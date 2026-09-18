<?php
/**
 * App shell. Every front-end request renders this same markup; the
 * sidebar (note list) and reading pane are owned entirely by
 * assets/js/app.js from here on, so switching notes never reloads
 * the page.
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<div id="obsidian-notes-app" class="obsidian-app" aria-live="polite">
	<noscript>
		<p><?php esc_html_e( 'This theme requires JavaScript to browse notes. Please enable it in your browser.', 'obsidian-notes' ); ?></p>
	</noscript>
</div>

<?php
get_footer();
