<?php
/**
 * Losse blogpost.
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
			<p class="ifs-lead" style="font-size:var(--ifs-fs-sm)">
				<?php echo esc_html( get_the_date() ); ?>
				<?php if ( has_excerpt() ) : ?>
					&middot; <?php echo esc_html( get_the_excerpt() ); ?>
				<?php endif; ?>
			</p>
		</div>
	</div>

	<section class="ifs-section">
		<div class="ifs-container">
			<article class="ifs-content ifs-narrow">
				<?php if ( has_post_thumbnail() ) : ?>
					<?php ifs_thumb( get_the_ID(), 'ifs-wide', '' ); ?>
				<?php endif; ?>
				<?php the_content(); ?>
			</article>
		</div>
	</section>

	<?php
endwhile;

get_template_part( 'template-parts/cta' );

get_footer();
