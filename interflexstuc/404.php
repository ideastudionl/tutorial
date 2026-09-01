<?php
/**
 * 404 — pagina niet gevonden.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<section class="ifs-section">
	<div class="ifs-container ifs-narrow" style="text-align:center">
		<span class="ifs-eyebrow ifs-eyebrow--center">Foutmelding 404</span>
		<h1>Deze pagina bestaat niet (meer)</h1>
		<p class="ifs-lead">Mogelijk is de pagina verplaatst of klopt het adres niet. Hieronder vind je de meest bezochte pagina&rsquo;s.</p>

		<div style="display:flex;flex-wrap:wrap;gap:.8rem;justify-content:center;margin:2.5rem 0">
			<a class="ifs-btn" href="<?php echo esc_url( ifs_quote_url() ); ?>">Offerte aanvragen</a>
			<a class="ifs-btn ifs-btn--ghost" href="<?php echo esc_url( get_post_type_archive_link( 'ifs_dienst' ) ); ?>">Onze diensten</a>
			<a class="ifs-btn ifs-btn--ghost" href="<?php echo esc_url( home_url( '/' ) ); ?>">Naar de homepage</a>
		</div>

		<?php get_search_form(); ?>
	</div>
</section>

<?php
get_footer();
