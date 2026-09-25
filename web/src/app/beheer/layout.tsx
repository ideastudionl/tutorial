import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { Klaver } from '@/lib/klaver';
import { Zijnav } from './zijnav';

export default async function BeheerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/inloggen');

  const { data: profiel } = await supabase
    .from('profielen')
    .select('naam, rol, actief')
    .eq('id', user.id)
    .single();

  // Een account zonder actief profiel hoort hier niet te komen.
  if (!profiel?.actief) {
    return (
      <main className="inlogscherm">
        <div className="inlogkaart">
          <h1 style={{ fontSize: '1.25rem' }}>Nog geen toegang</h1>
          <p style={{ color: 'var(--inkt-60)', fontSize: '.875rem' }}>
            Je bent ingelogd als <b>{user.email}</b>, maar er is nog geen actief
            profiel aan dit account gekoppeld. Vraag een beheerder om je rol in
            te stellen.
          </p>
          <a className="knop knop-leeg" href="/uitloggen">Uitloggen</a>
        </div>
      </main>
    );
  }

  const [{ count: openVacatures }, { count: nieuweSollicitaties }] = await Promise.all([
    supabase.from('vacatures').select('*', { count: 'exact', head: true }).eq('status', 'online'),
    supabase.from('sollicitaties').select('*', { count: 'exact', head: true }).eq('status', 'nieuw'),
  ]);

  return (
    <div className="schil">
      <aside className="zijbalk">
        <div className="merk">
          <Klaver size={30} />
          <span>
            <b>Clover</b>
            <small>Beheer</small>
          </span>
        </div>

        <Zijnav
          vacatures={openVacatures ?? 0}
          sollicitaties={nieuweSollicitaties ?? 0}
        />

        <div className="zijvoet">
          <span>
            <b>{profiel.naam}</b>
            <br />
            {profiel.rol === 'admin' ? 'Beheerder'
              : profiel.rol === 'intercedent' ? 'Intercedent' : 'Alleen lezen'}
          </span>
          <a href="/uitloggen" style={{ textDecoration: 'underline' }}>Uitloggen</a>
        </div>
      </aside>

      <main className="werkvlak">{children}</main>
    </div>
  );
}
