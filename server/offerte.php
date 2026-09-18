<?php
/**
 * ============================================================================
 *  FORTIS KOZIJNEN - OFFERTE CONFIGURATOR
 *  offerte.php  ->  Ontvangt de offerteaanvraag van de configurator,
 *                   slaat hem op en mailt hem naar Fortis Kozijnen.
 * ============================================================================
 *
 *  Plaatsing: zet dit bestand op de webserver (PHP 7.4 of nieuwer) en zet het
 *  pad ernaartoe in catalog.js -> settings.endpoint.
 *
 *  Het antwoord is altijd JSON:
 *      { "ok": true,  "referentie": "FK-20260918-1234" }
 *      { "ok": false, "fout": "..." }
 * ============================================================================
 */

declare(strict_types=1);

/* ------------------------------------------------------------- instellingen */

$CONFIG = [
    // Waar de aanvragen naartoe gaan
    'ontvanger'      => 'info@fortiskozijnen.nl',
    'afzender'       => 'website@fortiskozijnen.nl',   // moet een adres op het eigen domein zijn
    'bedrijfsnaam'   => 'Fortis Kozijnen',

    // Bevestigingsmail naar de klant sturen?
    'bevestiging'    => true,

    // Map waarin de aanvragen als JSON worden bewaard (leeg = niet opslaan).
    // Zorg dat deze map NIET publiek benaderbaar is via de browser.
    'opslagmap'      => __DIR__ . '/aanvragen',

    // Eenvoudige rem: maximaal dit aantal aanvragen per IP-adres per uur
    'maxPerUur'      => 8,

    // Sta alleen aanvragen toe vanaf het eigen domein (leeg = alles toestaan)
    'toegestaneHosts' => ['www.fortiskozijnen.nl', 'fortiskozijnen.nl'],
];

/* ------------------------------------------------------------------ helpers */

function antwoord(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Verwijdert regeleindes: voorkomt dat er extra mailheaders ingesmokkeld worden. */
function veiligeHeader(string $waarde): string
{
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', $waarde));
}

function tekst($waarde): string
{
    if (is_array($waarde)) {
        return implode(', ', array_map('strval', $waarde));
    }
    return trim((string) $waarde);
}

function euro($bedrag): string
{
    return '€ ' . number_format((float) $bedrag, 2, ',', '.');
}

/* -------------------------------------------------------------- voorcontrole */

header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    header('Allow: POST');
    antwoord(['ok' => false, 'fout' => 'Gebruik POST.'], 405);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    antwoord(['ok' => false, 'fout' => 'Gebruik POST.'], 405);
}

/* Alleen vanaf de eigen website (indien ingesteld) */
if (!empty($CONFIG['toegestaneHosts'])) {
    $herkomst = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
    $host = $herkomst !== '' ? parse_url($herkomst, PHP_URL_HOST) : ($_SERVER['HTTP_HOST'] ?? '');
    if (!in_array((string) $host, $CONFIG['toegestaneHosts'], true)) {
        antwoord(['ok' => false, 'fout' => 'Aanvraag komt van een onbekend domein.'], 403);
    }
}

/* Maximale omvang van het bericht */
$ruw = file_get_contents('php://input');
if ($ruw === false || $ruw === '') {
    antwoord(['ok' => false, 'fout' => 'Lege aanvraag ontvangen.'], 400);
}
if (strlen($ruw) > 512 * 1024) {
    antwoord(['ok' => false, 'fout' => 'De aanvraag is te groot.'], 413);
}

$data = json_decode($ruw, true);
if (!is_array($data)) {
    antwoord(['ok' => false, 'fout' => 'Onleesbare aanvraag.'], 400);
}

/* Eenvoudige rem per IP-adres */
$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'onbekend');
$remBestand = sys_get_temp_dir() . '/fortis-rem-' . md5($ip) . '.json';
$nu = time();
$tijden = [];
if (is_readable($remBestand)) {
    $tijden = json_decode((string) file_get_contents($remBestand), true) ?: [];
}
$tijden = array_values(array_filter($tijden, static fn($t) => ($nu - (int) $t) < 3600));
if (count($tijden) >= (int) $CONFIG['maxPerUur']) {
    antwoord(['ok' => false, 'fout' => 'Er zijn te veel aanvragen vanaf dit adres verstuurd. Probeer het later opnieuw of bel ons.'], 429);
}
$tijden[] = $nu;
@file_put_contents($remBestand, json_encode($tijden), LOCK_EX);

