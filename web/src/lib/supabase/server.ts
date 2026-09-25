import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase-client voor server components en route handlers.
 * Werkt met de publieke sleutel: alles wat deze client mag, mag
 * de ingelogde gebruiker ook volgens het RLS-beleid.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // In een server component mag je geen cookies zetten.
            // De middleware ververst de sessie, dus dit is veilig te negeren.
          }
        },
      },
    },
  );
}
