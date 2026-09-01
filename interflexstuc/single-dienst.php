<?php
/**
 * Losse dienstpagina.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$ifs_price = get_post_meta( get_the_ID(), 'ifs_price_from', true );
	$ifs_usps  = array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) get_post_meta( get_the_ID(), 'ifs_usps', true ) ) ) );
	?>

	<div class="ifs-page-head">
		<div class="ifs-container">
			<?php ifs_breadcrumbs(); ?>
			<span class="ifs-eyebrow">Dienst</span>
			<h1><?php the_title(); ?></h1>
			<?php if ( has_excerpt() ) : ?>
				<p class="ifs-lead"><?php echo esc_html( get_the_excerpt() ); ?></p>
			<?php endif; ?>

			<div style="display:flex;flex-wrap:wrap;gap:.8rem;margin-top:1.75rem">
				<a class="ifs-btn" href="<?php echo esc_url( ifs_quote_url() ); ?>">Offerte voor deze dienst</a>
				<a class="ifs-btn ifs-btn--ghost" href="<?php echo esc_url( ifs_phone_href() ); ?>">
					<?php ifs_the_icon( 'phone', 18 ); ?> <?php echo esc_html( ifs_option( 'phone' ) ); ?>
				</a>
			</div>
		</div>
	</div>

	<section class="ifs-section">
		<div class="ifs-container">
			<div class="ifs-layout">

				<article class="ifs-content">
					<?php if ( has_post_thumbnail() ) : ?>
						<?php ifs_thumb( get_the_ID(), 'ifs-wide', '' ); ?>
					<?php endif; ?>
					<?php the_content(); ?>
				</article>

				<aside class="ifs-aside">
					<?php if ( $ifs_price ) : ?>
						<div class="ifs-aside__card">
							<span class="ifs-badge">Richtprijs</span>
							<h3 style="margin:.75rem 0 .25rem"><?php echo esc_html( $ifs_price ); ?></h3>
							<p>Inclusief materiaal en btw. De definitieve prijs hangt af van de ondergrond en het afwerkingsniveau.</p>
							<a class="ifs-btn ifs-btn--block" href="<?php echo esc_url( ifs_quote_url() ); ?>">Bereken jouw prijs</a>
						</div>
					<?php endif; ?>

					<?php if ( $ifs_usps ) : ?>
						<div class="ifs-aside__card">
							<h3>Pluspunten</h3>
							<ul class="ifs-checklist">
								<?php foreach ( $ifs_usps as $ifs_usp ) : ?>
									<li><?php ifs_the_icon( 'check-circle', 21 ); ?> <?php echo esc_html( $ifs_usp ); ?></li>
								<?php endforeach; ?>
							</ul>
						</div>
					<?php endif; ?>

					<?php
					$ifs_others = get_posts(
						array(
							'post_type'      => 'ifs_dienst',
							'posts_per_page' => 5,
							'post__not_in'   => array( get_the_ID() ),
							'orderby'        => 'menu_order',
							'order'          => 'ASC',
						)
					);
					?>
					<?php if ( $ifs_others ) : ?>
						<div class="ifs-aside__card">
							<h3>Andere diensten</h3>
							<ul style="list-style:none;padding:0;margin:0;display:grid;gap:.6rem;font-size:var(--ifs-fs-sm)">
								<?php foreach ( $ifs_others as $ifs_other ) : ?>
									<li>
										<a class="ifs-link-arrow" href="<?php echo esc_url( get_permalink( $ifs_other ) ); ?>">
											<?php echo esc_html( get_the_title( $ifs_other ) ); ?> <span aria-hidden="true">→</span>
										</a>
									</li>
								<?php endforeach; ?>
							</ul>
						</div>
					<?php endif; ?>
				</aside>

			</div>
		</div>
	</section>

	<section class="ifs-quote" id="offerte">
		<div class="ifs-container">
			<div class="ifs-section-head ifs-section-head--center">
				<h2>Wat kost <?php echo esc_html( mb_strtolower( get_the_title() ) ); ?> bij jou?</h2>
				<p class="ifs-lead">Vul de vragen in en ontvang <?php echo esc_html( ifs_option( 'quote_response' ) ); ?> een vrijblijvende prijsopgave.</p>
			</div>
			<div class="ifs-narrow" style="max-width:860px">
				<?php get_template_part( 'template-parts/quote-form' ); ?>
			</div>
		</div>
	</section>

<?php endwhile; ?>

<?php
get_footer();
