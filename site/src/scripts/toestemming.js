/**
 * Toestemming en conversiemeting.
 *
 * Werkwijze: Google laadt meteen, maar met alle opslag op "geweigerd"
 * (Consent Mode v2). Er komt dan geen cookie op het apparaat te staan. Pas
 * als de bezoeker op accepteren klikt, wordt dat bijgesteld. De Meta-pixel
 * kent zo'n stand niet en laadt daarom pas ná toestemming.
 *
 * Alles hangt aan window.ifsTags; staat dat er niet, dan doet dit bestand niets.
 *
 * @package Interflex_Stuc
 */
(function () {
	'use strict';

	var tags = window.ifsTags;
	if ( ! tags ) {
		return;
	}

	var SLEUTEL = 'ifs-toestemming';
	var wachtrij = [];
	var toegestaan = false;

	/** De keuze bewaren we lokaal; dat is functioneel en mag zonder toestemming. */
	function bewaardeKeuze() {
		try {
			return window.localStorage.getItem( SLEUTEL );
		} catch ( e ) {
			return null;
		}
	}

	function bewaar( keuze ) {
		try {
			window.localStorage.setItem( SLEUTEL, keuze );
		} catch ( e ) {
			/* Niets aan te doen. */
		}
	}

	function gtag() {
		window.dataLayer.push( arguments );
	}

	window.dataLayer = window.dataLayer || [];

	/* ---------- Google ---------- */

	if ( tags.ga4 || tags.ads ) {
		// Standaard alles geweigerd. Google zet dan geen cookies en stuurt
		// alleen geanonimiseerde signalen.
		gtag( 'consent', 'default', {
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			analytics_storage: 'denied',
			wait_for_update: 500
		} );

		gtag( 'js', new Date() );

		if ( tags.ga4 ) {
			gtag( 'config', tags.ga4 );
		}
		if ( tags.ads ) {
			gtag( 'config', tags.ads );
		}

		var script = document.createElement( 'script' );
		script.async = true;
		script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent( tags.ga4 || tags.ads );
		document.head.appendChild( script );
	}

	/* ---------- Meta ---------- */

	function laadMeta() {
		if ( ! tags.meta || window.fbq ) {
			return;
		}

		/* eslint-disable */
		!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
		n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
		n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
		t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
		(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
		/* eslint-enable */

		window.fbq( 'init', tags.meta );
		window.fbq( 'track', 'PageView' );
	}

	/* ---------- Toestemming verwerken ---------- */

	function pasToe( keuze ) {
		toegestaan = keuze === 'ja';

		if ( tags.ga4 || tags.ads ) {
			var stand = toegestaan ? 'granted' : 'denied';
			gtag( 'consent', 'update', {
				ad_storage: stand,
				ad_user_data: stand,
				ad_personalization: stand,
				analytics_storage: stand
			} );
		}

		if ( toegestaan ) {
			laadMeta();

			// Gebeurtenissen die tijdens het wachten zijn opgespaard.
			wachtrij.splice( 0 ).forEach( function ( item ) {
				stuur( item.naam, item.gegevens );
			} );
		} else {
			wachtrij.length = 0;
		}
	}

	/* ---------- Meten ---------- */

	function stuur( naam, gegevens ) {
		gegevens = gegevens || {};

		if ( tags.ga4 ) {
			gtag( 'event', naam, gegevens );
		}

		// Google Ads telt de conversie alleen met een label erbij.
		if ( tags.ads && tags.adsLabel && naam === 'offerte_verstuurd' ) {
			gtag( 'event', 'conversion', {
				send_to: tags.ads + '/' + tags.adsLabel,
				value: gegevens.waarde || 0,
				currency: 'EUR'
			} );
		}

		if ( window.fbq ) {
			if ( naam === 'offerte_verstuurd' ) {
				window.fbq( 'track', 'Lead', { value: gegevens.waarde || 0, currency: 'EUR' } );
			} else {
				window.fbq( 'trackCustom', naam, gegevens );
			}
		}
	}

	/**
	 * Meet een gebeurtenis. Zonder toestemming wordt hij kort bewaard en
	 * alsnog verstuurd als de bezoeker daarna akkoord gaat.
	 *
	 * @param {string} naam     Naam van de gebeurtenis.
	 * @param {Object} gegevens Extra gegevens.
	 */
	window.ifsMeet = function ( naam, gegevens ) {
		if ( toegestaan ) {
			stuur( naam, gegevens );
		} else if ( wachtrij.length < 10 ) {
			wachtrij.push( { naam: naam, gegevens: gegevens } );
		}
	};

	/* ---------- Banner ---------- */

	var banner = document.querySelector( '[data-toestemming]' );

	function verberg() {
		if ( banner ) {
			banner.hidden = true;
		}
		document.body.classList.remove( 'ifs-vraagt-toestemming' );
	}

	function toon() {
		if ( banner ) {
			banner.hidden = false;
			document.body.classList.add( 'ifs-vraagt-toestemming' );
		}
	}

	var keuze = bewaardeKeuze();

	if ( keuze ) {
		pasToe( keuze );
		verberg();
	} else if ( banner ) {
		toon();
	} else {
		// Geen banner op de pagina: dan niets toestaan.
		pasToe( 'nee' );
	}

	if ( banner ) {
		banner.addEventListener( 'click', function ( event ) {
			var knop = event.target.closest( '[data-toestemming-keuze]' );
			if ( ! knop ) {
				return;
			}

			var antwoord = knop.dataset.toestemmingKeuze;
			bewaar( antwoord );
			pasToe( antwoord );
			verberg();
		} );
	}

	// Toestemming intrekken moet net zo makkelijk zijn als geven. De knop
	// staat in de privacyverklaring.
	document.addEventListener( 'click', function ( event ) {
		if ( ! event.target.closest( '[data-toestemming-herzien]' ) ) {
			return;
		}

		try {
			window.localStorage.removeItem( SLEUTEL );
		} catch ( e ) {
			/* Niets aan te doen. */
		}

		pasToe( 'nee' );

		toon();

		if ( banner ) {
			banner.scrollIntoView( { behavior: 'smooth', block: 'nearest' } );
		}
	} );

	/* ---------- Bellen en WhatsApp ---------- */

	// Voor een stukadoor komt een deel van de aanvragen per telefoon binnen.
	// Zonder dit lijken die campagnes niets op te leveren.
	document.addEventListener( 'click', function ( event ) {
		var link = event.target.closest( 'a[href^="tel:"], a[href*="wa.me"]' );
		if ( ! link ) {
			return;
		}

		window.ifsMeet( link.href.indexOf( 'tel:' ) === 0 ? 'telefoon_klik' : 'whatsapp_klik', {} );
	} );
})();
