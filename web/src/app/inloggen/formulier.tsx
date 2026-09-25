'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export function InlogFormulier({ verder }: { verder?: string }) {
  const router = useRouter();
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function verstuur(formData: FormData) {
    setBezig(true);
    setFout(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error } = await supabase.auth.signInWithPassword({
      email: String(formData.get('email') ?? '').trim(),
      password: String(formData.get('wachtwoord') ?? ''),
    });

    if (error) {
      // Onderscheid netwerkstoring van een afgewezen inlog. Bij een
      // storing is 'wachtwoord klopt niet' misleidend: dan zoekt iemand
      // een half uur naar een fout die er niet is.
      const netwerk =
        error.status === 0 ||
        error.status === undefined ||
        /fetch|network|failed to fetch/i.test(error.message);

      setFout(
        netwerk
          ? 'Geen verbinding met de server. Controleer je internetverbinding en probeer het opnieuw.'
          // Bewust één melding voor beide: niet verklappen of dit
          // e-mailadres bestaat.
          : 'E-mailadres of wachtwoord klopt niet.',
      );
      setBezig(false);
      return;
    }

    router.push(verder && verder.startsWith('/beheer') ? verder : '/beheer');
    router.refresh();
  }

  return (
    <form action={verstuur} className="form">
      {fout && <p className="melding melding-fout">{fout}</p>}

      <div className="veld">
        <label htmlFor="email">E-mailadres</label>
        <input id="email" name="email" type="email" required autoComplete="username"
               placeholder="naam@cloveruitzendbureau.nl" />
      </div>

      <div className="veld">
        <label htmlFor="wachtwoord">Wachtwoord</label>
        <input id="wachtwoord" name="wachtwoord" type="password" required
               autoComplete="current-password" />
      </div>

      <button className="knop" type="submit" disabled={bezig}>
        {bezig ? 'Even geduld…' : 'Inloggen'}
      </button>
    </form>
  );
}
