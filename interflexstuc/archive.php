<?php
/**
 * Terugvalsjabloon en blogoverzicht.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<div class="ifs-page-head">
	<div class="ifs-container">
		<?php ifs_breadcrumbs(); ?>
		<h1>
			<?php
			if ( is_home() && ! is_front_page() ) {
				echo esc_html( get_the_title( get_option( 'page_for_posts' ) ) );
			} elseif ( is_search() ) {
				/* translators: %s: zoekterm. */
				printf( esc_html__( 'Zoekresultaten voor &ldquo;%s&rdquo;', 'interflexstuc' ), esc_html( get_search_query() ) );
			} elseif ( is_archive() ) {
				echo esc_html( wp_strip_all_tags( get_the_archive_title() ) );
			} else {
				echo esc_html__( 'Artikelen', 'interflexstuc' );
			}
			?>
		</h1>
		<?php if ( is_home() && ! is_front_page() ) : ?>
			<p class="ifs-lead">Uitleg en achtergrond over stucwerk, afwerkingsniveaus en onderhoud.</p>
		<?php endif; ?>
	</div>
</div>

<section class="ifs-section">
	<div class="ifs-container">
		<?php if ( have_posts() ) : ?>
			<div class="ifs-grid ifs-grid--3">
				<?php while ( have_posts() ) : the_post(); ?>
					<a class="ifs-card ifs-card--link ifs-service" href="<?php the_permalink(); ?>">
						<?php ifs_thumb( get_the_ID(), 'ifs-card', '' ); ?>
						<div class="ifs-service__body">
							<h3><?php the_title(); ?></h3>
							<p><?php echo esc_html( wp_trim_words( get_the_excerpt(), 22 ) ); ?></p>
							<span class="ifs-link-arrow">Lees verder <span aria-hidden="true">→</span></span>
						</div>
					</a>
				<?php endwhile; ?>
			</div>
			<?php ifs_pagination(); ?>
		<?php else : ?>
			<div class="ifs-narrow">
				<p>Er is niets gevonden. Probeer een andere zoekterm of bekijk <a href="<?php echo esc_url( get_post_type_archive_link( 'ifs_dienst' ) ); ?>">onze diensten</a>.</p>
				<?php get_search_form(); ?>
			</div>
		<?php endif; ?>
	</div>
</section>

<?php
get_footer();
