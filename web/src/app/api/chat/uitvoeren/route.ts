import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import {
  VELDEN_VACATURE, VELDEN_PAGINA, slugVan, type Voorstel,
} from '@/lib/chat/gereedschap';

/**
 * Voert een goedgekeurd voorstel uit.
 *
 * Dit is de enige plek waar een chatopdracht de database raakt, en de
 * controles worden hier opnieuw gedaan: het model wordt nergens op zijn
 * woord geloofd, en het voorstel dat terugkomt uit de browser evenmin.
 * De veldenlijst wordt opnieuw getoetst, zodat een aangepast voorstel
 * uit de console niets extra's kan aanraken.
 */

type Tabel = 'vacatures' | 'paginas';

/** Maakt een vrij webadres op basis van een voorstel. */
async function vrijeSlug(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  tabel: Tabel,
  basis: string,
) {
  const kaal = slugVan(basis) || 'pagina';
  for (let n = 0; n < 50; n++) {
    const kandidaat = n === 0 ? kaal : `${kaal}-${n + 1}`;
    const { data } = await supabase
      .from(tabel).select('id').eq('slug', kandidaat).maybeSingle();
    if (!data) return kandidaat;
  }
  return `${kaal}-${Date.now()}`;
}

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

  const entiteit = voorstel?.entiteit;
  if (entiteit !== 'vacature' && entiteit !== 'pagina') {
    return NextResponse.json({ fout: 'Ongeldig voorstel.' }, { status: 400 });
  }

  const isPagina = entiteit === 'pagina';
  const tabel: Tabel = isPagina ? 'paginas' : 'vacatures';
  const toegestaan = isPagina ? VELDEN_PAGINA : VELDEN_VACATURE;

  // Velden verzamelen en opnieuw toetsen, ongeacht wat de browser stuurt.
  const velden: Record<string, unknown> = {};
  if (voorstel.soort === 'nieuw') {
    for (const [veld, waarde] of Object.entries(voorstel.velden ?? {})) {
      if (!toegestaan.has(veld)) {
        return NextResponse.json(
          { fout: `Het veld "${veld}" mag niet via de chat gezet worden.` },
          { status: 400 },
        );
      }
      velden[veld] = waarde;
    }
  } else if (voorstel.soort === 'wijziging') {
    if (!voorstel.id || !Array.isArray(voorstel.wijzigingen) || !voorstel.wijzigingen.length) {
      return NextResponse.json({ fout: 'Ongeldig voorstel.' }, { status: 400 });
    }
    for (const w of voorstel.wijzigingen) {
      if (!toegestaan.has(w.veld)) {
        return NextResponse.json(
          { fout: `Het veld "${w.veld}" mag niet via de chat gewijzigd worden.` },
          { status: 400 },
        );
      }
      velden[w.veld] = w.na;
    }
  } else {
    return NextResponse.json({ fout: 'Ongeldig voorstel.' }, { status: 400 });
  }

  // ---- Aanmaken ------------------------------------------------------
  if (voorstel.soort === 'nieuw') {
    if (!velden.titel) {
      return NextResponse.json({ fout: 'Een titel is verplicht.' }, { status: 400 });
    }

    // Nieuw materiaal gaat altijd als concept de kast in: iemand leest het na.
    velden.status = 'concept';
    velden.slug = await vrijeSlug(
      supabase,
      tabel,
      isPagina ? String(velden.titel) : `${velden.titel} ${velden.plaats ?? ''}`,
    );

    const { data: na, error } = await supabase
      .from(tabel).insert(velden).select().single();

    if (error) return NextResponse.json({ fout: error.message }, { status: 400 });

    await logboek(supabase, {
      actor_id: user.id,
      actor_naam: profiel.naam,
      actie: `${entiteit}.aangemaakt`,
      entiteit: tabel,
      entiteit_id: na.id,
      kanaal: 'chat',
      voor: null,
      na,
    });

    verversen(tabel, na.id);
    return NextResponse.json({
      goed: true,
      id: na.id,
      label: isPagina ? na.titel : na.nummer,
      slug: na.slug,
    });
  }

  // ---- Wijzigen ------------------------------------------------------
  const id = voorstel.id;
  const { data: voor } = await supabase
    .from(tabel).select('*').eq('id', id).single();

  // Online zetten vraagt om een publicatiedatum; de database dwingt dat af.
  const publicatie =
    velden.status === 'online' && !voor?.gepubliceerd_op
      ? { gepubliceerd_op: new Date().toISOString() }
      : {};

  const { data: na, error } = await supabase
    .from(tabel)
    .update({ ...velden, ...publicatie })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ fout: error.message }, { status: 400 });

  await logboek(supabase, {
    actor_id: user.id,
    actor_naam: profiel.naam,
    actie: `${entiteit}.gewijzigd`,
    entiteit: tabel,
    entiteit_id: id,
    kanaal: 'chat',
    voor,
    na,
  });

  verversen(tabel, id);
  return NextResponse.json({
    goed: true,
    id,
    label: isPagina ? na.titel : na.nummer,
    slug: na.slug,
  });
}

function verversen(tabel: Tabel, id: string) {
  if (tabel === 'paginas') {
    revalidatePath('/beheer/paginas');
    revalidatePath(`/beheer/paginas/${id}`);
  } else {
    revalidatePath('/beheer/vacatures');
    revalidatePath(`/beheer/vacatures/${id}`);
  }
}

/** Schrijft naar het logboek. Een fout hier mag de wijziging niet omkeren,
 *  maar mag ook niet stil verdwijnen. */
async function logboek(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  regel: Record<string, unknown>,
) {
  const { error } = await supabase.from('audit_log').insert(regel);
  if (error) console.error('auditlog schrijven mislukt:', error.message);
}
