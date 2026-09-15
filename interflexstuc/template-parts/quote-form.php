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

	<?php $ifs_recent = ifs_recent_quotes( 1 ); ?>
	<?php if ( $ifs_recent ) : ?>
		<p class="ifs-activity">
			<span class="ifs-activity__dot" aria-hidden="true"></span>
			<?php
			printf(
				/* translators: 1: tijdsduur zoals "3 uur", 2: plaatsnaam. */
				esc_html__( '%1$s geleden een offerte aangevraagd uit %2$s', 'interflexstuc' ),
				esc_html( $ifs_recent[0]['ago'] ),
				esc_html( $ifs_recent[0]['city'] )
			);
			?>
		</p>
	<?php endif; ?>

	<div class="ifs-wizard__head">
		<div class="ifs-wizard__progress">
			<span class="ifs-wizard__count" data-counter>Stap <b>1</b> van <?php echo esc_html( $ifs_total ); ?></span>
			<span class="ifs-wizard__time"><?php ifs_the_icon( 'clock', 14 ); ?> Klaar in ± 3 minuten</span>
		</div>
		<div class="ifs-wizard__bar" role="progressbar" aria-valuemin="1" aria-valuemax="<?php echo esc_attr( $ifs_total ); ?>" aria-valuenow="1" aria-label="Voortgang offerteaanvraag">
			<i data-bar style="width:<?php echo esc_attr( round( 100 / $ifs_total ) ); ?>%"></i>
		</div>

		<div class="ifs-price-panel" data-price hidden>
			<div class="ifs-price-panel__figure">
				<span class="ifs-price-panel__label">Richtprijs voor jouw klus</span>
				<strong data-price-value aria-live="polite"></strong>
				<span class="ifs-price-panel__unit" data-price-unit></span>
			</div>
			<p class="ifs-price-panel__note">
				<?php ifs_the_icon( 'clipboard', 15 ); ?>
				Indicatie op basis van je antwoorden, inclusief materiaal. Na een gratis opname leggen we de prijs vast.
			</p>
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

					<p class="ifs-reassure">
						<?php ifs_the_icon( 'shield', 17 ); ?>
						We gebruiken je gegevens alleen voor deze aanvraag. Geen nieuwsbrief, geen doorverkoop, geen telefoontjes van andere bedrijven.
					</p>

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
								<?php
								$ifs_label     = $ifs_option_data['label'];
								$ifs_desc      = isset( $ifs_option_data['desc'] ) ? $ifs_option_data['desc'] : '';
								$ifs_icon_name = isset( $ifs_option_data['icon'] ) ? $ifs_option_data['icon'] : 'clipboard';
								?>
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

					<?php if ( 'area' === ( $ifs_step['custom'] ?? '' ) ) : ?>
						<div class="ifs-area" data-area>
							<div class="ifs-area__or"><span>of vul het exact in</span></div>

							<div class="ifs-area__tabs" role="tablist" aria-label="Manier van opgeven">
								<button type="button" role="tab" aria-selected="true" data-area-tab="direct">Ik weet de m&sup2;</button>
								<button type="button" role="tab" aria-selected="false" data-area-tab="reken">Reken het uit</button>
							</div>

							<div class="ifs-area__panel is-active" data-area-panel="direct">
								<div class="ifs-field">
									<label for="<?php echo esc_attr( $ifs_uid ); ?>-m2">Oppervlakte in m&sup2;</label>
									<input type="number" inputmode="decimal" min="1" max="99999" step="0.1"
										id="<?php echo esc_attr( $ifs_uid ); ?>-m2"
										data-area-direct placeholder="bijvoorbeeld 48">
								</div>
							</div>

							<div class="ifs-area__panel" data-area-panel="reken" hidden>
								<p class="ifs-area__hint">Vul per muur of plafond de breedte en hoogte in. We tellen ze bij elkaar op.</p>
								<div data-area-rows></div>
								<button type="button" class="ifs-area__add" data-area-add>
									<?php ifs_the_icon( 'check', 15 ); ?> Nog een vlak toevoegen
								</button>
							</div>

							<p class="ifs-area__total" data-area-total hidden>
								Totaal: <strong data-area-total-value></strong>
							</p>

							<input type="hidden" name="ifs_oppervlakte_m2" value="" data-area-value>
						</div>
					<?php endif; ?>

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

	<ul class="ifs-wizard__trust">
		<li><?php ifs_the_icon( 'check-circle', 16 ); ?> Gratis en vrijblijvend</li>
		<li><?php ifs_the_icon( 'check-circle', 16 ); ?> Geen aanbetaling</li>
		<li><?php ifs_the_icon( 'check-circle', 16 ); ?> <?php echo esc_html( ifs_option( 'warranty_years' ) ); ?> jaar garantie op de uitvoering</li>
	</ul>

	<div class="ifs-wizard__done" data-done role="status" aria-live="polite">
		<div class="ifs-wizard__done-icon"><?php ifs_the_icon( 'check-circle', 36 ); ?></div>
		<h2>Je aanvraag is verstuurd</h2>
		<p data-done-message>We nemen <?php echo esc_html( ifs_option( 'quote_response' ) ); ?> contact met je op.</p>
		<ul class="ifs-wizard__next">
			<li><span>1</span> Je krijgt direct een bevestiging per e-mail</li>
			<li><span>2</span> We bellen je om de klus door te nemen</li>
			<li><span>3</span> Je ontvangt een offerte met een vaste prijs per m²</li>
		</ul>
		<p style="margin-top:1.5rem">
			<a class="ifs-btn ifs-btn--ghost" href="<?php echo esc_url( ifs_phone_href() ); ?>">
				<?php ifs_the_icon( 'phone', 18 ); ?> Liever direct bellen? <?php echo esc_html( ifs_option( 'phone' ) ); ?>
			</a>
		</p>
	</div>

</div>
