<?php
/**
 * Offerteaanvraag in een venster.
 *
 * Staat één keer per pagina in de footer. Elke knop met data-quote-open
 * opent hem, zodat de bezoeker niet van pagina hoeft te wisselen.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;
?>
<dialog class="ifs-modal" id="ifs-quote-modal" aria-labelledby="ifs-modal-title">
	<div class="ifs-modal__head">
		<div>
			<p class="ifs-modal__eyebrow">Gratis en vrijblijvend</p>
			<h2 class="ifs-modal__title" id="ifs-modal-title">Bereken je richtprijs</h2>
		</div>
		<button type="button" class="ifs-modal__close" data-quote-close aria-label="Sluiten">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
		</button>
	</div>
	<div class="ifs-modal__body">
		<?php get_template_part( 'template-parts/quote-form', null, array( 'compact' => true ) ); ?>
	</div>
</dialog>
