/**
 * Offerte-wizard — stapnavigatie, validatie en versturen via AJAX.
 *
 * @package Interflex_Stuc
 */
(function () {
	'use strict';

	var config = window.ifsQuote || {};
	var i18n = config.i18n || {};

	/**
	 * Initialiseert één wizard.
	 *
	 * @param {HTMLElement} root Wizardcontainer.
	 */
	function initWizard( root ) {
		var form = root.querySelector( '[data-quote-form]' );
		var panels = Array.prototype.slice.call( root.querySelectorAll( '[data-panel]' ) );
		var total = parseInt( root.dataset.total, 10 ) || panels.length;
		var bar = root.querySelector( '[data-bar]' );
		var barWrap = root.querySelector( '[role="progressbar"]' );
		var counter = root.querySelector( '[data-counter]' );
		var prevBtn = root.querySelector( '[data-prev]' );
		var nextBtn = root.querySelector( '[data-next]' );
		var submitBtn = root.querySelector( '[data-submit]' );
		var errorBox = root.querySelector( '[data-form-error]' );
		var summary = root.querySelector( '[data-summary]' );
		var current = 1;

		if ( ! form || ! panels.length ) {
			return;
		}

		/**
		 * Toont een stap.
		 *
		 * @param {number}  step  Stapnummer (1-based).
		 * @param {boolean} focus Verplaats de focus naar de nieuwe stap.
		 */
		function show( step, focus ) {
			current = Math.min( Math.max( step, 1 ), total );

			panels.forEach( function ( panel ) {
				var isActive = parseInt( panel.dataset.panel, 10 ) === current;
				panel.classList.toggle( 'is-active', isActive );
				panel.hidden = ! isActive;
			} );

			var percentage = Math.round( ( current / total ) * 100 );
			if ( bar ) {
				bar.style.width = percentage + '%';
			}
			if ( barWrap ) {
				barWrap.setAttribute( 'aria-valuenow', String( current ) );
			}
			if ( counter ) {
				counter.innerHTML = 'Stap <b>' + current + '</b> van ' + total;
			}

			if ( prevBtn ) {
				prevBtn.hidden = current === 1;
			}
			if ( nextBtn ) {
				nextBtn.hidden = current === total;
			}
			if ( submitBtn ) {
				submitBtn.hidden = current !== total;
			}

			hideError();

			if ( current === total ) {
				buildSummary();
			}

			if ( focus ) {
				var heading = panels[ current - 1 ].querySelector( 'h2' );
				if ( heading ) {
					heading.setAttribute( 'tabindex', '-1' );
					heading.focus( { preventScroll: true } );
				}
				var top = root.getBoundingClientRect().top + window.pageYOffset - 110;
				if ( window.pageYOffset > top ) {
					window.scrollTo( { top: top, behavior: 'smooth' } );
				}
			}
		}

		/**
		 * Toont een foutmelding boven de knoppen.
		 *
		 * @param {string} message Melding.
		 */
		function showError( message ) {
			if ( ! errorBox ) {
				return;
			}
			errorBox.textContent = message;
			errorBox.hidden = false;
		}

		/** Verbergt de foutmelding. */
		function hideError() {
			if ( errorBox ) {
				errorBox.hidden = true;
			}
			form.querySelectorAll( '.has-error' ).forEach( function ( field ) {
				field.classList.remove( 'has-error' );
				var msg = field.querySelector( '[data-error]' );
				if ( msg ) {
					msg.hidden = true;
				}
			} );
		}

		/**
		 * Markeert een veld als ongeldig.
		 *
		 * @param {HTMLElement} input   Invoerveld.
		 * @param {string}      message Melding.
		 */
		function markField( input, message ) {
			var field = input.closest( '.ifs-field' );
			if ( ! field ) {
				return;
			}
			field.classList.add( 'has-error' );
			var msg = field.querySelector( '[data-error]' );
			if ( msg ) {
				msg.textContent = message;
				msg.hidden = false;
			}
		}

		/**
		 * Valideert de huidige stap.
		 *
		 * @return {boolean} True wanneer de stap compleet is.
		 */
		function validateStep() {
			var panel = panels[ current - 1 ];
			if ( ! panel ) {
				return true;
			}

			hideError();

			var choices = panel.querySelectorAll( 'input[type="radio"], input[type="checkbox"]:not([name="ifs_consent"])' );
			if ( choices.length ) {
				var picked = Array.prototype.some.call( choices, function ( input ) {
					return input.checked;
				} );
				if ( ! picked ) {
					showError( i18n.required );
					return false;
				}
				return true;
			}

			var valid = true;
			var firstInvalid = null;

			panel.querySelectorAll( '[required]' ).forEach( function ( input ) {
				if ( input.type === 'checkbox' ) {
					if ( ! input.checked ) {
						valid = false;
						showError( i18n.consent );
					}
					return;
				}

				var value = input.value.trim();

				if ( ! value ) {
					markField( input, 'Dit veld is verplicht.' );
					valid = false;
					firstInvalid = firstInvalid || input;
					return;
				}

				if ( input.type === 'email' && ! /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test( value ) ) {
					markField( input, i18n.invalidMail );
					valid = false;
					firstInvalid = firstInvalid || input;
					return;
				}

				if ( input.type === 'tel' && value.replace( /[^0-9]/g, '' ).length < 9 ) {
					markField( input, i18n.invalidTel );
					valid = false;
					firstInvalid = firstInvalid || input;
				}
			} );

			if ( ! valid && firstInvalid ) {
				showError( i18n.fillFields );
				firstInvalid.focus();
			}

			return valid;
		}

		/** Vult de samenvatting met de gegeven antwoorden. */
		function buildSummary() {
			if ( ! summary ) {
				return;
			}

			summary.innerHTML = '';

			panels.forEach( function ( panel ) {
				var heading = panel.querySelector( 'h2' );
				if ( ! heading || panel.dataset.panel === String( total ) ) {
					return;
				}

				var labels = [];

				panel.querySelectorAll( 'input:checked' ).forEach( function ( input ) {
					var strong = input.parentElement.querySelector( '.ifs-option__label strong' );
					if ( strong ) {
						labels.push( strong.textContent.trim() );
					}
				} );

				panel.querySelectorAll( 'input:not([type="checkbox"]):not([type="radio"]), textarea' ).forEach( function ( input ) {
					if ( input.name === 'ifs_website' || ! input.value.trim() ) {
						return;
					}
					var label = panel.querySelector( 'label[for="' + input.id + '"]' );
					addRow( label ? label.textContent.replace( '*', '' ).trim() : input.name, input.value.trim() );
				} );

				if ( labels.length ) {
					addRow( heading.textContent.trim(), labels.join( ', ' ) );
				}
			} );

			/**
			 * Voegt een rij toe aan de samenvatting.
			 *
			 * @param {string} term  Vraag of veldnaam.
			 * @param {string} value Antwoord.
			 */
			function addRow( term, value ) {
				var row = document.createElement( 'div' );
				row.className = 'ifs-summary__row';

				var dt = document.createElement( 'dt' );
				dt.textContent = term;

				var dd = document.createElement( 'dd' );
				dd.textContent = value;

				row.appendChild( dt );
				row.appendChild( dd );
				summary.appendChild( row );
			}
		}

		/** Verstuurt het formulier. */
		function submit() {
			if ( ! validateStep() ) {
				return;
			}

			var data = new FormData( form );
			data.append( 'action', config.action );
			data.append( 'nonce', config.nonce );

			submitBtn.classList.add( 'is-loading' );
			submitBtn.disabled = true;

			window.fetch( config.ajaxUrl, {
				method: 'POST',
				body: data,
				credentials: 'same-origin'
			} )
				.then( function ( response ) {
					return response.json().catch( function () {
						return { success: false, data: { message: i18n.genericErr } };
					} );
				} )
				.then( function ( result ) {
					if ( result && result.success ) {
						var message = root.querySelector( '[data-done-message]' );
						if ( message && result.data && result.data.message ) {
							message.textContent = result.data.message;
						}
						root.classList.add( 'is-done' );
						root.scrollIntoView( { behavior: 'smooth', block: 'center' } );

						if ( window.dataLayer ) {
							window.dataLayer.push( { event: 'offerte_verstuurd' } );
						}
						return;
					}

					showError( ( result && result.data && result.data.message ) || i18n.genericErr );
				} )
				.catch( function () {
					showError( i18n.genericErr );
				} )
				.finally( function () {
					submitBtn.classList.remove( 'is-loading' );
					submitBtn.disabled = false;
				} );
		}

		// Gebeurtenissen.
		if ( nextBtn ) {
			nextBtn.addEventListener( 'click', function () {
				if ( validateStep() ) {
					show( current + 1, true );
				}
			} );
		}

		if ( prevBtn ) {
			prevBtn.addEventListener( 'click', function () {
				show( current - 1, true );
			} );
		}

		if ( submitBtn ) {
			submitBtn.addEventListener( 'click', submit );
		}

		// Radiokeuze springt automatisch door naar de volgende stap.
		form.addEventListener( 'change', function ( event ) {
			if ( event.target.type === 'radio' && current < total ) {
				window.setTimeout( function () {
					show( current + 1, true );
				}, 260 );
			}
			if ( event.target.closest( '.ifs-field.has-error' ) ) {
				event.target.closest( '.ifs-field' ).classList.remove( 'has-error' );
			}
		} );

		// Enter gaat door naar de volgende stap in plaats van te versturen.
		form.addEventListener( 'keydown', function ( event ) {
			if ( event.key !== 'Enter' || event.target.tagName === 'TEXTAREA' ) {
				return;
			}
			event.preventDefault();
			if ( current === total ) {
				submit();
			} else if ( validateStep() ) {
				show( current + 1, true );
			}
		} );

		form.addEventListener( 'submit', function ( event ) {
			event.preventDefault();
			submit();
		} );

		// Startstap: een via de hero voorgeselecteerde keuze slaat stap 1 over.
		if ( form.querySelector( '[data-panel="1"] input:checked' ) ) {
			show( 2, false );
		} else {
			show( 1, false );
		}
	}

	document.addEventListener( 'DOMContentLoaded', function () {
		document.querySelectorAll( '[data-wizard]' ).forEach( initWizard );
	} );
})();
