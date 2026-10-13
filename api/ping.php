<?php
/**
 * Silent Health Check / Ping API
 * Verifies if target website/module is online and reachable
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, no-store, must-revalidate');

$targetUrl = isset($_GET['url']) ? trim($_GET['url']) : '';

if (empty($targetUrl) || $targetUrl === '#' || !filter_var($targetUrl, FILTER_VALIDATE_URL)) {
    echo json_encode([
        'reachable' => false,
        'message' => 'URL tidak valid atau kosong',
        'status_code' => 0
    ]);
    exit;
}

$startTime = microtime(true);

$ch = curl_init($targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_NOBODY, true); // Fast HEAD request
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 4);
curl_setopt($ch, CURLOPT_TIMEOUT, 3); // 3 seconds timeout
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2); // 2 seconds connect timeout
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Allow self-signed SSL for local servers
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErrorNo = curl_errno($ch);
$curlError = curl_error($ch);

// If HEAD was rejected with 405 Method Not Allowed, fallback to a small GET request
if ($httpCode === 405) {
    curl_setopt($ch, CURLOPT_NOBODY, false);
    curl_setopt($ch, CURLOPT_RANGE, '0-256');
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErrorNo = curl_errno($ch);
    $curlError = curl_error($ch);
}

curl_close($ch);

$durationMs = round((microtime(true) - $startTime) * 1000);

// A web app is considered actually present and online if:
// 1. Connection succeeded (no curl error)
// 2. HTTP response is 2xx, 3xx (active/redirect), or 401/403 (login required)
// 404 (Not Found) or 502/503/504 (Server Down) are treated as NOT reachable.
$isReachable = ($curlErrorNo === 0 && (
    ($httpCode >= 200 && $httpCode < 400) ||
    $httpCode === 401 ||
    $httpCode === 403
));

echo json_encode([
    'url' => $targetUrl,
    'reachable' => $isReachable,
    'status_code' => $httpCode,
    'duration_ms' => $durationMs,
    'error' => $curlErrorNo !== 0 ? $curlError : ($isReachable ? null : "HTTP Error {$httpCode}")
]);
