<?php
/**
 * 설비트리거 - 네이버 로그인 콜백
 * 위치: /html/naver_callback.php
 */

define('NAVER_CLIENT_ID',     'X4ZLWeXd6cSSzF3FC3Cr');
define('NAVER_CLIENT_SECRET', 'izINeRCUn1');
define('NAVER_CALLBACK_URL',  'http://baboyayo.dothome.co.kr/naver_callback.php');
define('SITE_URL',            'http://baboyayo.dothome.co.kr');
define('USER_FILE',           __DIR__ . '/naver_users.json');

session_start();

// ── 디버그 모드 (문제 해결 후 false로 변경) ──
define('DEBUG', true);

function curlGet($url, $headers = []){
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_USERAGENT      => 'Mozilla/5.0',
    ]);
    $res  = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if(DEBUG && $err) error_log("cURL 오류: $err");
    return ['body'=>$res, 'code'=>$code, 'error'=>$err];
}

// ── 1. state 검증 ──
$state = $_GET['state'] ?? '';
if(empty($_SESSION['naver_state']) || $state !== $_SESSION['naver_state']){
    die('<script>alert("잘못된 접근입니다.");location.href="'.SITE_URL.'";</script>');
}
unset($_SESSION['naver_state']);

// ── 2. code 확인 ──
$code = $_GET['code'] ?? '';
if(!$code){
    die('<script>alert("로그인이 취소됐습니다.");location.href="'.SITE_URL.'";</script>');
}

// ── 3. 액세스 토큰 발급 (cURL POST 방식) ──
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => 'https://nid.naver.com/oauth2.0/token',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_POSTFIELDS     => http_build_query([
        'grant_type'    => 'authorization_code',
        'client_id'     => NAVER_CLIENT_ID,
        'client_secret' => NAVER_CLIENT_SECRET,
        'code'          => $code,
        'state'         => $state,
    ]),
]);
$tokenBody = curl_exec($ch);
$curlErr   = curl_error($ch);
curl_close($ch);

if($curlErr){
    die('<script>alert("네트워크 오류: '.addslashes($curlErr).'");location.href="'.SITE_URL.'";</script>');
}

$tokenRes    = json_decode($tokenBody, true);
$accessToken = $tokenRes['access_token'] ?? '';

if(!$accessToken){
    $errMsg = $tokenRes['error_description'] ?? $tokenRes['error'] ?? $tokenBody;
    if(DEBUG){
        die('<script>alert("토큰 발급 실패\n\n오류: '.addslashes($errMsg).'");location.href="'.SITE_URL.'";</script>');
    }
    die('<script>alert("로그인 처리 중 오류가 발생했습니다.");location.href="'.SITE_URL.'";</script>');
}

// ── 4. 사용자 정보 조회 ──
$profileResult = curlGet('https://openapi.naver.com/v1/nid/me', [
    'Authorization: Bearer ' . $accessToken
]);
$profileRes = json_decode($profileResult['body'], true);

if(($profileRes['resultcode'] ?? '') !== '00'){
    $errMsg = $profileRes['message'] ?? '프로필 조회 실패';
    die('<script>alert("프로필 오류: '.addslashes($errMsg).'");location.href="'.SITE_URL.'";</script>');
}

$profile  = $profileRes['response'];
$naverId  = $profile['id']       ?? '';
$email    = $profile['email']    ?? '';
$nickname = $profile['nickname'] ?? $profile['name'] ?? '네이버회원';

// ── 5. 회원 저장/조회 ──
$users = [];
if(file_exists(USER_FILE)){
    $users = json_decode(file_get_contents(USER_FILE), true) ?: [];
}

$found = null;
foreach($users as &$u){
    if(($u['naver_id'] ?? '') === $naverId){ $found = &$u; break; }
}

if($found){
    $found['last_login'] = date('Y-m-d H:i:s');
    $userData = $found;
} else {
    $userData = [
        'naver_id'   => $naverId,
        'id'         => 'naver_' . substr(md5($naverId), 0, 8),
        'name'       => $nickname,
        'email'      => $email,
        'grade'      => '기공',
        'type'       => 'naver',
        'joined'     => date('Y-m-d H:i:s'),
        'last_login' => date('Y-m-d H:i:s'),
    ];
    $users[] = $userData;
}

file_put_contents(USER_FILE, json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

// ── 6. 메인으로 전달 ──
$userJson = base64_encode(json_encode([
    'id'    => $userData['id'],
    'name'  => $userData['name'],
    'grade' => $userData['grade'],
    'email' => $userData['email'],
    'type'  => 'naver',
]));
?>
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>로그인 중...</title></head>
<body>
<script>
var userData = JSON.parse(atob('<?= $userJson ?>'));
if(window.opener && !window.opener.closed){
    window.opener.naverLoginCallback(userData);
    window.close();
} else {
    localStorage.setItem('naver_login_user', JSON.stringify(userData));
    location.href = '<?= SITE_URL ?>';
}
</script>
<p style="font-family:sans-serif;text-align:center;margin-top:100px;color:#666">로그인 처리 중...</p>
</body>
</html>
