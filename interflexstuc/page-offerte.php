<?php
/**
 * Template Name: Offerte aanvragen
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

get_header();

if ( have_posts() ) {
	the_post();
}

$ifs_reviews = ifs_get_items( 'ifs_review', 2 );
?>

<div class="ifs-page-head">
	<div class="ifs-container">
		<?php ifs_breadcrumbs(); ?>
		<span class="ifs-eyebrow">Vrijblijvend &amp; gratis</span>
		<h1>Vraag je offerte aan</h1>
		<p class="ifs-lead">Beantwoord vijf korte vragen — dat kost je ongeveer drie minuten. Je krijgt <?php echo esc_html( ifs_option( 'quote_response' ) ); ?> een prijsopgave die past bij jouw klus.</p>
	</div>
</div>

<section class="ifs-quote">
	<div class="ifs-container">
		<div class="ifs-quote__layout">
			<div>
				<?php get_template_part( 'template-parts/quote-form' ); ?>

				<?php if ( get_the_content() ) : ?>
					<div class="ifs-content" style="margin-top:2.5rem">
						<?php the_content(); ?>
					</div>
				<?php endif; ?>
			</div>

			<aside class="ifs-quote__aside">
				<div class="ifs-card">
					<h3>Wat je van ons krijgt</h3>
					<ul>
						<li><?php ifs_the_icon( 'check-circle', 19 ); ?> Vaste prijs per m², geen uurtje-factuurtje</li>
						<li><?php ifs_the_icon( 'check-circle', 19 ); ?> Duidelijk wat er wél en niet bij zit</li>
						<li><?php ifs_the_icon( 'check-circle', 19 ); ?> Realistische start- en einddatum</li>
						<li><?php ifs_the_icon( 'check-circle', 19 ); ?> <?php echo esc_html( ifs_option( 'warranty_years' ) ); ?> jaar garantie op de uitvoering</li>
					</ul>
				</div>

				<?php foreach ( $ifs_reviews as $ifs_review ) : ?>
					<?php ifs_review_card( $ifs_review ); ?>
				<?php endforeach; ?>

				<div class="ifs-card ifs-contact-card">
					<h3>Liever bellen?</h3>
					<p style="font-size:var(--ifs-fs-sm)"><?php echo esc_html( implode( ' · ', array_keys( ifs_hours() ) ) ); ?></p>
					<p>
						<a class="ifs-btn ifs-btn--light ifs-btn--block" href="<?php echo esc_url( ifs_phone_href() ); ?>">
							<?php ifs_the_icon( 'phone', 18 ); ?> <?php echo esc_html( ifs_option( 'phone' ) ); ?>
						</a>
					</p>
				</div>
			</aside>
		</div>
	</div>
</section>

<?php
get_footer();
