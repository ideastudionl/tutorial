import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

async function uitloggen(request: Request) {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/inloggen', request.url), { status: 303 });
}

export const GET = uitloggen;
export const POST = uitloggen;
