<?php
/**
 * Themaopties in de WordPress Customizer (bedrijfsgegevens, teksten, cijfers).
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

/**
 * Standaardwaarden voor alle themaopties.
 *
 * @return array
 */
function ifs_option_defaults() {
	return array(
		// Bedrijfsgegevens.
		'company_name'   => 'Interflex Stuc',
		'company_tagline'=> 'Stukadoor & schilderwerk',
		'phone'          => '+31 6 85 26 38 55',
		'whatsapp'       => '+31685263855',
		'email'          => 'info@interflexstuc.nl',
		'street'         => 'Overschiestraat 86',
		'postcode'       => '1062 XH',
		'city'           => 'Amsterdam',
		'kvk'            => '',
		'btw'            => '',
		'hours'          => "Maandag t/m zaterdag|07:00 – 18:00\nZondag|Gesloten",
		'maps_url'       => 'https://maps.google.com/?q=Overschiestraat+86,+1062+XH+Amsterdam',

		// Social.
		'facebook'       => '',
		'instagram'      => '',
		'linkedin'       => '',

		// Bewijs.
		'rating_score'   => '9,4',
		'rating_count'   => '87',
		'years_active'   => '10',
		'projects_done'  => '750',
		'warranty_years' => '5',

		// Offerte.
		'quote_email'    => '',
		'quote_response' => 'binnen 24 uur',

		// Hero.
		'hero_title'     => 'Strak stucwerk dat <em>jaren</em> mooi blijft',
		'hero_text'      => 'Interflex Stuc levert glad stucwerk, sierpleister en schilderwerk voor woningen en bedrijfspanden in Amsterdam en omstreken. Vakwerk van ervaren stukadoors, met een vaste prijs vooraf.',
	);
}

/**
 * Haalt een themaoptie op.
 *
 * @param string $key Sleutel zonder prefix.
 * @return string
 */
function ifs_option( $key ) {
	$defaults = ifs_option_defaults();
	$default  = isset( $defaults[ $key ] ) ? $defaults[ $key ] : '';
	return get_theme_mod( 'ifs_' . $key, $default );
}

/**
 * Registreert de Customizer-instellingen.
 *
 * @param WP_Customize_Manager $wp_customize Customizer.
 */
