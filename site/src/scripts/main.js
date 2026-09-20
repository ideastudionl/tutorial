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

/**
 * Reviewslider: knoppen en stippen op een horizontaal scrollbare lijst.
 * Het scrollen zelf doet de browser, dus zonder JavaScript blijft alles leesbaar.
 */
(function () {
	'use strict';

	document.querySelectorAll( '[data-slider]' ).forEach( function ( slider ) {
		var track = slider.querySelector( '[data-slider-track]' );
		var prev = slider.querySelector( '[data-slider-prev]' );
		var next = slider.querySelector( '[data-slider-next]' );
		var dotsBox = slider.querySelector( '[data-slider-dots]' );
		var cards = track ? Array.prototype.slice.call( track.children ) : [];

		if ( ! track || cards.length < 2 ) {
			return;
		}

		/**
		 * Aantal kaarten dat tegelijk in beeld past.
		 *
		 * @return {number} Aantal kaarten.
		 */
		function perView() {
			return Math.max( 1, Math.round( track.clientWidth / cards[ 0 ].offsetWidth ) );
		}

		/**
		 * Index van de kaart die nu vooraan staat.
		 *
		 * @return {number} Index.
		 */
		function currentIndex() {
			return Math.round( track.scrollLeft / cards[ 0 ].offsetWidth );
		}

		/**
		 * Scrollt naar een kaart.
		 *
		 * @param {number} index Index van de kaart.
		 */
		function scrollTo( index ) {
			var max = cards.length - perView();
			index = Math.min( Math.max( index, 0 ), Math.max( max, 0 ) );
			track.scrollTo( { left: index * cards[ 0 ].offsetWidth, behavior: 'smooth' } );
		}

		var dots = [];

		/**
		 * Bouwt de stippen opnieuw op: één per scrollpositie, niet per kaart.
		 *
		 * Wordt ook aangeroepen zodra de slider breedte krijgt — op een pagina
		 * die nog verborgen is, meet hij anders nul.
		 */
		function buildDots() {
			if ( ! dotsBox ) {
				return;
			}

			var count = Math.max( 1, cards.length - perView() + 1 );
			if ( count === dots.length ) {
				return;
			}

			dotsBox.innerHTML = '';
			dots = [];

			for ( var i = 0; i < count; i++ ) {
				var dot = document.createElement( 'button' );
				dot.type = 'button';
				dot.setAttribute( 'aria-label', 'Ga naar beoordeling ' + ( i + 1 ) );
				dot.addEventListener( 'click', ( function ( index ) {
					return function () {
						scrollTo( index );
					};
				} )( i ) );
				dotsBox.appendChild( dot );
				dots.push( dot );
			}
		}

		/** Werkt knoppen en stippen bij aan de huidige scrollpositie. */
		function sync() {
			if ( ! track.clientWidth || ! cards[ 0 ].offsetWidth ) {
				return; // Nog niet zichtbaar: meten heeft geen zin.
			}

			buildDots();

			var index = currentIndex();
			var max = Math.max( cards.length - perView(), 0 );

			if ( prev ) {
				prev.disabled = index <= 0;
			}
			if ( next ) {
				next.disabled = index >= max;
			}
			dots.forEach( function ( dot, i ) {
				dot.setAttribute( 'aria-current', i === index ? 'true' : 'false' );
			} );
		}

		if ( prev ) {
			prev.addEventListener( 'click', function () {
				scrollTo( currentIndex() - 1 );
			} );
		}
		if ( next ) {
			next.addEventListener( 'click', function () {
				scrollTo( currentIndex() + 1 );
			} );
		}

		var ticking = false;
		track.addEventListener( 'scroll', function () {
			if ( ticking ) {
				return;
			}
			ticking = true;
			window.requestAnimationFrame( function () {
				sync();
				ticking = false;
			} );
		}, { passive: true } );

		window.addEventListener( 'resize', sync );

		// Hermeten zodra de slider zichtbaar wordt en dus pas breedte krijgt.
		if ( window.ResizeObserver ) {
			new window.ResizeObserver( sync ).observe( track );
		}

		sync();
	} );
})();

/**
 * Offerteaanvraag in een venster.
 *
 * Gebruikt het <dialog>-element, dat focus en Escape zelf afhandelt.
 * Zonder ondersteuning volgt de knop gewoon zijn link naar de offertepagina.
 */
(function () {
	'use strict';

	var modal = document.getElementById( 'ifs-quote-modal' );
	if ( ! modal || typeof modal.showModal !== 'function' ) {
		return;
	}

	document.addEventListener( 'click', function ( event ) {
		var opener = event.target.closest( '[data-quote-open]' );
		if ( opener ) {
			event.preventDefault();
			modal.showModal();
			document.body.style.overflow = 'hidden';

			var first = modal.querySelector( '.ifs-step-panel.is-active input, .ifs-step-panel.is-active button' );
			if ( first ) {
				first.focus( { preventScroll: true } );
			}
			return;
		}

		if ( event.target.closest( '[data-quote-close]' ) ) {
			modal.close();
			return;
		}

		// Klik op de achtergrond sluit het venster.
		if ( event.target === modal ) {
			var box = modal.getBoundingClientRect();
			var outside = event.clientY < box.top || event.clientY > box.bottom ||
				event.clientX < box.left || event.clientX > box.right;
			if ( outside ) {
				modal.close();
			}
		}
	} );

	modal.addEventListener( 'close', function () {
		document.body.style.overflow = '';
	} );
})();
