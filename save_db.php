<?php
/**
 * 설비트리거 - 자재 DB 저장
 * 위치: /html/save_db.php
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

set_error_handler(function($errno, $errstr) {
    echo json_encode(['ok'=>false,'msg'=>'오류: '.$errstr]); exit;
});

require_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) { echo json_encode(['ok'=>false,'msg'=>'데이터 없음']); exit; }

// 관리자 비밀번호 확인
$pw = trim($input['pw'] ?? '');
if ($pw !== 'qkrdbwns16^') {
    echo json_encode(['ok'=>false,'msg'=>'권한 없음']); exit;
}

$items   = $input['items']   ?? [];
$replace = $input['replace'] ?? false; // true면 기존 전체 삭제 후 교체

if (!is_array($items) || !count($items)) {
    echo json_encode(['ok'=>false,'msg'=>'items 없음']); exit;
}

try {
    // sbt_materials 테이블 없으면 생성
    $pdo->exec("CREATE TABLE IF NOT EXISTS sbt_materials (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        cat         VARCHAR(50)  NOT NULL DEFAULT '',
        sub         VARCHAR(50)  NOT NULL DEFAULT '',
        aliases     TEXT,
        tags        TEXT,
        description TEXT,
        specs       TEXT,
        unit_from   VARCHAR(20)  NOT NULL DEFAULT '',
        unit_to     VARCHAR(20)  NOT NULL DEFAULT '',
        unit_rate   FLOAT        NOT NULL DEFAULT 0,
        created_at  DATETIME     DEFAULT NOW(),
        updated_at  DATETIME     DEFAULT NOW() ON UPDATE NOW(),
        UNIQUE KEY uq_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $added   = 0;
    $updated = 0;

    // replace 모드: 기존 전체 삭제
    if ($replace) {
        $pdo->exec("DELETE FROM sbt_materials");
    }

    $stmt = $pdo->prepare(
        "INSERT INTO sbt_materials (name, cat, sub, aliases, tags, description, specs, unit_from, unit_to, unit_rate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           cat=VALUES(cat), sub=VALUES(sub), aliases=VALUES(aliases),
           tags=VALUES(tags), description=VALUES(description),
           specs=VALUES(specs), unit_from=VALUES(unit_from),
           unit_to=VALUES(unit_to), unit_rate=VALUES(unit_rate),
           updated_at=NOW()"
    );

    foreach ($items as $item) {
        $name    = trim($item['name']    ?? '');
        if (!$name) continue;
        $cat     = trim($item['cat']     ?? '기타');
        $sub     = trim($item['sub']     ?? '');
        $aliases = implode(',', (array)($item['aliases'] ?? []));
        $tags    = implode(',', (array)($item['tags']    ?? []));
        $desc    = trim($item['desc']    ?? '');
        $specs   = implode(',', (array)($item['specs']   ?? []));
        $uf      = trim($item['unitFrom'] ?? '');
        $ut      = trim($item['unitTo']   ?? '');
        $ur      = floatval($item['unitRate'] ?? 0);

        // INSERT 전 존재 확인 (added/updated 카운트용)
        $ck = $pdo->prepare("SELECT id FROM sbt_materials WHERE name=? LIMIT 1");
        $ck->execute([$name]);
        $exists = $ck->fetch();

        $stmt->execute([$name, $cat, $sub, $aliases, $tags, $desc, $specs, $uf, $ut, $ur]);

        if ($exists) $updated++; else $added++;
    }

    echo json_encode(['ok'=>true, 'added'=>$added, 'updated'=>$updated, 'total'=>$added+$updated]);

} catch (Exception $e) {
    echo json_encode(['ok'=>false, 'msg'=>$e->getMessage()]);
}
