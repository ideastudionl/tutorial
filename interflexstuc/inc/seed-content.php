<?php
/**
 * Startcontent: vult de site bij activatie met diensten, werkgebieden,
 * veelgestelde vragen, reviews, pagina's en menu's.
 *
 * Alles is bedoeld als startpunt en kan gewoon in WordPress worden aangepast.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

/**
 * Draait de seed één keer, na activatie van het thema.
 */
function ifs_after_switch_theme() {
	ifs_register_post_types();
	ifs_register_quote_cpt();

	if ( ! get_option( 'ifs_seeded' ) ) {
		ifs_seed_content();
		update_option( 'ifs_seeded', IFS_VERSION );
	}

	flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'ifs_after_switch_theme' );

/**
 * Maakt een post aan als er nog geen post met dezelfde slug bestaat.
 *
 * @param string $type    Post type.
 * @param string $title   Titel.
 * @param string $content Inhoud.
 * @param array  $args    Extra argumenten (excerpt, meta, menu_order, template).
 * @return int Post ID.
 */
function ifs_seed_post( $type, $title, $content = '', $args = array() ) {
	$slug     = isset( $args['slug'] ) ? $args['slug'] : sanitize_title( $title );
	$existing = get_page_by_path( $slug, OBJECT, $type );

	if ( $existing ) {
		return $existing->ID;
	}

	$post_id = wp_insert_post(
		array(
			'post_type'    => $type,
			'post_status'  => 'publish',
			'post_title'   => $title,
			'post_name'    => $slug,
			'post_content' => $content,
			'post_excerpt' => isset( $args['excerpt'] ) ? $args['excerpt'] : '',
			'menu_order'   => isset( $args['menu_order'] ) ? $args['menu_order'] : 0,
		)
	);

	if ( is_wp_error( $post_id ) || ! $post_id ) {
		return 0;
	}

	if ( ! empty( $args['template'] ) ) {
		update_post_meta( $post_id, '_wp_page_template', $args['template'] );
	}

	foreach ( ( isset( $args['meta'] ) ? $args['meta'] : array() ) as $key => $value ) {
		update_post_meta( $post_id, $key, $value );
	}

	return $post_id;
}

/**
 * Vult de site met startcontent.
 */
function ifs_seed_content() {
	$services   = ifs_seed_services();
	$areas      = ifs_seed_areas();
	ifs_seed_faq();
	ifs_seed_reviews();
	$pages      = ifs_seed_pages();

	// Homepage instellen.
	if ( ! empty( $pages['home'] ) ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $pages['home'] );
	}
	if ( ! empty( $pages['blog'] ) ) {
		update_option( 'page_for_posts', $pages['blog'] );
	}

	update_option( 'blogname', 'Interflex Stuc' );
	update_option( 'blogdescription', 'Stukadoor en stucwerk in Amsterdam en omstreken' );
	update_option( 'permalink_structure', '/%postname%/' );

	ifs_seed_menus( $services, $areas, $pages );
}

/**
 * Diensten.
 *
 * @return array Slug => post ID.
 */
