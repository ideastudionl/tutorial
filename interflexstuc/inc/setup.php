<?php
/**
 * Themaondersteuning, menu's en algemene instellingen.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registreert de themaondersteuning.
 */
function ifs_setup() {
	load_theme_textdomain( 'interflexstuc', IFS_DIR . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support(
		'html5',
		array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' )
	);
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 60,
			'width'       => 240,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	add_editor_style( 'assets/css/main.css' );

	register_nav_menus(
		array(
			'primary'   => __( 'Hoofdmenu', 'interflexstuc' ),
			'services'  => __( 'Diensten (footer)', 'interflexstuc' ),
			'werkgebied'=> __( 'Werkgebied (footer)', 'interflexstuc' ),
			'legal'     => __( 'Juridisch (onderaan)', 'interflexstuc' ),
		)
	);

	add_image_size( 'ifs-card', 800, 600, true );
	add_image_size( 'ifs-hero', 1000, 1200, true );
	add_image_size( 'ifs-wide', 1600, 900, true );
}
add_action( 'after_setup_theme', 'ifs_setup' );

/**
 * Breedte van de contentkolom voor embeds.
 */
function ifs_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'ifs_content_width', 760 );
}
add_action( 'after_setup_theme', 'ifs_content_width', 0 );

/**
 * Widgetgebieden.
 */
function ifs_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'Zijbalk pagina', 'interflexstuc' ),
			'id'            => 'sidebar-page',
			'description'   => __( 'Verschijnt naast losse pagina- en blogartikelen.', 'interflexstuc' ),
			'before_widget' => '<section id="%1$s" class="ifs-aside__card widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h3>',
			'after_title'   => '</h3>',
		)
	);
}
add_action( 'widgets_init', 'ifs_widgets_init' );

/**
 * Excerpt-instellingen.
 */
add_filter( 'excerpt_length', fn() => 24, 999 );
add_filter( 'excerpt_more', fn() => '&hellip;' );

/**
 * Body classes.
 *
 * @param array $classes Bestaande classes.
 * @return array
 */
function ifs_body_classes( $classes ) {
	if ( ! is_singular() ) {
		$classes[] = 'ifs-archive';
	}
	if ( is_page_template( 'page-offerte.php' ) ) {
		$classes[] = 'ifs-page-offerte';
	}
	return $classes;
}
add_filter( 'body_class', 'ifs_body_classes' );

/**
 * Verwijdert de WordPress-emoji-scripts (snellere paginalaadtijd).
 */
function ifs_disable_emojis() {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
}
add_action( 'init', 'ifs_disable_emojis' );

/**
 * Reacties zijn niet nodig op een bedrijfssite.
 */
add_filter( 'comments_open', '__return_false', 20 );
add_filter( 'pings_open', '__return_false', 20 );
