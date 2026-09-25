'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

const STATUSSEN = ['nieuw', 'gebeld', 'voorgesteld', 'geplaatst', 'afgewezen'];

export async function sollicitatieBijwerken(
  id: string,
  velden: { status?: string; notitie?: string },
) {
  if (velden.status && !STATUSSEN.includes(velden.status)) {
    return { fout: 'Onbekende status.' };
  }

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { fout: 'Niet ingelogd.' };

  const { data: voor } = await supabase
    .from('sollicitaties').select('status, notitie').eq('id', id).single();

  const { data: na, error } = await supabase
    .from('sollicitaties').update(velden).eq('id', id).select().single();

  if (error) return { fout: error.message };

  const { data: profiel } = await supabase
    .from('profielen').select('naam').eq('id', user.id).single();

  const { error: logFout } = await supabase.from('audit_log').insert({
    actor_id: user.id,
    actor_naam: profiel?.naam ?? user.email,
    actie: 'sollicitatie.bijgewerkt',
    entiteit: 'sollicitaties',
    entiteit_id: id,
    kanaal: 'ui',
    voor,
    na: { status: na.status, notitie: na.notitie },
  });
  if (logFout) console.error('auditlog schrijven mislukt:', logFout.message);

  revalidatePath('/beheer/sollicitaties');
  revalidatePath(`/beheer/sollicitaties/${id}`);
  return { goed: 'Opgeslagen.' };
}

/**
 * Een cv staat in een privé-bucket. In plaats van het bestand door de
 * server te pompen geven we een link die tien minuten geldig is — lang
 * genoeg om te openen, kort genoeg om niet te blijven rondslingeren.
 */
export async function cvLink(pad: string) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.storage
    .from('cvs').createSignedUrl(pad, 600);

  if (error) return { fout: error.message };
  return { url: data.signedUrl };
}