function ifs_seed_services() {
	$items = array(
		array(
			'title'   => 'Glad stucwerk (wanden)',
			'slug'    => 'glad-stucwerk',
			'icon'    => 'wall',
			'price'   => '€ 18,50 per m²',
			'excerpt' => 'Strak, vlak en behangklaar pleisterwerk voor binnenmuren — de basis van elk mooi afgewerkt interieur.',
			'usps'    => "Vlak en naadloos resultaat\nDirect over te schilderen of te behangen\nGeschikt voor nieuwbouw en renovatie",
			'content' => "<p>Glad stucwerk is de meest gevraagde afwerking voor binnenmuren. Wij brengen een dunne, egale laag pleister aan die de ondergrond volledig vlak maakt. Het resultaat is een strakke wand zonder zichtbare naden, klaar om te sausen of te behangen.</p>
<h2>Wanneer kies je voor glad stucwerk?</h2>
<p>Bij nieuwbouw is glad stucwerk de standaard afwerking op kalkzandsteen of gipsblokken. Bij een renovatie gebruiken we het om oude, beschadigde of ongelijke muren weer als nieuw te maken. Ook wanden waar behang van af is gehaald krijgen er hun strakke uitstraling mee terug.</p>
<h2>Zo gaan we te werk</h2>
<ol>
<li><strong>Voorbereiding.</strong> We beschermen vloeren en kozijnen, verwijderen loszittend materiaal en repareren scheuren.</li>
<li><strong>Voorstrijken.</strong> De ondergrond wordt voorbehandeld zodat de pleister goed hecht en gelijkmatig droogt.</li>
<li><strong>Stucen.</strong> We brengen het pleisterwerk aan en werken het in meerdere gangen vlak af.</li>
<li><strong>Opleveren.</strong> Na droging controleren we het werk en leveren we schoon op.</li>
</ol>
<h2>Afwerkingsniveaus</h2>
<p>Behangklaar is de meest gekozen variant en volstaat wanneer er behang of structuurverf op komt. Kies je voor strak sauswerk of een donkere kleur, dan adviseren we een sausklaar niveau: dat vraagt een extra afwerkgang, maar voorkomt dat licht oneffenheden uitvergroot.</p>",
		),
		array(
			'title'   => 'Plafonds stucen',
			'slug'    => 'plafond-stucen',
			'icon'    => 'ceiling',
			'price'   => '€ 21,00 per m²',
			'excerpt' => 'Van gipsplaten of oude schrootjes naar een naadloos, spierwit plafond zonder zichtbare overgangen.',
			'usps'    => "Naden en schroefgaten volledig weggewerkt\nOok over bestaande systeemplafonds\nStof- en spatvrij werken",
			'content' => "<p>Een plafond valt pas op als het níét strak is. Wij werken plafonds van gipsplaten, beton of oude schrootjes af tot een egaal en naadloos vlak. Schroefgaten, naden en oneffenheden verdwijnen volledig.</p>
<h2>Veelvoorkomende situaties</h2>
<p>Bij nieuwbouw en verbouwingen worden gipsplaten geplaatst die wij afwerken met een gaas- en pleisterlaag. In oudere Amsterdamse woningen treffen we vaak stucplafonds met scheuren of een verlaagd schrootjesplafond aan; die kunnen we herstellen of vervangen door een strak nieuw plafond.</p>
<h2>Sierlijsten en ornamenten</h2>
<p>Werk je aan een pand met karakter? We plaatsen en herstellen ook sierlijsten, rozetten en ornamenten, zodat het originele karakter van de woning behouden blijft.</p>",
		),
		array(
			'title'   => 'Sierpleister & spachtelputz',
			'slug'    => 'sierpleister-spachtelputz',
			'icon'    => 'sparkles',
			'price'   => '€ 24,00 per m²',
			'excerpt' => 'Structuurpleister van kunsthars en steenkorrels: sterk, slijtvast en beschikbaar in fijne tot grove korrels.',
			'usps'    => "Zeer slijtvast en stootvast\nKorrelgrootte naar keuze\nGeschikt voor binnen en buiten",
			'content' => "<p>Spachtelputz is een sierpleister van kunsthars met steenkorrels. De korrelgrootte bepaalt hoe fijn of grof het oppervlak wordt — van een subtiele structuur tot een uitgesproken korrel. Het materiaal hardt zeer sterk uit en is daardoor lastig te beschadigen.</p>
<h2>Waar wordt het toegepast?</h2>
<p>Sierpleister is populair in trappenhuizen, gangen, portieken en bedrijfsruimtes: plekken waar veel langs gelopen wordt en gladde wanden snel beschadigen. Buiten wordt het gebruikt als gevelafwerking, omdat het bestand is tegen weer en wind.</p>
<h2>Kleur en korrel</h2>
<p>Spachtelputz is in vrijwel elke kleur leverbaar en kan direct in kleur worden aangebracht, zodat naschilderen niet nodig is. We laten je vooraf graag proefmonsters zien, zodat je precies weet welke structuur je krijgt.</p>",
		),
		array(
			'title'   => 'Buitengevel stucen',
			'slug'    => 'buitengevel-stucen',
			'icon'    => 'building',
			'price'   => 'op aanvraag',
			'excerpt' => 'Gevelpleister die de woning waterdicht maakt en er strak uit laat zien — glad, gestructureerd of met isolatie.',
			'usps'    => "Waterdichte, ademende afwerking\nOptioneel met gevelisolatie\nVerlengt de levensduur van het metselwerk",
			'content' => "<p>Een gestuukte gevel beschermt het metselwerk tegen regen en vorst en geeft de woning direct een frissere uitstraling. We werken met ademende systemen die vocht van binnenuit doorlaten, maar regen buitenhouden.</p>
<h2>Drie mogelijkheden</h2>
<ul>
<li><strong>Glad gevelstuc.</strong> Een strakke, moderne uitstraling.</li>
<li><strong>Gestructureerde pleister.</strong> Een korrelstructuur die kleine oneffenheden in het metselwerk verbergt.</li>
<li><strong>Gevelisolatie met stucwerk.</strong> Isolatieplaten op de bestaande gevel, afgewerkt met wapening en sierpleister. Dat verlaagt de stookkosten en verbetert het energielabel.</li>
</ul>
<h2>Voorbereiding is bepalend</h2>
<p>Slecht voegwerk, optrekkend vocht of scheuren in het metselwerk moeten eerst worden aangepakt. Tijdens de opname beoordelen we de gevel en benoemen we eerlijk wat er nodig is voordat er gepleisterd kan worden.</p>",
		),
		array(
			'title'   => 'Betonlook & betonstuc',
			'slug'    => 'betonlook-betonstuc',
			'icon'    => 'layers',
			'price'   => '€ 95,00 per m²',
			'excerpt' => 'Naadloze betonciré met levendige wolking — voor wanden, badkamers en vloeren zonder kieren of voegen.',
			'usps'    => "Volledig naadloos, ook in natte ruimtes\nSlechts enkele millimeters dik\nElk werk is uniek van tekening",
			'content' => "<p>Betonstuc — ook wel betonciré of betonlook genoemd — geeft een wand of vloer de rauwe uitstraling van beton, maar dan in een laag van slechts enkele millimeters. Doordat het naadloos wordt aangebracht ontstaat een rustig, doorlopend vlak zonder voegen.</p>
<h2>Populair in badkamers</h2>
<p>Met de juiste opbouw en afdichting is betonstuc uitstekend geschikt voor badkamers en doucheruimtes. Geen voegen betekent geen schimmelrandjes en veel makkelijker schoonmaken.</p>
<h2>Handwerk met karakter</h2>
<p>De wolking in betonstuc ontstaat tijdens het aanbrengen en is bij elk werk anders. We maken vooraf een proefvlak, zodat je precies weet welke tekening en kleur je krijgt.</p>",
		),
		array(
			'title'   => 'Schilderwerk binnen & buiten',
			'slug'    => 'schilderwerk',
			'icon'    => 'brush',
			'price'   => 'op aanvraag',
			'excerpt' => 'Kozijnen, deuren, trappen, plafonds en wanden — vakkundig geschilderd, met de juiste voorbereiding.',
			'usps'    => "Grondig schuren en plamuren vooraf\nDuurzame verfsystemen\nBinnen- en buitenschilderwerk",
			'content' => "<p>Omdat wij het stucwerk zelf uitvoeren, kunnen we de wanden en plafonds ook direct afwerken met verf. Eén partij voor het hele traject scheelt afstemming, wachttijd en discussie over wie waar verantwoordelijk voor is.</p>
<h2>Binnenschilderwerk</h2>
<p>Trappen, kozijnen, deuren, plafonds en wanden. We schuren, plamuren en gronden zorgvuldig voordat de aflak erop gaat — daar zit het verschil tussen verf die twee jaar meegaat en verf die tien jaar mooi blijft.</p>
<h2>Buitenschilderwerk</h2>
<p>Buiten werken we met verfsystemen die bestand zijn tegen UV en vocht. Houtrot pakken we aan voordat we schilderen, zodat het probleem niet onder de verf doorwoekert.</p>",
		),
	);

	$ids = array();
	foreach ( $items as $order => $item ) {
		$ids[ $item['slug'] ] = ifs_seed_post(
			'ifs_dienst',
			$item['title'],
			$item['content'],
			array(
				'slug'       => $item['slug'],
				'excerpt'    => $item['excerpt'],
				'menu_order' => $order,
				'meta'       => array(
					'ifs_icon'       => $item['icon'],
					'ifs_price_from' => $item['price'],
					'ifs_usps'       => $item['usps'],
				),
			)
		);
	}

	return $ids;
}

