import type { APIRoute } from 'astro';
import { adminClient, STATUSSEN } from '../../lib/supabase';

export const prerender = false;

/** Werkt de status van één aanvraag bij vanuit het portal. */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (cookies.get('ifs_portal')?.value !== '1') {
    return new Response('Geen toegang', { status: 403 });
  }

  const form = await request.formData();
  const id = String(form.get('id') ?? '');
  const status = String(form.get('status') ?? '');

  if (!id || !STATUSSEN.includes(status as (typeof STATUSSEN)[number])) {
    return new Response('Ongeldige invoer', { status: 400 });
  }

  const supabase = adminClient();
  if (!supabase) return new Response('Database niet ingesteld', { status: 500 });

  const { error } = await supabase.from('aanvragen').update({ status }).eq('id', id);
  if (error) return new Response(`Bijwerken mislukt: ${error.message}`, { status: 500 });

  return redirect('/portal/');
};
