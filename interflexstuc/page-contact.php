<?php
/**
 * Template Name: Contact
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

get_header();

if ( have_posts() ) {
	the_post();
}
?>

<div class="ifs-page-head">
	<div class="ifs-container">
		<?php ifs_breadcrumbs(); ?>
		<h1><?php the_title(); ?></h1>
		<p class="ifs-lead">Bel, mail of vraag direct online een offerte aan. We reageren <?php echo esc_html( ifs_option( 'quote_response' ) ); ?>.</p>
	</div>
</div>

<section class="ifs-section">
	<div class="ifs-container">
		<div class="ifs-split">

			<div>
				<h2>Contactgegevens</h2>

				<ul class="ifs-checklist" style="gap:1.25rem">
					<li>
						<?php ifs_the_icon( 'phone', 21 ); ?>
						<span>
							<strong style="display:block;color:var(--ifs-ink)">Telefoon</strong>
							<a href="<?php echo esc_url( ifs_phone_href() ); ?>"><?php echo esc_html( ifs_option( 'phone' ) ); ?></a>
						</span>
					</li>
					<?php if ( ifs_option( 'email' ) ) : ?>
						<li>
							<?php ifs_the_icon( 'mail', 21 ); ?>
							<span>
								<strong style="display:block;color:var(--ifs-ink)">E-mail</strong>
								<a href="mailto:<?php echo esc_attr( ifs_option( 'email' ) ); ?>"><?php echo esc_html( ifs_option( 'email' ) ); ?></a>
							</span>
						</li>
					<?php endif; ?>
					<li>
						<?php ifs_the_icon( 'pin', 21 ); ?>
						<span>
							<strong style="display:block;color:var(--ifs-ink)">Adres</strong>
							<?php echo esc_html( ifs_address_line() ); ?>
							<?php if ( ifs_option( 'maps_url' ) ) : ?>
								<br><a href="<?php echo esc_url( ifs_option( 'maps_url' ) ); ?>" target="_blank" rel="noopener">Route plannen</a>
							<?php endif; ?>
						</span>
					</li>
				</ul>

				<?php $ifs_hours = ifs_hours(); ?>
				<?php if ( $ifs_hours ) : ?>
					<h3 style="margin-top:2.5rem">Openingstijden</h3>
					<table class="ifs-price-table" style="max-width:420px">
						<tbody>
							<?php foreach ( $ifs_hours as $ifs_label => $ifs_time ) : ?>
								<tr>
									<td><?php echo esc_html( $ifs_label ); ?></td>
									<td><?php echo esc_html( $ifs_time ); ?></td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				<?php endif; ?>

				<?php if ( ifs_option( 'kvk' ) || ifs_option( 'btw' ) ) : ?>
					<p style="margin-top:2rem;font-size:var(--ifs-fs-sm);color:var(--ifs-stone)">
						<?php if ( ifs_option( 'kvk' ) ) : ?>
							KvK <?php echo esc_html( ifs_option( 'kvk' ) ); ?><br>
						<?php endif; ?>
						<?php if ( ifs_option( 'btw' ) ) : ?>
							BTW <?php echo esc_html( ifs_option( 'btw' ) ); ?>
						<?php endif; ?>
					</p>
				<?php endif; ?>

				<?php if ( get_the_content() ) : ?>
					<div class="ifs-content" style="margin-top:2rem"><?php the_content(); ?></div>
				<?php endif; ?>
			</div>

			<div>
				<h2>Direct een offerte</h2>
				<p class="ifs-lead" style="margin-bottom:1.75rem">Weet in drie minuten wat je klus kost.</p>
				<?php get_template_part( 'template-parts/quote-form' ); ?>
			</div>

		</div>
	</div>
</section>

<?php
get_footer();