/**
 * Werkgebieden (SEO-landingspagina's per plaats).
 *
 * @return array Slug => post ID.
 */
function ifs_seed_areas() {
	$cities = array(
		'Amsterdam'  => array( 'reistijd' => 'thuisbasis', 'wijken' => 'Centrum, De Pijp, Oud-West, Oud-Zuid, Noord, Oost, Nieuw-West, Zuidoost, IJburg' ),
		'Amstelveen' => array( 'reistijd' => '15 minuten', 'wijken' => 'Westwijk, Bankras, Elsrijk, Randwijck' ),
		'Haarlem'    => array( 'reistijd' => '25 minuten', 'wijken' => 'Centrum, Haarlem-Noord, Schalkwijk, Spaarndam' ),
		'Almere'     => array( 'reistijd' => '30 minuten', 'wijken' => 'Almere Stad, Almere Buiten, Almere Haven, Poort' ),
		'Purmerend'  => array( 'reistijd' => '25 minuten', 'wijken' => 'Weidevenne, Overwhere, Purmer-Noord, Purmer-Zuid' ),
		'Zaandam'    => array( 'reistijd' => '20 minuten', 'wijken' => 'Zaandam Centrum, Westerkoog, Kogerveld, Wormerveer' ),
		'Hoofddorp'  => array( 'reistijd' => '20 minuten', 'wijken' => 'Overbos, Toolenburg, Floriande, Nieuw-Vennep' ),
		'Aalsmeer'   => array( 'reistijd' => '25 minuten', 'wijken' => 'Aalsmeer-Dorp, Kudelstaart, Oosteinde' ),
		'Uithoorn'   => array( 'reistijd' => '25 minuten', 'wijken' => 'Thamerdal, Zijdelwaard, De Kwakel' ),
		'Diemen'     => array( 'reistijd' => '15 minuten', 'wijken' => 'Diemen-Noord, Diemen-Zuid, Diemen Centrum' ),
		'Hilversum'  => array( 'reistijd' => '35 minuten', 'wijken' => 'Centrum, Hilversum-Noord, Kerkelanden' ),
		'Utrecht'    => array( 'reistijd' => '40 minuten', 'wijken' => 'Binnenstad, Leidsche Rijn, Oost, Overvecht' ),
	);

	$ids = array();
	$i   = 0;

	foreach ( $cities as $city => $info ) {
		$slug    = 'stukadoor-' . sanitize_title( $city );
		$content = sprintf(
			'<p>Zoek je een ervaren stukadoor in %1$s? Interflex Stuc werkt al ruim tien jaar in %1$s en omgeving. We verzorgen glad stucwerk, plafonds, sierpleister, betonlook en schilderwerk — voor particulieren, VvE\'s en aannemers.</p>
<h2>Wat we doen in %1$s</h2>
<p>Van één kamer behangklaar maken tot het complete stucwerk van een nieuwbouwproject. We werken in %2$s en alle omliggende wijken. Vanuit onze locatie in Amsterdam zijn we in %3$s ter plaatse, waardoor we ook kleinere klussen goed kunnen inplannen.</p>
<h2>Eerst kijken, dan pas een prijs</h2>
<p>We geven geen prijs op basis van een gevoel. Bij grotere klussen komen we vrijblijvend langs om de ondergrond te beoordelen en op te meten. Daarna ontvang je een vaste prijs per vierkante meter, met daarin duidelijk benoemd wat er wél en niet bij zit.</p>
<h2>Werken in bewoonde huizen</h2>
<p>De meeste klussen voeren we uit terwijl mensen gewoon in hun woning wonen. We schermen vloeren en meubels af, houden de looproutes vrij en ruimen elke dag op. In een appartement stemmen we vooraf af hoe we materiaal aanvoeren en waar we mogen zagen en mengen.</p>',
			esc_html( $city ),
			esc_html( $info['wijken'] ),
			esc_html( $info['reistijd'] )
		);

		$ids[ $slug ] = ifs_seed_post(
			'ifs_werkgebied',
			$city,
			$content,
			array(
				'slug'       => $slug,
				'menu_order' => $i++,
				'excerpt'    => sprintf( 'Stukadoor in %s voor glad stucwerk, plafonds, sierpleister en schilderwerk. Vaste prijs vooraf en garantie op het werk.', $city ),
				'meta'       => array(
					'ifs_city'        => $city,
					'ifs_travel_time' => $info['reistijd'],
					'ifs_districts'   => $info['wijken'],
				),
			)
		);
	}

	return $ids;
}

