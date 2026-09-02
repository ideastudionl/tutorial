<?php
/**
 * Template Name: Homepage
 *
 * Homepage: offerte-eerst, met bewijs, diensten, werkwijze, projecten en werkgebied.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

get_header();

$ifs_services = ifs_get_items( 'ifs_dienst', 6 );
$ifs_projects = ifs_get_items( 'ifs_project', 3 );
$ifs_reviews  = ifs_get_items( 'ifs_review', 3 );
$ifs_areas    = ifs_get_items( 'ifs_werkgebied', 24 );
?>

<?php // ---------- Hero: eerste wizardvraag staat meteen in beeld ---------- ?>
<section class="ifs-hero">
	<div class="ifs-container ifs-hero__inner">

		<div class="ifs-hero__content">
			<span class="ifs-eyebrow">Stukadoor in <?php echo esc_html( ifs_option( 'city' ) ); ?> &amp; omstreken</span>

			<h1><?php echo wp_kses( ifs_option( 'hero_title' ), array( 'em' => array(), 'br' => array() ) ); ?></h1>

			<p class="ifs-lead"><?php echo esc_html( wp_strip_all_tags( ifs_option( 'hero_text' ) ) ); ?></p>

			<div class="ifs-hero__actions">
				<a class="ifs-btn ifs-btn--lg" href="#offerte">
					Prijs in 3 minuten <?php ifs_the_icon( 'arrow-right', 18 ); ?>
				</a>
				<a class="ifs-btn ifs-btn--ghost ifs-btn--lg" href="<?php echo esc_url( ifs_phone_href() ); ?>">
					<?php ifs_the_icon( 'phone', 18 ); ?> <?php echo esc_html( ifs_option( 'phone' ) ); ?>
				</a>
			</div>

			<div class="ifs-hero__quickstart">
				<span class="ifs-hero__quickstart-label">Waar gaat het om?</span>
				<div class="ifs-places">
					<?php
					$ifs_quick = array(
						'wanden'       => 'Wanden stucen',
						'plafonds'     => 'Plafonds stucen',
						'sierpleister' => 'Sierpleister',
						'buitengevel'  => 'Buitengevel',
						'betonlook'    => 'Betonlook',
						'schilderwerk' => 'Schilderwerk',
					);
					foreach ( $ifs_quick as $ifs_value => $ifs_label ) :
						?>
						<a class="ifs-place" data-quote-preset="<?php echo esc_attr( $ifs_value ); ?>"
							href="<?php echo esc_url( add_query_arg( 'werk', $ifs_value, ifs_quote_url() ) ); ?>">
							<?php echo esc_html( $ifs_label ); ?>
							<span aria-hidden="true">→</span>
						</a>
					<?php endforeach; ?>
				</div>
			</div>

			<div class="ifs-hero__proof">
				<div class="ifs-hero__proof-item">
					<span class="ifs-hero__proof-icon"><?php ifs_the_icon( 'star', 19 ); ?></span>
					<span>
						<strong><?php echo esc_html( ifs_option( 'rating_score' ) ); ?> gemiddeld</strong>
						<span><?php echo esc_html( ifs_option( 'rating_count' ) ); ?> klantbeoordelingen</span>
					</span>
				</div>
				<div class="ifs-hero__proof-item">
					<span class="ifs-hero__proof-icon"><?php ifs_the_icon( 'shield', 19 ); ?></span>
					<span>
						<strong><?php echo esc_html( ifs_option( 'warranty_years' ) ); ?> jaar garantie</strong>
						<span>op de uitvoering</span>
					</span>
				</div>
				<div class="ifs-hero__proof-item">
					<span class="ifs-hero__proof-icon"><?php ifs_the_icon( 'award', 19 ); ?></span>
					<span>
						<strong><?php echo esc_html( ifs_option( 'years_active' ) ); ?>+ jaar ervaring</strong>
						<span><?php echo esc_html( ifs_option( 'projects_done' ) ); ?>+ projecten</span>
					</span>
				</div>
			</div>
		</div>

		<div class="ifs-hero__visual">
			<?php
			$ifs_hero_img = ! empty( $ifs_projects ) ? $ifs_projects[0]->ID : 0;
			ifs_thumb( $ifs_hero_img, 'ifs-hero', '' );
			?>
			<div class="ifs-hero__float ifs-hero__float--tl">
				<span class="ifs-hero__float-avatar" aria-hidden="true">✓</span>
				<span>
					<strong style="font-size:1rem">Vaste prijs vooraf</strong><br>
					<small>Geen verrassingen achteraf</small>
				</span>
			</div>
			<div class="ifs-hero__float ifs-hero__float--br">
				<?php echo ifs_stars( 5 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<strong><?php echo esc_html( ifs_option( 'rating_score' ) ); ?></strong>
				<small><?php echo esc_html( ifs_option( 'rating_count' ) ); ?> beoordelingen</small>
			</div>
		</div>

	</div>
</section>

<?php // ---------- USP-balk ---------- ?>
<section class="ifs-usp">
	<div class="ifs-container">
		<div class="ifs-usp__grid">
			<?php
			$ifs_usps = array(
				array( 'euro', 'Vaste prijs per m²', 'Wat in de offerte staat, is wat je betaalt.' ),
				array( 'clock', 'Reactie ' . ifs_option( 'quote_response' ), 'Ook op zaterdag bereikbaar.' ),
				array( 'shield', ifs_option( 'warranty_years' ) . ' jaar garantie', 'Op de uitvoering van al ons werk.' ),
				array( 'thumbs-up', 'Schoon opgeleverd', 'Afval mee, ruimte bezemschoon.' ),
			);
			foreach ( $ifs_usps as $ifs_usp ) :
				?>
				<div class="ifs-usp__item">
					<?php ifs_the_icon( $ifs_usp[0], 24 ); ?>
					<span>
						<strong><?php echo esc_html( $ifs_usp[1] ); ?></strong>
						<span><?php echo esc_html( $ifs_usp[2] ); ?></span>
					</span>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<?php // ---------- Offerte-wizard: het hart van de pagina ---------- ?>
<section class="ifs-quote" id="offerte">
	<div class="ifs-container">

		<div class="ifs-section-head ifs-section-head--center">
			<span class="ifs-eyebrow ifs-eyebrow--center">Offerte aanvragen</span>
			<h2>Weet binnen 3 minuten wat je klus kost</h2>
			<p class="ifs-lead">Beantwoord vijf korte vragen. Je krijgt <?php echo esc_html( ifs_option( 'quote_response' ) ); ?> een vrijblijvende prijsopgave die past bij jouw situatie — geen algemene richtprijs.</p>
		</div>

		<div class="ifs-quote__layout">
			<div>
				<?php get_template_part( 'template-parts/quote-form' ); ?>
			</div>

			<aside class="ifs-quote__aside">
				<div class="ifs-card">
					<h3>Wat je van ons krijgt</h3>
					<ul>
						<li><?php ifs_the_icon( 'check-circle', 19 ); ?> Een vaste prijs per vierkante meter, geen uurtje-factuurtje</li>
						<li><?php ifs_the_icon( 'check-circle', 19 ); ?> Duidelijk wat er wél en niet bij zit</li>
						<li><?php ifs_the_icon( 'check-circle', 19 ); ?> Een realistische start- en einddatum</li>
						<li><?php ifs_the_icon( 'check-circle', 19 ); ?> Vrijblijvend — je zit nergens aan vast</li>
					</ul>
				</div>

				<div class="ifs-card ifs-contact-card">
					<h3>Liever even overleggen?</h3>
					<p style="font-size:var(--ifs-fs-sm)">Bel ons gerust. We denken graag mee, ook als je nog niet weet welke afwerking je wilt.</p>
					<p>
						<a class="ifs-btn ifs-btn--light ifs-btn--block" href="<?php echo esc_url( ifs_phone_href() ); ?>">
							<?php ifs_the_icon( 'phone', 18 ); ?> <?php echo esc_html( ifs_option( 'phone' ) ); ?>
						</a>
					</p>
					<?php if ( ifs_whatsapp_href() ) : ?>
						<p style="margin-top:.6rem">
							<a class="ifs-btn ifs-btn--ghost ifs-btn--block" style="--btn-fg:#fff;--btn-bd:rgba(255,255,255,.25)" href="<?php echo esc_url( ifs_whatsapp_href() ); ?>" target="_blank" rel="noopener">
								<?php ifs_the_icon( 'whatsapp', 18 ); ?> WhatsApp ons
							</a>
						</p>
					<?php endif; ?>
				</div>
			</aside>
		</div>

	</div>
</section>

<?php // ---------- Diensten ---------- ?>
<?php if ( $ifs_services ) : ?>
	<section class="ifs-section">
		<div class="ifs-container">
			<div class="ifs-section-head">
				<span class="ifs-eyebrow">Onze diensten</span>
				<h2>Van één kamer behangklaar tot een complete gevel</h2>
				<p class="ifs-lead">We doen het stuc- én schilderwerk zelf. Eén partij voor het hele traject scheelt afstemming, wachttijd en discussie achteraf.</p>
			</div>

			<div class="ifs-grid ifs-grid--3">
				<?php foreach ( $ifs_services as $ifs_service ) : ?>
					<?php ifs_service_card( $ifs_service ); ?>
				<?php endforeach; ?>
			</div>
		</div>
	</section>
<?php endif; ?>

<?php // ---------- Werkwijze ---------- ?>
<section class="ifs-section ifs-section--ink">
	<div class="ifs-container">
		<div class="ifs-section-head">
			<span class="ifs-eyebrow">Zo werkt het</span>
			<h2>Vier stappen, geen verrassingen</h2>
		</div>

		<div class="ifs-steps">
			<?php
			$ifs_steps_list = array(
				array( 'Aanvraag', 'Je vult de vragen hierboven in of belt ons. We weten dan al waar het over gaat.' ),
				array( 'Opname &amp; prijs', 'Bij grotere klussen komen we vrijblijvend meten. Daarna volgt een vaste prijs per m².' ),
				array( 'Uitvoering', 'We schermen alles af, werken per ruimte en ruimen elke dag op.' ),
				array( 'Oplevering', 'We lopen het werk samen na. Op de uitvoering krijg je ' . ifs_option( 'warranty_years' ) . ' jaar garantie.' ),
			);
			foreach ( $ifs_steps_list as $ifs_i => $ifs_step_item ) :
				?>
				<div class="ifs-step">
					<div class="ifs-step__num"><?php echo esc_html( $ifs_i + 1 ); ?></div>
					<h3><?php echo wp_kses( $ifs_step_item[0], array() ); ?></h3>
					<p><?php echo esc_html( $ifs_step_item[1] ); ?></p>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<?php // ---------- Over ons / cijfers ---------- ?>
<section class="ifs-section">
	<div class="ifs-container">
		<div class="ifs-split">
			<div>
				<span class="ifs-eyebrow">Over Interflex Stuc</span>
				<h2>Vakwerk zie je pas als het af is</h2>
				<p class="ifs-lead">Een wand die overal even vlak is, een plafond zonder zichtbare naden, een hoek die kaarsrecht loopt. Dat vraagt tijd in de voorbereiding — en juist daar wordt in onze branche het vaakst op bezuinigd.</p>

				<ul class="ifs-checklist">
					<li><?php ifs_the_icon( 'check-circle', 21 ); ?> Vast team van ervaren stukadoors, geen wisselende inhuur</li>
					<li><?php ifs_the_icon( 'check-circle', 21 ); ?> Eén aanspreekpunt van opname tot oplevering</li>
					<li><?php ifs_the_icon( 'check-circle', 21 ); ?> Eerlijk advies — ook als stucwerk (nog) niet de oplossing is</li>
					<li><?php ifs_the_icon( 'check-circle', 21 ); ?> Werken in bewoonde woningen, netjes afgeschermd</li>
				</ul>

				<div class="ifs-stat-strip">
					<div class="ifs-stat">
						<strong><?php echo esc_html( ifs_option( 'years_active' ) ); ?>+</strong>
						<span>jaar ervaring</span>
					</div>
					<div class="ifs-stat">
						<strong><?php echo esc_html( ifs_option( 'projects_done' ) ); ?>+</strong>
						<span>afgeronde projecten</span>
					</div>
					<div class="ifs-stat">
						<strong><?php echo esc_html( ifs_option( 'rating_score' ) ); ?></strong>
						<span>gemiddelde beoordeling</span>
					</div>
				</div>

				<p style="margin-top:2rem">
					<a class="ifs-btn ifs-btn--ink" href="<?php echo esc_url( home_url( '/over-ons/' ) ); ?>">Meer over ons</a>
				</p>
			</div>

			<div class="ifs-split__visual">
				<?php ifs_thumb( ! empty( $ifs_projects[1] ) ? $ifs_projects[1]->ID : 0, 'ifs-card', 'ifs-media--ratio' ); ?>
			</div>
		</div>
	</div>
</section>

<?php // ---------- Projecten ---------- ?>
<?php if ( $ifs_projects ) : ?>
	<section class="ifs-section ifs-section--tint">
		<div class="ifs-container">
			<div class="ifs-section-head">
				<span class="ifs-eyebrow">Recent werk</span>
				<h2>Bekijk wat we voor anderen deden</h2>
			</div>

			<div class="ifs-projects">
				<?php foreach ( $ifs_projects as $ifs_project ) : ?>
					<?php ifs_project_card( $ifs_project ); ?>
				<?php endforeach; ?>
			</div>

			<p style="margin-top:2.5rem">
				<a class="ifs-btn ifs-btn--ghost" href="<?php echo esc_url( get_post_type_archive_link( 'ifs_project' ) ); ?>">Alle projecten bekijken</a>
			</p>
		</div>
	</section>
<?php endif; ?>

<?php // ---------- Reviews ---------- ?>
<?php if ( $ifs_reviews ) : ?>
	<section class="ifs-section">
		<div class="ifs-container">
			<div class="ifs-section-head ifs-section-head--center">
				<span class="ifs-eyebrow ifs-eyebrow--center">Klantbeoordelingen</span>
				<h2>Wat klanten over ons zeggen</h2>
				<p>
					<span class="ifs-rating-summary">
						<?php echo ifs_stars( 5 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<strong><?php echo esc_html( ifs_option( 'rating_score' ) ); ?> / 10</strong>
						<span>gemiddeld uit <?php echo esc_html( ifs_option( 'rating_count' ) ); ?> beoordelingen</span>
					</span>
				</p>
			</div>

			<div class="ifs-grid ifs-grid--3">
				<?php foreach ( $ifs_reviews as $ifs_review ) : ?>
					<?php ifs_review_card( $ifs_review ); ?>
				<?php endforeach; ?>
			</div>
		</div>
	</section>
<?php endif; ?>

<?php // ---------- Werkgebied ---------- ?>
<?php if ( $ifs_areas ) : ?>
	<section class="ifs-section ifs-section--tint">
		<div class="ifs-container">
			<div class="ifs-split">
				<div>
					<span class="ifs-eyebrow">Werkgebied</span>
					<h2>Actief in Amsterdam, Noord-Holland en Utrecht</h2>
					<p class="ifs-lead">Vanuit onze locatie aan de <?php echo esc_html( ifs_option( 'street' ) ); ?> zijn we snel ter plaatse. Daardoor kunnen we ook kleinere klussen goed inplannen.</p>
					<p>
						<a class="ifs-link-arrow" href="<?php echo esc_url( get_post_type_archive_link( 'ifs_werkgebied' ) ); ?>">
							Bekijk het hele werkgebied <span aria-hidden="true">→</span>
						</a>
					</p>
				</div>

				<div>
					<div class="ifs-places">
						<?php foreach ( $ifs_areas as $ifs_area ) : ?>
							<a class="ifs-place" href="<?php echo esc_url( get_permalink( $ifs_area ) ); ?>">
								<?php ifs_the_icon( 'pin', 15 ); ?>
								<?php echo esc_html( get_the_title( $ifs_area ) ); ?>
							</a>
						<?php endforeach; ?>
					</div>
					<p style="margin-top:1.25rem;font-size:var(--ifs-fs-sm);color:var(--ifs-stone)">
						Staat jouw plaats er niet bij? Bel ons — we kijken graag of het past.
					</p>
				</div>
			</div>
		</div>
	</section>
<?php endif; ?>

<?php // ---------- FAQ ---------- ?>
<section class="ifs-section">
	<div class="ifs-container">
		<div class="ifs-section-head ifs-section-head--center">
			<span class="ifs-eyebrow ifs-eyebrow--center">Veelgestelde vragen</span>
			<h2>Goed om te weten</h2>
		</div>
		<div class="ifs-narrow">
			<?php ifs_faq_list( 8 ); ?>
		</div>
	</div>
</section>

<?php get_template_part( 'template-parts/cta' ); ?>

<?php
get_footer();
