<?php
/**
 * Custom post types voor diensten, projecten, reviews, werkgebieden en veelgestelde vragen.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registreert de post types.
 */
function ifs_register_post_types() {

	register_post_type(
		'ifs_dienst',
		array(
			'labels'        => ifs_cpt_labels( 'Dienst', 'Diensten' ),
			'public'        => true,
			'has_archive'   => 'diensten',
			'menu_icon'     => 'dashicons-hammer',
			'menu_position' => 21,
			'supports'      => array( 'title', 'editor', 'excerpt', 'thumbnail', 'page-attributes', 'revisions' ),
			'rewrite'       => array( 'slug' => 'diensten', 'with_front' => false ),
			'show_in_rest'  => true,
			'hierarchical'  => false,
		)
	);

	register_post_type(
		'ifs_project',
		array(
			'labels'        => ifs_cpt_labels( 'Project', 'Projecten' ),
			'public'        => true,
			'has_archive'   => 'projecten',
			'menu_icon'     => 'dashicons-format-gallery',
			'menu_position' => 22,
			'supports'      => array( 'title', 'editor', 'excerpt', 'thumbnail', 'page-attributes', 'revisions' ),
			'rewrite'       => array( 'slug' => 'projecten', 'with_front' => false ),
			'show_in_rest'  => true,
		)
	);

	register_post_type(
		'ifs_werkgebied',
		array(
			'labels'        => ifs_cpt_labels( 'Werkgebied', 'Werkgebieden' ),
			'public'        => true,
			'has_archive'   => 'werkgebied',
			'menu_icon'     => 'dashicons-location-alt',
			'menu_position' => 23,
			'supports'      => array( 'title', 'editor', 'excerpt', 'thumbnail', 'page-attributes', 'revisions' ),
			'rewrite'       => array( 'slug' => 'stukadoor', 'with_front' => false ),
			'show_in_rest'  => true,
		)
	);

	register_post_type(
		'ifs_review',
		array(
			'labels'        => ifs_cpt_labels( 'Review', 'Reviews' ),
			'public'        => false,
			'show_ui'       => true,
			'menu_icon'     => 'dashicons-star-filled',
			'menu_position' => 24,
			'supports'      => array( 'title', 'editor', 'page-attributes' ),
			'show_in_rest'  => true,
		)
	);

	register_post_type(
		'ifs_faq',
		array(
			'labels'        => ifs_cpt_labels( 'Veelgestelde vraag', 'Veelgestelde vragen' ),
			'public'        => false,
			'show_ui'       => true,
			'menu_icon'     => 'dashicons-editor-help',
			'menu_position' => 25,
			'supports'      => array( 'title', 'editor', 'page-attributes' ),
			'show_in_rest'  => true,
		)
	);

	register_taxonomy(
		'ifs_dienst_cat',
		array( 'ifs_project' ),
		array(
			'labels'            => ifs_cpt_labels( 'Werksoort', 'Werksoorten' ),
			'public'            => true,
			'hierarchical'      => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rewrite'           => array( 'slug' => 'werksoort', 'with_front' => false ),
		)
	);
}
add_action( 'init', 'ifs_register_post_types' );

/**
 * Bouwt een standaard labelset voor een post type.
 *
 * @param string $single Enkelvoud.
 * @param string $plural Meervoud.
 * @return array
 */
function ifs_cpt_labels( $single, $plural ) {
	return array(
		'name'               => $plural,
		'singular_name'      => $single,
		'menu_name'          => $plural,
		'add_new'            => 'Nieuw toevoegen',
		/* translators: %s: enkelvoudige naam. */
		'add_new_item'       => sprintf( 'Nieuwe %s toevoegen', strtolower( $single ) ),
		'edit_item'          => sprintf( '%s bewerken', $single ),
		'new_item'           => sprintf( 'Nieuwe %s', strtolower( $single ) ),
		'view_item'          => sprintf( '%s bekijken', $single ),
		'all_items'          => sprintf( 'Alle %s', strtolower( $plural ) ),
		'search_items'       => sprintf( '%s zoeken', $plural ),
		'not_found'          => sprintf( 'Geen %s gevonden.', strtolower( $plural ) ),
		'not_found_in_trash' => sprintf( 'Geen %s in de prullenbak.', strtolower( $plural ) ),
	);
}

/* -----------------------------------------------------------------------------
 * Meta-velden
 * -------------------------------------------------------------------------- */

/**
 * Definitie van alle metaboxen per post type.
 *
 * @return array
 */
