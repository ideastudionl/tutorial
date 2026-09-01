<?php
/**
 * Standaard pagina.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	?>

	<div class="ifs-page-head">
		<div class="ifs-container">
			<?php ifs_breadcrumbs(); ?>
			<h1><?php the_title(); ?></h1>
			<?php if ( has_excerpt() ) : ?>
				<p class="ifs-lead"><?php echo esc_html( get_the_excerpt() ); ?></p>
			<?php endif; ?>
		</div>
	</div>

	<section class="ifs-section">
		<div class="ifs-container">
			<?php if ( is_active_sidebar( 'sidebar-page' ) ) : ?>
				<div class="ifs-layout">
					<article class="ifs-content"><?php the_content(); ?></article>
					<aside class="ifs-aside"><?php dynamic_sidebar( 'sidebar-page' ); ?></aside>
				</div>
			<?php else : ?>
				<article class="ifs-content ifs-narrow"><?php the_content(); ?></article>
			<?php endif; ?>
		</div>
	</section>

	<?php
endwhile;

get_template_part( 'template-parts/cta' );

get_footer();
