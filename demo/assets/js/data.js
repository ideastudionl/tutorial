/* ==========================================================================
   Tegelloods BV — demo data
   Alle "afbeeldingen" worden procedureel als SVG gegenereerd, zodat de demo
   volledig offline werkt. In Shopify vervang je tex(...) door product media.
   ========================================================================== */

/* ---------- Procedurele tegeltextuur ---------- */
function tex(look, base, accent, seed, opts){
  opts = opts || {};
  var s = seed || 3, W = 600, H = 600, inner = '';

  function grain(freq, op, oct){
    return '<filter id="g'+s+'"><feTurbulence type="fractalNoise" baseFrequency="'+freq+'" numOctaves="'+(oct||4)+'" seed="'+s+'"/>'+
           '<feColorMatrix type="saturate" values="0"/></filter>'+
           '<rect width="'+W+'" height="'+H+'" filter="url(#g'+s+')" opacity="'+op+'"/>';
  }

  if(look==='marmerlook'){
    inner += grain(0.9, .10);
    inner += '<filter id="w'+s+'"><feTurbulence type="turbulence" baseFrequency="0.012" numOctaves="4" seed="'+s+'"/>'+
             '<feDisplacementMap in="SourceGraphic" scale="70"/></filter><g filter="url(#w'+s+')" opacity=".55">';
    for(var i=0;i<5;i++){
      var y = 60 + i*118 + (s*13)%40;
      inner += '<path d="M-40 '+y+' C 140 '+(y-70)+', 300 '+(y+80)+', 660 '+(y-30)+'" stroke="'+accent+'" stroke-width="'+(1.4+ (i%3)*2.1)+'" fill="none" opacity=".8"/>';
      inner += '<path d="M-40 '+(y+34)+' C 180 '+(y-20)+', 340 '+(y+120)+', 660 '+(y+40)+'" stroke="'+accent+'" stroke-width=".9" fill="none" opacity=".55"/>';
    }
    inner += '</g>';
  } else if(look==='betonlook'){
    inner += '<filter id="c'+s+'"><feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="5" seed="'+s+'"/>'+
             '<feColorMatrix type="saturate" values="0"/></filter>'+
             '<rect width="'+W+'" height="'+H+'" filter="url(#c'+s+')" opacity=".38"/>';
    inner += grain(1.4, .12, 3);
  } else if(look==='houtlook'){
    inner += '<g opacity=".5">';
    for(var p=0;p<7;p++){
      var x = p*(W/7);
      inner += '<rect x="'+x+'" y="0" width="'+(W/7)+'" height="'+H+'" fill="'+accent+'" opacity="'+(0.05+((p*7+s)%5)*0.035)+'"/>';
      for(var l=0;l<9;l++){
        var lx = x + 6 + ((l*13+s*5)%(W/7-10));
        inner += '<path d="M'+lx+' -10 C '+(lx+9)+' 150, '+(lx-8)+' 420, '+(lx+5)+' 610" stroke="'+accent+'" stroke-width="'+(0.6+(l%3)*0.5)+'" fill="none" opacity=".4"/>';
      }
    }
    inner += '</g>' + grain(1.1, .10);
  } else if(look==='terrazzo'){
    var pal = opts.pal || ['#b9b2a6','#8d857a','#d8d2c6','#a8927e'];
    inner += '<g>';
    for(var t=0;t<130;t++){
      var rx = ((t*97 + s*37) % W), ry = ((t*61 + s*53) % H);
      var rr = 3 + ((t*29+s)%13);
      inner += '<ellipse cx="'+rx+'" cy="'+ry+'" rx="'+rr+'" ry="'+(rr*0.72)+'" fill="'+pal[t%pal.length]+'" opacity=".78" transform="rotate('+((t*23)%180)+' '+rx+' '+ry+')"/>';
    }
    inner += '</g>' + grain(1.2, .09);
  } else if(look==='natuursteenlook'){
    inner += '<filter id="n'+s+'"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.035" numOctaves="5" seed="'+s+'"/>'+
             '<feColorMatrix type="saturate" values="0"/></filter>'+
             '<rect width="'+W+'" height="'+H+'" filter="url(#n'+s+')" opacity=".34"/>';
    inner += '<g opacity=".3">';
    for(var v=0;v<4;v++){
      var vy = 90 + v*140;
      inner += '<path d="M-20 '+vy+' C 160 '+(vy-50)+', 320 '+(vy+70)+', 640 '+vy+'" stroke="'+accent+'" stroke-width="2.4" fill="none"/>';
    }
    inner += '</g>' + grain(1.0, .10);
  } else { /* effen / metro */
    inner += '<linearGradient id="lg'+s+'" x1="0" y1="0" x2="1" y2="1">'+
             '<stop offset="0" stop-color="#ffffff" stop-opacity=".18"/>'+
             '<stop offset="1" stop-color="#000000" stop-opacity=".08"/></linearGradient>'+
             '<rect width="'+W+'" height="'+H+'" fill="url(#lg'+s+')"/>' + grain(1.6, .06, 2);
  }

  /* Voegwerk-suggestie zodat het als tegelvlak leest */
  var joint = opts.joint === false ? '' :
    '<g stroke="rgba(0,0,0,.14)" stroke-width="3" fill="none">'+
    '<line x1="0" y1="300" x2="600" y2="300"/><line x1="300" y1="0" x2="300" y2="600"/></g>'+
    '<g stroke="rgba(255,255,255,.20)" stroke-width="1" fill="none">'+
    '<line x1="0" y1="303" x2="600" y2="303"/><line x1="303" y1="0" x2="303" y2="600"/></g>';

  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+
            '<rect width="'+W+'" height="'+H+'" fill="'+base+'"/>'+ inner + joint +
            '<rect width="'+W+'" height="'+H+'" fill="none" stroke="rgba(0,0,0,.06)" stroke-width="2"/></svg>';
  return "url('data:image/svg+xml," + encodeURIComponent(svg) + "')";
}


