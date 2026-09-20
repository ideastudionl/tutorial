import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { describe, estimate, estimateValue } from '../../lib/quote';
import { site } from '../../data/site';

export const prerender = false;

/** Eenvoudige snelheidsbegrenzing per IP, in het geheugen van de instantie. */
const recent = new Map<string, number>();

const clean = (v: unknown, max = 500) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max) : '';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, message: 'Ongeldige aanvraag.' }, 400);
  }

  // Honeypot: bots vullen dit verborgen veld doorgaans wel in. We doen alsof
  // het gelukt is, zodat ze niet leren dat ze herkend zijn.
  if (clean(form.get('website'))) {
    return json({ ok: true, message: 'Bedankt voor je aanvraag.' });
  }

  const ip = clientAddress ?? 'onbekend';
  const now = Date.now();
  const last = recent.get(ip) ?? 0;
  if (now - last < 30_000) {
    return json({ ok: false, message: 'Je hebt zojuist al een aanvraag verstuurd. Bel ons gerust als het spoed heeft.' }, 429);
  }

  const data = {
    werk: form.getAll('werk[]').map((v) => clean(v, 60)).filter(Boolean),
    situatie: clean(form.get('situatie'), 60),
    oppervlakte: clean(form.get('oppervlakte'), 60),
    oppervlakte_m2: Math.min(Math.max(Number(form.get('oppervlakte_m2')) || 0, 0), 99_999),
    pand: clean(form.get('pand'), 60),
    planning: clean(form.get('planning'), 60),
    naam: clean(form.get('naam'), 120),
    email: clean(form.get('email'), 160).toLowerCase(),
    telefoon: clean(form.get('telefoon'), 40),
    postcode: clean(form.get('postcode'), 20),
    plaats: clean(form.get('plaats'), 80),
    opmerking: clean(form.get('opmerking'), 2000),
  };

  // Herkomst: waar kwam deze aanvraag vandaan? Komt uit de browser en is dus
  // niet te vertrouwen — daarom afkappen en nergens als HTML tonen.
  const herkomst = {
    utm_source: clean(form.get('utm_source'), 200),
    utm_medium: clean(form.get('utm_medium'), 200),
    utm_campaign: clean(form.get('utm_campaign'), 200),
    utm_term: clean(form.get('utm_term'), 200),
    utm_content: clean(form.get('utm_content'), 200),
    gclid: clean(form.get('gclid'), 200),
    fbclid: clean(form.get('fbclid'), 200),
    msclkid: clean(form.get('msclkid'), 200),
    landingspagina: clean(form.get('landingspagina'), 300),
    verwijzer: clean(form.get('verwijzer'), 300),
  };

  const errors: string[] = [];
  if (!data.werk.length) errors.push('Geef aan welk werk je wilt laten uitvoeren.');
  if (!data.naam) errors.push('Vul je naam in.');
  if (!isEmail(data.email)) errors.push('Vul een geldig e-mailadres in.');
  if (data.telefoon.replace(/\D/g, '').length < 9) errors.push('Vul een geldig telefoonnummer in.');
  if (!data.postcode || !data.plaats) errors.push('Vul je postcode en plaats in.');
  if (!data.oppervlakte && !data.oppervlakte_m2) errors.push('Kies een oppervlakte of vul het aantal m² in.');
  if (!form.get('consent')) errors.push('Ga akkoord met de privacyverklaring.');

  if (errors.length) return json({ ok: false, message: errors.join(' ') }, 400);

  recent.set(ip, now);

  const rows = describe(data);
  const richtprijs = estimate(data);
  const waarde = estimateValue(data);

  // Eerst bewaren, dan mailen: een aanvraag mag nooit verloren gaan omdat de
  // mailprovider hapert.
  let stored = false;
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
      const basis = { ...data, richtprijs, status: 'nieuw' };

      const { error } = await supabase.from('aanvragen').insert({ ...basis, ...herkomst });
      stored = !error;

      // Draait de site al met herkomstregistratie terwijl de kolommen nog niet
      // in Supabase staan? Dan de aanvraag alsnog bewaren zonder herkomst: een
      // aanvraag kwijtraken is erger dan niet weten waar hij vandaan kwam.
      if (error) {
        console.error('Opslaan mislukt:', error.message);
        const opnieuw = await supabase.from('aanvragen').insert(basis);
        stored = !opnieuw.error;
        if (!opnieuw.error) {
          console.error('Bewaard zonder herkomst. Draai het alter table-blok uit supabase-setup.sql.');
        }
      }
    } catch (e) {
      console.error('Supabase niet bereikbaar:', e);
    }
  }

  let mailed = false;
  const apiKey = import.meta.env.RESEND_API_KEY;

  if (apiKey) {
    const resend = new Resend(apiKey);
    const to = import.meta.env.QUOTE_TO_EMAIL || site.email;
    const from = import.meta.env.QUOTE_FROM_EMAIL || `offerte@${new URL(site.url).hostname}`;

    const bron = [herkomst.utm_source, herkomst.utm_medium, herkomst.utm_campaign]
      .filter(Boolean)
      .join(' / ');

    const table = Object.entries({
      ...rows,
      Herkomst: bron,
      Landingspagina: herkomst.landingspagina,
    })
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          `<tr><td style="background:#F1EDE6;font-weight:bold;border-bottom:1px solid #E0DAD0;padding:8px">${k}</td><td style="border-bottom:1px solid #E0DAD0;padding:8px">${String(v).replace(/\n/g, '<br>')}</td></tr>`,
      )
      .join('');

    try {
      const sent = await resend.emails.send({
        from: `${site.name} <${from}>`,
        to: [to],
        replyTo: data.email,
        subject: `[Offerte] ${data.naam} — ${data.plaats}`,
        html: `<h2 style="font-family:Arial,sans-serif">Nieuwe offerteaanvraag</h2>
          ${richtprijs ? `<p style="font-family:Arial,sans-serif"><strong>Richtprijs:</strong> ${richtprijs}</p>` : ''}
          <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${table}</table>`,
      });
      mailed = !sent.error;
      if (sent.error) console.error('Mailen mislukt:', sent.error);
    } catch (e) {
      console.error('Resend niet bereikbaar:', e);
    }

    // Bevestiging naar de klant. Mislukt die, dan blijft de aanvraag geldig.
    if (mailed) {
      try {
        await resend.emails.send({
          from: `${site.name} <${from}>`,
          to: [data.email],
          replyTo: to,
          subject: `We hebben je aanvraag ontvangen — ${site.name}`,
          html: `<p style="font-family:Arial,sans-serif">Beste ${data.naam},</p>
            <p style="font-family:Arial,sans-serif">Bedankt voor je aanvraag bij ${site.name}. We nemen ${site.responseTime} contact met je op met een vrijblijvende prijsopgave.</p>
            ${richtprijs ? `<p style="font-family:Arial,sans-serif">Op basis van je antwoorden komen we voorlopig uit op <strong>${richtprijs}</strong>. De definitieve prijs volgt na een gratis opname.</p>` : ''}
            <p style="font-family:Arial,sans-serif">Met vriendelijke groet,<br>${site.name}<br>${site.phone}</p>`,
        });
      } catch (e) {
        console.error('Bevestiging niet verstuurd:', e);
      }
    }
  }

  if (!stored && !mailed) {
    return json(
      { ok: false, message: `We konden je aanvraag niet verwerken. Bel ons gerust op ${site.phone}, dan pakken we het direct op.` },
      500,
    );
  }

  // De waarde gaat mee terug zodat Google Ads kan sturen op omzet in plaats
  // van op het aantal aanvragen. De browser rekent hem niet zelf uit: dan zou
  // iedereen hem kunnen opgeven.
  return json({
    ok: true,
    waarde,
    message: `Bedankt! We hebben je aanvraag ontvangen en nemen ${site.responseTime} contact met je op.`,
  });
};
