'use server';

import { supabasePubliek } from '@/lib/publiek';
import { verstuurMail, mailOpmaak, regel, escape, KANTOOR } from '@/lib/mail';

/**
 * De publieke formulieren. Alles loopt hierlangs: valideren, opslaan,
 * en dan pas mailen. De volgorde is niet toevallig — een sollicitatie
 * die is opgeslagen maar niet gemaild kun je terugvinden; andersom is
 * hij weg.
 */

export type Uitkomst = { goed?: true; fout?: string };

const tekst = (fd: FormData, naam: string) => String(fd.get(naam) ?? '').trim();

const MAILVORM = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const TELEFOONVORM = /^[\d\s+()-]{6,20}$/;

const MAX_CV = 10 * 1024 * 1024;
const CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];
const EXTENSIE: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

/** Een leeg veld dat alleen een bot invult. Mensen zien het niet. */
const isBot = (fd: FormData) => tekst(fd, 'website') !== '';

// =====================================================================
// Solliciteren
// =====================================================================

export async function solliciteren(fd: FormData): Promise<Uitkomst> {
  if (isBot(fd)) return { goed: true }; // stil laten doodlopen

  const naam = tekst(fd, 'naam');
  const telefoon = tekst(fd, 'telefoon');
  const email = tekst(fd, 'email');
  const motivatie = tekst(fd, 'motivatie');
  const beschikbaar = tekst(fd, 'beschikbaar');
  const vacatureId = tekst(fd, 'vacature_id') || null;

  if (naam.length < 2) return { fout: 'Vul je naam in.' };
  if (!TELEFOONVORM.test(telefoon)) {
    return { fout: 'Vul een telefoonnummer in waarop we je kunnen bereiken.' };
  }
  if (email && !MAILVORM.test(email)) return { fout: 'Dit e-mailadres klopt niet helemaal.' };
  if (fd.get('akkoord') !== 'on') {
    return { fout: 'Je moet akkoord gaan voordat we je mogen bellen.' };
  }

  const supabase = supabasePubliek();

  // ---- cv, als dat is meegestuurd -----------------------------------
  let cvPad: string | null = null;
  const cv = fd.get('cv');
  if (cv instanceof File && cv.size > 0) {
    if (cv.size > MAX_CV) return { fout: 'Je cv is groter dan 10 MB.' };
    if (!CV_TYPES.includes(cv.type)) {
      return { fout: 'Stuur een pdf, Word-bestand of foto mee.' };
    }

    const pad = `inbox/${crypto.randomUUID()}.${EXTENSIE[cv.type] ?? 'bin'}`;
    const { error } = await supabase.storage
      .from('cvs')
      .upload(pad, cv, { contentType: cv.type, upsert: false });

    if (error) {
      console.error('cv uploaden mislukt:', error.message);
      return { fout: 'Je cv kon niet worden opgeslagen. Probeer het zonder cv, of bel ons.' };
    }
    cvPad = pad;
  }

  // ---- opslaan -------------------------------------------------------
  // Bewust geen .select() hierachter. Dat maakt er een INSERT ... RETURNING
  // van, en teruglezen vraagt een SELECT-recht dat de bezoeker niet heeft en
  // ook niet hoort te hebben: in deze tabel staan andermans persoonsgegevens.
  // De hele insert faalt dan, niet alleen het teruglezen.
  const { error } = await supabase
    .from('sollicitaties')
    .insert({
      vacature_id: vacatureId,
      naam,
      telefoon,
      email: email || null,
      beschikbaar: beschikbaar || null,
      motivatie: motivatie || null,
      cv_pad: cvPad,
      akkoord_privacy: true,
    });

  if (error) {
    console.error('sollicitatie opslaan mislukt:', error.message);
    return { fout: 'Er ging iets mis bij het versturen. Probeer het nog eens of bel ons.' };
  }

  // ---- mailen --------------------------------------------------------
  let vacatuurtitel = 'Open sollicitatie';
  if (vacatureId) {
    const { data: v } = await supabase
      .from('vacatures').select('titel, plaats, nummer').eq('id', vacatureId).maybeSingle();
    if (v) vacatuurtitel = `${v.titel} in ${v.plaats} (${v.nummer})`;
  }

  await verstuurMail({
    naar: KANTOOR,
    onderwerp: `Nieuwe sollicitatie: ${naam} — ${vacatuurtitel}`,
    antwoordNaar: email || undefined,
    html: mailOpmaak('Nieuwe sollicitatie', [
      regel('Vacature', vacatuurtitel),
      regel('Naam', naam),
      regel('Telefoon', telefoon),
      regel('E-mail', email || '—'),
      regel('Beschikbaar', beschikbaar || '—'),
      regel('Cv meegestuurd', cvPad ? 'ja' : 'nee'),
      motivatie
        ? `<p style="margin:16px 0 0"><strong>Motivatie</strong><br>${escape(motivatie)}</p>`
        : '',
      `<p style="margin:20px 0 0"><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/beheer/sollicitaties"
         style="background:#1B7F58;color:#fff;padding:10px 16px;border-radius:8px;
         text-decoration:none;display:inline-block">Bekijk in het beheer</a></p>`,
    ].join('')),
  });

  if (email) {
    await verstuurMail({
      naar: email,
      onderwerp: 'We hebben je sollicitatie ontvangen',
      html: mailOpmaak(`Bedankt ${escape(naam.split(' ')[0])}, je sollicitatie staat binnen`, `
        <p style="margin:0 0 12px;line-height:1.6">
          Je reageerde op <strong>${escape(vacatuurtitel)}</strong>. Een van onze
          intercedenten kijkt ernaar en belt je binnen één werkdag op
          <strong>${escape(telefoon)}</strong>.
        </p>
        <p style="margin:0 0 12px;line-height:1.6">
          Kan het sneller? Bel ons gerust op +31 (0)36 123 45 67.
        </p>
        <p style="margin:20px 0 0;font-size:13px;color:rgba(16,22,20,.6)">
          We bewaren je gegevens maximaal vier weken, tenzij je aangeeft dat we ze
          langer mogen houden. Je kunt ze altijd laten verwijderen.
        </p>`),
    });
  }

  return { goed: true };
}

