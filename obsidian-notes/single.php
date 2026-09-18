<?php
/**
 * Single post template.
 *
 * The React app (assets/js/app.js) renders every route client-side from
 * index.php, but WordPress still needs a single.php so that a direct
 * permalink request, a crawler without JavaScript, or a syndication
 * feed gets real server-rendered content rather than an empty shell.
 * When JS is available, obsidian_notes_get_requested_slug() hands this
 * same post's slug to the app so it opens instantly instead of the
 * newest note.
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<div id="obsidian-notes-app" class="obsidian-app" aria-live="polite">
	<noscript>
		<main class="on-note">
			<?php
			while ( have_posts() ) :
				the_post();
				?>
				<h1 class="on-note__title"><?php the_title(); ?></h1>
				<p class="on-note__meta"><?php echo esc_html( get_the_date() ); ?></p>
				<div class="on-note__body">
					<?php the_content(); ?>
				</div>
			<?php endwhile; ?>
		</main>
	</noscript>
</div>

<?php
get_footer();
