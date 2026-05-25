<?php
// Shared bootstrap for NMU IntelliLearn PHP APIs.

function env_value(string $key, string $default = ''): string
{
    $value = getenv($key);
    if ($value === false) {
        return $default;
    }
    return $value;
}

function apply_cors(): void
{
    $allowedOrigins = array_filter(array_map('trim', explode(',', env_value('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000'))));
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    header('Content-Type: application/json; charset=utf-8');
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
    } elseif ($origin === '' && !empty($allowedOrigins)) {
        header("Access-Control-Allow-Origin: {$allowedOrigins[0]}");
    }
}

function json_response(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function read_json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return [];
    }

    return $decoded;
}

apply_cors();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function get_db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $host = env_value('DB_HOST', '127.0.0.1');
    $db = env_value('DB_NAME', 'pro-gr');
    $user = env_value('DB_USER', 'root');
    $pass = env_value('DB_PASS', '');
    $charset = env_value('DB_CHARSET', 'utf8mb4');

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        json_response(['success' => false, 'error' => 'Database connection failed.'], 500);
    }

    return $pdo;
}

