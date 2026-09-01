<?php
/**
 * Afsluitende call-to-action-band.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;
?>
<section class="ifs-section ifs-section--tight">
	<div class="ifs-container">
		<div class="ifs-cta-band">
			<div class="ifs-cta-band__inner">
				<div>
					<h2>Klaar voor strak stucwerk?</h2>
					<p>Vraag een vrijblijvende offerte aan en weet <?php echo esc_html( ifs_option( 'quote_response' ) ); ?> waar je aan toe bent. Liever direct overleggen? Bel ons gerust.</p>
				</div>
				<div class="ifs-cta-band__actions">
					<a class="ifs-btn ifs-btn--lg" href="<?php echo esc_url( ifs_quote_url() ); ?>">Offerte aanvragen</a>
					<a class="ifs-btn ifs-btn--ghost ifs-btn--lg" style="--btn-fg:#fff;--btn-bd:rgba(255,255,255,.28)" href="<?php echo esc_url( ifs_phone_href() ); ?>">
						<?php ifs_the_icon( 'phone', 18 ); ?> <?php echo esc_html( ifs_option( 'phone' ) ); ?>
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
