<?php
/**
 * Envoi du formulaire de contact.
 * Inactif tant que contact-config.php n'existe pas (voir contact-config.example.php).
 * Répond {"ok":true} uniquement si le serveur de messagerie a accepté le message.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const MIN_SECONDS = 3;      // délai minimal de saisie
const MAX_PER_HOUR = 5;     // envois maximum par adresse IP
const MAX_PER_DAY_ALL = 50; // plafond global quotidien

function reply(int $status, string $code): void
{
    http_response_code($status);
    echo json_encode(['ok' => $status === 200, 'code' => $code]);
    exit;
}

function length(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}

/** Compteur à fenêtre glissante, protégé par un verrou de fichier. */
function allow(string $key, int $max, int $window): bool
{
    $file = sys_get_temp_dir() . '/pf_contact_' . hash('sha256', __DIR__ . $key);
    $h = fopen($file, 'c+');
    if (!$h || !flock($h, LOCK_EX)) {
        return false;
    }
    $now = time();
    $hits = json_decode((string) stream_get_contents($h), true);
    $hits = array_values(array_filter(is_array($hits) ? $hits : [], fn ($t) => $t > $now - $window));
    $ok = count($hits) < $max;
    if ($ok) {
        $hits[] = $now;
        ftruncate($h, 0);
        rewind($h);
        fwrite($h, json_encode($hits));
    }
    flock($h, LOCK_UN);
    fclose($h);
    return $ok;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, 'method');
}

// Refuse les envois provenant d'un autre site.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $o = parse_url($origin);
    $host = ($o['host'] ?? '') . (isset($o['port']) ? ':' . $o['port'] : '');
    if (strcasecmp($host, $_SERVER['HTTP_HOST'] ?? '') !== 0) {
        reply(403, 'origin');
    }
}

$field = fn (string $k): string => is_string($_POST[$k] ?? null) ? trim($_POST[$k]) : '';

// Pièges anti-robots : champ invisible rempli, ou formulaire envoyé trop vite.
if ($field('website') !== '' || (int) $field('elapsed') < MIN_SECONDS) {
    reply(400, 'spam');
}

$name = $field('nom');
$email = $field('email');
$subject = $field('sujet');
$message = $field('message');
$subjects = ['Projet freelance', 'Proposition de poste', 'Collaboration', 'Autre'];

if (
    $name === '' || length($name) > 80 || preg_match('/[\r\n]/', $name . $email)
    || length($email) > 150 || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || !in_array($subject, $subjects, true)
    || length($message) < 10 || length($message) > 3000
) {
    reply(422, 'invalid');
}

$configFile = __DIR__ . '/contact-config.php';
$config = is_file($configFile) ? require $configFile : null;
if (
    !is_array($config)
    || !filter_var($config['to'] ?? '', FILTER_VALIDATE_EMAIL)
    || !filter_var($config['from'] ?? '', FILTER_VALIDATE_EMAIL)
) {
    reply(503, 'not_configured');
}

if (!allow('ip:' . ($_SERVER['REMOTE_ADDR'] ?? ''), MAX_PER_HOUR, 3600) || !allow('all', MAX_PER_DAY_ALL, 86400)) {
    header('Retry-After: 3600');
    reply(429, 'rate_limit');
}

$headers = [
    'From' => $config['from'],
    'Reply-To' => $email,
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
];
$body = "Nom : $name\nE-mail : $email\nSujet : $subject\n\n$message\n";
$encodedSubject = '=?UTF-8?B?' . base64_encode("[Portfolio] $subject") . '?=';

if (!@mail($config['to'], $encodedSubject, $body, $headers)) {
    reply(502, 'send_failed');
}
reply(200, 'sent');
