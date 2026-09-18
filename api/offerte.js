/*
 * ============================================================================
 *  FORTIS KOZIJNEN - OFFERTE CONFIGURATOR
 *  api/offerte.js  ->  Node-versie van het offerte-endpoint (Vercel).
 * ============================================================================
 *
 *  Draait de website op Vercel of een andere Node-omgeving, dan neemt dit
 *  bestand de plaats in van server/offerte.php. vercel.json stuurt
 *  /server/offerte.php door naar deze functie, zodat de configurator zelf
 *  niet aangepast hoeft te worden.
 *
 *  LET OP: deze functie controleert en logt de aanvraag, maar verstuurt zelf
 *  geen e-mail. Vercel heeft geen mailserver. Vul hieronder bij `verstuurMail`
 *  een maildienst in (Resend, Postmark, SendGrid, SMTP via Nodemailer) en zet
 *  de sleutel als omgevingsvariabele in het Vercel-project. Zonder die stap is
 *  dit een demo-endpoint: het antwoordt netjes, maar er komt geen bericht aan.
 * ============================================================================
 */

const CONFIG = {
  ontvanger: process.env.OFFERTE_ONTVANGER || 'info@fortiskozijnen.nl',
  afzender: process.env.OFFERTE_AFZENDER || 'website@fortiskozijnen.nl',
  bedrijfsnaam: 'Fortis Kozijnen',
  // Leeg laten om aanvragen vanaf elk domein toe te staan (handig bij een demo).
  toegestaneHosts: (process.env.OFFERTE_HOSTS || '')
    .split(',').map((h) => h.trim()).filter(Boolean),
};

const euro = (bedrag) =>
  '€ ' + Number(bedrag || 0).toLocaleString('nl-NL', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

const tekst = (waarde) => String(waarde === undefined || waarde === null ? '' : waarde).trim();

function referentieNummer() {
  const d = new Date();
  const datum = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `FK-${datum}-${Math.floor(Math.random() * 9000) + 1000}`;
}

/** Leesbare samenvatting van de aanvraag, klaar om te mailen of te loggen. */
function samenvatting(data, referentie) {
  const klant = data.klant || {};
  const totalen = data.totalen || {};
  const regels = [
    `Nieuwe offerteaanvraag via de online configurator`,
    `Referentie: ${referentie}`,
    '',
    'GEGEVENS AANVRAGER',
    `Naam        : ${tekst(klant.naam)}`,
    `E-mail      : ${tekst(klant.email)}`,
    `Telefoon    : ${tekst(klant.telefoon)}`,
    `Adres       : ${tekst(klant.adres)}`,
    `Postcode    : ${tekst(klant.postcode)}  ${tekst(klant.plaats)}`,
    `Soort woning: ${tekst(klant.soortWoning) || '-'}`,
    `Periode     : ${tekst(klant.periode) || '-'}`,
  ];
  if (tekst(klant.opmerking)) regels.push('', `Opmerking   : ${tekst(klant.opmerking)}`);

  regels.push('', 'GECONFIGUREERDE KOZIJNEN', '');
  (data.elementen || []).forEach((element, i) => {
    regels.push(`${i + 1}. ${tekst(element.naam) || `Kozijn ${i + 1}`}`);
    regels.push(`   ${tekst(element.omschrijving)}`);
    regels.push(`   Aantal: ${element.aantal} x ${euro(element.prijsPerStuk)} = ${euro(element.totaal)}`);
    (element.prijsopbouw || []).forEach((post) => {
      regels.push(`      - ${tekst(post.label).padEnd(46)} ${euro(post.bedrag)}`);
    });
    (element.waarschuwingen || []).forEach((w) => regels.push(`      ! ${tekst(w)}`));
    regels.push('');
  });

  regels.push(`Totaal excl. btw : ${euro(totalen.exclBtw)}`);
  regels.push(`Btw              : ${euro(totalen.btw)}`);
  regels.push(`TOTAAL INCL. BTW : ${euro(totalen.inclBtw)}`);
  return regels.join('\n');
}

/**
 * Hier komt de koppeling met de maildienst. Geef `true` terug zodra het
 * bericht daadwerkelijk verstuurd is.
 */
async function verstuurMail() {
  // Voorbeeld met Resend:
  //
  //   const res = await fetch('https://api.resend.com/emails', {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       from: `${CONFIG.bedrijfsnaam} <${CONFIG.afzender}>`,
  //       to: CONFIG.ontvanger,
  //       reply_to: klantEmail,
  //       subject: `Offerteaanvraag ${referentie}`,
  //       text: bericht,
  //     }),
  //   });
  //   return res.ok;
  return false;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, fout: 'Gebruik POST.' });
  }

  if (CONFIG.toegestaneHosts.length) {
    const herkomst = req.headers.origin || req.headers.referer || '';
    let host = '';
    try { host = herkomst ? new URL(herkomst).host : ''; } catch (e) { host = ''; }
    if (!CONFIG.toegestaneHosts.includes(host)) {
      return res.status(403).json({ ok: false, fout: 'Aanvraag komt van een onbekend domein.' });
    }
  }

  let data = req.body;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (e) { data = null; }
  }
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ ok: false, fout: 'Onleesbare aanvraag.' });
  }

  const klant = data.klant || {};
  const naam = tekst(klant.naam);
  const email = tekst(klant.email);
  const telefoon = tekst(klant.telefoon);
  const postcode = tekst(klant.postcode);
  const geldigEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  if (!naam || !geldigEmail || !telefoon || !postcode) {
    return res.status(422).json({
      ok: false,
      fout: 'Naam, e-mailadres, telefoonnummer en postcode zijn verplicht.',
    });
  }
  if (!Array.isArray(data.elementen) || data.elementen.length === 0) {
    return res.status(422).json({ ok: false, fout: 'De offerte bevat geen kozijnen.' });
  }
  if (!klant.akkoord) {
    return res.status(422).json({ ok: false, fout: 'Akkoord op het gebruik van de gegevens ontbreekt.' });
  }

  const referentie = /^FK-\d{8}-\d{4}$/.test(tekst(data.referentie))
    ? tekst(data.referentie)
    : referentieNummer();

  const bericht = samenvatting(data, referentie);

  // Zonder maildienst blijft de aanvraag in de logboeken van Vercel staan.
  console.log(`[offerte] ${referentie}\n${bericht}`);

  await verstuurMail();

  return res.status(200).json({ ok: true, referentie });
};
