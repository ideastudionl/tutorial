<?php
/**
 * Overzicht van alle werkgebieden.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<div class="ifs-page-head">
	<div class="ifs-container">
		<?php ifs_breadcrumbs(); ?>
		<span class="ifs-eyebrow">Waar we werken</span>
		<h1>Ons werkgebied</h1>
		<p class="ifs-lead">Vanuit <?php echo esc_html( ifs_option( 'city' ) ); ?> werken we in heel Noord-Holland en een deel van Utrecht. Kies je plaats voor meer informatie.</p>
	</div>
</div>

<section class="ifs-section">
	<div class="ifs-container">
		<?php if ( have_posts() ) : ?>
			<div class="ifs-grid ifs-grid--3">
				<?php
				while ( have_posts() ) :
					the_post();
					$ifs_travel = get_post_meta( get_the_ID(), 'ifs_travel_time', true );
					?>
					<a class="ifs-card ifs-card--link" href="<?php the_permalink(); ?>" style="text-decoration:none">
						<div class="ifs-icon-box"><?php ifs_the_icon( 'pin' ); ?></div>
						<h3 style="margin-bottom:.4rem">Stukadoor in <?php the_title(); ?></h3>
						<p style="color:var(--ifs-stone);font-size:var(--ifs-fs-sm);margin-bottom:1rem">
							<?php echo esc_html( get_the_excerpt() ); ?>
						</p>
						<?php if ( $ifs_travel ) : ?>
							<p style="margin-bottom:1rem"><span class="ifs-badge ifs-badge--green"><?php ifs_the_icon( 'clock', 14 ); ?> <?php echo esc_html( $ifs_travel ); ?></span></p>
						<?php endif; ?>
						<span class="ifs-link-arrow">Bekijk deze plaats <span aria-hidden="true">→</span></span>
					</a>
					<?php
				endwhile;
				?>
			</div>
			<?php ifs_pagination(); ?>
		<?php else : ?>
			<p>Er zijn nog geen werkgebieden toegevoegd.</p>
		<?php endif; ?>
	</div>
</section>

<?php get_template_part( 'template-parts/cta' ); ?>

<?php
get_footer();
