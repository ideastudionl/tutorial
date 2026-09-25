/* =============================================================
   Adres opzoeken op postcode + huisnummer via de PDOK Locatieserver
   (Kadaster, gratis, gebaseerd op de BAG). Server-side, zodat CORS en
   eventuele rate limits ons in de browser niet in de weg zitten.
   ============================================================= */

const PDOK = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free';

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const postcode = (url.searchParams.get('postcode') || '').replace(/\s+/g, '').toUpperCase();
  const number = (url.searchParams.get('number') || '').trim();

  res.setHeader('Cache-Control', 'public, max-age=86400');

  if (!/^[1-9][0-9]{3}[A-Z]{2}$/.test(postcode) || !number) {
    res.status(400).json({ message: 'Postcode of huisnummer klopt niet' });
    return;
  }

  const query = new URLSearchParams({
    q: postcode + ' ' + number,
    fq: 'type:adres',
    rows: '1',
    fl: 'straatnaam,woonplaatsnaam,postcode,huis_nlt,weergavenaam'
  });

  let data;
  try {
    const upstream = await fetch(PDOK + '?' + query.toString(), {
      headers: { Accept: 'application/json' }
    });
    if (!upstream.ok) throw new Error('HTTP ' + upstream.status);
    data = await upstream.json();
  } catch (err) {
    res.status(502).json({ message: 'Adressenregister is niet bereikbaar: ' + err.message });
    return;
  }

  const hit = data && data.response && data.response.docs && data.response.docs[0];
  if (!hit || !hit.straatnaam) {
    res.status(404).json({ message: 'Geen adres gevonden bij deze postcode en huisnummer' });
    return;
  }

  res.status(200).json({
    street: hit.straatnaam,
    city: hit.woonplaatsnaam,
    postcode: (hit.postcode || postcode).replace(/^(\d{4})\s?([A-Z]{2})$/, '$1 $2'),
    number: hit.huis_nlt || number,
    full: hit.weergavenaam
  });
};
