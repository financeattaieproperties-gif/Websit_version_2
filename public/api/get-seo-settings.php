<?php
require_once __DIR__ . '/bootstrap.php';
cors();
header('Content-Type: application/json; charset=utf-8');

$defaults = [
    'id'                  => 1,
    'site_name'           => 'Attaie Properties',
    'default_title'       => 'Attaie Properties — Premier Real Estate in Kabul, Afghanistan',
    'title_template'      => '%s | Attaie Properties',
    'default_description' => 'Browse verified luxury villas, modern apartments, commercial spaces, and development projects for sale and rent across Kabul with Attaie Properties.',
    'keywords'            => 'Attaie Properties, Kabul real estate, properties for sale in Kabul, properties for rent in Kabul, luxury villas Kabul, apartments in Kabul, Afghanistan property agency',
    'og_image'            => '/logo.png',
    'twitter_image'       => null,
    'twitter_card'        => 'summary_large_image',
    'twitter_site'        => '@AttaieProps',
    'canonical_base_url'  => 'https://www.attaieproperties.com',
    'robots_index'        => true,
    'updated_at'          => null,
];

try {
    $mysqli = db();
    $stmt = $mysqli->prepare(
        'SELECT id, site_name, default_title, title_template, default_description, keywords, og_image, twitter_image, twitter_card, twitter_site, canonical_base_url, robots_index, updated_at FROM seo_settings WHERE id = 1 LIMIT 1'
    );
    if (!$stmt) {
        json_out($defaults);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;

    if (!$row) {
        json_out($defaults);
    }

    $row['id'] = (int) $row['id'];
    $row['robots_index'] = (bool) $row['robots_index'];
    if (in_array($row['canonical_base_url'] ?? '', ['', 'https://attaieproperties.af', 'https://website.attaieproperties.com'], true)) {
        $row['canonical_base_url'] = 'https://www.attaieproperties.com';
    }
    json_out($row);
} catch (Throwable $e) {
    json_out($defaults);
}