// =====================================================================
// Werkgeversaanvraag
// =====================================================================

export async function personeelAanvragen(fd: FormData): Promise<Uitkomst> {
  if (isBot(fd)) return { goed: true };

  const bedrijf = tekst(fd, 'bedrijf');
  const contactpersoon = tekst(fd, 'contactpersoon');
  const email = tekst(fd, 'email');
  const telefoon = tekst(fd, 'telefoon');
  const sector = tekst(fd, 'sector_id');
  const dienst = tekst(fd, 'dienst');
  const omschrijving = tekst(fd, 'omschrijving');
  const aantal = Number(fd.get('aantal')) || 1;
  const startdatum = tekst(fd, 'startdatum');

  if (bedrijf.length < 2) return { fout: 'Vul de bedrijfsnaam in.' };
  if (contactpersoon.length < 2) return { fout: 'Vul je naam in.' };
  if (!MAILVORM.test(email)) return { fout: 'Vul een geldig e-mailadres in.' };
  if (!TELEFOONVORM.test(telefoon)) return { fout: 'Vul een geldig telefoonnummer in.' };
  if (aantal < 1 || aantal > 500) return { fout: 'Vul een aantal tussen 1 en 500 in.' };

  const { error } = await supabasePubliek().from('aanvragen').insert({
    bedrijf,
    contactpersoon,
    email,
    telefoon,
    sector_id: sector || null,
    dienst: dienst || null,
    aantal,
    startdatum: startdatum || null,
    omschrijving: omschrijving || null,
  });

  if (error) {
    console.error('aanvraag opslaan mislukt:', error.message);
    return { fout: 'Er ging iets mis bij het versturen. Bel ons gerust: +31 (0)36 123 45 67.' };
  }

  await verstuurMail({
    naar: KANTOOR,
    onderwerp: `Personeelsaanvraag: ${bedrijf} (${aantal}×)`,
    antwoordNaar: email,
    html: mailOpmaak('Nieuwe personeelsaanvraag', [
      regel('Bedrijf', bedrijf),
      regel('Contactpersoon', contactpersoon),
      regel('E-mail', email),
      regel('Telefoon', telefoon),
      regel('Sector', sector || '—'),
      regel('Dienst', dienst || '—'),
      regel('Aantal', String(aantal)),
      regel('Startdatum', startdatum || 'in overleg'),
      omschrijving
        ? `<p style="margin:16px 0 0"><strong>Toelichting</strong><br>${escape(omschrijving)}</p>`
        : '',
    ].join('')),
  });

  await verstuurMail({
    naar: email,
    onderwerp: 'We hebben je aanvraag ontvangen',
    html: mailOpmaak('Bedankt voor je aanvraag', `
      <p style="margin:0 0 12px;line-height:1.6">
        We hebben je aanvraag voor <strong>${escape(String(aantal))}</strong> medewerker(s)
        ontvangen. Een intercedent belt je binnen één werkdag op
        <strong>${escape(telefoon)}</strong> om de details door te nemen.
      </p>`),
  });

  return { goed: true };
}

// =====================================================================
// Jobalert
// =====================================================================

export async function jobalertAanmelden(fd: FormData): Promise<Uitkomst> {
  if (isBot(fd)) return { goed: true };

  const email = tekst(fd, 'email');
  const sector = tekst(fd, 'sector_id');
  const plaats = tekst(fd, 'plaats');

  if (!MAILVORM.test(email)) return { fout: 'Vul een geldig e-mailadres in.' };

  const { error } = await supabasePubliek().from('jobalerts').insert({
    email,
    sector_id: sector || null,
    plaats: plaats || null,
  });

  if (error) {
    console.error('jobalert opslaan mislukt:', error.message);
    return { fout: 'Aanmelden lukte niet. Probeer het later nog eens.' };
  }

  await verstuurMail({
    naar: email,
    onderwerp: 'Je jobalert staat aan',
    html: mailOpmaak('Je jobalert staat aan', `
      <p style="margin:0 0 12px;line-height:1.6">
        Zodra er werk bij je zoekopdracht past, sturen we je een bericht.
        ${sector ? `Sector: <strong>${escape(sector)}</strong>.` : ''}
        ${plaats ? ` Omgeving: <strong>${escape(plaats)}</strong>.` : ''}
      </p>
      <p style="margin:0;font-size:13px;color:rgba(16,22,20,.6)">
        Uitschrijven kan met één klik in elke jobalert die we sturen.
      </p>`),
  });

  return { goed: true };
}
