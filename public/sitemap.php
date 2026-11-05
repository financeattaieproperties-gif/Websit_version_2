<?php
/**
 * Dynamic XML Sitemap Generator for Attaie Properties
 *
 * Crawls live Property, Project, Career, and Published Agent IDs from MySQL
 * and returns a valid Sitemap 0.9 + Google Image Sitemap 1.1 XML document
 * while also updating `/sitemap.xml` on disk.
 */
header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');

require_once __DIR__ . '/api/sitemap-helper.php';
$report = crawl_and_generate_sitemap();
echo $report['xml'];
