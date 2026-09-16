/* Fotomanifest.
   ===========================================================================
   Leeg = de demo tekent lijnillustraties. Zodra hier bestanden bij staan en
   dit manifest gevuld is, toont de winkel de echte foto's.

   Vullen kan op twee manieren:

   1. Automatisch, op een computer die witgoed-koning.nl kan bereiken:
        node build/haal-fotos.mjs
      Dat haalt de productfoto's op via de WooCommerce Store API, zet ze in
      deze map en schrijft dit bestand opnieuw.

   2. Handmatig: zet de bestanden in deze map met het artikelnummer als naam
      en een volgnummer erachter, en vul ze hieronder in.
        WK-26-0402-1.jpg   vooraanzicht
        WK-26-0402-2.jpg   bedieningspaneel
        WK-26-0402-3.jpg   binnenzijde
        WK-26-0402-4.jpg   gebruikssporen

   Per artikelnummer een lijst met {bestand, omschrijving}. De omschrijving
   wordt de alt-tekst en het onderschrift bij de foto.
   =========================================================================== */
window.WK = window.WK || {};

WK.FOTOS = {
  /* Voorbeeld — verwijder dit zodra er echte foto's zijn:
  'WK-26-0402': [
    { bestand: 'WK-26-0402-1.jpg', omschrijving: 'Vooraanzicht' },
    { bestand: 'WK-26-0402-2.jpg', omschrijving: 'Bedieningspaneel' }
  ]
  */
};
