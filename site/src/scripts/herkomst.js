/**
 * Herkomst van een bezoeker vastleggen en meesturen met de offerteaanvraag.
 *
 * Zonder dit weet je wel dát er een aanvraag binnenkwam, maar niet waardoor.
 * Met Google Ads betekent dat: je ziet de kosten, niet wat ze opleverden.
 *
 * We bewaren de eerste aanraking van een bezoek (sessionStorage): klikt iemand
 * op een advertentie en gaat die daarna nog via Google naar een andere pagina,
 * dan blijft de advertentie de bron. Bij het sluiten van het tabblad is alles
 * weg — het is geen profiel en volgt niemand tussen bezoeken door.
 *
 * @package Interflex_Stuc
 */
(function () {
	'use strict';

	var SLEUTEL = 'ifs-herkomst';

	var VELDEN = [
		'utm_source',
		'utm_medium',
		'utm_campaign',
		'utm_term',
		'utm_content',
		'gclid',
		'fbclid',
		'msclkid'
	];

	/** sessionStorage kan geblokkeerd zijn; dan meten we gewoon niets. */
	function lees() {
		try {
			return JSON.parse( window.sessionStorage.getItem( SLEUTEL ) ) || null;
		} catch ( e ) {
			return null;
		}
	}

	function schrijf( waarde ) {
		try {
			window.sessionStorage.setItem( SLEUTEL, JSON.stringify( waarde ) );
		} catch ( e ) {
			/* Niets aan te doen. */
		}
	}

	/**
	 * Bepaalt de herkomst van dit bezoek, of haalt de eerder bewaarde op.
	 *
	 * @return {Object} Herkomstgegevens.
	 */
	function bepaal() {
		var bestaand = lees();
		if ( bestaand ) {
			return bestaand;
		}

		var params = new URLSearchParams( window.location.search );
		var herkomst = {};

		VELDEN.forEach( function ( veld ) {
			var waarde = params.get( veld );
			if ( waarde ) {
				herkomst[ veld ] = waarde.slice( 0, 200 );
			}
		} );

		// Geen utm's? Dan zegt de verwijzende site waar iemand vandaan komt.
		if ( ! herkomst.utm_source ) {
			var verwijzer = document.referrer;
			var eigen = verwijzer.indexOf( window.location.origin ) === 0;

			if ( verwijzer && ! eigen ) {
				try {
					herkomst.utm_source = new URL( verwijzer ).hostname.replace( /^www\./, '' );
					herkomst.utm_medium = 'verwijzing';
				} catch ( e ) {
					/* Onbruikbare verwijzer. */
				}
			} else if ( ! verwijzer ) {
				herkomst.utm_source = 'direct';
				herkomst.utm_medium = 'direct';
			}
		}

		herkomst.landingspagina = window.location.pathname.slice( 0, 300 );
		herkomst.verwijzer = ( document.referrer || '' ).slice( 0, 300 );

		schrijf( herkomst );
		return herkomst;
	}

	var herkomst = bepaal();

	// Beschikbaar voor de rest van de site, bijvoorbeeld voor het meten.
	window.ifsHerkomst = herkomst;

	/**
	 * Zet de herkomst als verborgen velden in elk offerteformulier. Dat gebeurt
	 * bij het versturen, zodat ook formulieren die later in beeld komen — het
	 * popup-venster bijvoorbeeld — de gegevens meekrijgen.
	 */
	window.ifsVulHerkomst = function ( formulier ) {
		if ( ! formulier ) {
			return;
		}

		Object.keys( herkomst ).forEach( function ( naam ) {
			if ( ! herkomst[ naam ] ) {
				return;
			}

			var veld = formulier.querySelector( 'input[name="' + naam + '"]' );
			if ( ! veld ) {
				veld = document.createElement( 'input' );
				veld.type = 'hidden';
				veld.name = naam;
				formulier.appendChild( veld );
			}
			veld.value = herkomst[ naam ];
		} );
	};
})();
