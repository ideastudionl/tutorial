import type { NextRequest } from 'next/server';
import { sessieBijwerken } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return sessieBijwerken(request);
}

export const config = {
  matcher: [
    // alles behalve statische bestanden en afbeeldingen
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
