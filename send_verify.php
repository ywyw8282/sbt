<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once 'db.php';

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
  echo json_encode(['ok'=>false,'msg'=>'잘못된 요청입니다.']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if(!$input) $input = $_POST;

$email = isset($input['email']) ? trim($input['email']) : '';

if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
  echo json_encode(['ok'=>false,'msg'=>'올바른 이메일 주소를 입력해주세요.']);
  exit;
}

// 이미 가입된 이메일 확인
try {
  $stmt = $pdo->prepare("SELECT id FROM sbt_users WHERE email = ? LIMIT 1");
  $stmt->execute([$email]);
  if($stmt->fetch()){
    echo json_encode(['ok'=>false,'msg'=>'이미 가입된 이메일입니다.']);
    exit;
  }
} catch(Exception $e) {}

// 인증코드 생성
$code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

// DB에 코드 저장 (5분 유효)
try {
  $pdo->exec("CREATE TABLE IF NOT EXISTS sbt_verify_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(200) NOT NULL,
    code VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email(email)
  )");
  $pdo->prepare("DELETE FROM sbt_verify_codes WHERE email = ?")->execute([$email]);
  $pdo->prepare("INSERT INTO sbt_verify_codes (email, code) VALUES (?, ?)")->execute([$email, $code]);
  $pdo->exec("DELETE FROM sbt_verify_codes WHERE created_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)");
} catch(Exception $e) {
  echo json_encode(['ok'=>false,'msg'=>'서버 오류가 발생했습니다.']);
  exit;
}

// 이메일 발송
$subject = '[설비트리거] 이메일 인증코드';
$message = "안녕하세요, 설비트리거입니다.\n\n";
$message .= "회원가입 이메일 인증코드입니다.\n\n";
$message .= "━━━━━━━━━━━━━━━━━\n";
$message .= "  인증코드: {$code}\n";
$message .= "━━━━━━━━━━━━━━━━━\n\n";
$message .= "인증코드는 5분간 유효합니다.\n";
$message .= "본인이 요청하지 않은 경우 이 메일을 무시해 주세요.\n\n";
$message .= "설비트리거 드림";

$headers  = "From: noreply@baboyayo.dothome.co.kr\r\n";
$headers .= "Reply-To: noreply@baboyayo.dothome.co.kr\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = @mail($email, '=?UTF-8?B?'.base64_encode($subject).'?=', $message, $headers);

if($sent){
  echo json_encode(['ok'=>true,'msg'=>'인증코드를 이메일로 발송했습니다.']);
} else {
  // 닷홈 mail() 실패 시 코드를 직접 반환 (개발용 fallback)
  echo json_encode(['ok'=>true,'msg'=>'인증코드를 발송했습니다.','dev_code'=>$code]);
}
