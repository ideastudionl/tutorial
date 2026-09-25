import type { NextRequest } from 'next/server';
import { sessieBijwerken } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return sessieBijwerken(request);
}

export const config = {
  // Alleen waar een sessie toe doet. De publieke site heeft geen
  // ingelogde gebruiker, dus daar zou elke aanvraag onnodig een
  // controle bij Supabase doen en de pagina dynamisch maken.
  matcher: ['/beheer/:path*', '/inloggen', '/uitloggen', '/api/chat/:path*'],
};
