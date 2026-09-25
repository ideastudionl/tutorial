'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

const regels = (v: FormDataEntryValue | null) =>
  String(v ?? '').split('\n').map((r) => r.trim()).filter(Boolean);

const slugVan = (titel: string, plaats: string) =>
  `${titel} ${plaats}`
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' en ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Schrijft elke wijziging weg, zodat je kunt zien wie wat deed. */
async function logboek(
  actie: string,
  entiteitId: string,
  voor: unknown,
  na: unknown,
) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profiel } = await supabase
    .from('profielen').select('naam').eq('id', user.id).single();

  const { error } = await supabase.from('audit_log').insert({
    actor_id: user.id,
    actor_naam: profiel?.naam ?? user.email,
    actie,
    entiteit: 'vacatures',
    entiteit_id: entiteitId,
    kanaal: 'ui',
    voor,
    na,
  });

  // Een logregel die stilletjes wegvalt is erger dan geen log: dan denk
  // je dat je een spoor hebt. Laat het in elk geval in de serverlogs zien.
  if (error) console.error('auditlog schrijven mislukt:', error.message);
}

export async function vacatureOpslaan(id: string | null, formData: FormData) {
  const supabase = await supabaseServer();

  const titel = String(formData.get('titel') ?? '').trim();
  const plaats = String(formData.get('plaats') ?? '').trim();
  const status = String(formData.get('status') ?? 'concept');

  if (!titel || !plaats) {
    return { fout: 'Titel en plaats zijn verplicht.' };
  }

  const uurloonMin = Number(formData.get('uurloon_min'));
  const uurloonMax = Number(formData.get('uurloon_max'));
  if (!(uurloonMin > 0) || !(uurloonMax >= uurloonMin)) {
    return { fout: 'Controleer het uurloon: het maximum moet minstens gelijk zijn aan het minimum.' };
  }

  const velden = {
    titel,
    plaats,
    provincie: String(formData.get('provincie') ?? '').trim(),
    sector_id: String(formData.get('sector_id') ?? ''),
    intercedent_id: String(formData.get('intercedent_id') ?? '') || null,
    dienstverband: String(formData.get('dienstverband') ?? 'Fulltime'),
    contract: String(formData.get('contract') ?? 'Uitzenden'),
    opleiding: String(formData.get('opleiding') ?? 'Geen diploma nodig'),
    uren: Number(formData.get('uren')) || 40,
    uurloon_min: uurloonMin,
    uurloon_max: uurloonMax,
    spoed: formData.get('spoed') === 'on',
    rijbewijs: formData.get('rijbewijs') === 'on',
    ploegendienst: formData.get('ploegendienst') === 'on',
    bedrijf: String(formData.get('bedrijf') ?? '').trim(),
    intro: String(formData.get('intro') ?? '').trim(),
    taken: regels(formData.get('taken')),
    vraag: regels(formData.get('vraag')),
    bieden: regels(formData.get('bieden')),
    status,
    vervalt_op: String(formData.get('vervalt_op') ?? '') || null,
  };

  if (id) {
    const { data: voor } = await supabase
      .from('vacatures').select('*').eq('id', id).single();

    // Een vacature die online gaat heeft een publicatiedatum nodig;
    // de database dwingt dat af.
    const publicatie =
      status === 'online' && !voor?.gepubliceerd_op
        ? { gepubliceerd_op: new Date().toISOString() }
        : {};

    const { data: na, error } = await supabase
      .from('vacatures')
      .update({ ...velden, ...publicatie })
      .eq('id', id)
      .select()
      .single();

    if (error) return { fout: error.message };

    await logboek('vacature.gewijzigd', id, voor, na);
    revalidatePath('/beheer/vacatures');
    revalidatePath(`/beheer/vacatures/${id}`);
    return { goed: 'Opgeslagen.' };
  }

  const { data: na, error } = await supabase
    .from('vacatures')
    .insert({
      ...velden,
      slug: slugVan(titel, plaats),
      gepubliceerd_op: status === 'online' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return {
      fout: error.code === '23505'
        ? 'Er bestaat al een vacature met deze titel in deze plaats. Maak de titel iets specifieker.'
        : error.message,
    };
  }

  await logboek('vacature.aangemaakt', na.id, null, na);
  revalidatePath('/beheer/vacatures');
  redirect(`/beheer/vacatures/${na.id}?opgeslagen=1`);
}

export async function statusWijzigen(id: string, status: string) {
  const supabase = await supabaseServer();
  const { data: voor } = await supabase
    .from('vacatures').select('status, gepubliceerd_op').eq('id', id).single();

  const publicatie =
    status === 'online' && !voor?.gepubliceerd_op
      ? { gepubliceerd_op: new Date().toISOString() }
      : {};

  const { error } = await supabase
    .from('vacatures').update({ status, ...publicatie }).eq('id', id);

  if (error) return { fout: error.message };

  await logboek('vacature.status', id, voor, { status });
  revalidatePath('/beheer/vacatures');
  revalidatePath(`/beheer/vacatures/${id}`);
  return { goed: `Status is nu “${status}”.` };
}
