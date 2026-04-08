<?php
/**
 * 설비트리거 - 네이버 로그인 시작
 * 위치: /html/naver_login.php
 */

define('NAVER_CLIENT_ID',     'X4ZLWeXd6cSSzF3FC3Cr');
define('NAVER_CLIENT_SECRET', 'izINeRCUn1');
define('NAVER_CALLBACK_URL',  'http://baboyayo.dothome.co.kr/naver_callback.php');

// CSRF 방지용 state 값 생성
session_start();
$state = bin2hex(random_bytes(16));
$_SESSION['naver_state'] = $state;

// 네이버 인증 URL로 리다이렉트
$authUrl = 'https://nid.naver.com/oauth2.0/authorize'
    . '?response_type=code'
    . '&client_id=' . NAVER_CLIENT_ID
    . '&redirect_uri=' . urlencode(NAVER_CALLBACK_URL)
    . '&state=' . $state;

header('Location: ' . $authUrl);
exit;
