<?php
/**
 * 설비트리거 DB 연결
 * 위치: /html/db.php
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'baboyayo');
define('DB_USER', 'baboyayo');
define('DB_PASS', 'qkrdbwns16^');
define('DB_CHARSET', 'utf8mb4');

try {
    $pdo = new PDO(
        'mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset='.DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // DB 연결 실패 시 JSON 에러 반환 (HTML 에러 방지)
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'msg' => 'DB 연결 오류: ' . $e->getMessage()]);
    exit;
}

/* ── 공통 헬퍼 함수 ── */
function getDB() {
    global $pdo;
    return $pdo;
}

function jsonOk($data = []) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array_merge(['ok' => true], $data));
    exit;
}

function jsonErr($msg, $code = 200) {
    header('Content-Type: application/json; charset=utf-8');
    if ($code !== 200) http_response_code($code);
    echo json_encode(['ok' => false, 'msg' => $msg]);
    exit;
}

function requireLogin() {
    if (!isset($_SESSION) || session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION['sbt_user'])) {
        jsonErr('로그인이 필요합니다.', 401);
    }
    return $_SESSION['sbt_user'];
}

function requireAdmin() {
    $user = requireLogin();
    if (($user['type'] ?? '') !== 'admin') {
        jsonErr('관리자 전용 기능입니다.', 403);
    }
    return $user;
}
