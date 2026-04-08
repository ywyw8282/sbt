<?php
/**
 * 설비트리거 - 공무자료실 파일 업로드
 * 위치: /html/upload_docs.php
 * 저장: /html/gongmu/
 * 
 * ★ 파일명 자동변환: 한글 원본명은 JSON 응답으로 반환,
 *   서버에는 영문(날짜_고유번호.확장자)으로 저장
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$uploadDir = __DIR__ . '/gongmu/';

// gongmu 폴더 없으면 생성
if(!is_dir($uploadDir)){
    mkdir($uploadDir, 0755, true);
}

if(empty($_FILES['file'])){
    echo json_encode(['ok'=>false,'msg'=>'파일이 없습니다.']);
    exit;
}

$file     = $_FILES['file'];
$origName = basename($file['name']);

// 허용 확장자 체크
$ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
$allowed = ['pdf','doc','docx','xls','xlsx','hwp','ppt','pptx','txt','zip','jpg','jpeg','png','gif'];
if(!in_array($ext, $allowed)){
    echo json_encode(['ok'=>false,'msg'=>'허용되지 않는 파일 형식입니다.']);
    exit;
}

// 파일 크기 제한 10MB
if($file['size'] > 10 * 1024 * 1024){
    echo json_encode(['ok'=>false,'msg'=>'파일 크기는 10MB 이하여야 합니다.']);
    exit;
}

// ★ 핵심: 서버 저장용 영문 파일명 생성
// 형식: 20260403_a3f7c2.pdf (날짜_랜덤6자리.확장자)
$safeName = date('Ymd_His') . '_' . substr(md5(uniqid(mt_rand(), true)), 0, 6) . '.' . $ext;

$destPath = $uploadDir . $safeName;
if(move_uploaded_file($file['tmp_name'], $destPath)){
    echo json_encode([
        'ok'       => true,
        'fileName' => $origName,      // 원본 한글 이름 (화면 표시용)
        'filePath' => 'gongmu/' . $safeName,  // 서버 영문 경로 (다운로드용)
        'fileSize' => $file['size'],
    ]);
} else {
    echo json_encode(['ok'=>false,'msg'=>'파일 저장에 실패했습니다.']);
}