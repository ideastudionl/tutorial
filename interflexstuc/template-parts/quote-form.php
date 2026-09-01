<?php
/**
 * Meerstaps offerte-wizard.
 *
 * Argumenten (via get_template_part):
 *   compact  bool   Toon geen zijkolom-onderdelen.
 *   preset   string Vooraf geselecteerde waarde voor stap 1.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

$ifs_steps  = ifs_quote_steps();
$ifs_total  = count( $ifs_steps ) + 1; // +1 voor de samenvattingsstap.
$ifs_preset = isset( $args['preset'] ) ? sanitize_key( $args['preset'] ) : '';
$ifs_uid    = wp_unique_id( 'ifs-wizard-' );
?>
<div class="ifs-wizard" id="<?php echo esc_attr( $ifs_uid ); ?>" data-wizard data-total="<?php echo esc_attr( $ifs_total ); ?>">

	<div class="ifs-wizard__head">
		<div class="ifs-wizard__progress">
			<span class="ifs-wizard__count" data-counter>Stap <b>1</b> van <?php echo esc_html( $ifs_total ); ?></span>
			<span class="ifs-wizard__time"><?php ifs_the_icon( 'clock', 14 ); ?> Klaar in ± 3 minuten</span>
		</div>
		<div class="ifs-wizard__bar" role="progressbar" aria-valuemin="1" aria-valuemax="<?php echo esc_attr( $ifs_total ); ?>" aria-valuenow="1" aria-label="Voortgang offerteaanvraag">
			<i data-bar style="width:<?php echo esc_attr( round( 100 / $ifs_total ) ); ?>%"></i>
		</div>
	</div>

	<form class="ifs-wizard__body" data-quote-form novalidate>

		<?php foreach ( $ifs_steps as $ifs_index => $ifs_step ) : ?>
			<section class="ifs-step-panel<?php echo 0 === $ifs_index ? ' is-active' : ''; ?>"
				data-panel="<?php echo esc_attr( $ifs_index + 1 ); ?>"
				<?php echo 0 === $ifs_index ? '' : 'hidden'; ?>>

				<h2><?php echo esc_html( $ifs_step['title'] ); ?></h2>

				<?php if ( ! empty( $ifs_step['hint'] ) ) : ?>
					<p class="ifs-step-panel__hint">
						<?php echo esc_html( sprintf( $ifs_step['hint'], ifs_option( 'quote_response' ) ) ); ?>
					</p>
				<?php endif; ?>

				<?php if ( 'fields' === $ifs_step['type'] ) : ?>

					<div class="ifs-fields ifs-fields--2">
						<?php foreach ( $ifs_step['fields'] as $ifs_key => $ifs_field ) : ?>
							<?php
							$ifs_id    = $ifs_uid . '-' . $ifs_key;
							$ifs_style = 'full' === $ifs_field['width'] ? ' style="grid-column:1/-1"' : '';
							?>
							<div class="ifs-field"<?php echo $ifs_style; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- vaste waarde. ?>>
								<label for="<?php echo esc_attr( $ifs_id ); ?>">
									<?php echo esc_html( $ifs_field['label'] ); ?>
									<?php if ( ! empty( $ifs_field['required'] ) ) : ?>
										<span class="req" aria-hidden="true">*</span>
									<?php endif; ?>
								</label>

								<?php if ( 'textarea' === $ifs_field['type'] ) : ?>
									<textarea id="<?php echo esc_attr( $ifs_id ); ?>" name="ifs_<?php echo esc_attr( $ifs_key ); ?>" rows="4"
										<?php echo ! empty( $ifs_field['required'] ) ? 'required' : ''; ?>></textarea>
								<?php else : ?>
									<input type="<?php echo esc_attr( $ifs_field['type'] ); ?>"
										id="<?php echo esc_attr( $ifs_id ); ?>"
										name="ifs_<?php echo esc_attr( $ifs_key ); ?>"
										<?php if ( ! empty( $ifs_field['autocomplete'] ) ) : ?>
											autocomplete="<?php echo esc_attr( $ifs_field['autocomplete'] ); ?>"
										<?php endif; ?>
										<?php echo ! empty( $ifs_field['required'] ) ? 'required' : ''; ?>>
								<?php endif; ?>

								<?php if ( ! empty( $ifs_field['hint'] ) ) : ?>
									<small><?php echo esc_html( $ifs_field['hint'] ); ?></small>
								<?php endif; ?>
								<span class="ifs-field__error" data-error hidden></span>
							</div>
						<?php endforeach; ?>
					</div>

					<div class="ifs-hp" aria-hidden="true">
						<label for="<?php echo esc_attr( $ifs_uid ); ?>-website">Laat dit veld leeg</label>
						<input type="text" id="<?php echo esc_attr( $ifs_uid ); ?>-website" name="ifs_website" tabindex="-1" autocomplete="off">
					</div>

				<?php else : ?>

					<?php
					$ifs_is_multi = 'multi' === $ifs_step['type'];
					$ifs_input    = $ifs_is_multi ? 'checkbox' : 'radio';
					$ifs_name     = 'ifs_' . $ifs_step['key'] . ( $ifs_is_multi ? '[]' : '' );
					?>
					<fieldset style="border:0;padding:0;margin:0">
						<legend class="screen-reader-text"><?php echo esc_html( $ifs_step['title'] ); ?></legend>
						<div class="ifs-options">
							<?php foreach ( $ifs_step['options'] as $ifs_value => $ifs_option_data ) : ?>
								<?php list( $ifs_label, $ifs_desc, $ifs_icon_name ) = $ifs_option_data; ?>
								<label class="ifs-option">
									<input type="<?php echo esc_attr( $ifs_input ); ?>"
										name="<?php echo esc_attr( $ifs_name ); ?>"
										value="<?php echo esc_attr( $ifs_value ); ?>"
										<?php checked( 0 === $ifs_index && $ifs_preset === $ifs_value ); ?>>
									<span class="ifs-option__box">
										<span class="ifs-option__icon"><?php ifs_the_icon( $ifs_icon_name, 21 ); ?></span>
										<span class="ifs-option__label">
											<strong><?php echo esc_html( $ifs_label ); ?></strong>
											<?php if ( $ifs_desc ) : ?>
												<span><?php echo esc_html( $ifs_desc ); ?></span>
											<?php endif; ?>
										</span>
										<span class="ifs-option__check" aria-hidden="true"><?php ifs_the_icon( 'check', 12 ); ?></span>
									</span>
								</label>
							<?php endforeach; ?>
						</div>
					</fieldset>

				<?php endif; ?>
			</section>
		<?php endforeach; ?>

		<?php // Samenvatting. ?>
		<section class="ifs-step-panel" data-panel="<?php echo esc_attr( $ifs_total ); ?>" hidden>
			<h2>Klopt dit zo?</h2>
			<p class="ifs-step-panel__hint">Controleer je aanvraag en verstuur hem. Je zit nergens aan vast.</p>

			<dl class="ifs-summary" data-summary></dl>

			<label class="ifs-consent">
				<input type="checkbox" name="ifs_consent" value="1" required>
				<span>
					Ik ga ermee akkoord dat <?php echo esc_html( ifs_option( 'company_name' ) ); ?> mijn gegevens gebruikt om contact met mij op te nemen over deze aanvraag, zoals beschreven in de
					<a href="<?php echo esc_url( get_privacy_policy_url() ? get_privacy_policy_url() : home_url( '/privacyverklaring/' ) ); ?>" target="_blank" rel="noopener">privacyverklaring</a>.
				</span>
			</label>
		</section>

		<div class="ifs-notice ifs-notice--err ifs-wizard__error" data-form-error hidden role="alert"></div>
	</form>

	<div class="ifs-wizard__nav">
		<button type="button" class="ifs-btn ifs-btn--ghost" data-prev hidden>
			<span aria-hidden="true">←</span> Vorige
		</button>
		<button type="button" class="ifs-btn ifs-btn--lg" data-next>
			Volgende stap <?php ifs_the_icon( 'arrow-right', 18 ); ?>
		</button>
		<button type="button" class="ifs-btn ifs-btn--lg" data-submit hidden>
			Aanvraag versturen <?php ifs_the_icon( 'arrow-right', 18 ); ?>
		</button>
	</div>

	<div class="ifs-wizard__done" data-done role="status" aria-live="polite">
		<div class="ifs-wizard__done-icon"><?php ifs_the_icon( 'check-circle', 36 ); ?></div>
		<h2>Je aanvraag is verstuurd</h2>
		<p data-done-message>We nemen <?php echo esc_html( ifs_option( 'quote_response' ) ); ?> contact met je op.</p>
		<p style="margin-top:1.5rem">
			<a class="ifs-btn ifs-btn--ghost" href="<?php echo esc_url( ifs_phone_href() ); ?>">
				<?php ifs_the_icon( 'phone', 18 ); ?> Liever direct bellen? <?php echo esc_html( ifs_option( 'phone' ) ); ?>
			</a>
		</p>
	</div>

</div>