function ifs_meta_fields() {
	return array(
		'ifs_dienst'     => array(
			'title'  => 'Dienstdetails',
			'fields' => array(
				'ifs_icon'       => array( 'label' => 'Icoon', 'type' => 'select', 'options' => array( 'wall' => 'Muur', 'ceiling' => 'Plafond', 'layers' => 'Lagen', 'brush' => 'Kwast', 'sparkles' => 'Sierpleister', 'building' => 'Gevel', 'ruler' => 'Meten', 'home' => 'Woning' ) ),
				'ifs_price_from' => array( 'label' => 'Vanafprijs (bijv. "€ 18,50 per m²")', 'type' => 'text' ),
				'ifs_usps'       => array( 'label' => 'Pluspunten (één per regel)', 'type' => 'textarea' ),
			),
		),
		'ifs_project'    => array(
			'title'  => 'Projectdetails',
			'fields' => array(
				'ifs_location' => array( 'label' => 'Plaats', 'type' => 'text' ),
				'ifs_surface'  => array( 'label' => 'Oppervlakte (bijv. "120 m²")', 'type' => 'text' ),
				'ifs_duration' => array( 'label' => 'Doorlooptijd (bijv. "4 werkdagen")', 'type' => 'text' ),
			),
		),
		'ifs_werkgebied' => array(
			'title'  => 'Werkgebieddetails',
			'fields' => array(
				'ifs_city'        => array( 'label' => 'Plaatsnaam', 'type' => 'text' ),
				'ifs_travel_time' => array( 'label' => 'Reistijd vanaf Amsterdam', 'type' => 'text' ),
				'ifs_districts'   => array( 'label' => 'Wijken/kernen (komma-gescheiden)', 'type' => 'textarea' ),
			),
		),
		'ifs_review'     => array(
			'title'  => 'Reviewdetails',
			'fields' => array(
				'ifs_author'   => array( 'label' => 'Naam klant', 'type' => 'text' ),
				'ifs_city'     => array( 'label' => 'Plaats', 'type' => 'text' ),
				'ifs_rating'   => array( 'label' => 'Beoordeling (1-5)', 'type' => 'number' ),
				'ifs_job'      => array( 'label' => 'Soort klus', 'type' => 'text' ),
			),
		),
	);
}

/**
 * Voegt de metaboxen toe.
 */
function ifs_add_meta_boxes() {
	foreach ( ifs_meta_fields() as $post_type => $box ) {
		add_meta_box( 'ifs_meta_' . $post_type, $box['title'], 'ifs_render_meta_box', $post_type, 'normal', 'high' );
	}
}
add_action( 'add_meta_boxes', 'ifs_add_meta_boxes' );

/**
 * Rendert een metabox.
 *
 * @param WP_Post $post Huidige post.
 */
function ifs_render_meta_box( $post ) {
	$config = ifs_meta_fields();
	if ( ! isset( $config[ $post->post_type ] ) ) {
		return;
	}

	wp_nonce_field( 'ifs_save_meta', 'ifs_meta_nonce' );
	echo '<div style="display:grid;gap:16px;padding:8px 0;">';

	foreach ( $config[ $post->post_type ]['fields'] as $key => $field ) {
		$value = get_post_meta( $post->ID, $key, true );
		printf( '<p style="margin:0"><label for="%1$s" style="display:block;font-weight:600;margin-bottom:4px">%2$s</label>', esc_attr( $key ), esc_html( $field['label'] ) );

		switch ( $field['type'] ) {
			case 'textarea':
				printf( '<textarea id="%1$s" name="%1$s" rows="4" class="widefat">%2$s</textarea>', esc_attr( $key ), esc_textarea( $value ) );
				break;
			case 'select':
				printf( '<select id="%1$s" name="%1$s" class="widefat"><option value="">— kies —</option>', esc_attr( $key ) );
				foreach ( $field['options'] as $opt_val => $opt_label ) {
					printf( '<option value="%1$s" %3$s>%2$s</option>', esc_attr( $opt_val ), esc_html( $opt_label ), selected( $value, $opt_val, false ) );
				}
				echo '</select>';
				break;
			case 'number':
				printf( '<input type="number" min="1" max="5" step="1" id="%1$s" name="%1$s" value="%2$s" class="widefat">', esc_attr( $key ), esc_attr( $value ) );
				break;
			default:
				printf( '<input type="text" id="%1$s" name="%1$s" value="%2$s" class="widefat">', esc_attr( $key ), esc_attr( $value ) );
		}

		echo '</p>';
	}

	echo '</div>';
}

/**
 * Slaat de metavelden op.
 *
 * @param int $post_id Post ID.
 */
function ifs_save_meta( $post_id ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! isset( $_POST['ifs_meta_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['ifs_meta_nonce'] ) ), 'ifs_save_meta' ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$config    = ifs_meta_fields();
	$post_type = get_post_type( $post_id );
	if ( ! isset( $config[ $post_type ] ) ) {
		return;
	}

	foreach ( $config[ $post_type ]['fields'] as $key => $field ) {
		if ( ! isset( $_POST[ $key ] ) ) {
			delete_post_meta( $post_id, $key );
			continue;
		}
		$raw   = wp_unslash( $_POST[ $key ] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- hieronder gesaneerd.
		$value = 'textarea' === $field['type'] ? sanitize_textarea_field( $raw ) : sanitize_text_field( $raw );
		update_post_meta( $post_id, $key, $value );
	}
}
add_action( 'save_post', 'ifs_save_meta' );