/**
 * Veelgestelde vragen.
 */
function ifs_seed_faq() {
	$faq = array(
		'Wat kost stucwerk per m²?'                       => '<p>Glad stucwerk op wanden begint bij ongeveer € 18,50 per m², plafonds bij € 21,00 per m². De uiteindelijke prijs hangt af van de staat van de ondergrond, de hoogte van de ruimte en het gewenste afwerkingsniveau. Via de offerteaanvraag krijg je binnen 24 uur een prijs die past bij jouw situatie.</p>',
		'Hoe lang duurt het voordat stucwerk droog is?'    => '<p>Reken op ongeveer één dag droogtijd per millimeter laagdikte. Glad stucwerk is meestal na twee tot vier dagen droog genoeg om te schilderen, maar in een koude of slecht geventileerde ruimte kan dat langer duren. We adviseren je bij oplevering wanneer je veilig kunt sausen.</p>',
		'Kan ik in huis blijven wonen tijdens het werk?'   => '<p>Ja, dat is bij de meeste klussen prima. We werken per ruimte, schermen alles zorgvuldig af en ruimen dagelijks op. Bij een volledige woning stemmen we samen een planning af, zodat je altijd een leefbare ruimte houdt.</p>',
		'Moet ik het behang er eerst zelf afhalen?'        => '<p>Dat hoeft niet — wij kunnen het behang verwijderen en de wand voorbereiden. Doe je het zelf, dan scheelt dat in de prijs. Geef bij de offerteaanvraag aan wat je kiest, dan verwerken we dat in de opgave.</p>',
		'Geven jullie garantie op het werk?'              => '<p>Ja. Op ons stuc- en schilderwerk geven we vijf jaar garantie op de uitvoering. Ontstaat er binnen die termijn een gebrek dat aan ons werk te wijten is, dan lossen we dat kosteloos op.</p>',
		'Werken jullie ook voor VvE\'s en aannemers?'     => '<p>Zeker. We werken regelmatig voor VvE\'s, aannemers en projectontwikkelaars aan portieken, trappenhuizen, gevels en complete nieuwbouwprojecten. Voor terugkerend werk maken we graag prijsafspraken op jaarbasis.</p>',
		'Hoe snel kunnen jullie beginnen?'                => '<p>Kleinere klussen kunnen we vaak binnen één tot twee weken inplannen. Voor grotere projecten geldt doorgaans een doorlooptijd van drie tot zes weken, afhankelijk van het seizoen. Heb je haast? Bel ons — er valt vaak meer te regelen dan je denkt.</p>',
		'Ruimen jullie het puin en afval op?'             => '<p>Ja. Afvoer van materiaal en afval zit standaard in onze prijs. We leveren de ruimte bezemschoon op.</p>',
	);

	$i = 0;
	foreach ( $faq as $question => $answer ) {
		ifs_seed_post( 'ifs_faq', $question, $answer, array( 'menu_order' => $i++ ) );
	}
}

