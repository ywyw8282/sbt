<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$images = [];
$f = __DIR__ . '/img_map.json';
if (file_exists($f)) {
    $d = json_decode(file_get_contents($f), true);
    if (is_array($d)) $images = $d;
}

$db = [];
$f = __DIR__ . '/mat_db.json';
if (file_exists($f)) {
    $d = json_decode(file_get_contents($f), true);
    if (is_array($d)) $db = $d;
}

echo json_encode(['ok'=>true, 'images'=>$images, 'db'=>$db]);
