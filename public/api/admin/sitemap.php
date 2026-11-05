<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../sitemap-helper.php';
cors();
require_admin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' || $method === 'POST') {
    $overrideBase = null;
    if ($method === 'POST') {
        $b = body();
        if (!empty($b['canonical_base_url']) && is_string($b['canonical_base_url'])) {
            $overrideBase = trim($b['canonical_base_url']);
        }
    }
    $report = crawl_and_generate_sitemap($overrideBase);
    json_out($report);
}

json_out(['error' => 'Method not allowed'], 405);
