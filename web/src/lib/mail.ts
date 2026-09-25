import 'server-only';

/**
 * Mail via Resend, zonder SDK: het is één POST.
 *
 * Belangrijk: mail mag nooit een inzending tegenhouden. Als de
 * mailservice plat ligt of nog niet is ingesteld, is de sollicitatie
 * toch opgeslagen en staat hij in het beheer. Een fout hier wordt
 * gelogd en teruggegeven, maar niet doorgegooid.
 */
type Bericht = {
  naar: string | string[];
  onderwerp: string;
  html: string;
  antwoordNaar?: string;
};

const VAN = process.env.MAIL_VAN ?? 'Clover Uitzendbureau <onboarding@resend.dev>';
export const KANTOOR = process.env.MAIL_NAAR ?? 'info@ideastudio.nl';

export async function verstuurMail(b: Bericht): Promise<{ goed: boolean; fout?: string }> {
  const sleutel = process.env.RESEND_API_KEY;
  if (!sleutel) return { goed: false, fout: 'Geen RESEND_API_KEY ingesteld.' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sleutel}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: VAN,
        to: Array.isArray(b.naar) ? b.naar : [b.naar],
        subject: b.onderwerp,
        html: b.html,
        ...(b.antwoordNaar ? { reply_to: b.antwoordNaar } : {}),
      }),
    });

    if (!res.ok) {
      const tekst = await res.text();
      console.error('mail versturen mislukt:', res.status, tekst.slice(0, 300));
      return { goed: false, fout: `Resend gaf ${res.status}` };
    }
    return { goed: true };
  } catch (e) {
    console.error('mail versturen mislukt:', e);
    return { goed: false, fout: e instanceof Error ? e.message : 'onbekende fout' };
  }
}

/** Eén opmaak voor alle mail, zodat het niet per bericht uit elkaar loopt. */
export function mailOpmaak(titel: string, binnen: string) {
  return `<!doctype html>
<html lang="nl"><body style="margin:0;background:#F7F8F7;padding:24px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#101614">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E2E5E3;border-radius:14px">
    <tr><td style="padding:28px 28px 8px">
      <span style="font-weight:700;font-size:18px;color:#1B7F58;letter-spacing:-.01em">Clover Uitzendbureau</span>
    </td></tr>
    <tr><td style="padding:8px 28px 28px">
      <h1 style="font-size:20px;margin:12px 0 16px;line-height:1.3">${titel}</h1>
      ${binnen}
    </td></tr>
    <tr><td style="padding:16px 28px;border-top:1px solid #EFF1F0;font-size:12px;color:rgba(16,22,20,.6)">
      Clover Uitzendbureau · +31 (0)36 123 45 67 · info@cloveruitzendbureau.nl
    </td></tr>
  </table>
</body></html>`;
}

export const regel = (kop: string, waarde: string) =>
  `<p style="margin:0 0 8px"><strong>${kop}:</strong> ${escape(waarde)}</p>`;

/** Gebruikersinvoer gaat als tekst de mail in, niet als opmaak. */
export function escape(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
