<?php
/**
 * Werkgebied-landingspagina (SEO per plaats).
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$ifs_city      = get_post_meta( get_the_ID(), 'ifs_city', true );
	$ifs_city      = $ifs_city ? $ifs_city : get_the_title();
	$ifs_travel    = get_post_meta( get_the_ID(), 'ifs_travel_time', true );
	$ifs_districts = array_filter( array_map( 'trim', explode( ',', (string) get_post_meta( get_the_ID(), 'ifs_districts', true ) ) ) );
	$ifs_services  = ifs_get_items( 'ifs_dienst', 6 );
	$ifs_reviews   = ifs_get_items( 'ifs_review', 3 );
	?>

	<div class="ifs-page-head">
		<div class="ifs-container">
			<?php ifs_breadcrumbs(); ?>
			<span class="ifs-eyebrow">Werkgebied</span>
			<h1>Stukadoor in <?php echo esc_html( $ifs_city ); ?></h1>
			<p class="ifs-lead">
				Glad stucwerk, plafonds, sierpleister, betonlook en schilderwerk in <?php echo esc_html( $ifs_city ); ?>.
				Vaste prijs vooraf en <?php echo esc_html( ifs_option( 'warranty_years' ) ); ?> jaar garantie op de uitvoering.
			</p>

			<div style="display:flex;flex-wrap:wrap;gap:.8rem;margin-top:1.75rem">
				<a class="ifs-btn" href="#offerte">Prijs in 3 minuten</a>
				<a class="ifs-btn ifs-btn--ghost" href="<?php echo esc_url( ifs_phone_href() ); ?>">
					<?php ifs_the_icon( 'phone', 18 ); ?> <?php echo esc_html( ifs_option( 'phone' ) ); ?>
				</a>
			</div>
		</div>
	</div>

	<section class="ifs-usp">
		<div class="ifs-container">
			<div class="ifs-usp__grid">
				<div class="ifs-usp__item">
					<?php ifs_the_icon( 'pin', 24 ); ?>
					<span><strong><?php echo esc_html( $ifs_travel ? $ifs_travel : 'Snel ter plaatse' ); ?></strong><span>vanaf onze locatie in Amsterdam</span></span>
				</div>
				<div class="ifs-usp__item">
					<?php ifs_the_icon( 'euro', 24 ); ?>
					<span><strong>Vaste prijs per m²</strong><span>geen verrassingen achteraf</span></span>
				</div>
				<div class="ifs-usp__item">
					<?php ifs_the_icon( 'star', 24 ); ?>
					<span><strong><?php echo esc_html( ifs_option( 'rating_score' ) ); ?> gemiddeld</strong><span><?php echo esc_html( ifs_option( 'rating_count' ) ); ?> beoordelingen</span></span>
				</div>
				<div class="ifs-usp__item">
					<?php ifs_the_icon( 'shield', 24 ); ?>
					<span><strong><?php echo esc_html( ifs_option( 'warranty_years' ) ); ?> jaar garantie</strong><span>op al ons stuc- en schilderwerk</span></span>
				</div>
			</div>
		</div>
	</section>

	<section class="ifs-section">
		<div class="ifs-container">
			<div class="ifs-layout">
				<article class="ifs-content">
					<?php the_content(); ?>

					<?php if ( $ifs_districts ) : ?>
						<h2>Wijken en kernen in <?php echo esc_html( $ifs_city ); ?></h2>
						<p>We werken onder meer in <?php echo esc_html( implode( ', ', $ifs_districts ) ); ?> — en alle omliggende buurten.</p>
					<?php endif; ?>
				</article>

				<aside class="ifs-aside">
					<div class="ifs-aside__card">
						<h3>Diensten in <?php echo esc_html( $ifs_city ); ?></h3>
						<ul style="list-style:none;padding:0;margin:0;display:grid;gap:.6rem;font-size:var(--ifs-fs-sm)">
							<?php foreach ( $ifs_services as $ifs_service ) : ?>
								<li>
									<a class="ifs-link-arrow" href="<?php echo esc_url( get_permalink( $ifs_service ) ); ?>">
										<?php echo esc_html( get_the_title( $ifs_service ) ); ?> <span aria-hidden="true">→</span>
									</a>
								</li>
							<?php endforeach; ?>
						</ul>
					</div>

					<div class="ifs-aside__card ifs-contact-card" style="background:var(--ifs-ink);color:#98A0A8">
						<h3 style="color:#fff">Direct contact</h3>
						<p style="color:#98A0A8">Even overleggen over je klus in <?php echo esc_html( $ifs_city ); ?>?</p>
						<a class="ifs-btn ifs-btn--light ifs-btn--block" href="<?php echo esc_url( ifs_phone_href() ); ?>">
							<?php ifs_the_icon( 'phone', 18 ); ?> <?php echo esc_html( ifs_option( 'phone' ) ); ?>
						</a>
					</div>
				</aside>
			</div>
		</div>
	</section>

	<?php if ( $ifs_reviews ) : ?>
		<section class="ifs-section ifs-section--tint">
			<div class="ifs-container">
				<div class="ifs-section-head ifs-section-head--center">
					<h2>Wat klanten zeggen</h2>
				</div>
				<div class="ifs-grid ifs-grid--3">
					<?php foreach ( $ifs_reviews as $ifs_review ) : ?>
						<?php ifs_review_card( $ifs_review ); ?>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<section class="ifs-quote" id="offerte">
		<div class="ifs-container">
			<div class="ifs-section-head ifs-section-head--center">
				<h2>Offerte voor je klus in <?php echo esc_html( $ifs_city ); ?></h2>
				<p class="ifs-lead">Vijf korte vragen. Reactie <?php echo esc_html( ifs_option( 'quote_response' ) ); ?>.</p>
			</div>
			<div class="ifs-narrow" style="max-width:860px">
				<?php get_template_part( 'template-parts/quote-form' ); ?>
			</div>
		</div>
	</section>

<?php endwhile; ?>

<?php
get_footer();
