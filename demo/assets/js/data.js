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

/* ---------- Assortiment ---------- */
/* prijs = per m2 incl. btw | m2PerDoos = inhoud per doos                    */
var PRODUCTS = [
  {
    id:'especta-beige',
    naam:'Especta Beige Natuursteenlook Vloer-/Wandtegel',
    merk:'Ege Seramik', look:'natuursteenlook', ruimte:['badkamer','woonkamer','keuken','toilet'],
    toepassing:['vloer','wand','binnen'], afwerking:'Mat', antislip:'R10', dikte:'9 mm',
    materiaal:'Gerectificeerd porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 5 (PEI V)',
    vloerverwarming:true, badge:['-22%','Actie van de maand'], nieuw:false, rating:5.0, reviews:38,
    levertijd:'2-3 weken', voorraad:'op bestelling',
    omschrijving:'Een warme, rustige natuursteenlook met subtiele aderingen. Gerectificeerd, dus met een strak voegbeeld van 2 mm te leggen. Geschikt voor vloer én wand, ook op vloerverwarming.',
    kleuren:[
      {naam:'Beige', tex:tex('natuursteenlook','#d8cdbd','#b6a794',7)},
      {naam:'Greige', tex:tex('natuursteenlook','#c9c1b4','#a2988a',11)},
      {naam:'Antraciet', tex:tex('natuursteenlook','#4a4c4f','#2e3033',13)}
    ],
    maten:[
      {maat:'60x60 cm', prijs:29.95, oud:38.95, m2PerDoos:1.44, stuksPerDoos:4},
      {maat:'80x80 cm', prijs:32.95, oud:41.95, m2PerDoos:1.28, stuksPerDoos:2},
      {maat:'100x100 cm', prijs:34.95, oud:44.95, m2PerDoos:2.00, stuksPerDoos:2}
    ]
  },
  {
    id:'carrara-statuario',
    naam:'Maison Marmerlook Gepolijst Vloertegel',
    merk:'Ege Seramik', look:'marmerlook', ruimte:['badkamer','woonkamer','hal'],
    toepassing:['vloer','wand','binnen'], afwerking:'Gepolijst', antislip:'R9', dikte:'9 mm',
    materiaal:'Gerectificeerd porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 4 (PEI IV)',
    vloerverwarming:true, badge:['Bestseller'], nieuw:false, rating:4.9, reviews:64,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Hoogglans marmerlook met grijze aderingen op een witte ondergrond. Geeft een lichte, luxe uitstraling en is onderhoudsarm — het uiterlijk van marmer zonder het onderhoud.',
    kleuren:[
      {naam:'Wit', tex:tex('marmerlook','#f2f1ee','#9aa2ab',3)},
      {naam:'Calacatta Goud', tex:tex('marmerlook','#f4f0e7','#c2a06a',5)},
      {naam:'Zwart', tex:tex('marmerlook','#26282c','#9fa6ae',9)}
    ],
    maten:[
      {maat:'60x60 cm', prijs:34.50, oud:null, m2PerDoos:1.44, stuksPerDoos:4},
      {maat:'60x120 cm', prijs:39.50, oud:null, m2PerDoos:1.44, stuksPerDoos:2}
    ]
  },
  {
    id:'urban-beton',
    naam:'Ontario Betonlook Vloertegel Mat',
    merk:'Tegelloods Select', look:'betonlook', ruimte:['woonkamer','keuken','badkamer','bedrijfsruimte'],
    toepassing:['vloer','wand','binnen'], afwerking:'Mat', antislip:'R10', dikte:'10 mm',
    materiaal:'Gerectificeerd porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 5 (PEI V)',
    vloerverwarming:true, badge:['-15%'], nieuw:false, rating:4.8, reviews:91,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Strakke betonlook met een licht gewolkte structuur. Onze meest verkochte vloertegel voor open woon-keukens; zeer sterk en geschikt voor intensief gebruik.',
    kleuren:[
      {naam:'Light Grey', tex:tex('betonlook','#c6c7c5','#8e908e',2)},
      {naam:'Taupe', tex:tex('betonlook','#b8afa3','#8a8175',4)},
      {naam:'Antraciet', tex:tex('betonlook','#54565a','#33353a',6)},
      {naam:'Ivory', tex:tex('betonlook','#ded9d1','#b0aaa1',8)}
    ],
    maten:[
      {maat:'60x60 cm', prijs:24.95, oud:29.50, m2PerDoos:1.44, stuksPerDoos:4},
      {maat:'75x75 cm', prijs:27.95, oud:32.95, m2PerDoos:1.69, stuksPerDoos:3},
      {maat:'60x120 cm', prijs:29.95, oud:35.50, m2PerDoos:1.44, stuksPerDoos:2}
    ]
  },
  {
    id:'nordic-eiken',
    naam:'Torro Eiken Houtlook Vloertegel 20x120',
    merk:'Ege Seramik', look:'houtlook', ruimte:['woonkamer','keuken','hal','slaapkamer'],
    toepassing:['vloer','binnen'], afwerking:'Structuur', antislip:'R10', dikte:'9 mm',
    materiaal:'Gerectificeerd porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 5 (PEI V)',
    vloerverwarming:true, badge:['Topper'], nieuw:false, rating:4.9, reviews:47,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Houtlook met realistische nerfstructuur in een lang formaat. Ideaal in visgraat of halfsteensverband en — anders dan echt hout — perfect combineerbaar met vloerverwarming.',
    kleuren:[
      {naam:'Natural', tex:tex('houtlook','#c9a877','#8e6c42',12)},
      {naam:'Smoked', tex:tex('houtlook','#9c8163','#6b523a',14)},
      {naam:'Grey Oak', tex:tex('houtlook','#b3ada4','#7e786f',16)}
    ],
    maten:[
      {maat:'20x120 cm', prijs:31.95, oud:null, m2PerDoos:1.44, stuksPerDoos:6},
      {maat:'15x90 cm (visgraat)', prijs:36.50, oud:null, m2PerDoos:1.08, stuksPerDoos:8}
    ]
  },
  {
    id:'metro-wit',
    naam:'Metrotegel Wit Glans 7,5x15',
    merk:'Tegelloods Select', look:'effen', ruimte:['keuken','badkamer','toilet'],
    toepassing:['wand','binnen'], afwerking:'Glans', antislip:'-', dikte:'8 mm',
    materiaal:'Keramiek', sortering:'1e sortering', slijtvastheid:'n.v.t. (wandtegel)',
    vloerverwarming:false, badge:['Voordeel'], nieuw:false, rating:4.7, reviews:120,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'De klassieke metrotegel met facet. Tijdloos in de keuken als achterwand en in de badkamer. Ook verkrijgbaar in mat.',
    kleuren:[
      {naam:'Wit glans', tex:tex('effen','#f6f6f4','#dcdcda',21,{joint:false})},
      {naam:'Wit mat', tex:tex('effen','#efeeea','#d4d3cf',22,{joint:false})},
      {naam:'Salie', tex:tex('effen','#b9c4b3','#93a08d',23,{joint:false})},
      {naam:'Terra', tex:tex('effen','#c98d6d','#a06a4c',24,{joint:false})}
    ],
    maten:[
      {maat:'7,5x15 cm', prijs:16.95, oud:21.95, m2PerDoos:0.50, stuksPerDoos:44},
      {maat:'10x30 cm', prijs:18.95, oud:23.95, m2PerDoos:1.00, stuksPerDoos:33}
    ]
  },
  {
    id:'terrazzo-venice',
    naam:'Romina Terrazzolook Vloer-/Wandtegel',
    merk:'Ege Seramik', look:'terrazzo', ruimte:['badkamer','toilet','hal'],
    toepassing:['vloer','wand','binnen'], afwerking:'Mat', antislip:'R10', dikte:'9 mm',
    materiaal:'Gerectificeerd porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 4 (PEI IV)',
    vloerverwarming:true, badge:['Nieuw'], nieuw:true, rating:4.8, reviews:12,
    levertijd:'2-3 weken', voorraad:'op bestelling',
    omschrijving:'Speels terrazzo met fijne kleurspikkels. Mooi als totaalvloer in een klein toilet of als accentvlak in de badkamer.',
    kleuren:[
      {naam:'Bianco', tex:tex('terrazzo','#eeece6','#b7b1a5',31,{pal:['#c7c0b3','#8f877a','#ddd7c9','#a89a86']})},
      {naam:'Greige', tex:tex('terrazzo','#d5cec2','#9d9484',33,{pal:['#b3a894','#7f7666','#e0d8c8','#9c8f7a']})}
    ],
    maten:[
      {maat:'60x60 cm', prijs:37.95, oud:null, m2PerDoos:1.44, stuksPerDoos:4}
    ]
  },
  {
    id:'quartz-buiten',
    naam:'Ares Keramische Terrastegel 60x60x2 cm',
    merk:'Tegelloods Select', look:'natuursteenlook', ruimte:['tuin','terras','oprit'],
    toepassing:['vloer','buiten'], afwerking:'Structuur', antislip:'R11 / A+B+C', dikte:'20 mm',
    materiaal:'Keramisch, vorstbestendig', sortering:'1e sortering', slijtvastheid:'Klasse 5 (PEI V)',
    vloerverwarming:false, badge:['Buiten'], nieuw:false, rating:4.9, reviews:73,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Keramische buitentegel van 2 cm dik. Vorstbestendig, kleurvast en nagenoeg onderhoudsvrij — losliggend op split of te verlijmen op een betonnen ondergrond.',
    kleuren:[
      {naam:'Grigio', tex:tex('natuursteenlook','#9d9d99','#77776f',41)},
      {naam:'Sand', tex:tex('natuursteenlook','#c4b7a1','#9c8f79',43)},
      {naam:'Nero', tex:tex('natuursteenlook','#3f4144','#26282b',45)}
    ],
    maten:[
      {maat:'60x60x2 cm', prijs:33.50, oud:null, m2PerDoos:1.44, stuksPerDoos:4},
      {maat:'80x80x2 cm', prijs:38.50, oud:null, m2PerDoos:1.28, stuksPerDoos:2}
    ]
  },
  {
    id:'zellige-groen',
    naam:'Zellige Handvorm Wandtegel 10x10',
    merk:'Atelier', look:'effen', ruimte:['keuken','badkamer'],
    toepassing:['wand','binnen'], afwerking:'Glans, handvorm', antislip:'-', dikte:'9 mm',
    materiaal:'Keramiek', sortering:'1e sortering', slijtvastheid:'n.v.t. (wandtegel)',
    vloerverwarming:false, badge:['Nieuw'], nieuw:true, rating:4.9, reviews:9,
    levertijd:'3-4 weken', voorraad:'op bestelling',
    omschrijving:'Handgevormde zellige met een levendig glazuur: elke tegel is net iets anders. Een warme keuze voor de keukenachterwand.',
    kleuren:[
      {naam:'Olijfgroen', tex:tex('effen','#7d8a63','#5d6849',51,{joint:false})},
      {naam:'Oceaan', tex:tex('effen','#5f7f8d','#456070',53,{joint:false})},
      {naam:'Off-white', tex:tex('effen','#e8e3d8','#c8c2b4',55,{joint:false})}
    ],
    maten:[
      {maat:'10x10 cm', prijs:59.95, oud:null, m2PerDoos:0.50, stuksPerDoos:50}
    ]
  },
  {
    id:'travertin-classic',
    naam:'Nepal Travertinlook Vloer-/Wandtegel',
    merk:'Ege Seramik', look:'natuursteenlook', ruimte:['badkamer','woonkamer','hal'],
    toepassing:['vloer','wand','binnen'], afwerking:'Zijdemat', antislip:'R10', dikte:'9 mm',
    materiaal:'Gerectificeerd porcellanato', sortering:'1e sortering', slijtvastheid:'Klasse 4 (PEI IV)',
    vloerverwarming:true, badge:[], nieuw:false, rating:4.8, reviews:26,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Travertinlook met de karakteristieke horizontale nerf. Warm van kleur en rustig van beeld — combineert mooi met hout en riet.',
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
    id:'mosaic-hex',
    naam:'Hexagon Mozaïek Mat op Matje 30x30',
    merk:'Atelier', look:'effen', ruimte:['badkamer','toilet'],
    toepassing:['vloer','wand','binnen'], afwerking:'Mat', antislip:'R11', dikte:'8 mm',
    materiaal:'Porcellanato mozaïek', sortering:'1e sortering', slijtvastheid:'Klasse 4 (PEI IV)',
    vloerverwarming:true, badge:['Douchevloer'], nieuw:false, rating:4.7, reviews:31,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Mozaïek op matje — dé oplossing voor de douchevloer met afschot. Veel voegen betekent extra grip (R11).',
    kleuren:[
      {naam:'Wit', tex:tex('effen','#eceae5','#cfccc5',71,{joint:false})},
      {naam:'Antraciet', tex:tex('effen','#4b4d50','#333538',73,{joint:false})}
    ],
    maten:[
      {maat:'30x30 cm (matje)', prijs:44.95, oud:null, m2PerDoos:0.90, stuksPerDoos:10}
    ]
  },
  {
    id:'lijm-flex',
    naam:'Tegellijm Flex Wit 25 kg',
    merk:'Tegelloods Select', look:'toebehoren', ruimte:['toebehoren'],
    toepassing:['toebehoren'], afwerking:'-', antislip:'-', dikte:'-',
    materiaal:'C2TE S1 flexibele poederlijm', sortering:'-', slijtvastheid:'-',
    vloerverwarming:true, badge:[], nieuw:false, rating:4.9, reviews:54,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Flexibele witte poederlijm (C2TE S1), geschikt voor grootformaat tegels en vloerverwarming. Rendement circa 4-5 kg per m².',
    perStuk:true, eenheid:'zak',
    kleuren:[{naam:'Wit', tex:tex('effen','#e9e6df','#cbc7bf',81,{joint:false})}],
    maten:[{maat:'25 kg', prijs:21.95, oud:null, m2PerDoos:1, stuksPerDoos:1}]
  },
  {
    id:'voegmiddel',
    naam:'Voegmiddel Flex 5 kg',
    merk:'Tegelloods Select', look:'toebehoren', ruimte:['toebehoren'],
    toepassing:['toebehoren'], afwerking:'-', antislip:'-', dikte:'-',
    materiaal:'Cementgebonden voegmortel CG2 WA', sortering:'-', slijtvastheid:'-',
    vloerverwarming:true, badge:[], nieuw:false, rating:4.8, reviews:29,
    levertijd:'1-3 werkdagen', voorraad:'op voorraad',
    omschrijving:'Flexibel voegmiddel voor voegen van 1-10 mm, water- en vuilafstotend. In 12 kleuren, afgestemd op onze collecties.',
    perStuk:true, eenheid:'emmer',
    kleuren:[
      {naam:'Zilvergrijs', tex:tex('effen','#b9b9b6','#9a9a97',83,{joint:false})},
      {naam:'Antraciet', tex:tex('effen','#4f5153','#3a3c3e',85,{joint:false})},
      {naam:'Wit', tex:tex('effen','#f0efec','#d6d5d1',87,{joint:false})}
    ],
    maten:[{maat:'5 kg', prijs:14.95, oud:null, m2PerDoos:1, stuksPerDoos:1}]
  }
];

/* ---------- Categorieën ---------- */
var CATEGORIES = [
  {slug:'vloertegels', naam:'Vloertegels', sub:'vanaf € 24,95 p/m²', tex:tex('betonlook','#c6c7c5','#8e908e',2)},
  {slug:'wandtegels',  naam:'Wandtegels',  sub:'vanaf € 16,95 p/m²', tex:tex('effen','#f6f6f4','#dcdcda',21,{joint:false})},
  {slug:'houtlook',    naam:'Houtlook',    sub:'nerfstructuur',      tex:tex('houtlook','#c9a877','#8e6c42',12)},
  {slug:'marmerlook',  naam:'Marmerlook',  sub:'gepolijst & mat',    tex:tex('marmerlook','#f2f1ee','#9aa2ab',3)},
  {slug:'buitentegels',naam:'Buitentegels',sub:'2 cm keramiek',      tex:tex('natuursteenlook','#9d9d99','#77776f',41)},
  {slug:'toebehoren',  naam:'Lijm & voeg', sub:'alles compleet',     tex:tex('effen','#e9e6df','#cbc7bf',81,{joint:false})}
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
