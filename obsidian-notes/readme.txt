=== Obsidian Notes ===
Contributors: mladgorchev
Tags: blog, two-columns, custom-colors, threaded-comments, translation-ready, block-styles
Requires at least: 5.9
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A minimalist theme that borrows its layout from the Obsidian note-taking app: a searchable note list on the left, a reading pane on the right, and instant switching between posts with no page reload.

== Description ==

Obsidian Notes turns your blog into something that feels like a personal knowledge base. The sidebar lists your posts the way a note-taking app lists files; clicking one loads it straight into the reading pane on the right using the WordPress REST API, so browsing between posts never reloads the page.

Features:

* Editor-style two-pane layout: note list on the left, content on the right.
* Instant, no-reload navigation between posts, built with React and the core REST API.
* A strict black & white light/dark mode toggle.
* A font switcher between a serif typeface (EB Garamond) and a modern sans-serif (Inter), both self-hosted with the theme.
* Full keyboard/URL support: selecting a note updates the address bar and browser history, and a direct link to a post still server-renders that post for search engines and users without JavaScript.
* Built-in search across post titles and content.
* Responsive: the sidebar collapses behind a toggle on small screens.

Obsidian Notes ships its own copies of React, ReactDOM, EB Garamond, and Inter, so nothing is loaded from a third-party CDN and the theme works entirely self-hosted.

== Installation ==

1. Upload the `obsidian-notes` folder to the `/wp-content/themes/` directory, or install it through the Appearance > Themes screen in your WordPress admin.
2. Activate the theme through the 'Appearance > Themes' menu in WordPress.
3. Publish some posts — they will appear in the sidebar automatically.

== Frequently Asked Questions ==

= Does this theme require a page builder or plugin? =

No. It works out of the box with standard WordPress posts and the built-in REST API.

= Can I use block-editor blocks in my posts? =

Yes. Post content is rendered exactly as the REST API returns it, which includes normal Gutenberg block output.

= Does this work with JavaScript disabled? =

Yes for reading a single post: single.php and page.php render the post server-side as a fallback. Browsing the full note list requires JavaScript, since that experience is the point of the theme.

== Changelog ==

= 1.0.0 =
* Initial release.

== Credits ==

* React and ReactDOM (c) Meta Platforms, Inc., MIT License — https://react.dev
* EB Garamond, SIL Open Font License — https://fonts.google.com/specimen/EB+Garamond
* Inter, SIL Open Font License — https://fonts.google.com/specimen/Inter