/**
 * Voorbeeldreviews. Vervang deze door échte klantbeoordelingen.
 */
function ifs_seed_reviews() {
	$reviews = array(
		array( 'Sanne de Vries', 'Amsterdam', 'Glad stucwerk woonkamer', 5, 'Onze woonkamer en hal zijn compleet opnieuw gestuukt. Strak resultaat, netjes afgeplakt en elke dag opgeruimd achtergelaten. De prijs die vooraf werd afgesproken bleef ook de eindprijs.' ),
		array( 'Mark Jansen', 'Haarlem', 'Plafonds en sierlijsten', 5, 'De plafonds in ons jaren-30-huis zaten vol scheuren. Ze zijn hersteld en de originele sierlijsten zijn keurig bijgewerkt. Je ziet niet meer waar het oude ophoudt.' ),
		array( 'Fatima El Amrani', 'Almere', 'Betonstuc badkamer', 5, 'Betonlook in de badkamer laten aanbrengen. Vooraf een proefvlak gemaakt zodat we de kleur konden kiezen. Naadloos en makkelijk schoon te houden — precies wat we wilden.' ),
		array( 'Peter Bakker', 'Amstelveen', 'Gevelstuc met isolatie', 5, 'Gevel geïsoleerd en afgewerkt met sierpleister. Duidelijke uitleg vooraf over wat er nodig was, geen verrassingen achteraf. Het huis is merkbaar warmer.' ),
		array( 'VvE Hoofddorp-West', 'Hoofddorp', 'Trappenhuizen VvE', 5, 'Vier trappenhuizen voorzien van nieuwe sierpleister en schilderwerk. Goed gepland, bewoners op tijd geïnformeerd en binnen de afgesproken periode klaar.' ),
		array( 'Lisa Wong', 'Utrecht', 'Nieuwbouw compleet stucwerk', 5, 'Complete nieuwbouwwoning gestuukt. Meedenkend over de afwerkingsniveaus per ruimte, waardoor we het budget goed hebben kunnen verdelen.' ),
	);

	$i = 0;
	foreach ( $reviews as $review ) {
		list( $author, $city, $job, $rating, $text ) = $review;
		ifs_seed_post(
			'ifs_review',
			$author,
			'<p>' . $text . '</p>',
			array(
				'slug'       => 'review-' . sanitize_title( $author ),
				'menu_order' => $i++,
				'meta'       => array(
					'ifs_author' => $author,
					'ifs_city'   => $city,
					'ifs_job'    => $job,
					'ifs_rating' => $rating,
				),
			)
		);
	}
}

/**
 * Pagina's.
 *
 * @return array Sleutel => post ID.
 */
