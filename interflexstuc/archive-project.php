<?php
/**
 * Projectenoverzicht.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<div class="ifs-page-head">
	<div class="ifs-container">
		<?php ifs_breadcrumbs(); ?>
		<span class="ifs-eyebrow">Ons werk</span>
		<h1>Projecten</h1>
		<p class="ifs-lead">Een greep uit recent uitgevoerd stuc- en schilderwerk in Amsterdam en omstreken.</p>
	</div>
</div>

<section class="ifs-section">
	<div class="ifs-container">
		<?php if ( have_posts() ) : ?>
			<div class="ifs-projects">
				<?php
				while ( have_posts() ) :
					the_post();
					ifs_project_card( get_post() );
				endwhile;
				?>
			</div>
			<?php ifs_pagination(); ?>
		<?php else : ?>
			<p>Er zijn nog geen projecten toegevoegd. Voeg ze toe via <strong>Projecten</strong> in het WordPress-menu.</p>
		<?php endif; ?>
	</div>
</section>

<?php get_template_part( 'template-parts/cta' ); ?>

<?php
get_footer();