function ifs_customize_register( $wp_customize ) {
	$defaults = ifs_option_defaults();

	$panels = array(
		'ifs_company' => array(
			'title'  => 'Bedrijfsgegevens',
			'fields' => array(
				'company_name'    => array( 'Bedrijfsnaam', 'text' ),
				'company_tagline' => array( 'Ondertitel bij het logo', 'text' ),
				'phone'           => array( 'Telefoonnummer (weergave)', 'text' ),
				'whatsapp'        => array( 'WhatsApp-nummer (alleen cijfers, met landcode)', 'text' ),
				'email'           => array( 'E-mailadres', 'text' ),
				'street'          => array( 'Straat en huisnummer', 'text' ),
				'postcode'        => array( 'Postcode', 'text' ),
				'city'            => array( 'Plaats', 'text' ),
				'kvk'             => array( 'KvK-nummer', 'text' ),
				'btw'             => array( 'BTW-nummer', 'text' ),
				'hours'           => array( 'Openingstijden (per regel: label|tijd)', 'textarea' ),
				'maps_url'        => array( 'Google Maps-link', 'url' ),
			),
		),
		'ifs_social'  => array(
			'title'  => 'Social media',
			'fields' => array(
				'facebook'  => array( 'Facebook-URL', 'url' ),
				'instagram' => array( 'Instagram-URL', 'url' ),
				'linkedin'  => array( 'LinkedIn-URL', 'url' ),
			),
		),
		'ifs_proof'   => array(
			'title'  => 'Cijfers & beoordelingen',
			'fields' => array(
				'rating_score'   => array( 'Gemiddeld cijfer (bijv. 9,4)', 'text' ),
				'rating_count'   => array( 'Aantal beoordelingen', 'text' ),
				'years_active'   => array( 'Jaren ervaring', 'text' ),
				'projects_done'  => array( 'Aantal afgeronde projecten', 'text' ),
				'warranty_years' => array( 'Jaren garantie', 'text' ),
			),
		),
		'ifs_quote'   => array(
			'title'  => 'Offerteaanvraag',
			'fields' => array(
				'quote_email'    => array( 'E-mailadres voor aanvragen (leeg = adres hierboven)', 'text' ),
				'quote_response' => array( 'Belofte reactietijd (bijv. "binnen 24 uur")', 'text' ),
			),
		),
		'ifs_hero'    => array(
			'title'  => 'Homepage hero',
			'fields' => array(
				'hero_title' => array( 'Titel (gebruik <em>…</em> voor accentkleur)', 'textarea' ),
				'hero_text'  => array( 'Introductietekst', 'textarea' ),
			),
		),
	);

	$priority = 30;
	foreach ( $panels as $section_id => $section ) {
		$wp_customize->add_section(
			$section_id,
			array(
				'title'    => $section['title'],
				'priority' => $priority++,
			)
		);

		foreach ( $section['fields'] as $key => $field ) {
			list( $label, $type ) = $field;

			$sanitize = 'sanitize_text_field';
			if ( 'url' === $type ) {
				$sanitize = 'esc_url_raw';
			} elseif ( 'textarea' === $type ) {
				$sanitize = 'wp_kses_post';
			}

			$wp_customize->add_setting(
				'ifs_' . $key,
				array(
					'default'           => isset( $defaults[ $key ] ) ? $defaults[ $key ] : '',
					'sanitize_callback' => $sanitize,
					'transport'         => 'refresh',
				)
			);

			$wp_customize->add_control(
				'ifs_' . $key,
				array(
					'label'   => $label,
					'section' => $section_id,
					'type'    => 'textarea' === $type ? 'textarea' : 'text',
				)
			);
		}
	}
}
add_action( 'customize_register', 'ifs_customize_register' );

/* -----------------------------------------------------------------------------
 * Afgeleide helpers
 * -------------------------------------------------------------------------- */

/**
 * Telefoonnummer geschikt voor een tel:-link.
 *
 * @return string
 */
function ifs_phone_href() {
	return 'tel:' . preg_replace( '/[^0-9+]/', '', ifs_option( 'phone' ) );
}

/**
 * WhatsApp-link met vooringevuld bericht.
 *
 * @return string
 */
function ifs_whatsapp_href() {
	$number = preg_replace( '/[^0-9]/', '', ifs_option( 'whatsapp' ) );
	if ( ! $number ) {
		return '';
	}
	return 'https://wa.me/' . $number . '?text=' . rawurlencode( 'Hallo, ik heb een vraag over stucwerk.' );
}

/**
 * Volledig adres op één regel.
 *
 * @return string
 */
function ifs_address_line() {
	return trim( sprintf( '%s, %s %s', ifs_option( 'street' ), ifs_option( 'postcode' ), ifs_option( 'city' ) ), ' ,' );
}

/**
 * Openingstijden als array van label => tijd.
 *
 * @return array
 */
function ifs_hours() {
	$out = array();
	foreach ( preg_split( '/\r\n|\r|\n/', (string) ifs_option( 'hours' ) ) as $line ) {
		$line = trim( $line );
		if ( ! $line ) {
			continue;
		}
		$parts             = array_map( 'trim', explode( '|', $line, 2 ) );
		$out[ $parts[0] ] = isset( $parts[1] ) ? $parts[1] : '';
	}
	return $out;
}

/**
 * URL van de offertepagina (valt terug op de homepage-sectie).
 *
 * @return string
 */
function ifs_quote_url() {
	$pages = get_posts(
		array(
			'post_type'      => 'page',
			'posts_per_page' => 1,
			'post_status'    => 'publish',
			'meta_key'       => '_wp_page_template',
			'meta_value'     => 'page-offerte.php',
			'fields'         => 'ids',
		)
	);

	if ( ! empty( $pages ) ) {
		return get_permalink( $pages[0] );
	}

	return home_url( '/#offerte' );
}
