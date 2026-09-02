<?php
/**
 * Header.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#0B1B33">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="ifs-skip-link" href="#content">Naar de inhoud springen</a>

<div class="ifs-topbar">
	<div class="ifs-container ifs-topbar__inner">
		<ul class="ifs-topbar__list">
			<li><?php ifs_the_icon( 'shield', 14 ); ?> <?php echo esc_html( ifs_option( 'warranty_years' ) ); ?> jaar garantie op ons werk</li>
			<li><?php ifs_the_icon( 'clock', 14 ); ?> Reactie <?php echo esc_html( ifs_option( 'quote_response' ) ); ?></li>
			<li><?php ifs_the_icon( 'pin', 14 ); ?> Actief in Amsterdam &amp; omstreken</li>
		</ul>
		<div class="ifs-topbar__list">
			<a href="<?php echo esc_url( ifs_phone_href() ); ?>"><?php ifs_the_icon( 'phone', 14 ); ?> <?php echo esc_html( ifs_option( 'phone' ) ); ?></a>
		</div>
	</div>
</div>

<header class="ifs-header" id="masthead">
	<div class="ifs-container ifs-header__inner">

		<a class="ifs-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
			<?php ifs_the_logo(); ?>
			<span class="ifs-brand__tag"><?php echo esc_html( ifs_option( 'company_tagline' ) ); ?></span>
		</a>

		<nav class="ifs-nav" aria-label="Hoofdnavigatie">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'depth'          => 2,
					'fallback_cb'    => 'ifs_menu_fallback',
				)
			);
			?>
		</nav>

		<div class="ifs-header__actions">
			<a class="ifs-header__phone" href="<?php echo esc_url( ifs_phone_href() ); ?>">
				<?php ifs_the_icon( 'phone', 18 ); ?>
				<?php echo esc_html( ifs_option( 'phone' ) ); ?>
			</a>
			<a class="ifs-btn" href="<?php echo esc_url( ifs_quote_url() ); ?>">Offerte aanvragen</a>
			<button class="ifs-burger" type="button" aria-expanded="false" aria-controls="ifs-mobile-nav" aria-label="Menu openen">
				<span></span>
			</button>
		</div>

	</div>
</header>

<div class="ifs-overlay" data-overlay></div>

<nav class="ifs-mobile-nav" id="ifs-mobile-nav" aria-label="Mobiele navigatie" inert>
	<div class="ifs-mobile-nav__head">
		<a class="ifs-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php ifs_the_logo(); ?></a>
		<button class="ifs-burger" type="button" data-close-nav aria-label="Menu sluiten" aria-expanded="true"><span></span></button>
	</div>
	<?php
	wp_nav_menu(
		array(
			'theme_location' => 'primary',
			'container'      => false,
			'depth'          => 2,
			'fallback_cb'    => 'ifs_menu_fallback',
		)
	);
	?>
	<div class="ifs-mobile-nav__actions">
		<a class="ifs-btn ifs-btn--block" href="<?php echo esc_url( ifs_quote_url() ); ?>">Offerte aanvragen</a>
		<a class="ifs-btn ifs-btn--ghost ifs-btn--block" href="<?php echo esc_url( ifs_phone_href() ); ?>">
			<?php ifs_the_icon( 'phone', 18 ); ?> <?php echo esc_html( ifs_option( 'phone' ) ); ?>
		</a>
	</div>
</nav>

<main id="content">
