import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { describe, estimate } from '../../lib/quote';
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

  // Eerst bewaren, dan mailen: een aanvraag mag nooit verloren gaan omdat de
  // mailprovider hapert.
  let stored = false;
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
      const { error } = await supabase.from('aanvragen').insert({ ...data, richtprijs, status: 'nieuw' });
      stored = !error;
      if (error) console.error('Opslaan mislukt:', error.message);
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

    const table = Object.entries(rows)
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

  return json({ ok: true, message: `Bedankt! We hebben je aanvraag ontvangen en nemen ${site.responseTime} contact met je op.` });
};
