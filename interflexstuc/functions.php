<?php
/**
 * Interflex Stuc — functions.php
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

define( 'IFS_VERSION', '1.0.0' );
define( 'IFS_DIR', get_template_directory() );
define( 'IFS_URI', get_template_directory_uri() );

require_once IFS_DIR . '/inc/setup.php';
require_once IFS_DIR . '/inc/enqueue.php';
require_once IFS_DIR . '/inc/post-types.php';
require_once IFS_DIR . '/inc/customizer.php';
require_once IFS_DIR . '/inc/template-tags.php';
require_once IFS_DIR . '/inc/icons.php';
require_once IFS_DIR . '/inc/schema.php';
require_once IFS_DIR . '/inc/offerte.php';
require_once IFS_DIR . '/inc/seed-content.php';
