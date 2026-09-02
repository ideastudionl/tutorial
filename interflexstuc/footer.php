<?php
/**
 * Footer.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

$ifs_socials = array(
	'facebook'  => ifs_option( 'facebook' ),
	'instagram' => ifs_option( 'instagram' ),
	'linkedin'  => ifs_option( 'linkedin' ),
);
$ifs_socials = array_filter( $ifs_socials );
?>
</main>

<footer class="ifs-footer">
	<div class="ifs-container">
		<div class="ifs-footer__grid">

			<div class="ifs-footer__brand">
				<a class="ifs-brand ifs-brand--light" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
					<?php ifs_the_logo(); ?>
				</a>
				<p>Stukadoors- en afbouwbedrijf uit Amsterdam. Glad stucwerk, sierpleister, betonlook, gevelstuc en schilderwerk voor woningen, VvE&rsquo;s en bedrijfspanden.</p>

				<?php if ( $ifs_socials ) : ?>
					<div class="ifs-socials" style="margin-top:1.5rem">
						<?php foreach ( $ifs_socials as $ifs_network => $ifs_url ) : ?>
							<a href="<?php echo esc_url( $ifs_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr( ucfirst( $ifs_network ) ); ?>">
								<?php ifs_the_icon( $ifs_network, 18 ); ?>
							</a>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>
			</div>

			<div>
				<h4>Diensten</h4>
				<?php
				wp_nav_menu(
					array(
						'theme_location' => 'services',
						'container'      => false,
						'depth'          => 1,
						'fallback_cb'    => false,
					)
				);
				?>
			</div>

			<div>
				<h4>Werkgebied</h4>
				<?php
				wp_nav_menu(
					array(
						'theme_location' => 'werkgebied',
						'container'      => false,
						'depth'          => 1,
						'fallback_cb'    => false,
					)
				);
				?>
			</div>

			<div>
				<h4>Contact</h4>
				<ul class="ifs-footer__contact">
					<li><?php ifs_the_icon( 'pin', 17 ); ?>
						<span>
							<?php echo esc_html( ifs_option( 'street' ) ); ?><br>
							<?php echo esc_html( trim( ifs_option( 'postcode' ) . ' ' . ifs_option( 'city' ) ) ); ?>
						</span>
					</li>
					<li><?php ifs_the_icon( 'phone', 17 ); ?>
						<a href="<?php echo esc_url( ifs_phone_href() ); ?>"><?php echo esc_html( ifs_option( 'phone' ) ); ?></a>
					</li>
					<?php if ( ifs_option( 'email' ) ) : ?>
						<li><?php ifs_the_icon( 'mail', 17 ); ?>
							<a href="mailto:<?php echo esc_attr( ifs_option( 'email' ) ); ?>"><?php echo esc_html( ifs_option( 'email' ) ); ?></a>
						</li>
					<?php endif; ?>
				</ul>

				<?php $ifs_hours = ifs_hours(); ?>
				<?php if ( $ifs_hours ) : ?>
					<h4 style="margin-top:2rem">Openingstijden</h4>
					<ul>
						<?php foreach ( $ifs_hours as $ifs_label => $ifs_time ) : ?>
							<li class="ifs-footer__hours">
								<span><?php echo esc_html( $ifs_label ); ?></span>
								<strong><?php echo esc_html( $ifs_time ); ?></strong>
							</li>
						<?php endforeach; ?>
					</ul>
				<?php endif; ?>
			</div>

		</div>

		<div class="ifs-footer__bottom">
			<p style="margin:0">
				&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( ifs_option( 'company_name' ) ); ?>
				<?php if ( ifs_option( 'kvk' ) ) : ?>
					&middot; KvK <?php echo esc_html( ifs_option( 'kvk' ) ); ?>
				<?php endif; ?>
				<?php if ( ifs_option( 'btw' ) ) : ?>
					&middot; BTW <?php echo esc_html( ifs_option( 'btw' ) ); ?>
				<?php endif; ?>
			</p>
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'legal',
					'container'      => false,
					'depth'          => 1,
					'fallback_cb'    => false,
				)
			);
			?>
		</div>
	</div>
</footer>

<div class="ifs-sticky-cta">
	<a class="ifs-btn ifs-btn--ghost" href="<?php echo esc_url( ifs_phone_href() ); ?>">
		<?php ifs_the_icon( 'phone', 18 ); ?> Bel direct
	</a>
	<a class="ifs-btn" href="<?php echo esc_url( ifs_quote_url() ); ?>">Offerte aanvragen</a>
</div>

<?php wp_footer(); ?>
</body>
</html>
