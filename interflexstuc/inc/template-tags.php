<?php
/**
 * Herbruikbare weergavefuncties.
 *
 * @package Interflex_Stuc
 */

defined( 'ABSPATH' ) || exit;

/**
 * Toont de afbeelding van een post, of een nette placeholder.
 *
 * @param int    $post_id Post ID.
 * @param string $size    Afbeeldingsformaat.
 * @param string $class   Extra classes op de wrapper.
 */
function ifs_thumb( $post_id = 0, $size = 'ifs-card', $class = 'ifs-media--ratio' ) {
	$post_id = $post_id ? $post_id : get_the_ID();

	printf( '<div class="ifs-media %s">', esc_attr( $class ) );

	if ( has_post_thumbnail( $post_id ) ) {
		echo get_the_post_thumbnail(
			$post_id,
			$size,
			array(
				'loading' => 'lazy',
				'alt'     => esc_attr( get_the_title( $post_id ) ),
			)
		);
	} else {
		echo '<div class="ifs-media__ph">' . ifs_icon( 'image', 40 ) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	echo '</div>';
}

/**
 * Kruimelpad met JSON-LD.
 */
function ifs_breadcrumbs() {
	if ( is_front_page() ) {
		return;
	}

	$items = array( array( 'name' => 'Home', 'url' => home_url( '/' ) ) );

	if ( is_singular( 'ifs_dienst' ) ) {
		$items[] = array( 'name' => 'Diensten', 'url' => get_post_type_archive_link( 'ifs_dienst' ) );
	} elseif ( is_singular( 'ifs_project' ) ) {
		$items[] = array( 'name' => 'Projecten', 'url' => get_post_type_archive_link( 'ifs_project' ) );
	} elseif ( is_singular( 'ifs_werkgebied' ) ) {
		$items[] = array( 'name' => 'Werkgebied', 'url' => get_post_type_archive_link( 'ifs_werkgebied' ) );
	} elseif ( is_singular( 'post' ) ) {
		$blog = get_option( 'page_for_posts' );
		if ( $blog ) {
			$items[] = array( 'name' => get_the_title( $blog ), 'url' => get_permalink( $blog ) );
		}
	}

	if ( is_singular() ) {
		$parent_id = wp_get_post_parent_id( get_the_ID() );
		if ( $parent_id ) {
			$items[] = array( 'name' => get_the_title( $parent_id ), 'url' => get_permalink( $parent_id ) );
		}
		$items[] = array( 'name' => get_the_title(), 'url' => get_permalink() );
	} elseif ( is_post_type_archive() ) {
		$items[] = array( 'name' => post_type_archive_title( '', false ), 'url' => '' );
	} elseif ( is_search() ) {
		$items[] = array( 'name' => 'Zoekresultaten', 'url' => '' );
	} elseif ( is_404() ) {
		$items[] = array( 'name' => 'Pagina niet gevonden', 'url' => '' );
	} elseif ( is_archive() ) {
		$items[] = array( 'name' => wp_strip_all_tags( get_the_archive_title() ), 'url' => '' );
	}

	echo '<nav class="ifs-crumbs" aria-label="Kruimelpad">';
	$last = count( $items ) - 1;
	foreach ( $items as $i => $item ) {
		if ( $i > 0 ) {
			echo '<span aria-hidden="true">/</span>';
		}
		if ( $i === $last || empty( $item['url'] ) ) {
			printf( '<span aria-current="page">%s</span>', esc_html( $item['name'] ) );
		} else {
			printf( '<a href="%s">%s</a>', esc_url( $item['url'] ), esc_html( $item['name'] ) );
		}
	}
	echo '</nav>';

	$list = array();
	foreach ( $items as $i => $item ) {
		$entry = array(
			'@type'    => 'ListItem',
			'position' => $i + 1,
			'name'     => $item['name'],
		);
		if ( ! empty( $item['url'] ) ) {
			$entry['item'] = $item['url'];
		}
		$list[] = $entry;
	}

	printf(
		'<script type="application/ld+json">%s</script>',
		wp_json_encode(
			array(
				'@context'        => 'https://schema.org',
				'@type'           => 'BreadcrumbList',
				'itemListElement' => $list,
			)
		)
	);
}

/**
 * Haalt een lijst met posts op van een eigen post type.
 *
 * @param string $type  Post type.
 * @param int    $count Aantal.
 * @return WP_Post[]
 */
function ifs_get_items( $type, $count = 6 ) {
	return get_posts(
		array(
			'post_type'      => $type,
			'posts_per_page' => $count,
			'post_status'    => 'publish',
			'orderby'        => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
		)
	);
}

/**
 * Toont een dienstkaart.
 *
 * @param WP_Post $post Dienst.
 */
function ifs_service_card( $post ) {
	$icon  = get_post_meta( $post->ID, 'ifs_icon', true );
	$price = get_post_meta( $post->ID, 'ifs_price_from', true );
	?>
	<a class="ifs-card ifs-card--link ifs-service" href="<?php echo esc_url( get_permalink( $post ) ); ?>">
		<?php ifs_thumb( $post->ID, 'ifs-card', '' ); ?>
		<div class="ifs-service__body">
			<?php if ( $icon ) : ?>
				<div class="ifs-icon-box"><?php ifs_the_icon( $icon ); ?></div>
			<?php endif; ?>
			<h3><?php echo esc_html( get_the_title( $post ) ); ?></h3>
			<p><?php echo esc_html( wp_trim_words( get_the_excerpt( $post ), 20 ) ); ?></p>
			<?php if ( $price ) : ?>
				<p><span class="ifs-badge"><?php echo esc_html( 'vanaf ' . $price ); ?></span></p>
			<?php endif; ?>
			<span class="ifs-link-arrow">Bekijk deze dienst <span aria-hidden="true">→</span></span>
		</div>
	</a>
	<?php
}

/**
 * Toont een reviewkaart.
 *
 * @param WP_Post $post Review.
 */
function ifs_review_card( $post ) {
	$author = get_post_meta( $post->ID, 'ifs_author', true );
	$city   = get_post_meta( $post->ID, 'ifs_city', true );
	$job    = get_post_meta( $post->ID, 'ifs_job', true );
	$rating = (int) get_post_meta( $post->ID, 'ifs_rating', true );
	$rating = $rating > 0 ? min( 5, $rating ) : 5;
	$author = $author ? $author : get_the_title( $post );
	$meta   = array_filter( array( $job, $city ) );
	?>
	<article class="ifs-card ifs-review">
		<?php echo ifs_stars( $rating ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<div class="ifs-review__text"><?php echo esc_html( wp_strip_all_tags( get_the_content( null, false, $post ) ) ); ?></div>
		<footer class="ifs-review__meta">
			<span class="ifs-review__avatar" aria-hidden="true"><?php echo esc_html( mb_strtoupper( mb_substr( $author, 0, 1 ) ) ); ?></span>
			<span>
				<strong><?php echo esc_html( $author ); ?></strong>
				<?php if ( $meta ) : ?>
					<span><?php echo esc_html( implode( ' · ', $meta ) ); ?></span>
				<?php endif; ?>
			</span>
		</footer>
	</article>
	<?php
}

/**
 * Toont een projectkaart.
 *
 * @param WP_Post $post Project.
 */
function ifs_project_card( $post ) {
	$location = get_post_meta( $post->ID, 'ifs_location', true );
	$surface  = get_post_meta( $post->ID, 'ifs_surface', true );
	$meta     = array_filter( array( $location, $surface ) );
	?>
	<a class="ifs-project" href="<?php echo esc_url( get_permalink( $post ) ); ?>">
		<?php ifs_thumb( $post->ID, 'ifs-card', '' ); ?>
		<div class="ifs-project__cap">
			<strong><?php echo esc_html( get_the_title( $post ) ); ?></strong>
			<?php if ( $meta ) : ?>
				<span><?php echo esc_html( implode( ' · ', $meta ) ); ?></span>
			<?php endif; ?>
		</div>
	</a>
	<?php
}

/**
 * Toont de FAQ-accordeon en de bijbehorende FAQPage-structured data.
 *
 * @param int $count Maximum aantal vragen.
 */
function ifs_faq_list( $count = 8 ) {
	$items = ifs_get_items( 'ifs_faq', $count );
	if ( ! $items ) {
		return;
	}

	echo '<div class="ifs-faq">';
	foreach ( $items as $item ) {
		printf(
			'<details class="ifs-faq__item"><summary class="ifs-faq__q">%s</summary><div class="ifs-faq__a">%s</div></details>',
			esc_html( get_the_title( $item ) ),
			wp_kses_post( apply_filters( 'the_content', $item->post_content ) )
		);
	}
	echo '</div>';

	$entities = array();
	foreach ( $items as $item ) {
		$entities[] = array(
			'@type'          => 'Question',
			'name'           => wp_strip_all_tags( get_the_title( $item ) ),
			'acceptedAnswer' => array(
				'@type' => 'Answer',
				'text'  => wp_strip_all_tags( $item->post_content ),
			),
		);
	}

	printf(
		'<script type="application/ld+json">%s</script>',
		wp_json_encode(
			array(
				'@context'   => 'https://schema.org',
				'@type'      => 'FAQPage',
				'mainEntity' => $entities,
			)
		)
	);
}

/**
 * Paginatie in themastijl.
 */
function ifs_pagination() {
	$links = paginate_links(
		array(
			'type'      => 'array',
			'prev_text' => '←',
			'next_text' => '→',
		)
	);

	if ( ! $links ) {
		return;
	}

	echo '<nav class="ifs-pagination" aria-label="Paginanavigatie">';
	foreach ( $links as $link ) {
		echo wp_kses_post( $link );
	}
	echo '</nav>';
}

/**
 * Geeft het primaire telefoonnummer als klikbare knopinhoud.
 *
 * @return string
 */
function ifs_phone_button() {
	return sprintf(
		'<a class="ifs-btn ifs-btn--ghost" href="%1$s">%2$s %3$s</a>',
		esc_url( ifs_phone_href() ),
		ifs_icon( 'phone', 18 ),
		esc_html( ifs_option( 'phone' ) )
	);
}

/**
 * Terugvalmenu wanneer er nog geen navigatiemenu is ingesteld.
 */
function ifs_menu_fallback() {
	$items = array(
		'Diensten'   => get_post_type_archive_link( 'ifs_dienst' ),
		'Projecten'  => get_post_type_archive_link( 'ifs_project' ),
		'Werkgebied' => get_post_type_archive_link( 'ifs_werkgebied' ),
		'Offerte'    => ifs_quote_url(),
	);

	echo '<ul>';
	foreach ( $items as $label => $url ) {
		printf( '<li><a href="%s">%s</a></li>', esc_url( $url ), esc_html( $label ) );
	}
	echo '</ul>';
}
