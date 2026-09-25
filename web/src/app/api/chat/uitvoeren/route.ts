import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { TOEGESTANE_VELDEN, type Voorstel } from '@/lib/chat/gereedschap';

/**
 * Voert een goedgekeurd voorstel uit.
 *
 * Dit is de enige plek waar een chatopdracht de database raakt, en de
 * controles worden hier opnieuw gedaan: het model wordt nergens op zijn
 * woord geloofd. Ook de veldenlijst wordt opnieuw getoetst, zodat een
 * gemanipuleerd voorstel uit de browser niets extra's kan.
 */
export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fout: 'Niet ingelogd.' }, { status: 401 });

  const { data: profiel } = await supabase
    .from('profielen').select('naam, rol, actief').eq('id', user.id).single();

  if (!profiel?.actief || !['admin', 'intercedent'].includes(profiel.rol)) {
    return NextResponse.json({ fout: 'Geen rechten.' }, { status: 403 });
  }

  const { voorstel } = (await request.json()) as { voorstel: Voorstel };

  if (!voorstel?.id || !Array.isArray(voorstel.wijzigingen) || !voorstel.wijzigingen.length) {
    return NextResponse.json({ fout: 'Ongeldig voorstel.' }, { status: 400 });
  }

  const velden: Record<string, unknown> = {};
  for (const w of voorstel.wijzigingen) {
    if (!TOEGESTANE_VELDEN.has(w.veld)) {
      return NextResponse.json(
        { fout: `Het veld "${w.veld}" mag niet via de chat gewijzigd worden.` },
        { status: 400 },
      );
    }
    velden[w.veld] = w.na;
  }

  const { data: voor } = await supabase
    .from('vacatures').select('*').eq('id', voorstel.id).single();

  // Online zetten vraagt om een publicatiedatum; de database dwingt dat af.
  const publicatie =
    velden.status === 'online' && !voor?.gepubliceerd_op
      ? { gepubliceerd_op: new Date().toISOString() }
      : {};

  const { data: na, error } = await supabase
    .from('vacatures')
    .update({ ...velden, ...publicatie })
    .eq('id', voorstel.id)
    .select()
    .single();

  if (error) return NextResponse.json({ fout: error.message }, { status: 400 });

  const { error: logFout } = await supabase.from('audit_log').insert({
    actor_id: user.id,
    actor_naam: profiel.naam,
    actie: 'vacature.gewijzigd',
    entiteit: 'vacatures',
    entiteit_id: voorstel.id,
    kanaal: 'chat',
    voor,
    na,
  });
  if (logFout) console.error('auditlog schrijven mislukt:', logFout.message);

  revalidatePath('/beheer/vacatures');
  revalidatePath(`/beheer/vacatures/${voorstel.id}`);

  return NextResponse.json({ goed: true, nummer: na.nummer });
}