/* ---------- Assortiment ----------------------------------------------------
   Series, kleuren en formaten zijn ontleend aan de publieke catalogus van
   leverancier Ege Seramik (zie `bron` per product). Prijzen, m² per doos,
   voorraad, levertijd en reviewaantallen zijn PLACEHOLDERS voor de demo en
   moeten uit de leveranciersfiches komen — zie SHOPIFY.md § 7.
   Turkse kleurnamen zijn vertaald: Beyaz=Wit, Gri=Grijs, Bej=Beige,
   Siyah=Zwart, Rölyef=Reliëf, Mat=Mat, Tam Parlak=Hoogglans,
   Rektifiye=Gerectificeerd.
--------------------------------------------------------------------------- */
var PRODUCTS = [
  {
    id:'especta',
    naam:'Especta Natuursteenlook Gerectificeerd 60x120',
    merk:'Ege Seramik', serie:'Especta', look:'natuursteenlook',
    bron:'https://www.egeseramik.com/en/collection/especta/60x120-especta-biege-rectified',
    ruimte:['badkamer','woonkamer','keuken','hal'],
    toepassing:['vloer','wand','binnen'], afwerking:'Mat, gerectificeerd', antislip:'R10', dikte:'9 mm',
    materiaal:'Gerectificeerd porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 5 (PEI V)',
    vloerverwarming:true, badge:['-22%','Actie van de maand'], nieuw:false, rating:5.0, reviews:38,
    levertijd:'2-3 weken', voorraad:'op bestelling',
    omschrijving:'Grootformaat natuursteenlook met een rustig, warm beeld. Gerectificeerd, dus met een strakke voeg van 2 mm te leggen. De reliëfvariant heeft een voelbare structuur en is mooi als accentwand.',
    kleuren:[
      {naam:'Beige', tex:tex('natuursteenlook','#d8cdbd','#b6a794',7)},
      {naam:'Grijs', tex:tex('natuursteenlook','#c3c3c0','#9b9b96',11)},
      {naam:'Reliëf Beige', tex:tex('natuursteenlook','#d2c6b3','#a8977f',13)}
    ],
    maten:[
      {maat:'60x120 cm', prijs:34.95, oud:44.95, m2PerDoos:1.44, stuksPerDoos:2}
    ]
  },
  {
    id:'ontario',
    naam:'Ontario Wit Gerectificeerd Vloer-/Wandtegel',
    merk:'Ege Seramik', serie:'Ontario', look:'effen',
    bron:'https://www.egeseramik.com/60x60-ontario-mat-beyaz-rektifiye',
    ruimte:['badkamer','keuken','woonkamer','toilet','hal'],
    toepassing:['vloer','wand','binnen'], afwerking:'Mat of hoogglans, gerectificeerd', antislip:'R9', dikte:'9 mm',
    materiaal:'Gerectificeerd porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 4 (PEI IV)',
    vloerverwarming:true, badge:['Bestseller'], nieuw:false, rating:4.9, reviews:64,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Strak wit in mat of hoogglans, in twee formaten. De mattte variant is rustig en onderhoudsvriendelijk; de hoogglansvariant maakt een kleine ruimte optisch lichter en groter.',
    kleuren:[
      {naam:'Mat Wit', tex:tex('effen','#f0efec','#d8d6d1',3,{joint:true})},
      {naam:'Hoogglans Wit', tex:tex('effen','#f8f8f7','#e0e0de',5,{joint:true})}
    ],
    maten:[
      {maat:'30x60 cm', prijs:24.95, oud:null, m2PerDoos:1.08, stuksPerDoos:6},
      {maat:'60x60 cm', prijs:28.95, oud:null, m2PerDoos:1.44, stuksPerDoos:4}
    ]
  },
  {
    id:'nepal',
    naam:'Nepal Grijs Betonlook 60x60',
    merk:'Ege Seramik', serie:'Nepal', look:'betonlook',
    bron:'https://www.egeseramik.com/nepal',
    ruimte:['woonkamer','keuken','badkamer','hal'],
    toepassing:['vloer','wand','binnen'], afwerking:'Mat', antislip:'R10', dikte:'9 mm',
    materiaal:'Porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 5 (PEI V)',
    vloerverwarming:true, badge:['-15%'], nieuw:false, rating:4.8, reviews:91,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Neutrale grijze betonlook met een licht gewolkt beeld — onze meest gekozen basisvloer voor open woon-keukens. Sterk, onderhoudsarm en makkelijk te combineren.',
    kleuren:[
      {naam:'Grijs', tex:tex('betonlook','#c6c7c5','#8e908e',2)},
      {naam:'Antraciet', tex:tex('betonlook','#54565a','#33353a',6)}
    ],
    maten:[
      {maat:'60x60 cm', prijs:24.95, oud:29.50, m2PerDoos:1.44, stuksPerDoos:4}
    ]
  },
  {
    id:'nevada',
    naam:'Nevada Zwart Hoogglans Gerectificeerd 60x60',
    merk:'Ege Seramik', serie:'Nevada', look:'marmerlook',
    bron:'https://www.egeseramik-usa.com/600x600-Black-Full-Polish-Rectified',
    ruimte:['badkamer','toilet','hal'],
    toepassing:['vloer','wand','binnen'], afwerking:'Hoogglans, gerectificeerd', antislip:'R9', dikte:'9 mm',
    materiaal:'Gerectificeerd porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 4 (PEI IV)',
    vloerverwarming:true, badge:[], nieuw:false, rating:4.8, reviews:21,
    levertijd:'2-3 weken', voorraad:'op bestelling',
    omschrijving:'Diep zwart met hoogglans en subtiele adering. Sterk statement in een toilet of als accentwand achter een vrijstaand bad. Let op: hoogglans laat kalkvlekken sneller zien.',
    kleuren:[
      {naam:'Zwart', tex:tex('marmerlook','#26282c','#9fa6ae',9)}
    ],
    maten:[
      {maat:'60x60 cm', prijs:36.50, oud:null, m2PerDoos:1.44, stuksPerDoos:4}
    ]
  },
  {
    id:'maison',
    naam:'Maison Wandtegel Gerectificeerd 33x99',
    merk:'Ege Seramik', serie:'Maison', look:'effen',
    bron:'https://www.egeseramik-usa.com/maison',
    ruimte:['badkamer','keuken','toilet'],
    toepassing:['wand','binnen'], afwerking:'Mat, gerectificeerd', antislip:'-', dikte:'9 mm',
    materiaal:'Keramische wandtegel', sortering:'1e sortering', slijtvastheid:'n.v.t. (wandtegel)',
    vloerverwarming:false, badge:['Groot formaat'], nieuw:false, rating:4.9, reviews:33,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Groot wandformaat van 33x99 cm: minder voegen, dus een rustiger beeld en makkelijker schoon te houden. De Star-varianten hebben een fijne glansnerf, de Memorie Mix is een decortegel.',
    kleuren:[
      {naam:'Wit', tex:tex('effen','#f3f2ef','#dcdbd7',21,{joint:false})},
      {naam:'Star Wit', tex:tex('effen','#f6f5f1','#e2e0da',22,{joint:false})},
      {naam:'Grijs', tex:tex('effen','#c8c8c6','#aaaaa7',23,{joint:false})},
      {naam:'Star Grijs', tex:tex('effen','#cfcfcd','#b2b2af',24,{joint:false})},
      {naam:'Beige', tex:tex('effen','#ded5c6','#c0b6a5',25,{joint:false})},
      {naam:'Memorie Mix', tex:tex('terrazzo','#e6e1d7','#b3aa98',26,{pal:['#c9bfa9','#8f877a','#ddd7c9','#a89a86']})}
    ],
    maten:[
      {maat:'33x99 cm', prijs:29.95, oud:null, m2PerDoos:1.31, stuksPerDoos:4}
    ]
  },
  {
    id:'metropolitan',
    naam:'Metropolitan Betonlook met Structuur',
    merk:'Ege Seramik', serie:'Metropolitan', look:'betonlook',
    bron:'https://www.egeseramik-usa.com/products',
    ruimte:['woonkamer','keuken','badkamer','bedrijfsruimte'],
    toepassing:['vloer','wand','binnen'], afwerking:'Licht gestructureerd', antislip:'R10', dikte:'10 mm',
    materiaal:'Geglazuurd porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 5 (PEI V)',
    vloerverwarming:true, badge:['Topper'], nieuw:false, rating:4.8, reviews:47,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Moderne betonlook met een licht voelbare structuur en patchwork-decors binnen dezelfde serie. Geschikt voor intensief gebruik, ook in bedrijfsruimtes.',
    kleuren:[
      {naam:'Light Grey', tex:tex('betonlook','#cbcbc8','#96968f',31)},
      {naam:'Taupe', tex:tex('betonlook','#b8afa3','#8a8175',33)},
      {naam:'Antraciet', tex:tex('betonlook','#4f5155','#303236',35)}
    ],
    maten:[
      {maat:'60x60 cm', prijs:27.95, oud:null, m2PerDoos:1.44, stuksPerDoos:4},
      {maat:'60x120 cm', prijs:32.95, oud:null, m2PerDoos:1.44, stuksPerDoos:2}
    ]
  },
  {
    id:'feelwood',
    naam:'Feelwood Houtlook Satijn',
    merk:'Ege Seramik', serie:'Feelwood', look:'houtlook',
    bron:'https://www.egeseramik-usa.com/products',
    ruimte:['woonkamer','keuken','hal','slaapkamer'],
    toepassing:['vloer','binnen'], afwerking:'Satijn, houtnerf', antislip:'R10', dikte:'9 mm',
    materiaal:'Geglazuurd porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 5 (PEI V)',
    vloerverwarming:true, badge:['Bestseller'], nieuw:false, rating:4.9, reviews:58,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Satijn afgewerkte houtlook die de nerf van verouderd hout nabootst — in uiterlijk én aanvoelen. Anders dan echt hout perfect te combineren met vloerverwarming, en niet gevoelig voor water.',
    kleuren:[
      {naam:'Natural', tex:tex('houtlook','#c9a877','#8e6c42',12)},
      {naam:'Smoked', tex:tex('houtlook','#9c8163','#6b523a',14)},
      {naam:'Grey Oak', tex:tex('houtlook','#b3ada4','#7e786f',16)}
    ],
    maten:[
      {maat:'20x120 cm', prijs:31.95, oud:null, m2PerDoos:1.44, stuksPerDoos:6}
    ]
  },
  {
    id:'dakota',
    naam:'Dakota Travertijnlook Vloer-/Wandtegel',
    merk:'Ege Seramik', serie:'Dakota', look:'natuursteenlook',
    bron:'https://www.egeseramik-usa.com/products',
    ruimte:['badkamer','woonkamer','hal'],
    toepassing:['vloer','wand','binnen'], afwerking:'Zijdemat', antislip:'R10', dikte:'9 mm',
    materiaal:'Porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 4 (PEI IV)',
    vloerverwarming:true, badge:[], nieuw:false, rating:4.8, reviews:26,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Travertijnlook met de karakteristieke horizontale nerf, in een onderhoudsarme keramische uitvoering. Warm van kleur en rustig van beeld — combineert mooi met hout en riet.',
    kleuren:[
      {naam:'Beige', tex:tex('natuursteenlook','#dfd2ba','#bda98a',61)},
      {naam:'Silver', tex:tex('natuursteenlook','#cfcac2','#a49e94',63)}
    ],
    maten:[
      {maat:'60x60 cm', prijs:28.95, oud:null, m2PerDoos:1.44, stuksPerDoos:4},
      {maat:'60x120 cm', prijs:33.95, oud:null, m2PerDoos:1.44, stuksPerDoos:2}
    ]
  },
  {
    id:'antwerp',
    naam:'Antwerp Mat Beton-/Natuursteenlook',
    merk:'Ege Seramik', serie:'Antwerp', look:'betonlook',
    bron:'https://www.egeseramik-usa.com/products',
    ruimte:['woonkamer','keuken','badkamer','hal'],
    toepassing:['vloer','wand','binnen'], afwerking:'Mat', antislip:'R10', dikte:'9 mm',
    materiaal:'Geglazuurd porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 5 (PEI V)',
    vloerverwarming:true, badge:['Nieuw'], nieuw:true, rating:4.9, reviews:11,
    levertijd:'2-3 weken', voorraad:'op bestelling',
    omschrijving:'Een mat vlak dat het midden houdt tussen beton en natuursteen: rustiger dan beton, minder uitgesproken dan marmer. Prettig als je een neutrale basis wilt die niet klinisch aanvoelt.',
    kleuren:[
      {naam:'Ivory', tex:tex('betonlook','#ded9d1','#b0aaa1',41)},
      {naam:'Greige', tex:tex('betonlook','#c4bcb0','#948c80',43)},
      {naam:'Dark', tex:tex('betonlook','#5b5c5e','#3a3b3d',45)}
    ],
    maten:[
      {maat:'60x60 cm', prijs:29.95, oud:null, m2PerDoos:1.44, stuksPerDoos:4},
      {maat:'60x120 cm', prijs:34.95, oud:null, m2PerDoos:1.44, stuksPerDoos:2}
    ]
  },
  {
    id:'terrazzo',
    naam:'Ege Terrazzo Porselein Vloer-/Wandtegel',
    merk:'Ege Seramik', serie:'Terrazzo', look:'terrazzo',
    bron:'https://www.artwalktile.com/collections/ege-seramik-tile-terrazzo-porcelain',
    ruimte:['badkamer','toilet','hal'],
    toepassing:['vloer','wand','binnen'], afwerking:'Mat', antislip:'R10', dikte:'9 mm',
    materiaal:'Porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 4 (PEI IV)',
    vloerverwarming:true, badge:['Nieuw'], nieuw:true, rating:4.8, reviews:12,
    levertijd:'2-3 weken', voorraad:'op bestelling',
    omschrijving:'Speels terrazzo met fijne kleurspikkels in een keramische uitvoering. Mooi als totaalvloer in een klein toilet of als accentvlak in de badkamer.',
    kleuren:[
      {naam:'Bianco', tex:tex('terrazzo','#eeece6','#b7b1a5',51,{pal:['#c7c0b3','#8f877a','#ddd7c9','#a89a86']})},
      {naam:'Greige', tex:tex('terrazzo','#d5cec2','#9d9484',53,{pal:['#b3a894','#7f7666','#e0d8c8','#9c8f7a']})}
    ],
    maten:[
      {maat:'60x60 cm', prijs:37.95, oud:null, m2PerDoos:1.44, stuksPerDoos:4}
    ]
  },
  {
    id:'terrastegel',
    naam:'Keramische Terrastegel 2 cm',
    merk:'Tegelloods Select', serie:null, look:'natuursteenlook',
    bron:null,
    ruimte:['tuin','terras','oprit'],
    toepassing:['vloer','buiten'], afwerking:'Structuur', antislip:'R11 / A+B+C', dikte:'20 mm',
    materiaal:'Keramisch, vorstbestendig', sortering:'1e sortering', slijtvastheid:'Klasse 5 (PEI V)',
    vloerverwarming:false, badge:['Buiten'], nieuw:false, rating:4.9, reviews:73,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Keramische buitentegel van 2 cm dik uit ons eigen label. Vorstbestendig, kleurvast en nagenoeg onderhoudsvrij — losliggend op split of te verlijmen op een betonnen ondergrond.',
    kleuren:[
      {naam:'Grigio', tex:tex('natuursteenlook','#9d9d99','#77776f',71)},
      {naam:'Sand', tex:tex('natuursteenlook','#c4b7a1','#9c8f79',73)},
      {naam:'Nero', tex:tex('natuursteenlook','#3f4144','#26282b',75)}
    ],
    maten:[
      {maat:'60x60x2 cm', prijs:33.50, oud:null, m2PerDoos:1.44, stuksPerDoos:4},
      {maat:'80x80x2 cm', prijs:38.50, oud:null, m2PerDoos:1.28, stuksPerDoos:2}
    ]
  },
  {
    id:'metrotegel',
    naam:'Metrotegel Wit Glans 7,5x15',
    merk:'Tegelloods Select', serie:null, look:'effen',
    bron:null,
    ruimte:['keuken','badkamer','toilet'],
    toepassing:['wand','binnen'], afwerking:'Glans, facet', antislip:'-', dikte:'8 mm',
    materiaal:'Keramiek', sortering:'1e sortering', slijtvastheid:'n.v.t. (wandtegel)',
    vloerverwarming:false, badge:['Voordeel'], nieuw:false, rating:4.7, reviews:120,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'De klassieke metrotegel met facet uit ons eigen label. Tijdloos in de keuken als achterwand en in de badkamer. Ook verkrijgbaar in mat en in kleur.',
    kleuren:[
      {naam:'Wit glans', tex:tex('effen','#f6f6f4','#dcdcda',81,{joint:false})},
      {naam:'Salie', tex:tex('effen','#b9c4b3','#93a08d',83,{joint:false})},
      {naam:'Terra', tex:tex('effen','#c98d6d','#a06a4c',85,{joint:false})}
    ],
    maten:[
      {maat:'7,5x15 cm', prijs:16.95, oud:21.95, m2PerDoos:0.50, stuksPerDoos:44}
    ]
  },
  {
    id:'lijm-flex',
    naam:'Tegellijm Flex Wit 25 kg',
    merk:'Tegelloods Select', serie:null, look:'toebehoren', bron:null,
    ruimte:['toebehoren'],
    toepassing:['toebehoren'], afwerking:'-', antislip:'-', dikte:'-',
    materiaal:'C2TE S1 flexibele poederlijm', sortering:'-', slijtvastheid:'-',
    vloerverwarming:true, badge:[], nieuw:false, rating:4.9, reviews:54,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Flexibele witte poederlijm (C2TE S1), geschikt voor grootformaat tegels en vloerverwarming. Rendement circa 4-5 kg per m².',
    perStuk:true, eenheid:'zak',
    kleuren:[{naam:'Wit', tex:tex('effen','#e9e6df','#cbc7bf',91,{joint:false})}],
    maten:[{maat:'25 kg', prijs:21.95, oud:null, m2PerDoos:1, stuksPerDoos:1}]
  },
  {
    id:'voegmiddel',
    naam:'Voegmiddel Flex 5 kg',
    merk:'Tegelloods Select', serie:null, look:'toebehoren', bron:null,
    ruimte:['toebehoren'],
    toepassing:['toebehoren'], afwerking:'-', antislip:'-', dikte:'-',
    materiaal:'Cementgebonden voegmortel CG2 WA', sortering:'-', slijtvastheid:'-',
    vloerverwarming:true, badge:[], nieuw:false, rating:4.8, reviews:29,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Flexibel voegmiddel voor voegen van 1-10 mm, water- en vuilafstotend. In 12 kleuren, afgestemd op onze collecties.',
    perStuk:true, eenheid:'emmer',
    kleuren:[
      {naam:'Zilvergrijs', tex:tex('effen','#b9b9b6','#9a9a97',93,{joint:false})},
      {naam:'Antraciet', tex:tex('effen','#4f5153','#3a3c3e',95,{joint:false})},
      {naam:'Wit', tex:tex('effen','#f0efec','#d6d5d1',97,{joint:false})}
    ],
    maten:[{maat:'5 kg', prijs:14.95, oud:null, m2PerDoos:1, stuksPerDoos:1}]
  }
];

