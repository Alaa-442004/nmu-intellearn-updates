<?php
require __DIR__ . '/db.php';

$storagePath = __DIR__ . '/chat-storage.json';

function read_chat_storage(string $path): array
{
    if (!file_exists($path)) {
        return [
            'last_message_id' => 0,
            'rooms' => [
                ['id' => 'general', 'name' => 'General'],
                ['id' => 'cs101', 'name' => 'CS 101'],
                ['id' => 'math201', 'name' => 'Math 201'],
            ],
            'messages' => [],
        ];
    }

    $raw = file_get_contents($path);
    if ($raw === false || trim($raw) === '') {
        return ['last_message_id' => 0, 'rooms' => [], 'messages' => []];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return ['last_message_id' => 0, 'rooms' => [], 'messages' => []];
    }

    return $data;
}

function write_chat_storage(string $path, array $data): void
{
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT));
}

$action = $_GET['action'] ?? '';
$storage = read_chat_storage($storagePath);

if ($action === 'rooms' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'rooms' => $storage['rooms'] ?? []]);
}

if ($action === 'messages' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $roomId = (string)($_GET['room_id'] ?? 'general');
    $lastId = (int)($_GET['last_id'] ?? 0);

    $messages = array_values(array_filter($storage['messages'] ?? [], function ($message) use ($roomId, $lastId) {
        return ($message['room_id'] ?? '') === $roomId && (int)($message['id'] ?? 0) > $lastId;
    }));

    json_response(['success' => true, 'messages' => $messages]);
}

if ($action === 'send' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = read_json_input();
    $roomId = trim((string)($payload['room_id'] ?? 'general'));
    $username = trim((string)($payload['username'] ?? 'Student'));
    $message = trim((string)($payload['message'] ?? ''));

    if ($message === '') {
        json_response(['success' => false, 'error' => 'Message cannot be empty.'], 422);
    }

    $nextId = ((int)($storage['last_message_id'] ?? 0)) + 1;
    $row = [
        'id' => $nextId,
        'room_id' => $roomId,
        'username' => $username === '' ? 'Student' : $username,
        'message' => $message,
        'created_at' => gmdate('c'),
    ];

    $storage['last_message_id'] = $nextId;
    $storage['messages'][] = $row;
    write_chat_storage($storagePath, $storage);

    json_response(['success' => true, 'message' => $row]);
}

if ($action === 'create_room' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = read_json_input();
    $name = trim((string)($payload['name'] ?? ''));

    if ($name === '') {
        json_response(['success' => false, 'error' => 'Room name is required.'], 422);
    }

    $id = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name));
    $id = trim($id, '-');
    if ($id === '') {
        $id = 'room-' . time();
    }

    foreach (($storage['rooms'] ?? []) as $room) {
        if (($room['id'] ?? '') === $id) {
            json_response(['success' => true, 'room' => $room]);
        }
    }

    $newRoom = ['id' => $id, 'name' => $name];
    $storage['rooms'][] = $newRoom;
    write_chat_storage($storagePath, $storage);

    json_response(['success' => true, 'room' => $newRoom]);
}

json_response(['success' => false, 'error' => 'Unsupported action.'], 404);
