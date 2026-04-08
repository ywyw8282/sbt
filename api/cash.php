<?php
/**
 * 설비트리거 - 캐시 API
 */
error_reporting(0);
ini_set('display_errors', '0');

require_once __DIR__ . '/../db.php';
header('Content-Type: application/json; charset=utf-8');

// 예외/에러 발생 시 항상 JSON 반환
set_error_handler(function($no, $str) {
    echo json_encode(['ok'=>false,'msg'=>'서버 오류: '.$str]); exit;
});
set_exception_handler(function($e) {
    echo json_encode(['ok'=>false,'msg'=>'서버 예외: '.$e->getMessage()]); exit;
});

if (session_status() === PHP_SESSION_NONE) session_start();

$action = $_GET['action'] ?? '';
$input  = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {

    // ── 캐시 이력 조회 ───────────────────────────
    case 'log':
        $user = requireLogin();
        $db   = getDB();
        $page  = max(1, (int)($_GET['page'] ?? 1));
        $limit = 30;
        $offset = ($page - 1) * $limit;

        $sum = $db->prepare("
            SELECT
              SUM(CASE WHEN amount>0 THEN amount ELSE 0 END) AS total_in,
              SUM(CASE WHEN amount<0 THEN amount ELSE 0 END) AS total_out
            FROM sbt_cash_log WHERE user_id=?
        ");
        $sum->execute([$user['id']]);
        $summary = $sum->fetch();

        $st = $db->prepare("SELECT * FROM sbt_cash_log WHERE user_id=? ORDER BY id DESC LIMIT ? OFFSET ?");
        $st->execute([$user['id'], $limit, $offset]);
        $logs = $st->fetchAll();

        $cnt = $db->prepare("SELECT COUNT(*) AS c FROM sbt_cash_log WHERE user_id=?");
        $cnt->execute([$user['id']]);
        $total = (int)$cnt->fetch()['c'];

        jsonOk([
            'logs'      => $logs,
            'total'     => $total,
            'page'      => $page,
            'total_in'  => (int)($summary['total_in'] ?? 0),
            'total_out' => (int)($summary['total_out'] ?? 0),
        ]);
        break;

    // ── 베타 무료 충전 ───────────────────────────
    case 'charge':
        $user   = requireLogin();
        $amount = (int)($input['amount'] ?? 0);
        if ($amount <= 0 || !in_array($amount, [1000,3000,5000,10000])) jsonErr('올바른 충전 금액이 아닙니다.');

        $db = getDB();
        $db->beginTransaction();
        try {
            $db->prepare("UPDATE sbt_users SET cash=cash+? WHERE id=?")->execute([$amount, $user['id']]);
            $newBal = _getCash($db, $user['id']);
            _addCashLog($db, $user['id'], $amount, $newBal, '베타 무료 충전', '');
            $db->commit();
            jsonOk(['cash'=>$newBal]);
        } catch (Exception $e) {
            $db->rollBack();
            jsonErr('충전 실패: '.$e->getMessage());
        }
        break;

    // ── 캐시 차감 (도움요청 등록) ─────────────────
    case 'deduct':
        $user   = requireLogin();
        $amount = (int)($input['amount'] ?? 0);
        $reason = trim($input['reason'] ?? '');
        $detail = trim($input['detail'] ?? '');
        if ($amount <= 0) jsonErr('금액 오류');

        $db = getDB();
        $db->beginTransaction();
        try {
            $cur = _getCash($db, $user['id']);
            if ($cur < $amount) jsonErr('전이 부족합니다. (보유: '.$cur.'전)');
            $db->prepare("UPDATE sbt_users SET cash=cash-? WHERE id=?")->execute([$amount, $user['id']]);
            $newBal = _getCash($db, $user['id']);
            _addCashLog($db, $user['id'], -$amount, $newBal, $reason ?: '전 사용', $detail);
            $db->commit();
            jsonOk(['cash'=>$newBal]);
        } catch (Exception $e) {
            $db->rollBack();
            jsonErr('차감 실패: '.$e->getMessage());
        }
        break;

    // ── 캐시 지급 ─────────────────────────────
    case 'reward':
        $admin = requireAdmin();
        $toUserId = (int)($input['to_user_id'] ?? 0);
        $amount   = (int)($input['amount'] ?? 0);
        $reason   = trim($input['reason'] ?? '전 지급');
        $detail   = trim($input['detail'] ?? '');
        if (!$toUserId || $amount <= 0) jsonErr('파라미터 오류');

        $db = getDB();
        $db->beginTransaction();
        try {
            $db->prepare("UPDATE sbt_users SET cash=cash+? WHERE id=?")->execute([$amount, $toUserId]);
            $newBal = _getCash($db, $toUserId);
            _addCashLog($db, $toUserId, $amount, $newBal, $reason, $detail);
            $db->commit();
            jsonOk(['cash'=>$newBal]);
        } catch (Exception $e) {
            $db->rollBack();
            jsonErr('지급 실패: '.$e->getMessage());
        }
        break;

    // ── 관리자 캐시 직접 조정 ────────────────────
    case 'admin_adjust':
        $admin    = requireAdmin();
        $toUserId = (int)($input['user_id'] ?? 0);
        $amount   = (int)($input['amount'] ?? 0);
        $reason   = trim($input['reason'] ?? '관리자 지급');
        if (!$toUserId || $amount === 0) jsonErr('파라미터 오류');

        $db = getDB();
        $db->beginTransaction();
        try {
            $db->prepare("UPDATE sbt_users SET cash=cash+? WHERE id=?")->execute([$amount, $toUserId]);
            $newBal = _getCash($db, $toUserId);
            _addCashLog($db, $toUserId, $amount, $newBal, $reason, '관리자:'.$admin['name']);
            $db->commit();
            jsonOk(['cash'=>$newBal]);
        } catch (Exception $e) {
            $db->rollBack();
            jsonErr('조정 실패: '.$e->getMessage());
        }
        break;

    // ── 충전 신청 (계좌입금) ──────────────────────
    case 'request_charge':
        $userId    = _resolveUserId($input);
        if (!$userId) jsonErr('로그인이 필요합니다.');
        $amount    = (int)($input['amount'] ?? 0);
        $depositor = trim($input['depositor'] ?? '');
        $memo      = trim($input['memo'] ?? '');
        $refundBank    = trim($input['refund_bank'] ?? '');
        $refundAccount = trim($input['refund_account'] ?? '');
        $refundHolder  = trim($input['refund_holder'] ?? '');

        if ($amount < 10000 || $amount > 1000000 || $amount % 1000 !== 0)
            jsonErr('금액은 10,000전 이상, 1,000 단위로 입력해주세요.');
        if (!$depositor) jsonErr('입금자명을 입력해주세요.');

        $db = getDB();
        _ensureChargeTable($db);

        // 환불계좌 컬럼 추가 (없으면)
        _ensureRefundColumns($db);

        // 충전신청 저장
        $db->prepare("INSERT INTO sbt_charge_requests
            (user_id, amount, depositor_name, memo, refund_bank, refund_account, refund_holder, status, created_at)
            VALUES (?,?,?,?,?,?,?,'pending',NOW())")
           ->execute([$userId, $amount, $depositor, $memo, $refundBank, $refundAccount, $refundHolder]);

        // 환불계좌 정보를 회원정보에 저장
        if ($refundBank || $refundAccount || $refundHolder) {
            _ensureUserRefundColumns($db);
            $db->prepare("UPDATE sbt_users SET refund_bank=?, refund_account=?, refund_holder=? WHERE id=?")
               ->execute([$refundBank, $refundAccount, $refundHolder, $userId]);
        }

        jsonOk(['msg'=>'충전 신청이 접수됐습니다. 입금 확인 후 처리됩니다.']);
        break;

    // ── 충전 신청 목록 조회 ──────────────────────
    case 'get_charge_requests':
        $db = getDB();
        _ensureChargeTable($db);
        $adminPw = $input['admin_pw'] ?? ($_GET['admin_pw'] ?? '');
        $isAdm   = ($adminPw === 'qkrdbwns16^');
        if (!$isAdm) {
            $userId = _resolveUserId($input);
            if (!$userId) jsonErr('로그인이 필요합니다.');
            $user = ['id' => $userId];
        }

        $status = $_GET['status'] ?? ($input['status'] ?? 'all');
        $page   = max(1,(int)($_GET['page'] ?? 1));
        $limit  = 20;
        $offset = ($page-1)*$limit;

        if ($isAdm) {
            $where  = $status !== 'all' ? "WHERE r.status=?" : "";
            $params = $status !== 'all' ? [$status] : [];
            $countSt = $db->prepare("SELECT COUNT(*) AS c FROM sbt_charge_requests r $where");
            $countSt->execute($params);
            $total = (int)$countSt->fetch()['c'];
            $st = $db->prepare("SELECT r.*,u.name,u.username FROM sbt_charge_requests r
                LEFT JOIN sbt_users u ON u.id=r.user_id $where
                ORDER BY r.id DESC LIMIT ? OFFSET ?");
            $st->execute(array_merge($params,[$limit,$offset]));
        } else {
            $countSt = $db->prepare("SELECT COUNT(*) AS c FROM sbt_charge_requests WHERE user_id=?");
            $countSt->execute([$user['id']]);
            $total = (int)$countSt->fetch()['c'];
            $st = $db->prepare("SELECT * FROM sbt_charge_requests WHERE user_id=?
                ORDER BY id DESC LIMIT ? OFFSET ?");
            $st->execute([$user['id'],$limit,$offset]);
        }
        jsonOk(['list'=>$st->fetchAll(),'total'=>$total,'page'=>$page]);
        break;

    // ── 관리자 충전 처리 (승인/거절) ─────────────
    case 'admin_process_charge':
        $adminPw = $input['admin_pw'] ?? '';
        if ($adminPw !== 'qkrdbwns16^') requireAdmin();

        $reqId   = (int)($input['request_id'] ?? 0);
        $act     = $input['action'] ?? '';
        $memo    = trim($input['memo'] ?? '');
        if (!$reqId || !in_array($act,['approve','reject'])) jsonErr('파라미터 오류');

        $db = getDB();
        _ensureChargeTable($db);
        $req = $db->prepare("SELECT * FROM sbt_charge_requests WHERE id=? LIMIT 1");
        $req->execute([$reqId]);
        $r = $req->fetch();
        if (!$r) jsonErr('신청 내역을 찾을 수 없습니다.');
        if ($r['status'] !== 'pending') jsonErr('이미 처리된 신청입니다. (상태: '.$r['status'].')');

        $db->beginTransaction();
        try {
            if ($act === 'approve') {
                $db->prepare("UPDATE sbt_users SET cash=cash+? WHERE id=?")
                   ->execute([$r['amount'],$r['user_id']]);
                $newBal = _getCash($db,$r['user_id']);
                _addCashLog($db,$r['user_id'],$r['amount'],$newBal,
                    '계좌 충전 승인', '입금자:'.$r['depositor_name'].($memo?' / '.$memo:''));
            }
            $newStatus = ($act === 'approve') ? 'approved' : 'rejected';
            $db->prepare("UPDATE sbt_charge_requests
                SET status=?,memo=?,processed_by='admin',processed_at=NOW() WHERE id=?")
               ->execute([$newStatus,$memo,$reqId]);
            $db->commit();
            jsonOk(['msg'=> $act==='approve' ? '충전이 승인됐습니다.' : '신청이 거절됐습니다.']);
        } catch (Exception $e) {
            $db->rollBack();
            jsonErr('처리 실패: '.$e->getMessage());
        }
        break;

    // ── 환불계좌 조회 ────────────────────────────
    case 'get_refund_info':
        $userId = _resolveUserId($input);
        if (!$userId) jsonErr('로그인이 필요합니다.');
        $db = getDB();
        try {
            _ensureUserRefundColumns($db);
            $st = $db->prepare("SELECT refund_bank, refund_account, refund_holder FROM sbt_users WHERE id=? LIMIT 1");
            $st->execute([$userId]);
            $row = $st->fetch();
            jsonOk([
                'bank'    => $row['refund_bank']    ?? '',
                'account' => $row['refund_account'] ?? '',
                'holder'  => $row['refund_holder']  ?? '',
            ]);
        } catch (Exception $e) {
            jsonOk(['bank'=>'','account'=>'','holder'=>'']);
        }
        break;

    // ── 잔액 정합성 검증 (관리자) ────────────────
    case 'integrity_check':
        $adminPw = $input['admin_pw'] ?? ($_GET['admin_pw'] ?? '');
        if ($adminPw !== 'qkrdbwns16^') requireAdmin();

        $db = getDB();
        $st = $db->query("
            SELECT u.id, u.username, u.name, u.cash AS balance,
                   COALESCE(SUM(l.amount),0) AS log_sum,
                   (u.cash - COALESCE(SUM(l.amount),0)) AS diff
            FROM sbt_users u
            LEFT JOIN sbt_cash_log l ON l.user_id=u.id
            WHERE u.cash != 0 OR l.user_id IS NOT NULL
            GROUP BY u.id
            HAVING diff != 0
        ");
        jsonOk(['mismatches'=>$st->fetchAll()]);
        break;

    // ── 닉네임 변경 (캐시 차감) ──────────────────
    case 'nick_change':
        $userId = _resolveUserId($input);
        if (!$userId) jsonErr('로그인이 필요합니다.');

        $newName = trim($input['new_name'] ?? '');
        $cost    = (int)($input['cost'] ?? 10000);
        if (mb_strlen($newName) < 2) jsonErr('닉네임은 2자 이상이어야 합니다.');
        if ($cost <= 0) $cost = 10000;

        $db = getDB();
        $db->beginTransaction();
        try {
            // 현재 잔액 확인
            $cur = _getCash($db, $userId);
            if ($cur < $cost) jsonErr('전이 부족합니다. (보유: '.$cur.'전 / 필요: '.$cost.'전)');

            // 중복 닉네임 확인
            $dup = $db->prepare("SELECT id FROM sbt_users WHERE name=? AND id!=? LIMIT 1");
            $dup->execute([$newName, $userId]);
            if ($dup->fetch()) jsonErr('이미 사용 중인 닉네임입니다.');

            // 캐시 차감
            $db->prepare("UPDATE sbt_users SET cash=cash-?, name=? WHERE id=?")->execute([$cost, $newName, $userId]);
            $newBal = _getCash($db, $userId);
            _addCashLog($db, $userId, -$cost, $newBal, '닉네임 변경', '변경: '.$newName);

            $db->commit();
            jsonOk(['msg'=>'닉네임이 변경됐습니다.', 'new_cash'=>$newBal, 'new_name'=>$newName]);
        } catch (Exception $e) {
            $db->rollBack();
            jsonErr('처리 실패: '.$e->getMessage());
        }
        break;

    default:
        jsonErr('알 수 없는 요청');
}

// ── 내부 헬퍼 ────────────────────────────────────

function _resolveUserId($input) {
    $db = getDB();

    // 1) URL 쿼리 파라미터 uid (가장 확실)
    $qId = (int)($_GET['uid'] ?? 0);
    if ($qId > 0) {
        $st = $db->prepare("SELECT id FROM sbt_users WHERE id=? LIMIT 1");
        $st->execute([$qId]);
        if ($st->fetch()) return $qId;
    }

    // 2) PHP 세션
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (!empty($_SESSION['sbt_user']['id'])) {
        return (int)$_SESSION['sbt_user']['id'];
    }

    // 3) POST body user_id
    $bodyId = (int)($input['user_id'] ?? 0);
    if ($bodyId > 0) {
        $st = $db->prepare("SELECT id FROM sbt_users WHERE id=? LIMIT 1");
        $st->execute([$bodyId]);
        if ($st->fetch()) return $bodyId;
    }

    return 0;
}

function _ensureChargeTable($db) {
    $db->exec("CREATE TABLE IF NOT EXISTS sbt_charge_requests (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        user_id        INT NOT NULL,
        amount         INT NOT NULL,
        depositor_name VARCHAR(50) NOT NULL DEFAULT '',
        status         ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        memo           TEXT,
        processed_by   VARCHAR(50) DEFAULT NULL,
        processed_at   DATETIME DEFAULT NULL,
        created_at     DATETIME NOT NULL,
        INDEX idx_user(user_id),
        INDEX idx_status(status)
    )");
    _ensureRefundColumns($db);
}

function _ensureRefundColumns($db) {
    try { $db->exec("ALTER TABLE sbt_charge_requests ADD COLUMN refund_bank VARCHAR(50) DEFAULT NULL"); } catch(Exception $e) {}
    try { $db->exec("ALTER TABLE sbt_charge_requests ADD COLUMN refund_account VARCHAR(50) DEFAULT NULL"); } catch(Exception $e) {}
    try { $db->exec("ALTER TABLE sbt_charge_requests ADD COLUMN refund_holder VARCHAR(50) DEFAULT NULL"); } catch(Exception $e) {}
}

function _ensureUserRefundColumns($db) {
    try { $db->exec("ALTER TABLE sbt_users ADD COLUMN refund_bank VARCHAR(50) DEFAULT NULL"); } catch(Exception $e) {}
    try { $db->exec("ALTER TABLE sbt_users ADD COLUMN refund_account VARCHAR(50) DEFAULT NULL"); } catch(Exception $e) {}
    try { $db->exec("ALTER TABLE sbt_users ADD COLUMN refund_holder VARCHAR(50) DEFAULT NULL"); } catch(Exception $e) {}
}

function _getCash($db, $userId) {
    $st = $db->prepare("SELECT cash FROM sbt_users WHERE id=? LIMIT 1");
    $st->execute([$userId]);
    return (int)($st->fetch()['cash'] ?? 0);
}

function _addCashLog($db, $userId, $amount, $balance, $reason, $detail='') {
    $db->prepare("INSERT INTO sbt_cash_log (user_id,amount,balance,reason,detail,created_at) VALUES (?,?,?,?,?,NOW())")
       ->execute([$userId, $amount, $balance, $reason, $detail]);
}
