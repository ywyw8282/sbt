<?php
/**
 * 설비트리거 - 게시글 API
 * 위치: /html/api/posts.php
 * action: list | get | write | edit | delete | vote | comment_add | comment_edit | comment_delete | comment_vote
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
        $limit = (int)($_GET['limit']??20);
        $q     = trim($_GET['q']??'');

        $where = '1=1';
        $params = [];
        if ($cat !== 'all') { $where.=' AND cat=?'; $params[]=$cat; }
        if ($q) { $where.=' AND (title LIKE ? OR content LIKE ?)'; $params[]="%$q%"; $params[]="%$q%"; }

        $total = (int)$db->prepare("SELECT COUNT(*) FROM sbt_posts WHERE $where")->execute($params) ? $db->prepare("SELECT COUNT(*) FROM sbt_posts WHERE $where")->execute($params) : 0;
        $cntSt = $db->prepare("SELECT COUNT(*) AS c FROM sbt_posts WHERE $where");
        $cntSt->execute($params);
        $total = (int)$cntSt->fetch()['c'];

        $params2 = array_merge($params, [$limit, ($page-1)*$limit]);
        $st = $db->prepare("SELECT id,cat,badge,title,author_name,grade,views,likes,dislikes,created_at,(SELECT COUNT(*) FROM sbt_comments WHERE post_id=sbt_posts.id) AS comment_count FROM sbt_posts WHERE $where ORDER BY id DESC LIMIT ? OFFSET ?");
        $st->execute($params2);
        jsonOk(['posts'=>$st->fetchAll(),'total'=>$total,'page'=>$page]);
        break;

    // ── 단건 조회 ────────────────────────────────
    case 'get':
        $id = (int)($_GET['id']??0);
        if (!$id) jsonErr('id 필요');
        $db = getDB();
        $db->prepare("UPDATE sbt_posts SET views=views+1 WHERE id=?")->execute([$id]);
        $st = $db->prepare("SELECT * FROM sbt_posts WHERE id=? LIMIT 1");
        $st->execute([$id]);
        $post = $st->fetch();
        if (!$post) jsonErr('게시글 없음',404);

        // 댓글 (대댓글 포함)
        $cs = $db->prepare("SELECT * FROM sbt_comments WHERE post_id=? ORDER BY id ASC");
        $cs->execute([$id]);
        $allCmts = $cs->fetchAll();
        $comments = [];
        $cmtMap = [];
        foreach ($allCmts as $c) {
            $c['replies'] = [];
            $cmtMap[$c['id']] = $c;
        }
        foreach ($cmtMap as &$c) {
            if ($c['parent_id']) {
                if (isset($cmtMap[$c['parent_id']])) $cmtMap[$c['parent_id']]['replies'][] = $c;
            } else {
                $comments[] = &$c;
            }
        }
        $post['comments'] = $comments;
        jsonOk(['post'=>$post]);
        break;

    // ── 작성 ─────────────────────────────────────
    case 'write':
        $user = requireLogin();
        $cat  = trim($input['cat'] ?? '');
        $title = trim($input['title'] ?? '');
        $content = trim($input['content'] ?? '');
        if (!$cat || !$title || !$content) jsonErr('필수 항목 누락');

        $badge = str_contains($cat,'질문') ? 'Q&A' : '자료';
        $db = getDB();
        $db->prepare("INSERT INTO sbt_posts (cat,badge,title,content,author_id,author_name,grade,is_html,images,created_at) VALUES (?,?,?,?,?,?,?,?,?,NOW())")
           ->execute([$cat,$badge,$title,$content,$user['id'],$user['name'],$user['grade'],(int)($input['is_html']??0),json_encode($input['images']??[])]);
        $newId = $db->lastInsertId();
        $db->prepare("UPDATE sbt_users SET post_count=post_count+1 WHERE id=?")->execute([$user['id']]);

        // 경험치 +15
        _addExp($db, $user['id'], 15, '게시글 작성');
        jsonOk(['id'=>(int)$newId]);
        break;

    // ── 수정 ─────────────────────────────────────
    case 'edit':
        $user = requireLogin();
        $id   = (int)($input['id']??0);
        $db   = getDB();
        $st   = $db->prepare("SELECT author_id FROM sbt_posts WHERE id=? LIMIT 1");
        $st->execute([$id]);
        $row = $st->fetch();
        if (!$row) jsonErr('게시글 없음',404);
        if ($row['author_id'] != $user['id'] && $user['type']!=='admin') jsonErr('권한 없음',403);

        $db->prepare("UPDATE sbt_posts SET title=?,content=?,updated_at=NOW() WHERE id=?")
           ->execute([trim($input['title']??''), trim($input['content']??''), $id]);
        jsonOk();
        break;

    // ── 삭제 ─────────────────────────────────────
    case 'delete':
        $user = requireLogin();
        $id   = (int)($input['id']??0);
        $db   = getDB();
        $st   = $db->prepare("SELECT author_id FROM sbt_posts WHERE id=? LIMIT 1");
        $st->execute([$id]);
        $row  = $st->fetch();
        if (!$row) jsonErr('게시글 없음',404);
        if ($row['author_id'] != $user['id'] && $user['type']!=='admin') jsonErr('권한 없음',403);
        $db->prepare("DELETE FROM sbt_comments WHERE post_id=?")->execute([$id]);
        $db->prepare("DELETE FROM sbt_posts WHERE id=?")->execute([$id]);
        jsonOk();
        break;

    // ── 추천/반대 ────────────────────────────────
    case 'vote':
        $user = requireLogin();
        $id   = (int)($input['id']??0);
        $type = $input['type'] ?? ''; // like|dislike
        if (!in_array($type,['like','dislike'])) jsonErr('type 오류');
        $db = getDB();
        $col = $type==='like' ? 'likes' : 'dislikes';
        $db->prepare("UPDATE sbt_posts SET $col=$col+1 WHERE id=?")->execute([$id]);
        $st = $db->prepare("SELECT likes,dislikes FROM sbt_posts WHERE id=?");
        $st->execute([$id]);
        jsonOk($st->fetch());
        break;

    // ── 댓글 등록 ────────────────────────────────
    case 'comment_add':
        $user    = requireLogin();
        $postId  = (int)($input['post_id']??0);
        $content = trim($input['content']??'');
        $parentId = ($input['parent_id']??null) ? (int)$input['parent_id'] : null;
        if (!$postId || !$content) jsonErr('필수 항목 누락');
        $db = getDB();
        $db->prepare("INSERT INTO sbt_comments (post_id,parent_id,author_id,author_name,content,created_at) VALUES (?,?,?,?,?,NOW())")
           ->execute([$postId,$parentId,$user['id'],$user['name'],$content]);
        $db->prepare("UPDATE sbt_users SET comment_count=comment_count+1 WHERE id=?")->execute([$user['id']]);
        _addExp($db, $user['id'], 5, '댓글 작성');
        jsonOk(['id'=>(int)$db->lastInsertId()]);
        break;

    // ── 댓글 수정 ────────────────────────────────
    case 'comment_edit':
        $user = requireLogin();
        $id   = (int)($input['id']??0);
        $db   = getDB();
        $st   = $db->prepare("SELECT author_id FROM sbt_comments WHERE id=? LIMIT 1");
        $st->execute([$id]);
        $row  = $st->fetch();
        if (!$row) jsonErr('댓글 없음',404);
        if ($row['author_id']!=$user['id'] && $user['type']!=='admin') jsonErr('권한 없음',403);
        $db->prepare("UPDATE sbt_comments SET content=? WHERE id=?")->execute([trim($input['content']??''),$id]);
        jsonOk();
        break;

    // ── 댓글 삭제 ────────────────────────────────
    case 'comment_delete':
        $user = requireLogin();
        $id   = (int)($input['id']??0);
        $db   = getDB();
        $st   = $db->prepare("SELECT author_id FROM sbt_comments WHERE id=? LIMIT 1");
        $st->execute([$id]);
        $row  = $st->fetch();
        if (!$row) jsonErr('댓글 없음',404);
        if ($row['author_id']!=$user['id'] && $user['type']!=='admin') jsonErr('권한 없음',403);
        $db->prepare("DELETE FROM sbt_comments WHERE id=?")->execute([$id]);
        jsonOk();
        break;

    // ── 댓글 추천/반대 ───────────────────────────
    case 'comment_vote':
        requireLogin();
        $id  = (int)($input['id']??0);
        $type= $input['type']??'';
        if (!in_array($type,['like','dislike'])) jsonErr('type 오류');
        $col = $type==='like'?'likes':'dislikes';
        $db  = getDB();
        $db->prepare("UPDATE sbt_comments SET $col=$col+1 WHERE id=?")->execute([$id]);
        $st  = $db->prepare("SELECT likes,dislikes FROM sbt_comments WHERE id=?");
        $st->execute([$id]);
        jsonOk($st->fetch());
        break;

    default:
        jsonErr('알 수 없는 요청');
}

function _addExp($db, $userId, $amount, $reason) {
    $db->prepare("UPDATE sbt_users SET exp=exp+? WHERE id=?")->execute([$amount,$userId]);
    $db->prepare("INSERT INTO sbt_exp_log (user_id,amount,reason,created_at) VALUES (?,?,?,NOW())")->execute([$userId,$amount,$reason]);
}