function ifs_seed_pages() {
	$pages = array();

	$pages['home'] = ifs_seed_post(
		'page',
		'Home',
		'',
		array( 'slug' => 'home', 'template' => 'front-page.php' )
	);

	$pages['offerte'] = ifs_seed_post(
		'page',
		'Offerte aanvragen',
		'',
		array( 'slug' => 'offerte-aanvragen', 'template' => 'page-offerte.php', 'excerpt' => 'Vraag in drie minuten een vrijblijvende offerte aan voor stucwerk of schilderwerk.' )
	);

	$pages['over'] = ifs_seed_post(
		'page',
		'Over ons',
		'<p>Interflex Stuc is een stukadoors- en afbouwbedrijf uit Amsterdam. Wat begon als één stukadoor met een bus vol gereedschap, is uitgegroeid tot een vast team van ervaren vakmensen dat werkt in Amsterdam, Noord-Holland en Utrecht.</p>
<h2>Waar we in geloven</h2>
<p>Goed stucwerk merk je pas als het klaar is: een wand die overal even vlak is, een plafond zonder zichtbare naden, een hoek die kaarsrecht loopt. Dat vraagt tijd in de voorbereiding — voorstrijken, repareren, afplakken. Juist daar wordt in onze branche het vaakst op bezuinigd, en juist daar zie je het later aan.</p>
<h2>Eén aanspreekpunt</h2>
<p>Bij ons heb je van opname tot oplevering met dezelfde mensen te maken. Degene die de prijs opneemt is ook betrokken bij de uitvoering. Dat voorkomt misverstanden en betekent dat afspraken die je maakt ook echt op de steiger terechtkomen.</p>
<h2>Voor wie we werken</h2>
<p>Ongeveer de helft van ons werk doen we voor particulieren: van één kamer tot een complete verbouwing. De andere helft bestaat uit opdrachten voor aannemers, VvE\'s en projectontwikkelaars — nieuwbouwprojecten, trappenhuizen en gevelrenovaties.</p>
<h2>Eerlijk advies</h2>
<p>Soms is stucwerk niet de beste oplossing. Als een muur eerst een vochtprobleem heeft, zeggen we dat — ook als dat betekent dat de klus wordt uitgesteld. Werk dat over een jaar loslaat helpt niemand.</p>',
		array( 'slug' => 'over-ons', 'excerpt' => 'Interflex Stuc is een stukadoors- en afbouwbedrijf uit Amsterdam met ruim tien jaar ervaring in stuc- en schilderwerk.' )
	);

	$pages['werkwijze'] = ifs_seed_post(
		'page',
		'Werkwijze',
		'<p>Van eerste contact tot oplevering doorloop je bij ons vier stappen. Zo weet je precies waar je aan toe bent.</p>
<h2>1. Aanvraag</h2>
<p>Je vult de offerteaanvraag in of belt ons. We vragen door op het soort werk, de oppervlakte en de staat van de ondergrond — dat bepaalt namelijk het grootste deel van de prijs.</p>
<h2>2. Opname en prijs</h2>
<p>Bij grotere klussen komen we vrijblijvend langs om op te meten en de ondergrond te beoordelen. Daarna ontvang je binnen 24 uur een offerte met een vaste prijs per vierkante meter en een duidelijke omschrijving van wat er wel en niet bij zit.</p>
<h2>3. Uitvoering</h2>
<p>We plannen een startdatum en een verwachte einddatum. Op de eerste dag schermen we vloeren, kozijnen en meubels af. We werken per ruimte en ruimen aan het einde van elke dag op.</p>
<h2>4. Oplevering en garantie</h2>
<p>We lopen het werk samen na en werken eventuele puntjes direct af. Je krijgt van ons advies over droogtijden en wanneer je kunt schilderen. Op de uitvoering geldt vijf jaar garantie.</p>
<h2>Wat we van jou nodig hebben</h2>
<ul>
<li>Vrije toegang tot de werkruimte en een aansluiting voor stroom en water.</li>
<li>Losse spullen en gordijnen vooraf weggehaald (kunnen we ook voor je doen).</li>
<li>Bij appartementen: afstemming met de VvE over het gebruik van de lift en de aanvoer van materiaal.</li>
</ul>',
		array( 'slug' => 'werkwijze', 'excerpt' => 'Van aanvraag tot oplevering in vier duidelijke stappen — met een vaste prijs vooraf en vijf jaar garantie.' )
	);

	$pages['prijzen'] = ifs_seed_post(
		'page',
		'Prijzen',
		'<p>Hieronder vind je onze richtprijzen. Het zijn indicaties: de uiteindelijke prijs hangt af van de staat van de ondergrond, de hoogte van de ruimte, de bereikbaarheid en het gewenste afwerkingsniveau. Alle bedragen zijn inclusief materiaal en btw, exclusief eventueel voorbereidend herstelwerk.</p>
<table>
<thead><tr><th>Werkzaamheid</th><th>Toelichting</th><th>Vanafprijs</th></tr></thead>
<tbody>
<tr><td>Glad stucwerk wanden</td><td>Behangklaar, bestaande ondergrond</td><td>€ 18,50 / m²</td></tr>
<tr><td>Glad stucwerk wanden</td><td>Sausklaar, extra afwerkgang</td><td>€ 22,50 / m²</td></tr>
<tr><td>Plafond stucen</td><td>Inclusief wegwerken naden</td><td>€ 21,00 / m²</td></tr>
<tr><td>Sierpleister / spachtelputz</td><td>Binnen, korrel naar keuze</td><td>€ 24,00 / m²</td></tr>
<tr><td>Betonstuc / betonlook</td><td>Inclusief proefvlak en afdichting</td><td>€ 95,00 / m²</td></tr>
<tr><td>Buitengevel stucen</td><td>Afhankelijk van gevelhoogte en steiger</td><td>op aanvraag</td></tr>
<tr><td>Gevelisolatie met sierpleister</td><td>Inclusief isolatieplaten en wapening</td><td>op aanvraag</td></tr>
<tr><td>Behang verwijderen</td><td>Per m² wandoppervlak</td><td>€ 4,50 / m²</td></tr>
<tr><td>Schilderwerk binnen</td><td>Wanden en plafonds, twee lagen</td><td>€ 9,50 / m²</td></tr>
</tbody>
</table>
<h2>Waar hangt de prijs vanaf?</h2>
<ul>
<li><strong>Staat van de ondergrond.</strong> Scheuren, loszittend stuc of oud behang vragen extra voorbereiding.</li>
<li><strong>Oppervlakte.</strong> Bij grotere oppervlaktes daalt de prijs per m², omdat opbouw- en afbouwtijd over meer meters wordt verdeeld.</li>
<li><strong>Hoogte en bereikbaarheid.</strong> Vides, trappenhuizen en gevels vragen om rolsteigers of steigerwerk.</li>
<li><strong>Afwerkingsniveau.</strong> Sausklaar vraagt een extra gang ten opzichte van behangklaar.</li>
</ul>
<h2>Geen verrassingen achteraf</h2>
<p>Wat in de offerte staat, is wat je betaalt. Komen we tijdens het werk iets tegen dat we vooraf niet konden zien — bijvoorbeeld vocht achter een wand — dan leggen we het eerst aan je voor. We voeren nooit ongevraagd meerwerk uit.</p>',
		array( 'slug' => 'prijzen', 'excerpt' => 'Richtprijzen voor stucwerk, sierpleister, betonlook en schilderwerk — inclusief materiaal en btw.' )
	);

	$pages['contact'] = ifs_seed_post(
		'page',
		'Contact',
		'',
		array( 'slug' => 'contact', 'template' => 'page-contact.php', 'excerpt' => 'Bel, mail of vraag direct online een offerte aan. We reageren binnen 24 uur.' )
	);

	$pages['blog'] = ifs_seed_post(
		'page',
		'Kennisbank',
		'',
		array( 'slug' => 'kennisbank', 'excerpt' => 'Artikelen en uitleg over stucwerk, afwerkingsniveaus en onderhoud.' )
	);

	$pages['privacy'] = ifs_seed_post(
		'page',
		'Privacyverklaring',
		'<p>Interflex Stuc hecht waarde aan de bescherming van je persoonsgegevens. In deze verklaring leggen we uit welke gegevens we verwerken en waarom.</p>
<h2>Welke gegevens verwerken wij?</h2>
<p>Wanneer je een offerte aanvraagt of contact met ons opneemt, verwerken wij je naam, e-mailadres, telefoonnummer, adresgegevens en de informatie die je zelf over de klus doorgeeft.</p>
<h2>Waarvoor gebruiken wij deze gegevens?</h2>
<p>Uitsluitend om je aanvraag te beantwoorden, een offerte op te stellen en — als je akkoord gaat — het werk uit te voeren en te factureren. We verkopen je gegevens niet en delen ze niet met derden voor commerciële doeleinden.</p>
<h2>Hoe lang bewaren wij gegevens?</h2>
<p>Offerteaanvragen bewaren we maximaal twee jaar. Gegevens die horen bij een uitgevoerde opdracht bewaren we zeven jaar, omdat de Belastingdienst dat voorschrijft.</p>
<h2>Je rechten</h2>
<p>Je mag je gegevens altijd inzien, laten corrigeren of laten verwijderen. Stuur daarvoor een bericht naar het e-mailadres op onze contactpagina. We reageren binnen vier weken.</p>
<h2>Cookies</h2>
<p>Deze website plaatst functionele cookies die nodig zijn om de site te laten werken. Gebruiken we analytische of marketingcookies, dan vragen we daar vooraf toestemming voor.</p>
<p><em>Vul deze verklaring aan met je KvK-nummer en vestigingsgegevens voordat de site live gaat.</em></p>',
		array( 'slug' => 'privacyverklaring' )
	);

	$pages['voorwaarden'] = ifs_seed_post(
		'page',
		'Algemene voorwaarden',
		'<p><em>Plaats hier de algemene voorwaarden van Interflex Stuc. Werk je met de voorwaarden van een brancheorganisatie, verwijs daar dan naar en neem een downloadlink op.</em></p>',
		array( 'slug' => 'algemene-voorwaarden' )
	);

	return $pages;
}

