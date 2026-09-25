'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { slugVan } from '@/lib/chat/gereedschap';
import { sectiesUitTekst } from '@/lib/secties';

async function logboek(actie: string, id: string, voor: unknown, na: unknown) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profiel } = await supabase
    .from('profielen').select('naam').eq('id', user.id).single();

  const { error } = await supabase.from('audit_log').insert({
    actor_id: user.id,
    actor_naam: profiel?.naam ?? user.email,
    actie,
    entiteit: 'paginas',
    entiteit_id: id,
    kanaal: 'ui',
    voor,
    na,
  });
  if (error) console.error('auditlog schrijven mislukt:', error.message);
}

export async function paginaOpslaan(id: string | null, formData: FormData) {
  const supabase = await supabaseServer();

  const titel = String(formData.get('titel') ?? '').trim();
  if (!titel) return { fout: 'Een titel is verplicht.' };

  const status = String(formData.get('status') ?? 'concept');
  const velden = {
    titel,
    status,
    intro: String(formData.get('intro') ?? '').trim() || null,
    secties: sectiesUitTekst(String(formData.get('secties') ?? '')),
    meta_titel: String(formData.get('meta_titel') ?? '').trim() || null,
    meta_omschrijving: String(formData.get('meta_omschrijving') ?? '').trim() || null,
  };

  if (id) {
    const { data: voor } = await supabase
      .from('paginas').select('*').eq('id', id).single();

    // Een pagina die online gaat heeft een publicatiedatum nodig; de
    // database dwingt dat af.
    const publicatie =
      status === 'online' && !voor?.gepubliceerd_op
        ? { gepubliceerd_op: new Date().toISOString() }
        : {};

    const { data: na, error } = await supabase
      .from('paginas').update({ ...velden, ...publicatie }).eq('id', id).select().single();

    if (error) return { fout: error.message };

    await logboek('pagina.gewijzigd', id, voor, na);
    revalidatePath('/beheer/paginas');
    revalidatePath(`/beheer/paginas/${id}`);
    return { goed: 'Opgeslagen.' };
  }

  const { data: na, error } = await supabase
    .from('paginas')
    .insert({
      ...velden,
      slug: slugVan(titel),
      gepubliceerd_op: status === 'online' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return {
      fout: error.code === '23505'
        ? 'Er bestaat al een pagina met dit webadres. Kies een andere titel.'
        : error.message,
    };
  }

  await logboek('pagina.aangemaakt', na.id, null, na);
  revalidatePath('/beheer/paginas');
  redirect(`/beheer/paginas/${na.id}?opgeslagen=1`);
}
