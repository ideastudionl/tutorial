<?php
/**
 * Structured data (schema.org) en meta-informatie voor SEO.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

/**
 * Plaatst het LocalBusiness-blok in de head.
 */
function ifs_localbusiness_schema() {
	$hours   = array();
	$daymap  = array(
		'maandag'   => 'Monday',
		'dinsdag'   => 'Tuesday',
		'woensdag'  => 'Wednesday',
		'donderdag' => 'Thursday',
		'vrijdag'   => 'Friday',
		'zaterdag'  => 'Saturday',
		'zondag'    => 'Sunday',
	);

	foreach ( ifs_hours() as $label => $time ) {
		if ( ! $time || false !== stripos( $time, 'gesloten' ) ) {
			continue;
		}

		$days  = array();
		$lower = mb_strtolower( $label );
		foreach ( $daymap as $nl => $en ) {
			if ( false !== mb_strpos( $lower, $nl ) ) {
				$days[] = $en;
			}
		}

		// "Maandag t/m zaterdag" → volledige reeks tussen begin en eind.
		if ( 2 === count( $days ) && preg_match( '/t\/m|tot en met|–|-/u', $lower ) ) {
			$order = array_values( $daymap );
			$start = array_search( $days[0], $order, true );
			$end   = array_search( $days[1], $order, true );
			if ( false !== $start && false !== $end && $end > $start ) {
				$days = array_slice( $order, $start, $end - $start + 1 );
			}
		}

		if ( ! $days ) {
			continue;
		}

		$times = preg_split( '/\s*[–-]\s*/u', $time );
		if ( count( $times ) < 2 ) {
			continue;
		}

		$hours[] = array(
			'@type'     => 'OpeningHoursSpecification',
			'dayOfWeek' => $days,
			'opens'     => trim( $times[0] ),
			'closes'    => trim( $times[1] ),
		);
	}

	$schema = array(
		'@context'    => 'https://schema.org',
		'@type'       => 'HomeAndConstructionBusiness',
		'@id'         => home_url( '/#organisatie' ),
		'name'        => ifs_option( 'company_name' ),
		'description' => get_bloginfo( 'description' ),
		'url'         => home_url( '/' ),
		'telephone'   => ifs_option( 'phone' ),
		'email'       => ifs_option( 'email' ),
		'priceRange'  => '€€',
		'address'     => array(
			'@type'           => 'PostalAddress',
			'streetAddress'   => ifs_option( 'street' ),
			'postalCode'      => ifs_option( 'postcode' ),
			'addressLocality' => ifs_option( 'city' ),
			'addressCountry'  => 'NL',
		),
	);

	$logo = get_theme_mod( 'custom_logo' );
	if ( $logo ) {
		$src = wp_get_attachment_image_src( $logo, 'full' );
		if ( $src ) {
			$schema['logo']  = $src[0];
			$schema['image'] = $src[0];
		}
	}

	if ( $hours ) {
		$schema['openingHoursSpecification'] = $hours;
	}

	$socials = array_filter( array( ifs_option( 'facebook' ), ifs_option( 'instagram' ), ifs_option( 'linkedin' ) ) );
	if ( $socials ) {
		$schema['sameAs'] = array_values( $socials );
	}

	$areas = ifs_get_items( 'ifs_werkgebied', 40 );
	if ( $areas ) {
		$schema['areaServed'] = array_map(
			function ( $area ) {
				$city = get_post_meta( $area->ID, 'ifs_city', true );
				return array(
					'@type' => 'City',
					'name'  => $city ? $city : get_the_title( $area ),
				);
			},
			$areas
		);
	}

	$score = ifs_option( 'rating_score' );
	$count = (int) ifs_option( 'rating_count' );
	if ( $score && $count > 0 ) {
		$schema['aggregateRating'] = array(
			'@type'       => 'AggregateRating',
			'ratingValue' => str_replace( ',', '.', $score ),
			'reviewCount' => $count,
			'bestRating'  => '10',
			'worstRating' => '1',
		);
	}

	$services = ifs_get_items( 'ifs_dienst', 20 );
	if ( $services ) {
		$schema['hasOfferCatalog'] = array(
			'@type'      => 'OfferCatalog',
			'name'       => 'Diensten',
			'itemListElement' => array_map(
				function ( $service ) {
					return array(
						'@type'       => 'Offer',
						'itemOffered' => array(
							'@type'       => 'Service',
							'name'        => get_the_title( $service ),
							'description' => wp_strip_all_tags( get_the_excerpt( $service ) ),
							'url'         => get_permalink( $service ),
						),
					);
				},
				$services
			),
		);
	}

	printf( '<script type="application/ld+json">%s</script>' . "\n", wp_json_encode( $schema ) );
}
add_action( 'wp_head', 'ifs_localbusiness_schema', 20 );

/**
 * Meta description en Open Graph-tags.
 */
function ifs_meta_tags() {
	$title = wp_get_document_title();
	$desc  = get_bloginfo( 'description' );
	$image = '';

	if ( is_singular() ) {
		$excerpt = get_the_excerpt();
		if ( $excerpt ) {
			$desc = wp_strip_all_tags( $excerpt );
		}
		if ( has_post_thumbnail() ) {
			$src = wp_get_attachment_image_src( get_post_thumbnail_id(), 'ifs-wide' );
			if ( $src ) {
				$image = $src[0];
			}
		}
	}

	$desc = trim( wp_html_excerpt( $desc, 158, '…' ) );

	printf( '<meta name="description" content="%s">' . "\n", esc_attr( $desc ) );
	printf( '<meta property="og:site_name" content="%s">' . "\n", esc_attr( get_bloginfo( 'name' ) ) );
	printf( '<meta property="og:title" content="%s">' . "\n", esc_attr( $title ) );
	printf( '<meta property="og:description" content="%s">' . "\n", esc_attr( $desc ) );
	printf( '<meta property="og:type" content="%s">' . "\n", is_singular() ? 'article' : 'website' );
	printf( '<meta property="og:locale" content="nl_NL">' . "\n" );
	printf( '<meta property="og:url" content="%s">' . "\n", esc_url( is_singular() ? get_permalink() : home_url( add_query_arg( array() ) ) ) );

	if ( $image ) {
		printf( '<meta property="og:image" content="%s">' . "\n", esc_url( $image ) );
		printf( '<meta name="twitter:card" content="summary_large_image">' . "\n" );
	} else {
		printf( '<meta name="twitter:card" content="summary">' . "\n" );
	}

	if ( is_singular() ) {
		printf( '<link rel="canonical" href="%s">' . "\n", esc_url( get_permalink() ) );
	}
}
add_action( 'wp_head', 'ifs_meta_tags', 5 );
