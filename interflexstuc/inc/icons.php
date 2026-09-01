<?php
/**
 * Inline SVG-iconen (geen externe iconfont nodig).
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

/**
 * Geeft een inline SVG-icoon terug.
 *
 * @param string $name  Naam van het icoon.
 * @param int    $size  Grootte in pixels (viewBox blijft 24).
 * @return string
 */
function ifs_icon( $name, $size = 24 ) {
	$paths = array(
		'check'      => '<polyline points="20 6 9 17 4 12"/>',
		'check-circle' => '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
		'arrow-right'=> '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
		'phone'      => '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
		'mail'       => '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
		'pin'        => '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
		'clock'      => '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
		'star'       => '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
		'shield'     => '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
		'award'      => '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
		'euro'       => '<path d="M4 10h12M4 14h9"/><path d="M19 5.5A7.5 7.5 0 0 0 8 12a7.5 7.5 0 0 0 11 6.5"/>',
		'clipboard'  => '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 13h6M9 17h4"/>',
		'ruler'      => '<path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4z"/><path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/>',
		'brush'      => '<path d="M9.06 11.9 3 18v3h3l6.1-6.06"/><path d="m14 6 4 4"/><path d="M17.5 2.5a2.12 2.12 0 0 1 3 3L14 12l-4-4z"/>',
		'wall'       => '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 10h18M3 16h18M9 4v6M15 10v6M9 16v4"/>',
		'ceiling'    => '<path d="M3 4h18"/><rect x="5" y="8" width="14" height="12" rx="1"/><path d="M12 4v4"/>',
		'home'       => '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 13 15 13 15 22"/>',
		'building'   => '<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/><path d="M10 22v-4h4v4"/>',
		'layers'     => '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
		'sparkles'   => '<path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
		'calendar'   => '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
		'user'       => '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
		'users'      => '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
		'thumbs-up'  => '<path d="M7 22V11M2 13v7a2 2 0 0 0 2 2h13.28a2 2 0 0 0 2-1.7l1.38-9A2 2 0 0 0 18.7 9H14V5a3 3 0 0 0-3-3l-4 9"/>',
		'image'      => '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
		'spinner'    => '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
		'chevron-right' => '<polyline points="9 18 15 12 9 6"/>',
		'whatsapp'   => '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/>',
		'facebook'   => '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
		'instagram'  => '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
		'linkedin'   => '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-13h4v1.5A6 6 0 0 1 16 8z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
		'file-text'  => '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8M16 17H8M10 9H8"/>',
		'zap'        => '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
	);

	if ( ! isset( $paths[ $name ] ) ) {
		return '';
	}

	// Gevulde iconen krijgen geen contourlijn: die maakt de vorm op kleine
	// formaten onnodig zwaar en modderig.
	$filled = in_array( $name, array( 'star' ), true );

	return sprintf(
		'<svg width="%1$d" height="%1$d" viewBox="0 0 24 24" fill="%2$s" stroke="%3$s" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">%4$s</svg>',
		absint( $size ),
		$filled ? 'currentColor' : 'none',
		$filled ? 'none' : 'currentColor',
		$paths[ $name ]
	);
}

/**
 * Echo-variant van ifs_icon().
 *
 * @param string $name Naam van het icoon.
 * @param int    $size Grootte.
 */
function ifs_the_icon( $name, $size = 24 ) {
	echo ifs_icon( $name, $size ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- vaste, veilige SVG-set.
}

/**
 * Rij van vijf sterren.
 *
 * @param int $count Aantal gevulde sterren.
 * @return string
 */
function ifs_stars( $count = 5 ) {
	$out = '<span class="ifs-stars" role="img" aria-label="' . esc_attr( sprintf( '%d van de 5 sterren', $count ) ) . '">';
	for ( $i = 0; $i < $count; $i++ ) {
		$out .= ifs_icon( 'star', 17 );
	}
	return $out . '</span>';
}
