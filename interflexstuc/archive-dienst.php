<?php
/**
 * Overzicht van alle diensten.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<div class="ifs-page-head">
	<div class="ifs-container">
		<?php ifs_breadcrumbs(); ?>
		<span class="ifs-eyebrow">Wat we doen</span>
		<h1>Onze diensten</h1>
		<p class="ifs-lead">Stuc- en schilderwerk voor woningen, VvE&rsquo;s en bedrijfspanden in Amsterdam en omstreken. Alles in eigen beheer — van voorbereiding tot afwerking.</p>
	</div>
</div>

<section class="ifs-section">
	<div class="ifs-container">
		<?php if ( have_posts() ) : ?>
			<div class="ifs-grid ifs-grid--3">
				<?php
				while ( have_posts() ) :
					the_post();
					ifs_service_card( get_post() );
				endwhile;
				?>
			</div>
			<?php ifs_pagination(); ?>
		<?php else : ?>
			<p>Er zijn nog geen diensten toegevoegd.</p>
		<?php endif; ?>
	</div>
</section>

<?php get_template_part( 'template-parts/cta' ); ?>

<?php
get_footer();
