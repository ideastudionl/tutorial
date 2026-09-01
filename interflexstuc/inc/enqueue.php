<?php
/**
 * Scripts en stylesheets.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

/**
 * Laadt de front-end assets.
 */
function ifs_enqueue_assets() {
	// Lettertypen (preconnect staat in header.php).
	wp_enqueue_style(
		'ifs-fonts',
		'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap',
		array(),
		null // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion -- externe bron.
	);

	wp_enqueue_style( 'ifs-style', IFS_URI . '/assets/css/main.css', array( 'ifs-fonts' ), IFS_VERSION );

	// De themaheader-stylesheet zelf bevat geen opmaak, maar hoort er wel te zijn.
	wp_enqueue_style( 'ifs-theme', get_stylesheet_uri(), array( 'ifs-style' ), IFS_VERSION );

	wp_enqueue_script( 'ifs-main', IFS_URI . '/assets/js/main.js', array(), IFS_VERSION, true );

	if ( ifs_has_quote_form() ) {
		wp_enqueue_script( 'ifs-offerte', IFS_URI . '/assets/js/offerte.js', array(), IFS_VERSION, true );
		wp_localize_script(
			'ifs-offerte',
			'ifsQuote',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'ifs_quote' ),
				'action'  => 'ifs_submit_quote',
				'i18n'    => array(
					'required'    => __( 'Maak eerst een keuze om verder te gaan.', 'interflexstuc' ),
					'fillFields'  => __( 'Vul de verplichte velden in.', 'interflexstuc' ),
					'invalidMail' => __( 'Vul een geldig e-mailadres in.', 'interflexstuc' ),
					'invalidTel'  => __( 'Vul een geldig telefoonnummer in.', 'interflexstuc' ),
					'consent'     => __( 'Ga akkoord met de privacyverklaring om te versturen.', 'interflexstuc' ),
					'genericErr'  => __( 'Er ging iets mis. Bel ons gerust even, dan regelen we het direct.', 'interflexstuc' ),
					'stepOf'      => __( 'Stap %1$d van %2$d', 'interflexstuc' ),
				),
			)
		);
	}
}
add_action( 'wp_enqueue_scripts', 'ifs_enqueue_assets' );

/**
 * Bepaalt of het offerteformulier op de huidige weergave staat.
 *
 * @return bool
 */
function ifs_has_quote_form() {
	return is_front_page()
		|| is_page_template( array( 'page-offerte.php', 'page-contact.php' ) )
		|| is_singular( array( 'ifs_dienst', 'ifs_werkgebied' ) )
		|| is_post_type_archive( array( 'ifs_dienst', 'ifs_werkgebied' ) );
}

/**
 * Voegt preconnect-hints toe voor de lettertypen.
 *
 * @param array  $urls           Bestaande hints.
 * @param string $relation_type  Type relatie.
 * @return array
 */
function ifs_resource_hints( $urls, $relation_type ) {
	if ( 'preconnect' === $relation_type ) {
		$urls[] = array(
			'href' => 'https://fonts.gstatic.com',
			'crossorigin',
		);
	}
	return $urls;
}
add_filter( 'wp_resource_hints', 'ifs_resource_hints', 10, 2 );
