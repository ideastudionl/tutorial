/**
 * Secties zijn blokken met een kop en een alinea. In de database staan ze
 * als JSON; in het beheerformulier als platte tekst, omdat een rij losse
 * invoervelden slechter leest en slechter plakt. Hier staat de vertaling
 * tussen die twee vormen, één keer, zodat ze niet uit elkaar lopen.
 */
export type Sectie = { kop: string; tekst: string };

export function sectiesUitTekst(ruw: string): Sectie[] {
  return ruw
    .split(/\n\s*\n/)
    .map((blok) => blok.trim())
    .filter(Boolean)
    .map((blok) => {
      const [kop, ...rest] = blok.split('\n');
      return { kop: kop.trim(), tekst: rest.join('\n').trim() };
    })
    .filter((s) => s.kop || s.tekst);
}

export function sectiesNaarTekst(secties: Sectie[]): string {
  return secties.map((s) => `${s.kop}\n${s.tekst}`).join('\n\n');
}
