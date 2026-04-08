<?php
/**
 * 설비트리거 - 도움요청 API
 * 위치: /html/api/help.php
 * action: list | get | write | edit | delete | apply | select | confirm | dispute | resolve
 */
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

$action = $_GET['action'] ?? '';
$input  = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {

    // ── 목록 ─────────────────────────────────────
    case 'list':
        $db    = getDB();
        $cat   = $_GET['cat'] ?? 'all';
        $page  = max(1,(int)($_GET['page']??1));
        $limit = 20;

        $where  = '1=1';
        $params = [];
        if ($cat !== 'all') { $where.=' AND cat=?'; $params[]=$cat; }

        $cntSt = $db->prepare("SELECT COUNT(*) AS c FROM sbt_help WHERE $where");
        $cntSt->execute($params);
        $total = (int)$cntSt->fetch()['c'];

        $p2 = array_merge($params, [$limit, ($page-1)*$limit]);
        $st = $db->prepare("SELECT id,cat,type,title,author_name,cash,status,deadline,created_at,(SELECT COUNT(*) FROM sbt_help_applicants WHERE help_id=sbt_help.id) AS apply_count FROM sbt_help WHERE $where ORDER BY id DESC LIMIT ? OFFSET ?");
        $st->execute($p2);
        jsonOk(['helps'=>$st->fetchAll(),'total'=>$total,'page'=>$page]);
        break;

    // ── 단건 ─────────────────────────────────────
    case 'get':
        $id = (int)($_GET['id']??0);
        if (!$id) jsonErr('id 필요');
        $db = getDB();
        $st = $db->prepare("SELECT * FROM sbt_help WHERE id=? LIMIT 1");
        $st->execute([$id]);
        $h = $st->fetch();
        if (!$h) jsonErr('없음',404);

        $as = $db->prepare("SELECT * FROM sbt_help_applicants WHERE help_id=? ORDER BY id ASC");
        $as->execute([$id]);
        $h['applicants'] = $as->fetchAll();
        jsonOk(['help'=>$h]);
        break;

    // ── 등록 ─────────────────────────────────────
    case 'write':
        $user  = requireLogin();
        $cat   = trim($input['cat']??'');
        $type  = trim($input['type']??'');
        $title = trim($input['title']??'');
        $content = trim($input['content']??'');
        $cash  = (int)($input['cash']??0);
        $deadline = $input['deadline']??null;

        if (!$cat||!$type||!$title||!$content) jsonErr('필수 항목 누락');
        if ($cash < 100) jsonErr('캐시는 최소 100C 이상');

        $db = getDB();
        $cur = (int)$db->prepare("SELECT cash FROM sbt_users WHERE id=?")->execute([$user['id']]) ? 0 : 0;
        $st  = $db->prepare("SELECT cash FROM sbt_users WHERE id=? LIMIT 1");
        $st->execute([$user['id']]);
        $cur = (int)$st->fetch()['cash'];
        if ($cur < $cash) jsonErr('캐시가 부족합니다. (보유: '.$cur.'C)');

        $db->beginTransaction();
        try {
            $db->prepare("UPDATE sbt_users SET cash=cash-? WHERE id=?")->execute([$cash,$user['id']]);
            $newBal = $cur - $cash;
            $db->prepare("INSERT INTO sbt_cash_log (user_id,amount,balance,reason,detail,created_at) VALUES (?,?,?,?,?,NOW())")
               ->execute([$user['id'],-$cash,$newBal,'도움요청 등록 차감',$title]);

            $db->prepare("INSERT INTO sbt_help (cat,type,title,content,author_id,author_name,cash,deadline,images,created_at) VALUES (?,?,?,?,?,?,?,?,?,NOW())")
               ->execute([$cat,$type,$title,$content,$user['id'],$user['name'],$cash,$deadline ?: null, json_encode($input['images']??[])]);
            $newId = $db->lastInsertId();
            $db->commit();
            jsonOk(['id'=>(int)$newId,'cash'=>$newBal]);
        } catch (Exception $e) {
            $db->rollBack(); jsonErr($e->getMessage());
        }
        break;

    // ── 수정 ─────────────────────────────────────
    case 'edit':
        $user = requireLogin();
        $id   = (int)($input['id']??0);
        $db   = getDB();
        $st   = $db->prepare("SELECT author_id,status FROM sbt_help WHERE id=? LIMIT 1");
        $st->execute([$id]);
        $row  = $st->fetch();
        if (!$row) jsonErr('없음',404);
        if ($row['author_id']!=$user['id'] && $user['type']!=='admin') jsonErr('권한 없음',403);
        if ($row['status']!=='open') jsonErr('모집 중인 게시글만 수정 가능합니다.');
        $db->prepare("UPDATE sbt_help SET cat=?,type=?,title=?,content=?,deadline=? WHERE id=?")
           ->execute([trim($input['cat']??''),trim($input['type']??''),trim($input['title']??''),trim($input['content']??''),$input['deadline']??null,$id]);
        jsonOk();
        break;

    // ── 삭제 (캐시 환불) ─────────────────────────
    case 'delete':
        $user = requireLogin();
        $id   = (int)($input['id']??0);
        $db   = getDB();
        $st   = $db->prepare("SELECT author_id,status,cash,title,author_name FROM sbt_help WHERE id=? LIMIT 1");
        $st->execute([$id]);
        $row  = $st->fetch();
        if (!$row) jsonErr('없음',404);
        if ($row['author_id']!=$user['id'] && $user['type']!=='admin') jsonErr('권한 없음',403);

        $db->beginTransaction();
        try {
            // open 상태면 캐시 환불
            if ($row['status']==='open') {
                $db->prepare("UPDATE sbt_users SET cash=cash+? WHERE id=?")->execute([$row['cash'],$row['author_id']]);
                $st2 = $db->prepare("SELECT cash FROM sbt_users WHERE id=?");
                $st2->execute([$row['author_id']]);
                $newBal = (int)$st2->fetch()['cash'];
                $db->prepare("INSERT INTO sbt_cash_log (user_id,amount,balance,reason,detail,created_at) VALUES (?,?,?,?,?,NOW())")
                   ->execute([$row['author_id'],$row['cash'],$newBal,'도움요청 취소 환불',$row['title']]);
            }
            $db->prepare("DELETE FROM sbt_help_applicants WHERE help_id=?")->execute([$id]);
            $db->prepare("DELETE FROM sbt_help WHERE id=?")->execute([$id]);
            $db->commit();
            jsonOk();
        } catch (Exception $e) {
            $db->rollBack(); jsonErr($e->getMessage());
        }
        break;

    // ── 신청 ─────────────────────────────────────
    case 'apply':
        $user    = requireLogin();
        $helpId  = (int)($input['help_id']??0);
        $content = trim($input['content']??'');
        if (!$content) jsonErr('신청 내용을 입력해주세요.');

        $db = getDB();
        $st = $db->prepare("SELECT author_id,status FROM sbt_help WHERE id=? LIMIT 1");
        $st->execute([$helpId]);
        $h  = $st->fetch();
        if (!$h) jsonErr('없음',404);
        if ($h['author_id']==$user['id']) jsonErr('본인 요청에는 신청 불가');
        if ($h['status']!=='open') jsonErr('모집 중인 요청만 신청 가능합니다.');

        // 중복 신청 체크
        $chk = $db->prepare("SELECT id FROM sbt_help_applicants WHERE help_id=? AND user_id=? LIMIT 1");
        $chk->execute([$helpId,$user['id']]);
        if ($chk->fetch()) jsonErr('이미 신청했습니다.');

        $db->prepare("INSERT INTO sbt_help_applicants (help_id,user_id,user_name,content,created_at) VALUES (?,?,?,?,NOW())")
           ->execute([$helpId,$user['id'],$user['name'],$content]);
        _addExp($db,$user['id'],10,'도움요청 신청');
        jsonOk();
        break;

    // ── 신청자 선택 → 진행중 ─────────────────────
    case 'select':
        $user     = requireLogin();
        $helpId   = (int)($input['help_id']??0);
        $helperId = (int)($input['helper_id']??0);
        $db = getDB();
        $st = $db->prepare("SELECT author_id,status FROM sbt_help WHERE id=? LIMIT 1");
        $st->execute([$helpId]);
        $h  = $st->fetch();
        if (!$h) jsonErr('없음',404);
        if ($h['author_id']!=$user['id']) jsonErr('의뢰인만 선택 가능');
        if ($h['status']!=='open') jsonErr('모집 중 상태에서만 선택 가능');

        $hs = $db->prepare("SELECT user_name FROM sbt_help_applicants WHERE help_id=? AND user_id=? LIMIT 1");
        $hs->execute([$helpId,$helperId]);
        $helperRow = $hs->fetch();
        if (!$helperRow) jsonErr('신청자 없음');

        $db->prepare("UPDATE sbt_help SET status='progress',selected_helper_id=?,selected_helper_name=? WHERE id=?")
           ->execute([$helperId,$helperRow['user_name'],$helpId]);
        jsonOk(['helper_name'=>$helperRow['user_name']]);
        break;

    // ── 완료 확인 → 캐시 지급 (수수료 10%) ────────
    case 'confirm':
        $user   = requireLogin();
        $helpId = (int)($input['help_id']??0);
        $db     = getDB();
        $st     = $db->prepare("SELECT * FROM sbt_help WHERE id=? LIMIT 1");
        $st->execute([$helpId]);
        $h = $st->fetch();
        if (!$h) jsonErr('없음',404);
        if ($h['author_id']!=$user['id']) jsonErr('의뢰인만 확인 가능');
        if ($h['status']!=='progress') jsonErr('진행 중 상태에서만 완료 가능');

        $payout = (int)round($h['cash'] * 0.90);
        $db->beginTransaction();
        try {
            $db->prepare("UPDATE sbt_help SET status='done' WHERE id=?")->execute([$helpId]);
            $db->prepare("UPDATE sbt_users SET cash=cash+? WHERE id=?")->execute([$payout,$h['selected_helper_id']]);
            $hs = $db->prepare("SELECT cash FROM sbt_users WHERE id=?");
            $hs->execute([$h['selected_helper_id']]);
            $newBal = (int)$hs->fetch()['cash'];
            $db->prepare("INSERT INTO sbt_cash_log (user_id,amount,balance,reason,detail,created_at) VALUES (?,?,?,?,?,NOW())")
               ->execute([$h['selected_helper_id'],$payout,$newBal,'도움요청 채택 지급',$h['title']]);
            _addExp($db,$h['selected_helper_id'],10,'도움요청 채택');
            $db->commit();
            jsonOk(['payout'=>$payout,'helper'=>$h['selected_helper_name']]);
        } catch (Exception $e) {
            $db->rollBack(); jsonErr($e->getMessage());
        }
        break;

    // ── 중재 요청 ────────────────────────────────
    case 'dispute':
        $user   = requireLogin();
        $helpId = (int)($input['help_id']??0);
        $db     = getDB();
        $st     = $db->prepare("SELECT author_id,selected_helper_id,status FROM sbt_help WHERE id=? LIMIT 1");
        $st->execute([$helpId]);
        $h = $st->fetch();
        if (!$h) jsonErr('없음',404);
        if ($h['author_id']!=$user['id'] && $h['selected_helper_id']!=$user['id']) jsonErr('거래 당사자만 중재 요청 가능');
        if ($h['status']!=='progress') jsonErr('진행 중 상태에서만 중재 요청 가능');
        $db->prepare("UPDATE sbt_help SET status='dispute',dispute_by=? WHERE id=?")->execute([$user['name'],$helpId]);
        jsonOk();
        break;

    // ── 관리자 중재 결정 ─────────────────────────
    case 'resolve':
        requireAdmin();
        $helpId = (int)($input['help_id']??0);
        $to     = $input['to']??''; // requester | helper
        $db     = getDB();
        $st     = $db->prepare("SELECT * FROM sbt_help WHERE id=? LIMIT 1");
        $st->execute([$helpId]);
        $h = $st->fetch();
        if (!$h) jsonErr('없음',404);
        if ($h['status']!=='dispute') jsonErr('중재 중 상태가 아닙니다.');

        $targetId   = $to==='requester' ? $h['author_id'] : $h['selected_helper_id'];
        $targetName = $to==='requester' ? $h['author_name'] : $h['selected_helper_name'];
        $amount     = $h['cash'];

        $db->beginTransaction();
        try {
            $db->prepare("UPDATE sbt_help SET status='done',resolved_to=? WHERE id=?")->execute([$targetName,$helpId]);
            $db->prepare("UPDATE sbt_users SET cash=cash+? WHERE id=?")->execute([$amount,$targetId]);
            $ns = $db->prepare("SELECT cash FROM sbt_users WHERE id=?");
            $ns->execute([$targetId]);
            $newBal = (int)$ns->fetch()['cash'];
            $db->prepare("INSERT INTO sbt_cash_log (user_id,amount,balance,reason,detail,created_at) VALUES (?,?,?,?,?,NOW())")
               ->execute([$targetId,$amount,$newBal,'중재 결정 지급',$h['title']]);
            $db->commit();
            jsonOk(['to'=>$targetName,'amount'=>$amount]);
        } catch (Exception $e) {
            $db->rollBack(); jsonErr($e->getMessage());
        }
        break;

    // ── 도움 완료 캐시 지급 (프론트엔드 로컬스토리지 연동) ─
    case 'pay_helper':
        // 요청자 uid 검증 (URL 파라미터 또는 세션)
        $callerId = 0;
        $qId = (int)($_GET['uid'] ?? 0);
        if ($qId > 0) {
            $db = getDB();
            $chk = $db->prepare("SELECT id FROM sbt_users WHERE id=? LIMIT 1");
            $chk->execute([$qId]);
            if ($chk->fetch()) $callerId = $qId;
        }
        if (!$callerId) {
            if (session_status() === PHP_SESSION_NONE) session_start();
            if (!empty($_SESSION['sbt_user']['id'])) $callerId = (int)$_SESSION['sbt_user']['id'];
        }
        if (!$callerId) jsonErr('로그인이 필요합니다.', 401);

        $helperName = trim($input['helper_name'] ?? '');
        $amount     = (int)($input['amount'] ?? 0);
        $title      = trim($input['title'] ?? '도움요청 채택');

        if (!$helperName || $amount <= 0) jsonErr('파라미터 오류');

        $db = getDB();
        $hs = $db->prepare("SELECT id FROM sbt_users WHERE name=? LIMIT 1");
        $hs->execute([$helperName]);
        $helperRow = $hs->fetch();
        if (!$helperRow) jsonErr('도움 제공자를 찾을 수 없습니다: '.$helperName);

        $helperId = (int)$helperRow['id'];
        $db->beginTransaction();
        try {
            $db->prepare("UPDATE sbt_users SET cash=cash+? WHERE id=?")->execute([$amount, $helperId]);
            $bs = $db->prepare("SELECT cash FROM sbt_users WHERE id=? LIMIT 1");
            $bs->execute([$helperId]);
            $newBal = (int)$bs->fetch()['cash'];
            $db->prepare("INSERT INTO sbt_cash_log (user_id,amount,balance,reason,detail,created_at) VALUES (?,?,?,?,?,NOW())")
               ->execute([$helperId, $amount, $newBal, '도움요청 채택 지급', $title]);
            _addExp($db, $helperId, 10, '도움요청 채택');
            $db->commit();
            jsonOk(['payout'=>$amount, 'helper'=>$helperName, 'new_balance'=>$newBal]);
        } catch (Exception $e) {
            $db->rollBack();
            jsonErr('지급 실패: '.$e->getMessage());
        }
        break;

    default:
        jsonErr('알 수 없는 요청');
}

function _addExp($db,$userId,$amount,$reason){
    $db->prepare("UPDATE sbt_users SET exp=exp+? WHERE id=?")->execute([$amount,$userId]);
    $db->prepare("INSERT INTO sbt_exp_log (user_id,amount,reason,created_at) VALUES (?,?,?,NOW())")->execute([$userId,$amount,$reason]);
}
