/* Vercel-build: haalt de bron uit de publieke repo (vastgezet op één commit)
   en zet daar de statische map public/ uit samen. Zo blijft de upload klein
   en staat exact vast welke commit live staat. */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, cpSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const REPO = 'ideastudionl/tutorial';
const COMMIT = 'ca3bf4f41b69608e48600addabe6444fd0738393';

const work = mkdtempSync(join(tmpdir(), 'bron-'));
const tarball = join(work, 'bron.tar.gz');

const res = await fetch(`https://codeload.github.com/${REPO}/tar.gz/${COMMIT}`);
if (!res.ok) throw new Error(`Bron ophalen mislukte: HTTP ${res.status}`);
writeFileSync(tarball, Buffer.from(await res.arrayBuffer()));
execFileSync('tar', ['-xzf', tarball, '-C', work], { stdio: 'inherit' });

const src = join(work, `tutorial-${COMMIT}`);
execFileSync(process.execPath, ['build.mjs'], { cwd: src, stdio: 'inherit' });

rmSync('public', { recursive: true, force: true });
mkdirSync('public', { recursive: true });
cpSync(join(src, 'dist'), 'public', { recursive: true });
console.log(`public/ gebouwd uit ${COMMIT}`);
