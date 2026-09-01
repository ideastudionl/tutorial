<?php
/**
 * Zoekformulier.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

$ifs_search_id = wp_unique_id( 'ifs-search-' );
?>
<form role="search" method="get" class="ifs-fields" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="grid-template-columns:1fr auto;align-items:end;max-width:520px;margin-inline:auto">
	<div class="ifs-field">
		<label for="<?php echo esc_attr( $ifs_search_id ); ?>" class="screen-reader-text">Zoeken op de site</label>
		<input type="search" id="<?php echo esc_attr( $ifs_search_id ); ?>" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="Waar ben je naar op zoek?">
	</div>
	<button type="submit" class="ifs-btn">Zoeken</button>
</form>
