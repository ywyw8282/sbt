<?php
/**
 * 설비트리거 - 회원가입/로그인 API
 * 위치: /html/api/auth.php
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// 모든 PHP 에러를 JSON으로 변환 (HTML 에러 방지)
set_error_handler(function($errno, $errstr) {
    echo json_encode(['ok'=>false,'msg'=>'서버 오류: '.$errstr]);
    exit;
});
set_exception_handler(function($e) {
    echo json_encode(['ok'=>false,'msg'=>'서버 예외: '.$e->getMessage()]);
    exit;
});

require_once '../db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';
$input  = json_decode(file_get_contents('php://input'), true);
if (!$input) $input = [];

// ── sbt_users 컬럼 자동 추가 ──
try {
    $existCols = [];
    $st = $pdo->query("SHOW COLUMNS FROM sbt_users");
    foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $col) $existCols[] = $col['Field'];

    $toAdd = [
        'real_name' => "VARCHAR(50) NOT NULL DEFAULT ''",
        'birth'     => "VARCHAR(20) NOT NULL DEFAULT ''",
        'gender'    => "VARCHAR(10) NOT NULL DEFAULT ''",
        'email'     => "VARCHAR(200) NOT NULL DEFAULT ''",
        'grade'     => "VARCHAR(20) NOT NULL DEFAULT '용역'",
        'cash'      => "INT NOT NULL DEFAULT 0",
        'exp'       => "INT NOT NULL DEFAULT 0",
        'last_login'=> "DATETIME NULL DEFAULT NULL",
    ];
    foreach ($toAdd as $col => $def) {
        if (!in_array($col, $existCols)) {
            $pdo->exec("ALTER TABLE sbt_users ADD COLUMN `$col` $def");
        }
    }
} catch (Exception $e) { /* 무시 */ }

/* ════════════════════════════
   아이디 중복 확인
════════════════════════════ */
if ($action === 'check_id') {
    $username = trim($input['username'] ?? '');
    if (!$username || strlen($username) < 4) {
        echo json_encode(['ok'=>true,'available'=>false,'msg'=>'아이디는 4자 이상이어야 합니다.']); exit;
    }
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        echo json_encode(['ok'=>true,'available'=>false,'msg'=>'영문, 숫자, _만 사용 가능합니다.']); exit;
    }
    if ($username === 'admin') {
        echo json_encode(['ok'=>true,'available'=>false,'msg'=>'사용할 수 없는 아이디입니다.']); exit;
    }
    $st = $pdo->prepare("SELECT id FROM sbt_users WHERE username = ? LIMIT 1");
    $st->execute([$username]);
    if ($st->fetch()) {
        echo json_encode(['ok'=>true,'available'=>false,'msg'=>'이미 사용 중인 아이디입니다.']); exit;
    }
    echo json_encode(['ok'=>true,'available'=>true,'msg'=>'✅ 사용 가능한 아이디입니다.']); exit;
}

/* ════════════════════════════
   회원가입
════════════════════════════ */
if ($action === 'register') {
    $username  = trim($input['username']  ?? '');
    $password  = trim($input['password']  ?? '');
    $name      = trim($input['name']      ?? '');
    $real_name = trim($input['real_name'] ?? '');
    $birth     = trim($input['birth']     ?? '');
    $gender    = trim($input['gender']    ?? '');
    $email     = trim($input['email']     ?? '');
    $grade     = '용역'; // 항상 최하위로 시작

    if (!$username || !$password || !$name) {
        echo json_encode(['ok'=>false,'msg'=>'필수 항목이 누락됐습니다.']); exit;
    }
    if (strlen($username) < 4) {
        echo json_encode(['ok'=>false,'msg'=>'아이디는 4자 이상이어야 합니다.']); exit;
    }
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        echo json_encode(['ok'=>false,'msg'=>'아이디는 영문, 숫자, _만 사용 가능합니다.']); exit;
    }
    if (strlen($password) < 8) {
        echo json_encode(['ok'=>false,'msg'=>'비밀번호는 8자 이상이어야 합니다.']); exit;
    }

    // 아이디 중복
    $st = $pdo->prepare("SELECT id FROM sbt_users WHERE username = ? LIMIT 1");
    $st->execute([$username]);
    if ($st->fetch()) {
        echo json_encode(['ok'=>false,'msg'=>'이미 사용 중인 아이디입니다.']); exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $st = $pdo->prepare(
        "INSERT INTO sbt_users (username, password, name, real_name, birth, gender, grade, email, exp, cash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())"
    );
    $st->execute([$username, $hash, $name, $real_name, $birth, $gender, $grade, $email]);
    $newId = $pdo->lastInsertId();

    echo json_encode([
        'ok'   => true,
        'user' => [
            'id'       => (int)$newId,
            'username' => $username,
            'name'     => $name,
            'grade'    => $grade,
            'cash'     => 0,
            'exp'      => 0,
        ]
    ]); exit;
}