/**
 * Bouwt de navigatiemenu's op.
 *
 * @param array $services Dienst-ID's.
 * @param array $areas    Werkgebied-ID's.
 * @param array $pages    Pagina-ID's.
 */
function ifs_seed_menus( $services, $areas, $pages ) {
	$locations = get_theme_mod( 'nav_menu_locations', array() );

	// Hoofdmenu.
	$menu_id = ifs_get_or_create_menu( 'Hoofdmenu' );
	if ( $menu_id && ! wp_get_nav_menu_items( $menu_id ) ) {
		$diensten_item = wp_update_nav_menu_item(
			$menu_id,
			0,
			array(
				'menu-item-title'     => 'Diensten',
				'menu-item-url'       => get_post_type_archive_link( 'ifs_dienst' ),
				'menu-item-status'    => 'publish',
				'menu-item-type'      => 'custom',
			)
		);

		foreach ( $services as $service_id ) {
			if ( ! $service_id ) {
				continue;
			}
			wp_update_nav_menu_item(
				$menu_id,
				0,
				array(
					'menu-item-object'    => 'ifs_dienst',
					'menu-item-object-id' => $service_id,
					'menu-item-type'      => 'post_type',
					'menu-item-status'    => 'publish',
					'menu-item-parent-id' => $diensten_item,
				)
			);
		}

		$simple = array(
			'Projecten'  => get_post_type_archive_link( 'ifs_project' ),
			'Werkgebied' => get_post_type_archive_link( 'ifs_werkgebied' ),
		);
		foreach ( $simple as $title => $url ) {
			wp_update_nav_menu_item(
				$menu_id,
				0,
				array(
					'menu-item-title'  => $title,
					'menu-item-url'    => $url,
					'menu-item-type'   => 'custom',
					'menu-item-status' => 'publish',
				)
			);
		}

		foreach ( array( 'prijzen', 'over', 'contact' ) as $key ) {
			if ( empty( $pages[ $key ] ) ) {
				continue;
			}
			wp_update_nav_menu_item(
				$menu_id,
				0,
				array(
					'menu-item-object'    => 'page',
					'menu-item-object-id' => $pages[ $key ],
					'menu-item-type'      => 'post_type',
					'menu-item-status'    => 'publish',
				)
			);
		}

		$locations['primary'] = $menu_id;
	}

	// Footermenu diensten.
	$services_menu = ifs_get_or_create_menu( 'Diensten footer' );
	if ( $services_menu && ! wp_get_nav_menu_items( $services_menu ) ) {
		foreach ( $services as $service_id ) {
			if ( ! $service_id ) {
				continue;
			}
			wp_update_nav_menu_item( $services_menu, 0, array(
				'menu-item-object'    => 'ifs_dienst',
				'menu-item-object-id' => $service_id,
				'menu-item-type'      => 'post_type',
				'menu-item-status'    => 'publish',
			) );
		}
		$locations['services'] = $services_menu;
	}

	// Footermenu werkgebied.
	$area_menu = ifs_get_or_create_menu( 'Werkgebied footer' );
	if ( $area_menu && ! wp_get_nav_menu_items( $area_menu ) ) {
		foreach ( array_slice( $areas, 0, 8 ) as $area_id ) {
			if ( ! $area_id ) {
				continue;
			}
			wp_update_nav_menu_item( $area_menu, 0, array(
				'menu-item-object'    => 'ifs_werkgebied',
				'menu-item-object-id' => $area_id,
				'menu-item-type'      => 'post_type',
				'menu-item-status'    => 'publish',
			) );
		}
		$locations['werkgebied'] = $area_menu;
	}

	// Juridisch.
	$legal_menu = ifs_get_or_create_menu( 'Juridisch' );
	if ( $legal_menu && ! wp_get_nav_menu_items( $legal_menu ) ) {
		foreach ( array( 'privacy', 'voorwaarden' ) as $key ) {
			if ( empty( $pages[ $key ] ) ) {
				continue;
			}
			wp_update_nav_menu_item( $legal_menu, 0, array(
				'menu-item-object'    => 'page',
				'menu-item-object-id' => $pages[ $key ],
				'menu-item-type'      => 'post_type',
				'menu-item-status'    => 'publish',
			) );
		}
		$locations['legal'] = $legal_menu;
	}

	set_theme_mod( 'nav_menu_locations', $locations );
}

/**
 * Haalt een menu op of maakt het aan.
 *
 * @param string $name Menunaam.
 * @return int Menu-ID (0 bij mislukking).
 */
function ifs_get_or_create_menu( $name ) {
	$menu = wp_get_nav_menu_object( $name );
	if ( $menu ) {
		return (int) $menu->term_id;
	}

	$menu_id = wp_create_nav_menu( $name );
	return is_wp_error( $menu_id ) ? 0 : (int) $menu_id;
}
