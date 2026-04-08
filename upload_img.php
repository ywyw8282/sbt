<?php
/**
 * 설비트리거 - 자재 이미지 관리
 * 위치: /html/upload_img.php
 *
 * ★ 파일명 자동변환: 자재명(한글)은 img_map.json에서 관리,
 *   서버 파일명은 영문(md5 해시.jpg)으로 저장
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

define('ADMIN_PW', 'qkrdbwns16^');
define('IMG_DIR',  __DIR__ . '/images/');
define('MAP_FILE', __DIR__ . '/img_map.json');

$action = $_REQUEST['action'] ?? '';

if ($action === 'get') {
    echo json_encode(['ok'=>true, 'images'=>load_map()]);
    exit;
}

if ($action === 'save') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (($input['pw'] ?? '') !== ADMIN_PW) {
        echo json_encode(['ok'=>false, 'msg'=>'권한 없음']); exit;
    }
    $name = preg_replace('/[\/\\\:*?"<>|]/', '_', trim($input['name'] ?? ''));
    $b64  = $input['image'] ?? '';
    if (!$name || !$b64) {
        echo json_encode(['ok'=>false, 'msg'=>'자재명 또는 이미지 없음']); exit;
    }
    $b64clean = preg_replace('/^data:image\/\w+;base64,/', '', $b64);
    $binary   = base64_decode($b64clean);
    $src = $binary ? @imagecreatefromstring($binary) : false;
    if (!$src) {
        echo json_encode(['ok'=>false, 'msg'=>'이미지 변환 실패']); exit;
    }
    $ow = imagesx($src); $oh = imagesy($src); $max = 800;
    if ($ow > $max || $oh > $max) {
        $r = min($max/$ow, $max/$oh);
        $nw = (int)($ow*$r); $nh = (int)($oh*$r);
        $dst = imagecreatetruecolor($nw, $nh);
        imagecopyresampled($dst, $src, 0,0,0,0, $nw,$nh,$ow,$oh);
        imagedestroy($src); $src = $dst;
    }
    if (!is_dir(IMG_DIR)) mkdir(IMG_DIR, 0755, true);

    // ★ 핵심: 서버 파일명을 영문으로 생성
    // 기존 매핑이 있으면 같은 파일명 재사용 (덮어쓰기), 없으면 새로 생성
    $map = load_map();
    if (isset($map[$name])) {
        // 기존 이미지 덮어쓰기 (같은 영문 파일명 유지)
        $file = basename($map[$name]);
    } else {
        // 새 이미지: 영문 고유 파일명 생성
        $file = 'mat_' . substr(md5($name . microtime(true)), 0, 8) . '.jpg';
    }

    imagejpeg($src, IMG_DIR . $file, 75);
    imagedestroy($src);

    $map[$name] = 'images/' . $file;
    save_map($map);
    echo json_encode(['ok'=>true, 'path'=>'images/'.$file]);
    exit;
}

if ($action === 'delete') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (($input['pw'] ?? '') !== ADMIN_PW) {
        echo json_encode(['ok'=>false, 'msg'=>'권한 없음']); exit;
    }
    $name = trim($input['name'] ?? '');
    $map  = load_map();
    if (isset($map[$name])) {
        $f = __DIR__ . '/' . $map[$name];
        if (file_exists($f)) unlink($f);
        unset($map[$name]);
        save_map($map);
    }
    echo json_encode(['ok'=>true]);
    exit;
}

echo json_encode(['ok'=>false, 'msg'=>'알 수 없는 요청']);

function map_path()  { return MAP_FILE; }
function load_map()  {
    if (!file_exists(MAP_FILE)) return [];
    $d = json_decode(file_get_contents(MAP_FILE), true);
    return is_array($d) ? $d : [];
}
function save_map($map) {
    file_put_contents(MAP_FILE, json_encode($map, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
}