/* ════════════════════════════
   로그인
════════════════════════════ */
if ($action === 'login') {
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (!$username || !$password) {
        echo json_encode(['ok'=>false,'msg'=>'아이디와 비밀번호를 입력해주세요.']); exit;
    }

    $st = $pdo->prepare("SELECT * FROM sbt_users WHERE username = ? LIMIT 1");
    $st->execute([$username]);
    $user = $st->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['ok'=>false,'msg'=>'아이디 또는 비밀번호가 올바르지 않습니다.']); exit;
    }

    $pwOk = false;
    if (password_verify($password, $user['password']))   $pwOk = true;
    elseif ($user['password'] === $password)             $pwOk = true; // 평문 폴백

    if (!$pwOk) {
        echo json_encode(['ok'=>false,'msg'=>'아이디 또는 비밀번호가 올바르지 않습니다.']); exit;
    }

    // 로그인 시간 업데이트
    $pdo->prepare("UPDATE sbt_users SET last_login=NOW() WHERE id=?")->execute([$user['id']]);

    // PHP 세션에도 저장 (charge_request.php 등 PHP 페이지용)
    if (session_status() === PHP_SESSION_NONE) session_start();
    $_SESSION['sbt_user'] = [
        'id'   => (int)$user['id'],
        'name' => $user['name'],
        'type' => $user['type'] ?? 'user',
    ];

    echo json_encode([
        'ok'   => true,
        'user' => [
            'id'        => (int)$user['id'],
            'username'  => $user['username'],
            'name'      => $user['name'],
            'real_name' => $user['real_name'] ?? '',
            'birth'     => $user['birth']     ?? '',
            'gender'    => $user['gender']    ?? '',
            'grade'     => $user['grade']     ?? '용역',
            'email'     => $user['email']     ?? '',
            'exp'       => (int)($user['exp']  ?? 0),
            'cash'      => (int)($user['cash'] ?? 0),
        ]
    ]); exit;
}

/* ════════════════════════════
   회원 정보 조회
════════════════════════════ */
if ($action === 'get_user') {
    $uid = (int)($input['db_id'] ?? 0);
    if (!$uid) { echo json_encode(['ok'=>false,'msg'=>'잘못된 요청']); exit; }
    $st = $pdo->prepare("SELECT * FROM sbt_users WHERE id=? LIMIT 1");
    $st->execute([$uid]);
    $user = $st->fetch(PDO::FETCH_ASSOC);
    if (!$user) { echo json_encode(['ok'=>false,'msg'=>'회원 없음']); exit; }
    unset($user['password']);
    echo json_encode(['ok'=>true,'user'=>$user]); exit;
}

/* ════════════════════════════
   닉네임 변경
════════════════════════════ */
if ($action === 'update_name') {
    $uid  = (int)(  $input['db_id'] ?? 0);
    $name = trim($input['name']   ?? '');
    if (!$uid || !$name) { echo json_encode(['ok'=>false,'msg'=>'잘못된 요청']); exit; }
    $pdo->prepare("UPDATE sbt_users SET name=? WHERE id=?")->execute([$name, $uid]);
    echo json_encode(['ok'=>true]); exit;
}

/* ════════════════════════════
   비밀번호 변경
════════════════════════════ */
if ($action === 'change_pw') {
    $uid   = (int)($input['db_id']  ?? 0);
    $curPw = trim($input['cur_pw']  ?? '');
    $newPw = trim($input['new_pw']  ?? '');
    if (!$uid || !$curPw || !$newPw) { echo json_encode(['ok'=>false,'msg'=>'잘못된 요청']); exit; }
    $st = $pdo->prepare("SELECT password FROM sbt_users WHERE id=? LIMIT 1");
    $st->execute([$uid]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    if (!$row || !password_verify($curPw, $row['password'])) {
        echo json_encode(['ok'=>false,'msg'=>'현재 비밀번호가 올바르지 않습니다.']); exit;
    }
    if (strlen($newPw) < 8) { echo json_encode(['ok'=>false,'msg'=>'비밀번호는 8자 이상이어야 합니다.']); exit; }
    $pdo->prepare("UPDATE sbt_users SET password=? WHERE id=?")->execute([password_hash($newPw, PASSWORD_DEFAULT), $uid]);
    echo json_encode(['ok'=>true]); exit;
}

echo json_encode(['ok'=>false,'msg'=>'알 수 없는 요청: '.$action]);
