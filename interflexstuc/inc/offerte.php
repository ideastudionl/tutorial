<?php
/**
 * Offerte-wizard: stapdefinitie, validatie, opslag en e-mailafhandeling.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

/**
 * Definieert de stappen en antwoordopties van de wizard.
 *
 * Elke stap heeft: key, title, hint, type (choice|multi|fields) en options/fields.
 *
 * @return array
 */
function ifs_quote_steps() {
	$steps = array(
		array(
			'key'     => 'werk',
			'title'   => 'Wat wil je laten doen?',
			'hint'    => 'Meerdere antwoorden mogelijk — we stemmen de offerte daarop af.',
			'type'    => 'multi',
			'options' => array(
				'wanden'      => array( 'Wanden stucen', 'Glad pleisterwerk, schuurwerk of behangklaar', 'wall' ),
				'plafonds'    => array( 'Plafonds stucen', 'Strak wit plafond zonder naden', 'ceiling' ),
				'sierpleister'=> array( 'Sierpleister / spachtelputz', 'Structuurpleister binnen of buiten', 'sparkles' ),
				'buitengevel' => array( 'Buitengevel stucen', 'Gevelpleister, eventueel met isolatie', 'building' ),
				'betonlook'   => array( 'Betonlook / betonstuc', 'Naadloze betonciré-afwerking', 'layers' ),
				'schilderwerk'=> array( 'Schilderwerk', 'Kozijnen, deuren, trappen, wanden', 'brush' ),
				'anders'      => array( 'Iets anders', 'Vertel het ons bij de opmerkingen', 'clipboard' ),
			),
		),
		array(
			'key'     => 'situatie',
			'title'   => 'Wat is de situatie van de ondergrond?',
			'hint'    => 'Dit bepaalt hoeveel voorbereidend werk er nodig is.',
			'type'    => 'choice',
			'options' => array(
				'nieuwbouw'   => array( 'Nieuwbouw / kale muren', 'Nog nooit afgewerkt', 'home' ),
				'glad'        => array( 'Bestaand en redelijk glad', 'Alleen bijwerken en afwerken', 'ruler' ),
				'beschadigd'  => array( 'Bestaand en beschadigd', 'Scheuren, gaten of loszittend stuc', 'layers' ),
				'behang'      => array( 'Er zit nog behang op', 'Behang moet er eerst af', 'file-text' ),
				'onbekend'    => array( 'Weet ik niet precies', 'Wij bekijken het tijdens de opname', 'clipboard' ),
			),
		),
		array(
			'key'     => 'oppervlakte',
			'title'   => 'Om hoeveel vierkante meter gaat het ongeveer?',
			'hint'    => 'Een ruwe schatting is genoeg. Twijfel je? Kies "weet ik niet".',
			'type'    => 'choice',
			'options' => array(
				'tot-25'   => array( 'Tot 25 m²', 'Bijvoorbeeld één kamer', 'ruler' ),
				'25-60'    => array( '25 – 60 m²', 'Enkele kamers', 'ruler' ),
				'60-120'   => array( '60 – 120 m²', 'Een hele verdieping', 'ruler' ),
				'120-plus' => array( 'Meer dan 120 m²', 'Hele woning of bedrijfspand', 'ruler' ),
				'onbekend' => array( 'Weet ik niet', 'We meten het samen op', 'clipboard' ),
			),
		),
		array(
			'key'     => 'pand',
			'title'   => 'Wat voor pand betreft het?',
			'hint'    => '',
			'type'    => 'choice',
			'options' => array(
				'appartement' => array( 'Appartement', '', 'building' ),
				'tussenwoning'=> array( 'Tussen- of hoekwoning', '', 'home' ),
				'vrijstaand'  => array( 'Twee-onder-een-kap of vrijstaand', '', 'home' ),
				'nieuwbouw'   => array( 'Nieuwbouwproject', '', 'layers' ),
				'zakelijk'    => array( 'Bedrijfspand of VvE', '', 'building' ),
			),
		),
		array(
			'key'     => 'planning',
			'title'   => 'Wanneer wil je dat het werk start?',
			'hint'    => 'Zo kunnen we meteen realistisch inplannen.',
			'type'    => 'choice',
			'options' => array(
				'asap'      => array( 'Zo snel mogelijk', 'Spoedklus', 'zap' ),
				'maand'     => array( 'Binnen een maand', '', 'calendar' ),
				'kwartaal'  => array( 'Over 1 tot 3 maanden', '', 'calendar' ),
				'later'     => array( 'Later dit jaar', '', 'calendar' ),
				'orienteren'=> array( 'Ik oriënteer me nog', 'Alleen een prijsindicatie', 'euro' ),
			),
		),
		array(
			'key'    => 'gegevens',
			'title'  => 'Waar mogen we de offerte naartoe sturen?',
			'hint'   => 'We nemen %s contact op met een vrijblijvende prijsopgave.',
			'type'   => 'fields',
			'fields' => array(
				'naam'      => array( 'label' => 'Naam', 'type' => 'text', 'required' => true, 'autocomplete' => 'name', 'width' => 'half' ),
				'email'     => array( 'label' => 'E-mailadres', 'type' => 'email', 'required' => true, 'autocomplete' => 'email', 'width' => 'half' ),
				'telefoon'  => array( 'label' => 'Telefoonnummer', 'type' => 'tel', 'required' => true, 'autocomplete' => 'tel', 'width' => 'half' ),
				'postcode'  => array( 'label' => 'Postcode', 'type' => 'text', 'required' => true, 'autocomplete' => 'postal-code', 'width' => 'half' ),
				'plaats'    => array( 'label' => 'Plaats', 'type' => 'text', 'required' => true, 'autocomplete' => 'address-level2', 'width' => 'half' ),
				'adres'     => array( 'label' => 'Straat en huisnummer', 'type' => 'text', 'required' => false, 'autocomplete' => 'street-address', 'width' => 'half' ),
				'opmerking' => array( 'label' => 'Toelichting op de klus', 'type' => 'textarea', 'required' => false, 'width' => 'full', 'hint' => 'Bijvoorbeeld: hoogte van de ruimte, gewenste afwerking of een deadline.' ),
			),
		),
	);

	/**
	 * Maakt het mogelijk stappen aan te passen zonder het thema te wijzigen.
	 *
	 * @param array $steps Stapdefinitie.
	 */
	return apply_filters( 'ifs_quote_steps', $steps );
}

