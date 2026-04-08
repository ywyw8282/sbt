<?php
/**
 * 설비트리거 - 회원 API
 * 위치: /html/api/user.php
 * action: info | update_name | update_pw | add_exp | list(admin) | adjust(admin)
 */
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

$action = $_GET['action'] ?? '';
$input  = json_decode(file_get_contents('php://input'), true) ?? [];

// 등급 기준
$GRADES = ['기술사'=>2000,'기능장'=>1200,'팀장'=>800,'기공'=>500,'준기공'=>300,'조공'=>150,'신호수'=>50,'용역'=>0];
$GRADE_ORDER = ['기술사','기능장','팀장','기공','준기공','조공','신호수','용역'];

switch ($action) {

    // ── 내 정보 + 캐시이력 요약 ─────────────────
    case 'info':
        // uid 쿼리 파라미터로 직접 조회 허용 (charge_request.php 등 JS-only 페이지)
        $uidParam = (int)($_GET['uid'] ?? 0);
        if ($uidParam > 0) {
            $db = getDB();
            $st = $db->prepare("SELECT id,username,name,email,grade,exp,cash,point,type,post_count,comment_count,visit_days,last_login,created_at FROM sbt_users WHERE id=? LIMIT 1");
            $st->execute([$uidParam]);
            $row = $st->fetch();
            if (!$row) jsonErr('회원 없음', 404);
            jsonOk(['user' => $row]);
        }
        $user = requireLogin();
        if ($user['type'] === 'admin') jsonOk(['user'=>$user]);
        $db = getDB();
        $st = $db->prepare("SELECT id,username,name,email,grade,exp,cash,point,type,post_count,comment_count,visit_days,last_login,created_at FROM sbt_users WHERE id=? LIMIT 1");
        $st->execute([$user['id']]);
        $row = $st->fetch();
        if (!$row) jsonErr('회원 없음', 404);

        // 캐시 요약
        $cs = $db->prepare("SELECT SUM(CASE WHEN amount>0 THEN amount ELSE 0 END) AS total_in, SUM(CASE WHEN amount<0 THEN amount ELSE 0 END) AS total_out FROM sbt_cash_log WHERE user_id=?");
        $cs->execute([$user['id']]);
        $cashSum = $cs->fetch();

        // 최근 캐시이력 5건
        $cl = $db->prepare("SELECT amount,balance,reason,detail,created_at FROM sbt_cash_log WHERE user_id=? ORDER BY id DESC LIMIT 5");
        $cl->execute([$user['id']]);

        // 최근 경험치이력 5건
        $el = $db->prepare("SELECT amount,reason,created_at FROM sbt_exp_log WHERE user_id=? ORDER BY id DESC LIMIT 5");
        $el->execute([$user['id']]);

        jsonOk([
            'user'       => $row,
            'cash_in'    => (int)($cashSum['total_in'] ?? 0),
            'cash_out'   => abs((int)($cashSum['total_out'] ?? 0)),
            'cash_log'   => $cl->fetchAll(),
            'exp_log'    => $el->fetchAll(),
        ]);
        break;

    // ── 닉네임 변경 ─────────────────────────────
    case 'update_name':
        $user = requireLogin();
        if ($user['type'] === 'admin') jsonErr('관리자는 닉네임 변경 불필요');
        $name = trim($input['name'] ?? '');
        if (strlen($name) < 2) jsonErr('닉네임은 2자 이상이어야 합니다.');
        $db = getDB();
        $db->prepare("UPDATE sbt_users SET name=? WHERE id=?")->execute([$name, $user['id']]);
        $_SESSION['sbt_user']['name'] = $name;
        jsonOk(['name'=>$name]);
        break;

    // ── 비밀번호 변경 ────────────────────────────
    case 'update_pw':
        $user   = requireLogin();
        $oldPw  = $input['old_pw'] ?? '';
        $newPw  = $input['new_pw'] ?? '';
        if (strlen($newPw) < 8) jsonErr('비밀번호는 8자 이상이어야 합니다.');
        $db = getDB();
        $st = $db->prepare("SELECT password FROM sbt_users WHERE id=? LIMIT 1");
        $st->execute([$user['id']]);
        $row = $st->fetch();
        if (!$row || !password_verify($oldPw, $row['password'])) jsonErr('현재 비밀번호가 올바르지 않습니다.');
        $db->prepare("UPDATE sbt_users SET password=? WHERE id=?")->execute([password_hash($newPw, PASSWORD_BCRYPT), $user['id']]);
        jsonOk();
        break;

    // ── 경험치 추가 (내부 사용) ──────────────────
    case 'add_exp':
        $user   = requireLogin();
        $amount = (int)($input['amount'] ?? 0);
        $reason = trim($input['reason'] ?? '활동');
        if ($amount <= 0) jsonErr('경험치 오류');

        global $GRADES, $GRADE_ORDER;
        $db = getDB();
        $db->beginTransaction();
        try {
            $db->prepare("UPDATE sbt_users SET exp=exp+? WHERE id=?")->execute([$amount, $user['id']]);
            $db->prepare("INSERT INTO sbt_exp_log (user_id,amount,reason,created_at) VALUES (?,?,?,NOW())")->execute([$user['id'],$amount,$reason]);

            // 등급 자동 승급
            $st = $db->prepare("SELECT exp,grade FROM sbt_users WHERE id=?");
            $st->execute([$user['id']]);
            $cur = $st->fetch();
            $newGrade = $cur['grade'];
            foreach ($GRADES as $g => $req) {
                if ($cur['exp'] >= $req) { $newGrade = $g; break; }
            }
            if ($newGrade !== $cur['grade']) {
                $db->prepare("UPDATE sbt_users SET grade=? WHERE id=?")->execute([$newGrade, $user['id']]);
                $_SESSION['sbt_user']['grade'] = $newGrade;
            }
            $db->commit();
            jsonOk(['exp'=>(int)$cur['exp'], 'grade'=>$newGrade]);
        } catch (Exception $e) {
            $db->rollBack(); jsonErr($e->getMessage());
        }
        break;

    // ── 관리자: 회원 목록 ────────────────────────
    case 'list':
        requireAdmin();
        $db = getDB();
        $page  = max(1,(int)($_GET['page']??1));
        $limit = 30;
        $st = $db->prepare("SELECT id,username,name,email,grade,exp,cash,point,type,created_at,last_login FROM sbt_users ORDER BY id DESC LIMIT ? OFFSET ?");
        $st->execute([$limit, ($page-1)*$limit]);
        $cnt = (int)$db->query("SELECT COUNT(*) FROM sbt_users")->fetchColumn();
        jsonOk(['users'=>$st->fetchAll(),'total'=>$cnt,'page'=>$page]);
        break;

    // ── 관리자: 회원 직접 조정 ───────────────────
    case 'adjust':
        requireAdmin();
        $userId = (int)($input['user_id'] ?? 0);
        if (!$userId) jsonErr('user_id 필요');
        $db = getDB();

        $sets = [];
        $params = [];
        if (isset($input['grade']))  { $sets[]='grade=?';  $params[]=$input['grade']; }
        if (isset($input['exp']))    { $sets[]='exp=?';    $params[]=(int)$input['exp']; }
        if (isset($input['cash']))   { $sets[]='cash=?';   $params[]=(int)$input['cash']; }
        if (isset($input['point']))  { $sets[]='point=?';  $params[]=(int)$input['point']; }

        if (!$sets) jsonErr('변경 항목 없음');
        $params[] = $userId;
        $db->prepare("UPDATE sbt_users SET ".implode(',',$sets)." WHERE id=?")->execute($params);

        // 캐시 변경시 이력 기록
        if (isset($input['cash'])) {
            $db->prepare("INSERT INTO sbt_cash_log (user_id,amount,balance,reason,detail,created_at) VALUES (?,?,?,?,?,NOW())")
               ->execute([$userId, 0, (int)$input['cash'], '관리자 직접 조정', '']);
        }
        jsonOk();
        break;


    // ── 관리자: 메뉴 상태 저장 ──────────────────
    case 'save_menu_state':
        // 세션 인증 또는 관리자 비밀번호 직접 인증 허용
        $adminPw = $input['admin_pw'] ?? '';
        if($adminPw !== 'qkrdbwns16^'){
            requireAdmin();
        }
        $state = json_encode($input['state'] ?? []);
        $db = getDB();
        // sbt_settings 테이블에 저장 (없으면 생성)
        $db->exec("CREATE TABLE IF NOT EXISTS sbt_settings (
            `key` VARCHAR(100) PRIMARY KEY,
            `value` MEDIUMTEXT,
            updated_at DATETIME
        )");
        $db->prepare("INSERT INTO sbt_settings (`key`,`value`,updated_at) VALUES ('menu_state',?,NOW())
            ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), updated_at=NOW()")
           ->execute([$state]);
        jsonOk();
        break;

    // ── 메뉴 상태 불러오기 (전체 공개) ─────────
    case 'get_menu_state':
        $db = getDB();
        try {
            $st = $db->prepare("SELECT `value` FROM sbt_settings WHERE `key`='menu_state' LIMIT 1");
            $st->execute();
            $row = $st->fetch();
            jsonOk(['state' => $row ? json_decode($row['value'], true) : new stdClass()]);
        } catch (Exception $e) {
            jsonOk(['state' => new stdClass()]);
        }
        break;

    // ── 관리자: 네이버 회원 목록 ────────────────
    case 'list_naver':
        requireAdmin();
        $file = __DIR__ . '/../naver_users.json';
        if (!file_exists($file)) { jsonOk(['users'=>[]]); }
        $users = json_decode(file_get_contents($file), true) ?: [];
        jsonOk(['users' => $users]);
        break;

    // ── 관리자: 비밀번호 초기화 ─────────────────
    case 'admin_reset_pw':
        requireAdmin();
        $userId = (int)($input['user_id'] ?? 0);
        $newPw  = $input['new_pw'] ?? '';
        if (!$userId) jsonErr('user_id 필요');
        if (strlen($newPw) < 8) jsonErr('비밀번호는 8자 이상이어야 합니다.');
        $db = getDB();
        $db->prepare("UPDATE sbt_users SET password=? WHERE id=?")->execute([password_hash($newPw, PASSWORD_BCRYPT), $userId]);
        jsonOk(['msg'=>'비밀번호가 초기화됐습니다.']);
        break;

    default:
        jsonErr('알 수 없는 요청');
}

/* ── 헬퍼: db.php에 정의된 함수 사용 (중복 선언 제거) ── */
