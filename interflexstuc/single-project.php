<?php
/**
 * Losse projectpagina.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$ifs_facts = array(
		'Plaats'      => get_post_meta( get_the_ID(), 'ifs_location', true ),
		'Oppervlakte' => get_post_meta( get_the_ID(), 'ifs_surface', true ),
		'Doorlooptijd'=> get_post_meta( get_the_ID(), 'ifs_duration', true ),
	);
	$ifs_facts = array_filter( $ifs_facts );
	?>

	<div class="ifs-page-head">
		<div class="ifs-container">
			<?php ifs_breadcrumbs(); ?>
			<span class="ifs-eyebrow">Project</span>
			<h1><?php the_title(); ?></h1>
			<?php if ( has_excerpt() ) : ?>
				<p class="ifs-lead"><?php echo esc_html( get_the_excerpt() ); ?></p>
			<?php endif; ?>
		</div>
	</div>

	<section class="ifs-section">
		<div class="ifs-container">
			<div class="ifs-layout">
				<article class="ifs-content">
					<?php ifs_thumb( get_the_ID(), 'ifs-wide', '' ); ?>
					<?php the_content(); ?>
				</article>

				<aside class="ifs-aside">
					<?php if ( $ifs_facts ) : ?>
						<div class="ifs-aside__card">
							<h3>Projectgegevens</h3>
							<dl style="margin:0;display:grid;gap:.75rem;font-size:var(--ifs-fs-sm)">
								<?php foreach ( $ifs_facts as $ifs_label => $ifs_value ) : ?>
									<div style="display:flex;justify-content:space-between;gap:1rem">
										<dt style="color:var(--ifs-stone)"><?php echo esc_html( $ifs_label ); ?></dt>
										<dd style="margin:0;font-weight:700;color:var(--ifs-ink)"><?php echo esc_html( $ifs_value ); ?></dd>
									</div>
								<?php endforeach; ?>
							</dl>
						</div>
					<?php endif; ?>

					<div class="ifs-aside__card">
						<h3>Zoiets ook laten doen?</h3>
						<p>Vraag een vrijblijvende offerte aan. Reactie <?php echo esc_html( ifs_option( 'quote_response' ) ); ?>.</p>
						<a class="ifs-btn ifs-btn--block" href="<?php echo esc_url( ifs_quote_url() ); ?>">Offerte aanvragen</a>
					</div>
				</aside>
			</div>
		</div>
	</section>

	<?php
	$ifs_more = get_posts(
		array(
			'post_type'      => 'ifs_project',
			'posts_per_page' => 3,
			'post__not_in'   => array( get_the_ID() ),
		)
	);
	?>
	<?php if ( $ifs_more ) : ?>
		<section class="ifs-section ifs-section--sand">
			<div class="ifs-container">
				<div class="ifs-section-head"><h2>Meer projecten</h2></div>
				<div class="ifs-projects">
					<?php foreach ( $ifs_more as $ifs_item ) : ?>
						<?php ifs_project_card( $ifs_item ); ?>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
	<?php endif; ?>

<?php endwhile; ?>

<?php get_template_part( 'template-parts/cta' ); ?>

<?php
get_footer();