/* ---------- Categorieën ---------- */
var CATEGORIES = [
  {slug:'vloertegels', naam:'Vloertegels', sub:'vanaf € 24,95 p/m²', tex:tex('betonlook','#c6c7c5','#8e908e',2)},
  {slug:'wandtegels',  naam:'Wandtegels',  sub:'vanaf € 16,95 p/m²', tex:tex('effen','#f3f2ef','#dcdbd7',21,{joint:false})},
  {slug:'houtlook',    naam:'Houtlook',    sub:'Feelwood-serie',     tex:tex('houtlook','#c9a877','#8e6c42',12)},
  {slug:'marmerlook',  naam:'Marmerlook',  sub:'mat & hoogglans',    tex:tex('marmerlook','#26282c','#9fa6ae',9)},
  {slug:'buitentegels',naam:'Buitentegels',sub:'2 cm keramiek',      tex:tex('natuursteenlook','#9d9d99','#77776f',71)},
  {slug:'toebehoren',  naam:'Lijm & voeg', sub:'alles compleet',     tex:tex('effen','#e9e6df','#cbc7bf',91,{joint:false})}
];

/* ---------- Inspiratie per ruimte ---------- */
var RUIMTES = [
  {
    slug:'badkamer', naam:'Badkamer',
    kop:'Een badkamer die na tien jaar nog klopt',
    intro:'De badkamer is de ruimte waar de meeste keuzes tegelijk vallen: vloer, wand, douchevloer en soms een nis. Wij adviseren om met de vloer te beginnen en de wand daarop te kiezen — niet andersom.',
    advies:[
      ['Vloer','Kies minimaal R10. In de douche zelf mag het gerust R11 of mozaïek zijn: veel voegen betekent extra grip.'],
      ['Wand','Groot formaat (33x99) geeft minder voegen en dus minder schoonmaakwerk. Doortrekken tot het plafond maakt de ruimte hoger.'],
      ['Combineren','Eén rustige basis plus één accentvlak werkt bijna altijd. Twee uitgesproken tegels naast elkaar zelden.'],
      ['Voegkleur','Een voeg net iets donkerder dan de tegel blijft jarenlang mooi; wit in de douche niet.']
    ],
    producten:['ontario','maison','especta','terrazzo']
  },
  {
    slug:'keuken', naam:'Keuken',
    kop:'Een vloer die tegen een gemorst glas rode wijn kan',
    intro:'In de keuken telt vooral wat er met de vloer gebeurt als er iets valt of morst. Keramiek is hier in het voordeel boven hout: vlekvrij, krasvast en niet gevoelig voor water.',
    advies:[
      ['Vloer','Doorlopende vloer van keuken naar woonkamer maakt de ruimte optisch groter. Kies dan één formaat voor beide.'],
      ['Achterwand','Metrotegel of een groot formaat zonder voegen achter het fornuis — vet is makkelijker van een tegel dan van een voeg.'],
      ['Formaat','60x120 geeft rust in een open keuken; 60x60 is voordeliger en makkelijker te leggen rond kasten.'],
      ['Let op','Hoogglans op de vloer is in een keuken minder praktisch: elke druppel is zichtbaar.']
    ],
    producten:['nepal','feelwood','metrotegel','metropolitan']
  },
  {
    slug:'woonkamer', naam:'Woonkamer',
    kop:'Eén vloer voor de hele begane grond',
    intro:'De meeste klanten kiezen hier één vloer voor woonkamer, hal en keuken samen. Dat is niet alleen rustiger, het is ook goedkoper: minder snijverlies en één keer legkosten.',
    advies:[
      ['Vloerverwarming','Keramiek geleidt warmte beter dan hout of pvc — je stookt efficiënter. Al onze binnenvloeren zijn geschikt.'],
      ['Kleur','Licht maakt ruimer, donker maakt rustiger. Bij veel daglicht kan donker prima; bij een noordkamer zelden.'],
      ['Legpatroon','Recht verband is het rustigst en het goedkoopst. Visgraat kost circa 15% snijverlies en meer legwerk.'],
      ['Overgangen','Denk vooraf aan de overgang naar de trap of de hal — een strakke overgang bedenk je niet achteraf.']
    ],
    producten:['feelwood','antwerp','dakota','metropolitan']
  },
  {
    slug:'terras', naam:'Terras & tuin',
    kop:'Buiten hetzelfde beeld als binnen',
    intro:'Keramiek van 2 cm is buiten inmiddels de standaard: vorstbestendig, kleurvast en je hoeft er nooit meer over met een hogedrukreiniger op zoek naar groene aanslag.',
    advies:[
      ['Dikte','Buiten altijd 2 cm. Een binnentegel van 9 mm los op split leggen gaat kapot.'],
      ['Antislip','Kies R11 of A+B+C, zeker rond een zwembad of op een hellend pad.'],
      ['Leggen','Losliggend op split is het snelst en herstelbaar; verlijmd op beton is het strakst.'],
      ['Doorlopen','Binnen 60x60 en buiten 60x60x2 in dezelfde kleur geeft een prachtig doorlopend beeld door de pui.']
    ],
    producten:['terrastegel','nepal','antwerp','dakota']
  }
];

