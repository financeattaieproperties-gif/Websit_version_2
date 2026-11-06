<?php
/**
 * Optional upload optimization using PHP GD. Returns optimized bytes + extension,
 * or null when GD is unavailable or the output is not smaller.
 * Technical drawings are lossless by default; photos use WebP.
 */
function optimize_uploaded_image(string $bytes, string $mime, int $width, int $height, string $purpose): ?array {
    if (!function_exists('imagecreatefromstring') || !function_exists('imagewebp')) return null;
    if ($width < 1 || $height < 1 || $width * $height > 24000000) return null;
    // GIF animation and transparent PNG drawings should not be flattened.
    if ($mime === 'image/gif') return null;
    $src = @imagecreatefromstring($bytes);
    if (!$src) return null;
    $isDrawing = in_array($purpose, ['blueprint','technical','legend','floor_plan'], true);
    $maxEdge = $isDrawing ? 6000 : 2560;
    $scale = min(1, $maxEdge / max($width, $height));
    $w = max(1, (int) round($width * $scale));
    $h = max(1, (int) round($height * $scale));
    $canvas = imagecreatetruecolor($w, $h);
    if (!$canvas) { imagedestroy($src); return null; }
    imagealphablending($canvas, false);
    imagesavealpha($canvas, true);
    $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
    imagefilledrectangle($canvas, 0, 0, $w, $h, $transparent);
    if (!imagecopyresampled($canvas, $src, 0, 0, 0, 0, $w, $h, $width, $height)) {
        imagedestroy($canvas); imagedestroy($src); return null;
    }
    ob_start();
    if ($isDrawing) {
        $ok = imagepng($canvas, null, 8);
        $ext = 'png'; $outputMime = 'image/png';
    } else {
        $quality = in_array($purpose, ['exterior','building_exterior','furnished'], true) ? 85 : 82;
        $ok = imagewebp($canvas, null, $quality);
        $ext = 'webp'; $outputMime = 'image/webp';
    }
    $output = ob_get_clean();
    imagedestroy($canvas); imagedestroy($src);
    if (!$ok || !is_string($output) || strlen($output) >= strlen($bytes)) return null;
    return ['bytes'=>$output,'ext'=>$ext,'mime'=>$outputMime,'width'=>$w,'height'=>$h];
}
