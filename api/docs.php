<?php
/**
 * 설비트리거 - 공무자료실 API
 * 위치: /html/api/docs.php
 * action: list | get | write | edit | delete | comment_add | comment_delete | upload(파일업로드)
 *
 * ※ 기존 upload_docs.php 역할을 이 파일이 흡수합니다.
 *    upload_docs.php는 더 이상 불필요합니다.
 */
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

$action = $_GET['action'] ?? '';

// ── 파일 업로드 (multipart/form-data) ────────────
if ($action === 'upload') {
    requireLogin();
    $uploadDir = __DIR__ . '/../gongmu/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    if (empty($_FILES['file'])) jsonErr('파일이 없습니다.');
    $file     = $_FILES['file'];
    $origName = basename($file['name']);
    $safeName = preg_replace('/[^\w가-힣\.\-]/u','_',$origName);
    $safeName = date('Ymd_His').'_'.$safeName;
    $ext      = strtolower(pathinfo($safeName, PATHINFO_EXTENSION));
    $allowed  = ['pdf','doc','docx','xls','xlsx','hwp','ppt','pptx','txt','zip','jpg','jpeg','png','gif'];
    if (!in_array($ext,$allowed)) jsonErr('허용되지 않는 파일 형식');
    if ($file['size'] > 10*1024*1024) jsonErr('파일은 10MB 이하여야 합니다.');
    $dest = $uploadDir.$safeName;
    if (!move_uploaded_file($file['tmp_name'],$dest)) jsonErr('파일 저장 실패');
    jsonOk(['fileName'=>$origName,'filePath'=>'gongmu/'.$safeName,'fileSize'=>$file['size']]);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

// 등급 숫자 맵 (낮은 숫자 = 높은 등급)
$gradeNum = ['기술사'=>1,'기능장'=>2,'팀장'=>3,'기공'=>4,'준기공'=>5,'조공'=>6,'신호수'=>7,'용역'=>8];

switch ($action) {

    // ── 목록 ─────────────────────────────────────
    case 'list':
        $db   = getDB();
        $type = $_GET['type'] ?? 'all';
        $q    = trim($_GET['q']??'');
        $page = max(1,(int)($_GET['page']??1));
        $limit= 20;

        $where  = '1=1';
        $params = [];
        if ($type!=='all') { $where.=' AND type=?'; $params[]=$type; }
        if ($q) { $where.=' AND (title LIKE ? OR content LIKE ?)'; $params[]="%$q%"; $params[]="%$q%"; }

        $cntSt = $db->prepare("SELECT COUNT(*) AS c FROM sbt_docs WHERE $where");
        $cntSt->execute($params);
        $total = (int)$cntSt->fetch()['c'];

        $p2 = array_merge($params,[$limit,($page-1)*$limit]);
        $st = $db->prepare("SELECT id,type,title,file_name,min_grade,author_name,created_at,(SELECT COUNT(*) FROM sbt_docs_comments WHERE doc_id=sbt_docs.id) AS comment_count FROM sbt_docs WHERE $where ORDER BY id DESC LIMIT ? OFFSET ?");
        $st->execute($p2);
        jsonOk(['docs'=>$st->fetchAll(),'total'=>$total,'page'=>$page]);
        break;

    // ── 단건 ─────────────────────────────────────
    case 'get':
        $id   = (int)($_GET['id']??0);
        $user = getSessionUser();
        $db   = getDB();
        $st   = $db->prepare("SELECT * FROM sbt_docs WHERE id=? LIMIT 1");
        $st->execute([$id]);
        $doc  = $st->fetch();
        if (!$doc) jsonErr('없음',404);

        // 다운로드 권한 체크
        $canDownload = false;
        if ($user) {
            if ($user['type']==='admin') {
                $canDownload = true;
            } elseif ($doc['min_grade']==='전체') {
                $canDownload = true;
            } else {
                $userGradeNum = $gradeNum[$user['grade']] ?? 9;
                $minGradeNum  = $gradeNum[$doc['min_grade']] ?? 9;
                $canDownload  = $userGradeNum <= $minGradeNum;
            }
        } elseif ($doc['min_grade']==='전체') {
            $canDownload = true;
        }

        if (!$canDownload) $doc['file_path'] = null; // 경로 숨김

        $cs = $db->prepare("SELECT * FROM sbt_docs_comments WHERE doc_id=? ORDER BY id ASC");
        $cs->execute([$id]);
        $doc['comments'] = $cs->fetchAll();
        jsonOk(['doc'=>$doc,'can_download'=>$canDownload]);
        break;

    // ── 등록 ─────────────────────────────────────
    case 'write':
        $user  = requireLogin();
        $title = trim($input['title']??'');
        if (!$title) jsonErr('제목 필요');
        $db = getDB();
        $db->prepare("INSERT INTO sbt_docs (type,title,content,file_name,file_path,min_grade,author_id,author_name,created_at) VALUES (?,?,?,?,?,?,?,?,NOW())")
           ->execute([
               $input['type']??'upload',
               $title,
               trim($input['content']??''),
               $input['file_name']??'',
               $input['file_path']??'',
               $input['min_grade']??'전체',
               $user['id'],
               $user['name'],
           ]);
        jsonOk(['id'=>(int)$db->lastInsertId()]);
        break;

    // ── 수정 ─────────────────────────────────────
    case 'edit':
        $user = requireLogin();
        $id   = (int)($input['id']??0);
        $db   = getDB();
        $st   = $db->prepare("SELECT author_id FROM sbt_docs WHERE id=? LIMIT 1");
        $st->execute([$id]);
        $row  = $st->fetch();
        if (!$row) jsonErr('없음',404);
        if ($row['author_id']!=$user['id'] && $user['type']!=='admin') jsonErr('권한 없음',403);
        $db->prepare("UPDATE sbt_docs SET title=?,content=?,min_grade=? WHERE id=?")
           ->execute([trim($input['title']??''),trim($input['content']??''),$input['min_grade']??'전체',$id]);
        jsonOk();
        break;

    // ── 삭제 ─────────────────────────────────────
    case 'delete':
        $user = requireLogin();
        $id   = (int)($input['id']??0);
        $db   = getDB();
        $st   = $db->prepare("SELECT author_id,file_path FROM sbt_docs WHERE id=? LIMIT 1");
        $st->execute([$id]);
        $row  = $st->fetch();
        if (!$row) jsonErr('없음',404);
        if ($row['author_id']!=$user['id'] && $user['type']!=='admin') jsonErr('권한 없음',403);

        // 파일 삭제
        if ($row['file_path']) {
            $fp = __DIR__.'/../'.$row['file_path'];
            if (file_exists($fp)) unlink($fp);
        }
        $db->prepare("DELETE FROM sbt_docs_comments WHERE doc_id=?")->execute([$id]);
        $db->prepare("DELETE FROM sbt_docs WHERE id=?")->execute([$id]);
        jsonOk();
        break;

    // ── 댓글 등록 ────────────────────────────────
    case 'comment_add':
        $user   = requireLogin();
        $docId  = (int)($input['doc_id']??0);
        $content= trim($input['content']??'');
        if (!$docId||!$content) jsonErr('필수 항목 누락');
        $db = getDB();
        $db->prepare("INSERT INTO sbt_docs_comments (doc_id,author_id,author_name,content,created_at) VALUES (?,?,?,?,NOW())")
           ->execute([$docId,$user['id'],$user['name'],$content]);
        jsonOk(['id'=>(int)$db->lastInsertId()]);
        break;

    // ── 댓글 삭제 ────────────────────────────────
    case 'comment_delete':
        $user = requireLogin();
        $id   = (int)($input['id']??0);
        $db   = getDB();
        $st   = $db->prepare("SELECT author_id FROM sbt_docs_comments WHERE id=? LIMIT 1");
        $st->execute([$id]);
        $row  = $st->fetch();
        if (!$row) jsonErr('없음',404);
        if ($row['author_id']!=$user['id'] && $user['type']!=='admin') jsonErr('권한 없음',403);
        $db->prepare("DELETE FROM sbt_docs_comments WHERE id=?")->execute([$id]);
        jsonOk();
        break;

    default:
        jsonErr('알 수 없는 요청');
}