/* ---------- Kennisbank ---------- */
var ARTIKELEN = [
  {
    slug:'hoeveel-tegels',
    titel:'Hoeveel tegels heb ik nodig?',
    samenvatting:'De rekenregel, het snijverlies en waarom je altijd op hele dozen afrondt.',
    leestijd:'3 min',
    body:[
      ['De rekenregel','Meet je oppervlakte in m², tel er snijverlies bij op en deel dat door de inhoud van een doos. Rond altijd naar boven af, want tegels worden per doos verkocht: <code>dozen = ceil(m² × (1 + snijverlies) ÷ m² per doos)</code>.'],
      ['Hoeveel snijverlies?','Bij recht verband is 10% de norm. Leg je in visgraat, diagonaal of in een ruimte met veel hoeken en obstakels, reken dan met 15%. Bij een heel kleine ruimte (een toilet van 2 m²) is 20% realistischer, omdat één misgesneden tegel daar meteen zwaar telt.'],
      ['Meet per vlak','Meet niet één keer de hele ruimte, maar per rechthoek en tel op. Een erker, een nis of een schuine wand gaat anders mis. Trek deuropeningen niet af — die m² heb je nodig voor de aansluiting.'],
      ['Waarom niet krap bestellen','Nabestellen betekent bijna altijd een andere productiebatch, en dus een zichtbaar kleurverschil. Houd liever een halve doos over als reserve voor als er later één tegel breekt.'],
      ['Bij ons','Op elke productpagina staat een rekenmodule die dit automatisch doet. Ongeopende restdozen mag je binnen 30 dagen retourneren, dus royaal bestellen kost je niets.']
    ]
  },
  {
    slug:'antislip',
    titel:'R9, R10, R11 of A+B+C: welke antislip heb ik nodig?',
    samenvatting:'De waardes uitgelegd in gewone taal, per ruimte.',
    leestijd:'3 min',
    body:[
      ['Wat de R-waarde betekent','De R-waarde (DIN 51130) geeft aan hoe schuin een vlak mag staan voordat iemand met werkschoenen wegglijdt. Hoe hoger, hoe meer grip — maar ook: hoe groffer, en dus hoe lastiger schoon te maken.'],
      ['R9','Droge binnenruimtes: woonkamer, slaapkamer, hal. Vaak gepolijst of hoogglans. Niet in de douche.'],
      ['R10','De standaard voor keuken, toilet en badkamervloer. Genoeg grip bij spatwater, nog steeds makkelijk te dweilen. Dit is wat wij in verreweg de meeste badkamers adviseren.'],
      ['R11 en hoger','Buiten, in een natte bedrijfsruimte, of op een hellend pad. Merkbaar ruwer onder de voet.'],
      ['A, B en C','Een aparte schaal (DIN 51097) voor blootsvoets natte ruimtes: A is een kleedruimte, B een douche, C een hellend zwembadpad. Een terrastegel met A+B+C is geschikt voor alle drie.'],
      ['De douchevloer','Daar telt niet alleen de tegel maar ook de voeg. Mozaïek op matje heeft veel voegen en dus veel grip — daarom adviseren wij dat vaak boven een grote tegel met afschot.']
    ]
  },
  {
    slug:'lijm-en-voeg',
    titel:'Hoeveel lijm en voegmiddel heb ik nodig?',
    samenvatting:'Vuistregels per m², en welke lijm bij welke tegel hoort.',
    leestijd:'2 min',
    body:[
      ['Lijm','Reken op 4 tot 5 kg poederlijm per m². Een zak van 25 kg is dus goed voor ongeveer 5 m². Bij grootformaat (60x120 en groter) ligt het hoger, omdat je volvlaks moet werken.'],
      ['Welke lijm','Voor keramiek op een gangbare ondergrond volstaat een flexibele C2TE S1. Bij vloerverwarming, op hout of op een bestaande tegelvloer is flexibele lijm geen luxe maar een eis.'],
      ['Voegmiddel','Circa 0,4 kg per m² bij een voeg van 2 mm op 60x60. Kleinere tegels betekenen meer voegen en dus meer materiaal: bij mozaïek loopt dat op naar 1,5 kg per m².'],
      ['Voegkleur','Kies een voeg net iets donkerder dan de tegel. Wit oogt mooi op de dag van oplevering en daarna nooit meer, zeker niet op een vloer of in een douche.'],
      ['Vergeet niet','Tegelkruisjes (2 mm bij gerectificeerd), een koker sanitairkit voor de hoeken, en primer als je op een zuigende ondergrond werkt. Wij rekenen dit bij je bestelling automatisch mee.']
    ]
  },
  {
    slug:'formaat-kiezen',
    titel:'Welk formaat past in mijn ruimte?',
    samenvatting:'Waarom een groot formaat een kleine ruimte juist groter maakt.',
    leestijd:'3 min',
    body:[
      ['Het misverstand','"Kleine ruimte, dus kleine tegels" klopt niet. Elke voeg is een lijn die het oog onderbreekt; hoe minder lijnen, hoe rustiger en ruimer het beeld. Een 60x60 in een badkamer van 4 m² werkt bijna altijd beter dan een 30x30.'],
      ['De grens','Het formaat wordt begrensd door je snijverlies. In een smalle ruimte van 1,60 m breed snijd je een 120 cm tegel altijd door — dan verlies je meer dan je aan rust wint.'],
      ['Gerectificeerd of niet','Gerectificeerde tegels zijn nagesneden en exact op maat, waardoor een voeg van 2 mm mogelijk is. Niet-gerectificeerd vraagt 3 tot 5 mm. Voor een strak beeld bij groot formaat is gerectificeerd de moeite waard.'],
      ['Vloerverwarming en formaat','Grootformaat vraagt een vlakke ondergrond en volvlakse lijm; een holte onder de tegel is bij 120 cm een breukrisico. Laat dit bij twijfel door een tegelzetter beoordelen.'],
      ['Ons advies','Twijfel je tussen twee formaten, kom dan langs. Wij leggen beide op de grond naast elkaar — op een showroomvloer zie je binnen dertig seconden welke het is.']
    ]
  }
];

