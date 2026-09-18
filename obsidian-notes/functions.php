<?php
/**
 * Obsidian Notes theme bootstrap.
 */

defined( 'ABSPATH' ) || exit;

define( 'OBSIDIAN_NOTES_VERSION', '1.0.0' );

function obsidian_notes_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );
	add_theme_support( 'automatic-feed-links' );

	register_nav_menus(
		array(
			'primary' => __( 'Primary Menu', 'obsidian-notes' ),
		)
	);
}
add_action( 'after_setup_theme', 'obsidian_notes_setup' );

/**
 * The theme is a single-page app shell: the sidebar (note list) and the
 * reading pane both live in assets/js/app.js and talk to the core REST
 * API (/wp-json/wp/v2/posts) so that clicking a note in the sidebar swaps
 * the reading pane instantly, with the URL kept in sync via
 * history.pushState — no full page reload.
 */
function obsidian_notes_enqueue_assets() {
	wp_enqueue_style(
		'obsidian-notes-fonts',
		get_template_directory_uri() . '/assets/css/fonts.css',
		array(),
		OBSIDIAN_NOTES_VERSION
	);

	wp_enqueue_style(
		'obsidian-notes-style',
		get_stylesheet_uri(),
		array(),
		OBSIDIAN_NOTES_VERSION
	);

	wp_enqueue_style(
		'obsidian-notes-app',
		get_template_directory_uri() . '/assets/css/app.css',
		array( 'obsidian-notes-style', 'obsidian-notes-fonts' ),
		OBSIDIAN_NOTES_VERSION
	);

	// React + ReactDOM (production UMD builds), bundled with the theme so
	// no remote script is loaded and the theme works fully self-hosted —
	// required for the WordPress.org theme directory.
	wp_enqueue_script( 'react', get_template_directory_uri() . '/assets/js/react.production.min.js', array(), '18.3.1', true );
	wp_enqueue_script( 'react-dom', get_template_directory_uri() . '/assets/js/react-dom.production.min.js', array( 'react' ), '18.3.1', true );

	wp_enqueue_script(
		'obsidian-notes-app',
		get_template_directory_uri() . '/assets/js/app.js',
		array( 'react', 'react-dom', 'wp-api-fetch' ),
		OBSIDIAN_NOTES_VERSION,
		true
	);

	wp_localize_script(
		'obsidian-notes-app',
		'ObsidianNotesConfig',
		array(
			'restUrl'    => esc_url_raw( rest_url( 'wp/v2' ) ),
			'nonce'      => wp_create_nonce( 'wp_rest' ),
			'homeUrl'    => esc_url_raw( home_url( '/' ) ),
			'siteTitle'  => get_bloginfo( 'name' ),
			'perPage'    => 30,
			'initialSlug' => obsidian_notes_get_requested_slug(),
		)
	);
}
add_action( 'wp_enqueue_scripts', 'obsidian_notes_enqueue_assets' );

/**
 * When a permalink for a single post is requested directly, pass its slug
 * to the app so it can open that note immediately instead of the newest
 * one, while everything after that first paint is still client-side.
 */
function obsidian_notes_get_requested_slug() {
	global $wp_query;

	if ( isset( $wp_query ) && $wp_query->is_single() && $wp_query->get_queried_object() instanceof WP_Post ) {
		return $wp_query->get_queried_object()->post_name;
	}

	return '';
}

/**
 * Widen the REST posts response with the bits the reading pane needs
 * (rendered content is already included by core; we add reading time).
 */
function obsidian_notes_register_rest_fields() {
	register_rest_field(
		'post',
		'obsidian_reading_time',
		array(
			'get_callback' => function ( $post_arr ) {
				$content    = get_post_field( 'post_content', $post_arr['id'] );
				$word_count = str_word_count( wp_strip_all_tags( $content ) );
				return max( 1, (int) ceil( $word_count / 200 ) );
			},
		)
	);
}
add_action( 'rest_api_init', 'obsidian_notes_register_rest_fields' );
