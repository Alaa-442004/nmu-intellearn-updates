<?php
require __DIR__ . '/db.php';

try {
    $pdo = get_db();

    $userId = isset($_GET['user_id']) ? (int) $_GET['user_id'] : null;

    $sql = "
        SELECT cert.certificate_id,
               cert.certificate_number,
               cert.issued_at,
               cert.expires_at,
               cert.is_verified,
               c.title       AS course_title,
               c.description AS course_description,
               u.first_name,
               u.last_name
        FROM certificates cert
        LEFT JOIN courses c ON c.course_id = cert.course_id
        LEFT JOIN users   u ON u.user_id = cert.user_id
    ";

    $params = [];
    if ($userId) {
        $sql .= " WHERE cert.user_id = :user_id";
        $params['user_id'] = $userId;
    }

    $sql .= " ORDER BY cert.issued_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $certificates = array_map(function ($row) {
        $issuedAt = $row['issued_at'] ? date('F j, Y', strtotime($row['issued_at'])) : null;
        $holder   = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));

        return [
            'id'                => (int) $row['certificate_id'],
            'title'             => $row['course_title'] ?: 'Course Certificate',
            'course'            => $row['course_title'] ?: 'Course',
            'score'             => 100,
            'date'              => $issuedAt,
            'certificateNumber' => $row['certificate_number'],
            'holder'            => $holder ?: 'Student',
            'verified'          => (bool) $row['is_verified'],
        ];
    }, $rows);

    json_response(['success' => true, 'certificates' => $certificates]);
} catch (Exception $e) {
    json_response(['success' => false, 'error' => 'Unable to load certificates at the moment.'], 500);
}