/* ---------- Reviews ---------- */
var REVIEWS = [
  {naam:'Marloes B.', plaats:'Deventer', score:5, titel:'Eerlijk advies, geen verkooppraatje',
   tekst:'We twijfelden tussen twee formaten. In de showroom kregen we een half uur de tijd en het eerlijke advies om voor de goedkopere te gaan. Vloer ligt er nu prachtig in.'},
  {naam:'Jeroen K.', plaats:'Raalte', score:5, titel:'Samples binnen twee dagen',
   tekst:'Vier stalen aangevraagd op donderdag, zaterdag lagen ze op de mat. Scheelde ons een hoop twijfel; kleur bij kunstlicht is echt anders dan op je scherm.'},
  {naam:'Familie De Vries', plaats:'Heeten', score:5, titel:'Berekening klopte precies',
   tekst:'Via de rekenmodule 6 dozen besteld inclusief snijverlies. Precies genoeg, één halve doos over voor reserve. Zelf afgehaald in Heeten.'},
  {naam:'Sander W.', plaats:'Zwolle', score:4, titel:'Goede kwaliteit, levering iets later',
   tekst:'De tegels zijn top en de lijm werd meteen meegeleverd. Levering was een week later dan gehoopt, wel netjes op de hoogte gehouden.'}
];