/* ------------------------------------------------------- gegevens uitpakken */

$klant     = is_array($data['klant'] ?? null) ? $data['klant'] : [];
$elementen = is_array($data['elementen'] ?? null) ? $data['elementen'] : [];
$totalen   = is_array($data['totalen'] ?? null) ? $data['totalen'] : [];

$naam     = tekst($klant['naam'] ?? '');
$email    = filter_var(tekst($klant['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$telefoon = tekst($klant['telefoon'] ?? '');
$postcode = tekst($klant['postcode'] ?? '');

if ($naam === '' || $email === false || $telefoon === '' || $postcode === '') {
    antwoord(['ok' => false, 'fout' => 'Naam, e-mailadres, telefoonnummer en postcode zijn verplicht.'], 422);
}
if (empty($elementen)) {
    antwoord(['ok' => false, 'fout' => 'De offerte bevat geen kozijnen.'], 422);
}
if (empty($klant['akkoord'])) {
    antwoord(['ok' => false, 'fout' => 'Akkoord op het gebruik van de gegevens ontbreekt.'], 422);
}

/* Referentienummer: gebruik die van de configurator of maak een nieuwe */
$referentie = tekst($data['referentie'] ?? '');
if (!preg_match('/^FK-\d{8}-\d{4}$/', $referentie)) {
    $referentie = 'FK-' . date('Ymd') . '-' . str_pad((string) random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
}

/* ----------------------------------------------------------------- opslaan */

if (!empty($CONFIG['opslagmap'])) {
    $map = $CONFIG['opslagmap'];
    if (!is_dir($map)) {
        @mkdir($map, 0750, true);
        @file_put_contents($map . '/.htaccess', "Require all denied\n");
    }
    $data['ontvangen'] = date('c');
    $data['ip']        = $ip;
    $data['referentie'] = $referentie;
    @file_put_contents(
        $map . '/' . $referentie . '.json',
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        LOCK_EX
    );
}

/* ------------------------------------------------------------- mail opbouwen */

$regels = [];
$regels[] = 'Nieuwe offerteaanvraag via de online configurator';
$regels[] = 'Referentie: ' . $referentie;
$regels[] = 'Ontvangen op: ' . date('d-m-Y H:i');
$regels[] = str_repeat('=', 62);
$regels[] = '';
$regels[] = 'GEGEVENS AANVRAGER';
$regels[] = 'Naam        : ' . $naam;
$regels[] = 'E-mail      : ' . $email;
$regels[] = 'Telefoon    : ' . $telefoon;
$regels[] = 'Adres       : ' . tekst($klant['adres'] ?? '');
$regels[] = 'Postcode    : ' . $postcode . '  ' . tekst($klant['plaats'] ?? '');
$regels[] = 'Soort woning: ' . tekst($klant['soortWoning'] ?? '-');
$regels[] = 'Periode     : ' . tekst($klant['periode'] ?? '-');
if (tekst($klant['opmerking'] ?? '') !== '') {
    $regels[] = '';
    $regels[] = 'Opmerking   : ' . tekst($klant['opmerking']);
}
$regels[] = '';
$regels[] = str_repeat('-', 62);
$regels[] = 'GECONFIGUREERDE KOZIJNEN';
$regels[] = '';

foreach ($elementen as $i => $element) {
    if (!is_array($element)) {
        continue;
    }
    $regels[] = sprintf('%d. %s', $i + 1, tekst($element['naam'] ?? ('Kozijn ' . ($i + 1))));
    $regels[] = '   ' . tekst($element['omschrijving'] ?? '');
    $regels[] = sprintf(
        '   Aantal: %s x %s = %s',
        tekst($element['aantal'] ?? 1),
        euro($element['prijsPerStuk'] ?? 0),
        euro($element['totaal'] ?? 0)
    );

    $opbouw = is_array($element['prijsopbouw'] ?? null) ? $element['prijsopbouw'] : [];
    foreach ($opbouw as $post) {
        if (!is_array($post)) {
            continue;
        }
        $regels[] = sprintf('      - %-46s %12s', tekst($post['label'] ?? ''), euro($post['bedrag'] ?? 0));
    }

    $waarschuwingen = is_array($element['waarschuwingen'] ?? null) ? $element['waarschuwingen'] : [];
    foreach ($waarschuwingen as $w) {
        $regels[] = '      ! ' . tekst($w);
    }
    $regels[] = '';
}

$regels[] = str_repeat('-', 62);
$regels[] = sprintf('Subtotaal            : %s', euro($totalen['subtotaal'] ?? 0));
if (!empty($totalen['korting'])) {
    $regels[] = sprintf('Staffelkorting %-5s : - %s',
        round(((float) ($totalen['kortingPercentage'] ?? 0)) * 100) . '%',
        euro($totalen['korting']));
}
foreach ((array) ($totalen['eenmaligeDiensten'] ?? []) as $dienst) {
    if (is_array($dienst)) {
        $regels[] = sprintf('%-21s: %s', tekst($dienst['label'] ?? 'Dienst'), euro($dienst['bedrag'] ?? 0));
    }
}
$regels[] = sprintf('Totaal excl. btw     : %s', euro($totalen['exclBtw'] ?? 0));
$regels[] = sprintf('Btw                  : %s', euro($totalen['btw'] ?? 0));
$regels[] = sprintf('TOTAAL INCL. BTW     : %s', euro($totalen['inclBtw'] ?? 0));
$regels[] = '';
$regels[] = 'Herkomst pagina: ' . tekst($data['herkomst'] ?? '-');

$bericht = implode("\r\n", $regels);

/* ------------------------------------------------------------- mail versturen */

$onderwerp = 'Offerteaanvraag ' . $referentie . ' - ' . $naam;

$headers = implode("\r\n", [
    'From: ' . veiligeHeader($CONFIG['bedrijfsnaam']) . ' <' . veiligeHeader($CONFIG['afzender']) . '>',
    'Reply-To: ' . veiligeHeader($naam) . ' <' . veiligeHeader($email) . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: Fortis Configurator',
]);

$verstuurd = @mail(
    $CONFIG['ontvanger'],
    '=?UTF-8?B?' . base64_encode($onderwerp) . '?=',
    $bericht,
    $headers,
    '-f' . $CONFIG['afzender']
);

/* Bevestiging naar de klant */
if ($verstuurd && !empty($CONFIG['bevestiging'])) {
    $klantBericht = implode("\r\n", [
        'Beste ' . $naam . ',',
        '',
        'Bedankt voor uw aanvraag via onze online configurator.',
        'Wij nemen binnen één werkdag contact met u op om de configuratie door te nemen',
        'en een definitieve offerte op te stellen.',
        '',
        'Uw referentie: ' . $referentie,
        '',
        'Hieronder vindt u de samenvatting van uw aanvraag.',
        '',
        $bericht,
        '',
        'Met vriendelijke groet,',
        $CONFIG['bedrijfsnaam'],
    ]);

    @mail(
        $email,
        '=?UTF-8?B?' . base64_encode('Uw offerteaanvraag ' . $referentie) . '?=',
        $klantBericht,
        implode("\r\n", [
            'From: ' . veiligeHeader($CONFIG['bedrijfsnaam']) . ' <' . veiligeHeader($CONFIG['afzender']) . '>',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
        ]),
        '-f' . $CONFIG['afzender']
    );
}

if (!$verstuurd) {
    // De aanvraag staat wel opgeslagen: meld dat, zodat niets verloren gaat.
    antwoord([
        'ok' => false,
        'fout' => 'De aanvraag is opgeslagen, maar de e-mail kon niet worden verstuurd.',
        'referentie' => $referentie,
    ], 500);
}

antwoord(['ok' => true, 'referentie' => $referentie]);