/**
 * Zoekt het leesbare label bij een opgeslagen antwoordwaarde.
 *
 * @param string $step_key Sleutel van de stap.
 * @param string $value    Waarde van het antwoord.
 * @return string
 */
function ifs_quote_label( $step_key, $value ) {
	foreach ( ifs_quote_steps() as $step ) {
		if ( $step['key'] !== $step_key || empty( $step['options'] ) ) {
			continue;
		}
		return isset( $step['options'][ $value ] ) ? $step['options'][ $value ][0] : $value;
	}
	return $value;
}

/* -----------------------------------------------------------------------------
 * Verwerking
 * -------------------------------------------------------------------------- */

add_action( 'wp_ajax_ifs_submit_quote', 'ifs_handle_quote' );
add_action( 'wp_ajax_nopriv_ifs_submit_quote', 'ifs_handle_quote' );

/**
 * Verwerkt een offerteaanvraag (AJAX).
 */
function ifs_handle_quote() {
	check_ajax_referer( 'ifs_quote', 'nonce' );

	// Honeypot: bots vullen dit verborgen veld doorgaans wel in.
	if ( ! empty( $_POST['ifs_website'] ) ) {
		wp_send_json_success( array( 'message' => 'Bedankt voor je aanvraag.' ) );
	}

	// Eenvoudige snelheidsbegrenzing per IP.
	$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'onbekend';
	$key = 'ifs_quote_' . md5( $ip );
	if ( get_transient( $key ) ) {
		wp_send_json_error( array( 'message' => 'Je hebt zojuist al een aanvraag verstuurd. Bel ons gerust als het spoed heeft.' ), 429 );
	}

	$data   = array();
	$errors = array();

	foreach ( ifs_quote_steps() as $step ) {
		$name = 'ifs_' . $step['key'];

		if ( 'fields' === $step['type'] ) {
			foreach ( $step['fields'] as $field_key => $field ) {
				$raw = isset( $_POST[ 'ifs_' . $field_key ] ) ? wp_unslash( $_POST[ 'ifs_' . $field_key ] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- hieronder gesaneerd.

				if ( 'email' === $field['type'] ) {
					$value = sanitize_email( $raw );
					if ( $value && ! is_email( $value ) ) {
						$errors[] = 'Het e-mailadres lijkt niet te kloppen.';
						$value    = '';
					}
				} elseif ( 'textarea' === $field['type'] ) {
					$value = sanitize_textarea_field( $raw );
				} else {
					$value = sanitize_text_field( $raw );
				}

				if ( ! empty( $field['required'] ) && '' === $value ) {
					/* translators: %s: veldnaam. */
					$errors[] = sprintf( 'Vul "%s" in.', $field['label'] );
				}

				$data[ $field_key ] = $value;
			}
			continue;
		}

		if ( 'multi' === $step['type'] ) {
			$raw    = isset( $_POST[ $name ] ) ? (array) wp_unslash( $_POST[ $name ] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- hieronder gesaneerd.
			$values = array_values( array_intersect( array_map( 'sanitize_key', $raw ), array_keys( $step['options'] ) ) );
			if ( empty( $values ) ) {
				$errors[] = 'Geef aan welk werk je wilt laten uitvoeren.';
			}
			$data[ $step['key'] ] = $values;
			continue;
		}

		$value = isset( $_POST[ $name ] ) ? sanitize_key( wp_unslash( $_POST[ $name ] ) ) : '';
		if ( ! isset( $step['options'][ $value ] ) ) {
			$value = '';
		}
		$data[ $step['key'] ] = $value;
	}

	if ( empty( $_POST['ifs_consent'] ) ) {
		$errors[] = 'Ga akkoord met de privacyverklaring.';
	}

	if ( $errors ) {
		wp_send_json_error( array( 'message' => implode( ' ', array_unique( $errors ) ) ), 400 );
	}

	set_transient( $key, 1, 45 );

	$post_id = ifs_store_quote( $data );
	$sent    = ifs_mail_quote( $data, $post_id );

	if ( ! $sent ) {
		wp_send_json_error(
			array(
				'message' => sprintf(
					/* translators: %s: telefoonnummer. */
					'We konden de e-mail niet versturen. Bel ons gerust op %s, dan pakken we het direct op.',
					ifs_option( 'phone' )
				),
			),
			500
		);
	}

	wp_send_json_success(
		array(
			'message' => sprintf(
				/* translators: %s: reactietermijn. */
				'Bedankt! We hebben je aanvraag ontvangen en nemen %s contact met je op.',
				ifs_option( 'quote_response' )
			),
		)
	);
}

/**
 * Bewaart de aanvraag als privébericht in WordPress, zodat niets verloren gaat
 * wanneer de e-mail onverhoopt niet aankomt.
 *
 * @param array $data Gesaneerde aanvraag.
 * @return int Post ID (0 bij mislukking).
 */
function ifs_store_quote( $data ) {
	$post_id = wp_insert_post(
		array(
			'post_type'   => 'ifs_aanvraag',
			'post_status' => 'private',
			'post_title'  => sprintf( '%s — %s', $data['naam'], $data['plaats'] ),
			'post_content'=> $data['opmerking'],
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		return 0;
	}

	foreach ( $data as $key => $value ) {
		update_post_meta( $post_id, 'ifs_' . $key, is_array( $value ) ? implode( ', ', $value ) : $value );
	}

	return $post_id;
}

/**
 * Registreert het (verborgen) post type waarin aanvragen worden bewaard.
 */
function ifs_register_quote_cpt() {
	register_post_type(
		'ifs_aanvraag',
		array(
			'labels'        => ifs_cpt_labels( 'Offerteaanvraag', 'Offerteaanvragen' ),
			'public'        => false,
			'show_ui'       => true,
			'menu_icon'     => 'dashicons-email-alt',
			'menu_position' => 20,
			'supports'      => array( 'title', 'editor' ),
			'capabilities'  => array( 'create_posts' => 'do_not_allow' ),
			'map_meta_cap'  => true,
		)
	);
}
add_action( 'init', 'ifs_register_quote_cpt' );

/**
 * Toont de belangrijkste aanvraaggegevens in de beheerderslijst.
 *
 * @param array $columns Kolommen.
 * @return array
 */
function ifs_quote_columns( $columns ) {
	return array(
		'cb'        => isset( $columns['cb'] ) ? $columns['cb'] : '',
		'title'     => 'Aanvrager',
		'ifs_werk'  => 'Werk',
		'ifs_opp'   => 'Oppervlakte',
		'ifs_tel'   => 'Telefoon',
		'ifs_mail'  => 'E-mail',
		'date'      => 'Ontvangen',
	);
}
add_filter( 'manage_ifs_aanvraag_posts_columns', 'ifs_quote_columns' );

/**
 * Vult de eigen kolommen.
 *
 * @param string $column  Kolomnaam.
 * @param int    $post_id Post ID.
 */
function ifs_quote_column_content( $column, $post_id ) {
	$map = array(
		'ifs_werk' => 'ifs_werk',
		'ifs_opp'  => 'ifs_oppervlakte',
		'ifs_tel'  => 'ifs_telefoon',
		'ifs_mail' => 'ifs_email',
	);

	if ( ! isset( $map[ $column ] ) ) {
		return;
	}

	echo esc_html( get_post_meta( $post_id, $map[ $column ], true ) );
}
add_action( 'manage_ifs_aanvraag_posts_custom_column', 'ifs_quote_column_content', 10, 2 );

/**
 * Verstuurt de aanvraag naar het bedrijf en een bevestiging naar de klant.
 *
 * @param array $data    Gesaneerde aanvraag.
 * @param int   $post_id Opgeslagen aanvraag.
 * @return bool
 */
function ifs_mail_quote( $data, $post_id ) {
	$to = ifs_option( 'quote_email' );
	if ( ! is_email( $to ) ) {
		$to = ifs_option( 'email' );
	}
	if ( ! is_email( $to ) ) {
		$to = get_option( 'admin_email' );
	}

	$site    = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );
	$headers = array(
		'Content-Type: text/html; charset=UTF-8',
		sprintf( 'From: %s <%s>', $site, ifs_noreply_address() ),
		sprintf( 'Reply-To: %s <%s>', $data['naam'], $data['email'] ),
	);

	$rows = array(
		'Naam'            => $data['naam'],
		'E-mail'          => $data['email'],
		'Telefoon'        => $data['telefoon'],
		'Adres'           => trim( $data['adres'] . ' ' . $data['postcode'] . ' ' . $data['plaats'] ),
		'Gewenst werk'    => implode( ', ', array_map( fn( $v ) => ifs_quote_label( 'werk', $v ), (array) $data['werk'] ) ),
		'Ondergrond'      => ifs_quote_label( 'situatie', $data['situatie'] ),
		'Oppervlakte'     => ifs_quote_label( 'oppervlakte', $data['oppervlakte'] ),
		'Type pand'       => ifs_quote_label( 'pand', $data['pand'] ),
		'Gewenste start'  => ifs_quote_label( 'planning', $data['planning'] ),
		'Toelichting'     => $data['opmerking'],
	);

	$body = '<h2 style="font-family:Arial,sans-serif">Nieuwe offerteaanvraag</h2>';
	$body .= '<table cellpadding="8" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">';
	foreach ( $rows as $label => $value ) {
		if ( '' === trim( (string) $value ) ) {
			continue;
		}
		$body .= sprintf(
			'<tr><td style="background:#f7f3ed;font-weight:bold;border-bottom:1px solid #e3ddd4">%s</td><td style="border-bottom:1px solid #e3ddd4">%s</td></tr>',
			esc_html( $label ),
			nl2br( esc_html( $value ) )
		);
	}
	$body .= '</table>';

	if ( $post_id ) {
		// get_edit_post_link() steunt op de rechten van de huidige bezoeker en is
		// bij een anonieme aanvraag leeg; daarom bouwen we de beheer-URL zelf op.
		$body .= sprintf(
			'<p style="font-family:Arial,sans-serif;font-size:13px"><a href="%s">Bekijk de aanvraag in WordPress</a></p>',
			esc_url( admin_url( 'post.php?post=' . $post_id . '&action=edit' ) )
		);
	}

	$subject = sprintf( '[Offerte] %s — %s', $data['naam'], $data['plaats'] );
	$sent    = wp_mail( $to, $subject, $body, $headers );

	// Bevestiging naar de klant (mislukking hiervan mag de aanvraag niet blokkeren).
	if ( is_email( $data['email'] ) ) {
		$confirm  = sprintf( '<p style="font-family:Arial,sans-serif">Beste %s,</p>', esc_html( $data['naam'] ) );
		$confirm .= sprintf(
			'<p style="font-family:Arial,sans-serif">Bedankt voor je aanvraag bij %1$s. We hebben hem goed ontvangen en nemen %2$s contact met je op met een vrijblijvende prijsopgave.</p>',
			esc_html( ifs_option( 'company_name' ) ),
			esc_html( ifs_option( 'quote_response' ) )
		);
		$confirm .= '<p style="font-family:Arial,sans-serif"><strong>Dit gaf je door:</strong></p>';
		$confirm .= '<table cellpadding="8" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">';
		foreach ( array( 'Gewenst werk', 'Oppervlakte', 'Gewenste start', 'Toelichting' ) as $label ) {
			if ( empty( $rows[ $label ] ) ) {
				continue;
			}
			$confirm .= sprintf(
				'<tr><td style="background:#f7f3ed;font-weight:bold;border-bottom:1px solid #e3ddd4">%s</td><td style="border-bottom:1px solid #e3ddd4">%s</td></tr>',
				esc_html( $label ),
				nl2br( esc_html( $rows[ $label ] ) )
			);
		}
		$confirm .= '</table>';
		$confirm .= sprintf(
			'<p style="font-family:Arial,sans-serif">Met vriendelijke groet,<br>%1$s<br>%2$s</p>',
			esc_html( ifs_option( 'company_name' ) ),
			esc_html( ifs_option( 'phone' ) )
		);

		wp_mail(
			$data['email'],
			sprintf( 'We hebben je aanvraag ontvangen — %s', ifs_option( 'company_name' ) ),
			$confirm,
			array(
				'Content-Type: text/html; charset=UTF-8',
				sprintf( 'From: %s <%s>', $site, ifs_noreply_address() ),
				sprintf( 'Reply-To: %s', $to ),
			)
		);
	}

	return (bool) $sent;
}

/**
 * Afzenderadres op het eigen domein (voorkomt dat mail als spam wordt gemarkeerd).
 *
 * @return string
 */
function ifs_noreply_address() {
	$host = wp_parse_url( home_url(), PHP_URL_HOST );
	$host = preg_replace( '/^www\./i', '', (string) $host );
	return 'no-reply@' . $host;
}
