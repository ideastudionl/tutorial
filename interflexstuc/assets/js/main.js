/**
 * Algemene interacties: mobiel menu, sticky header en heroverwijzing naar de wizard.
 *
 * @package Interflex_Stuc
 */
(function () {
	'use strict';

	/* Sticky header — schaduw zodra er gescrold wordt. */
	var header = document.getElementById( 'masthead' );
	if ( header ) {
		var onScroll = function () {
			header.classList.toggle( 'is-stuck', window.pageYOffset > 8 );
		};
		window.addEventListener( 'scroll', onScroll, { passive: true } );
		onScroll();
	}

	/* Mobiel menu. */
	var nav = document.getElementById( 'ifs-mobile-nav' );
	var overlay = document.querySelector( '[data-overlay]' );
	var openers = document.querySelectorAll( '.ifs-burger:not([data-close-nav])' );
	var closers = document.querySelectorAll( '[data-close-nav]' );

	/**
	 * Opent of sluit het mobiele menu.
	 *
	 * @param {boolean} open Gewenste toestand.
	 */
	function toggleNav( open ) {
		if ( ! nav ) {
			return;
		}

		nav.classList.toggle( 'is-open', open );
		nav.inert = ! open;

		if ( overlay ) {
			overlay.classList.toggle( 'is-open', open );
		}

		document.body.classList.toggle( 'ifs-no-scroll', open );

		openers.forEach( function ( button ) {
			button.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
		} );

		if ( open ) {
			var firstLink = nav.querySelector( 'a' );
			if ( firstLink ) {
				firstLink.focus();
			}
		} else if ( openers.length ) {
			openers[ openers.length - 1 ].focus();
		}
	}

	openers.forEach( function ( button ) {
		button.addEventListener( 'click', function () {
			toggleNav( ! nav.classList.contains( 'is-open' ) );
		} );
	} );

	closers.forEach( function ( button ) {
		button.addEventListener( 'click', function () {
			toggleNav( false );
		} );
	} );

	if ( overlay ) {
		overlay.addEventListener( 'click', function () {
			toggleNav( false );
		} );
	}

	document.addEventListener( 'keydown', function ( event ) {
		if ( event.key === 'Escape' && nav && nav.classList.contains( 'is-open' ) ) {
			toggleNav( false );
		}
	} );

	/* Sluit het menu na een klik op een ankerlink binnen dezelfde pagina. */
	if ( nav ) {
		nav.addEventListener( 'click', function ( event ) {
			var link = event.target.closest( 'a[href*="#"]' );
			if ( link && link.pathname === window.location.pathname ) {
				toggleNav( false );
			}
		} );
	}

	/**
	 * Hero-keuzeknoppen: selecteren de bijbehorende optie in de wizard en
	 * scrollen daarnaartoe. Werkt zowel op de homepage (wizard op dezelfde
	 * pagina) als daarbuiten (doorlink met ?werk=…).
	 */
	document.querySelectorAll( '[data-quote-preset]' ).forEach( function ( trigger ) {
		trigger.addEventListener( 'click', function ( event ) {
			var value = trigger.dataset.quotePreset;
			var target = document.querySelector( '[data-wizard] input[value="' + value + '"]' );

			if ( ! target ) {
				return; // Geen wizard op deze pagina: volg gewoon de link.
			}

			event.preventDefault();
			target.checked = true;
			target.dispatchEvent( new Event( 'change', { bubbles: true } ) );

			var wizard = target.closest( '[data-wizard]' );
			if ( wizard ) {
				wizard.scrollIntoView( { behavior: 'smooth', block: 'start' } );
			}
		} );
	} );

	/**
	 * Vult stap 1 vooraf in wanneer de pagina met ?werk=… wordt geopend.
	 */
	var preset = new URLSearchParams( window.location.search ).get( 'werk' );
	if ( preset ) {
		var presetInput = document.querySelector( '[data-wizard] [data-panel="1"] input[value="' + preset.replace( /[^a-z0-9_-]/gi, '' ) + '"]' );
		if ( presetInput ) {
			presetInput.checked = true;
		}
	}
})();
