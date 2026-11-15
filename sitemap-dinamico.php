<?php
declare(strict_types=1);

header('Content-Type: application/xml; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=300');

define('ACPA_BLOG_METRICS_INCLUDE', true);
require_once __DIR__ . DIRECTORY_SEPARATOR . 'blog' . DIRECTORY_SEPARATOR . 'blog-metrics-lib.php';

$urls = [];
$addPage = static function (string $path, string $file) use (&$urls): void {
    if (!is_file($file)) {
        return;
    }
    $modifiedAt = @filemtime($file);
    $urls[$path] = $modifiedAt === false ? date('Y-m-d') : date('Y-m-d', $modifiedAt);
};

$addPage('/', __DIR__ . DIRECTORY_SEPARATOR . 'index.html');
$addPage('/nosotros', __DIR__ . DIRECTORY_SEPARATOR . 'nosotros.html');
$addPage('/servicios', __DIR__ . DIRECTORY_SEPARATOR . 'servicios.html');
$addPage('/contacto', __DIR__ . DIRECTORY_SEPARATOR . 'contacto.html');
$addPage('/redes-sociales', __DIR__ . DIRECTORY_SEPARATOR . 'redes-sociales.html');
$addPage('/calculadora', __DIR__ . DIRECTORY_SEPARATOR . 'calculadora.html');
$addPage('/privacidad', __DIR__ . DIRECTORY_SEPARATOR . 'privacidad.html');
$addPage('/cookies', __DIR__ . DIRECTORY_SEPARATOR . 'cookies.html');
$addPage('/terminos', __DIR__ . DIRECTORY_SEPARATOR . 'terminos.html');
$addPage('/blog/', __DIR__ . DIRECTORY_SEPARATOR . 'blog' . DIRECTORY_SEPARATOR . 'index.html');

$blogDirectory = __DIR__ . DIRECTORY_SEPARATOR . 'blog';
if (is_dir($blogDirectory) && is_readable($blogDirectory)) {
    foreach (new DirectoryIterator($blogDirectory) as $item) {
        if (!$item->isDir() || $item->isDot()) {
            continue;
        }

        $slug = $item->getFilename();
        $postFile = $item->getPathname() . DIRECTORY_SEPARATOR . 'post.json';
        $articleFile = $item->getPathname() . DIRECTORY_SEPARATOR . 'index.html';
        if (!preg_match('/^[a-z0-9][a-z0-9-]{0,79}$/D', $slug) || !is_file($postFile) || !is_file($articleFile)) {
            continue;
        }

        $post = json_decode((string) file_get_contents($postFile), true);
        if (!is_array($post) || empty($post['titulo']) || !acpaBlogIsPublished($post)) {
            continue;
        }

        $postModified = @filemtime($postFile);
        $articleModified = @filemtime($articleFile);
        $modifiedAt = max((int) $postModified, (int) $articleModified);
        $urls['/blog/' . $slug . '/'] = date('Y-m-d', $modifiedAt ?: time());
    }
}

ksort($urls, SORT_STRING);
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($urls as $path => $lastModified) {
    $location = htmlspecialchars('https://acpa.mx' . $path, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    echo "  <url>\n";
    echo '    <loc>' . $location . "</loc>\n";
    echo '    <lastmod>' . $lastModified . "</lastmod>\n";
    echo "  </url>\n";
}
echo '</urlset>' . "\n";
