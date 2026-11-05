<?php
/**
 * Automatic Sitemap.xml Crawler, Builder & Disk Updater for Attaie Properties
 *
 * Crawls live Properties, Projects, Careers, and Published Agents from MySQL,
 * generates a Sitemap 0.9 + Google Image Sitemap 1.1 XML document,
 * writes `/sitemap.xml` and `/sitemap-status.json` to disk, and returns
 * structured crawl statistics for the Admin CRM Sitemap Crawler.
 */

function resolve_sitemap_absolute_url(string $baseUrl, ?string $urlOrPath): ?string {
    if (!$urlOrPath) return null;
    $trimmed = trim($urlOrPath);
    if ($trimmed === '') return null;
    if (preg_match('#^https?://#i', $trimmed)) {
        return $trimmed;
    }
    return rtrim($baseUrl, '/') . '/' . ltrim($trimmed, '/');
}

function crawl_and_generate_sitemap(?string $overrideBaseUrl = null): array {
    $siteUrl = $overrideBaseUrl ? rtrim(trim($overrideBaseUrl), '/') : '';
    $today   = gmdate('Y-m-d');
    $nowIso  = gmdate('Y-m-d\TH:i:s\Z');

    $conn = null;
    if (function_exists('db') || is_file(__DIR__ . '/db.php')) {
        require_once __DIR__ . '/bootstrap.php';
        try {
            $conn = @db();
            if ($conn && $conn->connect_error) {
                $conn = null;
            }
        } catch (Throwable $e) {
            $conn = null;
        }
    }

    // Resolve canonical base URL from seo_settings table if not explicitly overridden
    if ($siteUrl === '' && $conn) {
        $seoRes = @$conn->query('SELECT canonical_base_url FROM seo_settings WHERE id = 1 LIMIT 1');
        if ($seoRes && ($seoRow = $seoRes->fetch_assoc())) {
            $dbBase = rtrim(trim((string) ($seoRow['canonical_base_url'] ?? '')), '/');
            if ($dbBase !== '') {
                $siteUrl = $dbBase;
            }
        }
    }

    if ($siteUrl === '') {
        $siteUrl = 'https://www.attaieproperties.com';
    }

    $staticRoutes = [
        ['path' => '/',           'changefreq' => 'daily',   'priority' => '1.0', 'title' => 'Home — Attaie Properties'],
        ['path' => '/properties', 'changefreq' => 'daily',   'priority' => '0.9', 'title' => 'Properties for Sale & Rent in Kabul'],
        ['path' => '/projects',   'changefreq' => 'weekly',  'priority' => '0.8', 'title' => 'Real Estate Development Projects in Kabul'],
        ['path' => '/careers',    'changefreq' => 'daily',   'priority' => '0.8', 'title' => 'Careers & Job Openings — Attaie Properties'],
        ['path' => '/agents',     'changefreq' => 'weekly',  'priority' => '0.7', 'title' => 'Licensed Property Advisors & Agents'],
        ['path' => '/about',      'changefreq' => 'monthly', 'priority' => '0.6', 'title' => 'About Attaie Properties'],
        ['path' => '/contact',    'changefreq' => 'monthly', 'priority' => '0.7', 'title' => 'Contact Attaie Properties Kabul'],
    ];

    $entries = [];
    foreach ($staticRoutes as $st) {
        $entries[] = [
            'loc'        => $siteUrl . $st['path'],
            'lastmod'    => $today,
            'changefreq' => $st['changefreq'],
            'priority'   => $st['priority'],
            'category'   => 'static',
            'title'      => $st['title'],
            'images'     => [],
        ];
    }

    $propertyCount = 0;
    $projectCount  = 0;
    $careerCount   = 0;
    $agentCount    = 0;

    if ($conn) {
        // 1. Crawl Properties
        $res = @$conn->query('SELECT id, serial_number, title, location, status, image_url, gallery_images, updated_at, created_at FROM properties ORDER BY id DESC');
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $id = (int) ($row['id'] ?? 0);
                if ($id <= 0) continue;
                $propertyCount++;

                $ts = $row['updated_at'] ?? $row['created_at'] ?? null;
                $lastmod = ($ts && preg_match('/^\d{4}-\d{2}-\d{2}/', (string) $ts, $m)) ? $m[0] : $today;
                $title = trim((string) ($row['title'] ?? '')) ?: "Property #$id";
                $serial = trim((string) ($row['serial_number'] ?? ''));
                $location = trim((string) ($row['location'] ?? ''));
                $status = strtolower(trim((string) ($row['status'] ?? 'available')));

                $images = [];
                $primaryImg = resolve_sitemap_absolute_url($siteUrl, $row['image_url'] ?? null);
                if ($primaryImg) {
                    $images[] = [
                        'loc'     => $primaryImg,
                        'title'   => $serial !== '' ? "$title ($serial)" : $title,
                        'caption' => $location !== '' ? "$title in $location" : $title,
                    ];
                }
                if (!empty($row['gallery_images'])) {
                    $decoded = json_decode((string) $row['gallery_images'], true);
                    if (is_array($decoded)) {
                        foreach (array_slice($decoded, 0, 5) as $gImg) {
                            $absG = resolve_sitemap_absolute_url($siteUrl, is_string($gImg) ? $gImg : null);
                            if ($absG) {
                                $exists = false;
                                foreach ($images as $existing) {
                                    if ($existing['loc'] === $absG) {
                                        $exists = true;
                                        break;
                                    }
                                }
                                if (!$exists) {
                                    $images[] = [
                                        'loc'     => $absG,
                                        'title'   => "$title — Gallery",
                                        'caption' => $location !== '' ? $location : 'Kabul, Afghanistan',
                                    ];
                                }
                            }
                        }
                    }
                }

                $isAvailable = ($status === 'available');
                $entries[] = [
                    'loc'        => "$siteUrl/properties/$id",
                    'lastmod'    => $lastmod,
                    'changefreq' => $isAvailable ? 'daily' : 'weekly',
                    'priority'   => $isAvailable ? '0.85' : '0.70',
                    'category'   => 'properties',
                    'title'      => $title,
                    'images'     => $images,
                ];
            }
        }

        // 2. Crawl Projects
        $res = @$conn->query('SELECT id, name, location, status, image_url, gallery_images, masterplan_image, updated_at, created_at FROM projects ORDER BY id DESC');
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $id = (int) ($row['id'] ?? 0);
                if ($id <= 0) continue;
                $projectCount++;

                $ts = $row['updated_at'] ?? $row['created_at'] ?? null;
                $lastmod = ($ts && preg_match('/^\d{4}-\d{2}-\d{2}/', (string) $ts, $m)) ? $m[0] : $today;
                $name = trim((string) ($row['name'] ?? '')) ?: "Project #$id";
                $location = trim((string) ($row['location'] ?? ''));

                $images = [];
                $primaryImg = resolve_sitemap_absolute_url($siteUrl, $row['image_url'] ?? null);
                if ($primaryImg) {
                    $images[] = [
                        'loc'     => $primaryImg,
                        'title'   => $name,
                        'caption' => $location !== '' ? "$name — $location" : $name,
                    ];
                }
                $masterplanImg = resolve_sitemap_absolute_url($siteUrl, $row['masterplan_image'] ?? null);
                if ($masterplanImg) {
                    $images[] = [
                        'loc'     => $masterplanImg,
                        'title'   => "$name — Masterplan",
                        'caption' => "Architectural Masterplan — $name",
                    ];
                }

                $entries[] = [
                    'loc'        => "$siteUrl/projects/$id",
                    'lastmod'    => $lastmod,
                    'changefreq' => 'weekly',
                    'priority'   => '0.85',
                    'category'   => 'projects',
                    'title'      => $name,
                    'images'     => $images,
                ];
            }
        }

        // 3. Crawl Career Announcements (published & closed public pages)
        $res = @$conn->query("SELECT id, title, location, employment_type, status, updated_at, created_at FROM career_jobs WHERE status IN ('published', 'closed') ORDER BY id DESC");
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $id = (int) ($row['id'] ?? 0);
                if ($id <= 0) continue;
                $careerCount++;

                $ts = $row['updated_at'] ?? $row['created_at'] ?? null;
                $lastmod = ($ts && preg_match('/^\d{4}-\d{2}-\d{2}/', (string) $ts, $m)) ? $m[0] : $today;
                $title = trim((string) ($row['title'] ?? '')) ?: "Career Opportunity #$id";
                $status = strtolower(trim((string) ($row['status'] ?? 'published')));
                $isOpen = ($status === 'published');

                $entries[] = [
                    'loc'        => "$siteUrl/careers/$id",
                    'lastmod'    => $lastmod,
                    'changefreq' => $isOpen ? 'daily' : 'weekly',
                    'priority'   => $isOpen ? '0.75' : '0.55',
                    'category'   => 'careers',
                    'title'      => $title,
                    'images'     => [],
                ];
            }
        }

        // 4. Crawl Published Agents
        $res = @$conn->query('SELECT id, name, role, portrait_url, updated_at, created_at FROM agents WHERE published = 1 ORDER BY id DESC');
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $id = (int) ($row['id'] ?? 0);
                if ($id <= 0) continue;
                $agentCount++;

                $ts = $row['updated_at'] ?? $row['created_at'] ?? null;
                $lastmod = ($ts && preg_match('/^\d{4}-\d{2}-\d{2}/', (string) $ts, $m)) ? $m[0] : $today;
                $name = trim((string) ($row['name'] ?? '')) ?: "Agent #$id";
                $role = trim((string) ($row['role'] ?? 'Property Advisor'));

                $images = [];
                $portraitImg = resolve_sitemap_absolute_url($siteUrl, $row['portrait_url'] ?? null);
                if ($portraitImg) {
                    $images[] = [
                        'loc'     => $portraitImg,
                        'title'   => "$name — $role",
                        'caption' => "$name at Attaie Properties",
                    ];
                }

                $entries[] = [
                    'loc'        => "$siteUrl/agents/$id",
                    'lastmod'    => $lastmod,
                    'changefreq' => 'monthly',
                    'priority'   => '0.65',
                    'category'   => 'agents',
                    'title'      => $name,
                    'images'     => $images,
                ];
            }
        }
    }

    $lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ];

    foreach ($entries as $u) {
        $loc  = htmlspecialchars($u['loc'], ENT_XML1, 'UTF-8');
        $last = htmlspecialchars($u['lastmod'], ENT_XML1, 'UTF-8');
        $freq = htmlspecialchars($u['changefreq'], ENT_XML1, 'UTF-8');
        $prio = htmlspecialchars($u['priority'], ENT_XML1, 'UTF-8');

        $lines[] = '  <url>';
        $lines[] = "    <loc>$loc</loc>";
        $lines[] = "    <lastmod>$last</lastmod>";
        $lines[] = "    <changefreq>$freq</changefreq>";
        $lines[] = "    <priority>$prio</priority>";

        if (!empty($u['images']) && is_array($u['images'])) {
            foreach ($u['images'] as $img) {
                $imgLoc = htmlspecialchars((string) ($img['loc'] ?? ''), ENT_XML1, 'UTF-8');
                if ($imgLoc === '') continue;
                $lines[] = '    <image:image>';
                $lines[] = "      <image:loc>$imgLoc</image:loc>";
                if (!empty($img['title'])) {
                    $imgTitle = htmlspecialchars((string) $img['title'], ENT_XML1, 'UTF-8');
                    $lines[] = "      <image:title>$imgTitle</image:title>";
                }
                if (!empty($img['caption'])) {
                    $imgCap = htmlspecialchars((string) $img['caption'], ENT_XML1, 'UTF-8');
                    $lines[] = "      <image:caption>$imgCap</image:caption>";
                }
                $lines[] = '    </image:image>';
            }
        }

        $lines[] = '  </url>';
    }

    $lines[] = '</urlset>';
    $xml = implode("\n", $lines) . "\n";

    $publicRoot = dirname(__DIR__);
    @file_put_contents($publicRoot . '/sitemap.xml', $xml);

    $urlSummaries = [];
    foreach ($entries as $e) {
        $urlSummaries[] = [
            'loc'         => $e['loc'],
            'lastmod'     => $e['lastmod'],
            'changefreq'  => $e['changefreq'],
            'priority'    => $e['priority'],
            'category'    => $e['category'],
            'title'       => $e['title'],
            'image_count' => isset($e['images']) && is_array($e['images']) ? count($e['images']) : 0,
        ];
    }

    $report = [
        'generated_at'       => $nowIso,
        'canonical_base_url' => $siteUrl,
        'sitemap_url'        => "$siteUrl/sitemap.xml",
        'counts'             => [
            'static'     => count($staticRoutes),
            'properties' => $propertyCount,
            'projects'   => $projectCount,
            'careers'    => $careerCount,
            'agents'     => $agentCount,
            'total'      => count($entries),
        ],
        'urls'               => $urlSummaries,
        'xml'                => $xml,
    ];

    $statusPayload = $report;
    unset($statusPayload['xml']);
    @file_put_contents($publicRoot . '/sitemap-status.json', json_encode($statusPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    return $report;
}

function build_and_save_sitemap(string $siteUrl = 'https://www.attaieproperties.com'): string {
    $report = crawl_and_generate_sitemap($siteUrl);
    return $report['xml'];
}
