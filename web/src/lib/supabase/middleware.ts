import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Ververst de sessie bij elk verzoek en bewaakt /beheer.
 *
 * Belangrijk: gebruik getUser(), niet getSession(). getSession leest
 * de cookie zonder te controleren of hij echt van Supabase komt;
 * getUser valideert het token bij de server. Voor een pagina met
 * sollicitantgegevens is dat het verschil tussen wel en niet veilig.
 */
export async function sessieBijwerken(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pad = request.nextUrl.pathname;

  if (pad.startsWith('/beheer') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/inloggen';
    url.searchParams.set('verder', pad);
    return NextResponse.redirect(url);
  }

  if (pad === '/inloggen' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/beheer';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}
