/**
 * Obsidian Notes — app shell.
 *
 * Renders the note list (sidebar) and reading pane (main column) as a
 * single React tree. Selecting a note in the sidebar fetches its content
 * from the core REST API and swaps the reading pane in place; the URL is
 * kept in sync with history.pushState so links/back-forward still work,
 * but nothing ever triggers a full page reload.
 */
( function () {
	'use strict';

	var e = React.createElement;
	var useState = React.useState;
	var useEffect = React.useEffect;
	var useCallback = React.useCallback;
	var useRef = React.useRef;

	var config = window.ObsidianNotesConfig || {};
	var REST_URL = config.restUrl;
	var PER_PAGE = config.perPage || 30;

	var THEME_KEY = 'obsidianNotes.theme';
	var FONT_KEY = 'obsidianNotes.font';

	function readStored( key, fallback ) {
		try {
			return window.localStorage.getItem( key ) || fallback;
		} catch ( err ) {
			return fallback;
		}
	}

	function writeStored( key, value ) {
		try {
			window.localStorage.setItem( key, value );
		} catch ( err ) {
			/* Storage may be unavailable (private mode, disabled cookies) — ignore. */
		}
	}

	function formatDate( iso ) {
		try {
			return new Date( iso ).toLocaleDateString( undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			} );
		} catch ( err ) {
			return '';
		}
	}

	function decodeEntities( html ) {
		var el = document.createElement( 'textarea' );
		el.innerHTML = html;
		return el.value;
	}

	/* ---------------------------------------------------------------- */
	/* Data hooks                                                        */
	/* ---------------------------------------------------------------- */

	function useNoteList( search ) {
		var _a = useState( [] ),
			notes = _a[ 0 ],
			setNotes = _a[ 1 ];
		var _b = useState( true ),
			loading = _b[ 0 ],
			setLoading = _b[ 1 ];
		var _c = useState( 1 ),
			page = _c[ 0 ],
			setPage = _c[ 1 ];
		var _d = useState( true ),
			hasMore = _d[ 0 ],
			setHasMore = _d[ 1 ];
		var _e = useState( null ),
			error = _e[ 0 ],
			setError = _e[ 1 ];

		var requestId = useRef( 0 );

		var load = useCallback(
			function ( targetPage, append ) {
				var thisRequest = ++requestId.current;
				setLoading( true );
				setError( null );

				var url =
					REST_URL +
					'/posts?per_page=' +
					PER_PAGE +
					'&page=' +
					targetPage +
					'&_fields=id,slug,title,date,excerpt,obsidian_reading_time' +
					( search ? '&search=' + encodeURIComponent( search ) : '' );

				fetch( url )
					.then( function ( res ) {
						if ( ! res.ok ) {
							throw new Error( 'Failed to load notes (' + res.status + ')' );
						}
						var totalPagesHeader = res.headers.get( 'X-WP-TotalPages' );
						setHasMore( targetPage < parseInt( totalPagesHeader || '1', 10 ) );
						return res.json();
					} )
					.then( function ( data ) {
						if ( thisRequest !== requestId.current ) {
							return;
						}
						setNotes( function ( prev ) {
							return append ? prev.concat( data ) : data;
						} );
						setLoading( false );
					} )
					.catch( function ( err ) {
						if ( thisRequest !== requestId.current ) {
							return;
						}
						setError( err.message );
						setLoading( false );
					} );
			},
			[ search ]
		);

		useEffect(
			function () {
				setPage( 1 );
				load( 1, false );
			},
			[ search, load ]
		);

		var loadMore = useCallback(
			function () {
				var next = page + 1;
				setPage( next );
				load( next, true );
			},
			[ page, load ]
		);

		return { notes: notes, loading: loading, hasMore: hasMore, error: error, loadMore: loadMore };
	}

	function useNote( slug ) {
		var _a = useState( null ),
			note = _a[ 0 ],
			setNote = _a[ 1 ];
		var _b = useState( false ),
			loading = _b[ 0 ],
			setLoading = _b[ 1 ];
		var _c = useState( null ),
			error = _c[ 0 ],
			setError = _c[ 1 ];

		useEffect(
			function () {
				if ( ! slug ) {
					setNote( null );
					return;
				}

				var cancelled = false;
				setLoading( true );
				setError( null );

				fetch( REST_URL + '/posts?slug=' + encodeURIComponent( slug ) + '&_fields=id,slug,title,date,content,excerpt,obsidian_reading_time,link' )
					.then( function ( res ) {
						if ( ! res.ok ) {
							throw new Error( 'Failed to load note (' + res.status + ')' );
						}
						return res.json();
					} )
					.then( function ( data ) {
						if ( cancelled ) {
							return;
						}
						if ( ! data.length ) {
							throw new Error( 'This note could not be found.' );
						}
						setNote( data[ 0 ] );
						setLoading( false );
					} )
					.catch( function ( err ) {
						if ( cancelled ) {
							return;
						}
						setError( err.message );
						setLoading( false );
					} );

				return function () {
					cancelled = true;
				};
			},
			[ slug ]
		);

		return { note: note, loading: loading, error: error };
	}

	/* ---------------------------------------------------------------- */
	/* Components                                                        */
	/* ---------------------------------------------------------------- */

	function NoteListItem( props ) {
		var note = props.note;
		var isActive = props.isActive;
		var onSelect = props.onSelect;

		return e(
			'button',
			{
				className: 'on-note-item' + ( isActive ? ' is-active' : '' ),
				onClick: function () {
					onSelect( note.slug );
				},
			},
			e( 'span', { className: 'on-note-item__title' }, decodeEntities( note.title.rendered ) || '(untitled)' ),
			e(
				'span',
				{ className: 'on-note-item__meta' },
				formatDate( note.date ) + ' · ' + note.obsidian_reading_time + ' min read'
			)
		);
	}

	function Sidebar( props ) {
		var activeSlug = props.activeSlug;
		var onSelect = props.onSelect;
		var theme = props.theme;
		var setTheme = props.setTheme;
		var font = props.font;
		var setFont = props.setFont;
		var isOpenOnMobile = props.isOpenOnMobile;

		var _s = useState( '' );
		var search = _s[ 0 ];
		var setSearch = _s[ 1 ];

		var list = useNoteList( search );

		return e(
			'aside',
			{ className: 'on-sidebar' + ( isOpenOnMobile ? ' is-open' : '' ) },
			e(
				'div',
				{ className: 'on-sidebar__header' },
				e( 'p', { className: 'on-sidebar__title' }, config.siteTitle || 'Notes' ),
				e(
					'div',
					{ className: 'on-search' },
					e( 'span', { 'aria-hidden': 'true' }, '⌕' ),
					e( 'input', {
						type: 'text',
						placeholder: 'Search notes…',
						value: search,
						onChange: function ( ev ) {
							setSearch( ev.target.value );
						},
					} )
				)
			),
			e(
				'nav',
				{ className: 'on-note-list', 'aria-label': 'Notes' },
				list.notes.map( function ( note ) {
					return e( NoteListItem, {
						key: note.id,
						note: note,
						isActive: note.slug === activeSlug,
						onSelect: onSelect,
					} );
				} ),
				! list.loading && ! list.notes.length
					? e( 'p', { className: 'on-note-list__empty' }, 'No notes found.' )
					: null,
				list.loading ? e( 'p', { className: 'on-note-list__loading' }, 'Loading…' ) : null,
				! list.loading && list.hasMore
					? e(
							'button',
							{ className: 'on-note-list__load-more', onClick: list.loadMore },
							'Load more'
					  )
					: null
			),
			e(
				'div',
				{ className: 'on-sidebar__footer' },
				e(
					'div',
					{ className: 'on-toggle-group', role: 'group', 'aria-label': 'Colour theme' },
					e(
						'button',
						{
							className: theme === 'dark' ? 'is-active' : '',
							onClick: function () {
								setTheme( 'dark' );
							},
						},
						'Dark'
					),
					e(
						'button',
						{
							className: theme === 'light' ? 'is-active' : '',
							onClick: function () {
								setTheme( 'light' );
							},
						},
						'Light'
					)
				),
				e(
					'div',
					{ className: 'on-toggle-group', role: 'group', 'aria-label': 'Font' },
					e(
						'button',
						{
							className: font === 'sans' ? 'is-active' : '',
							onClick: function () {
								setFont( 'sans' );
							},
						},
						'Sans'
					),
					e(
						'button',
						{
							className: font === 'serif' ? 'is-active' : '',
							onClick: function () {
								setFont( 'serif' );
							},
						},
						'Serif'
					)
				)
			)
		);
	}

	function ReadingPane( props ) {
		var slug = props.slug;
		var noteData = useNote( slug );

		if ( ! slug ) {
			return e(
				'div',
				{ className: 'on-empty-state' },
				e( 'h2', null, 'Select a note' ),
				e( 'p', null, 'Choose a post from the list on the left to start reading.' )
			);
		}

		if ( noteData.error ) {
			return e(
				'div',
				{ className: 'on-error-state' },
				e( 'h2', null, 'Something went wrong' ),
				e( 'p', null, noteData.error )
			);
		}

		if ( noteData.loading || ! noteData.note ) {
			return e(
				'div',
				{ className: 'on-skeleton' },
				e( 'div', { className: 'on-skeleton__line', style: { width: '60%', height: 28 } } ),
				e( 'div', { className: 'on-skeleton__line', style: { width: '30%', marginTop: 20 } } ),
				e( 'div', { className: 'on-skeleton__line', style: { width: '100%', marginTop: 30 } } ),
				e( 'div', { className: 'on-skeleton__line', style: { width: '95%' } } ),
				e( 'div', { className: 'on-skeleton__line', style: { width: '88%' } } )
			);
		}

		var note = noteData.note;

		return e(
			'article',
			{ className: 'on-note' },
			e( 'h1', { className: 'on-note__title' }, decodeEntities( note.title.rendered ) ),
			e(
				'div',
				{ className: 'on-note__meta' },
				e( 'span', null, formatDate( note.date ) ),
				e( 'span', null, note.obsidian_reading_time + ' min read' )
			),
			e( 'div', {
				className: 'on-note__body',
				dangerouslySetInnerHTML: { __html: note.content.rendered },
			} )
		);
	}

	function App() {
		var _t = useState( function () {
			return readStored( THEME_KEY, 'dark' );
		} );
		var theme = _t[ 0 ];
		var setThemeState = _t[ 1 ];

		var _f = useState( function () {
			return readStored( FONT_KEY, 'sans' );
		} );
		var font = _f[ 0 ];
		var setFontState = _f[ 1 ];

		var _slug = useState( function () {
			return config.initialSlug || null;
		} );
		var slug = _slug[ 0 ];
		var setSlugState = _slug[ 1 ];

		var _mobileOpen = useState( false );
		var mobileOpen = _mobileOpen[ 0 ];
		var setMobileOpen = _mobileOpen[ 1 ];

		useEffect( function () {
			document.documentElement.setAttribute( 'data-on-theme', theme );
			writeStored( THEME_KEY, theme );
		}, [ theme ] );

		useEffect( function () {
			document.documentElement.setAttribute( 'data-on-font', font );
			writeStored( FONT_KEY, font );
		}, [ font ] );

		useEffect( function () {
			function onPopState( ev ) {
				setSlugState( ( ev.state && ev.state.slug ) || null );
			}
			window.addEventListener( 'popstate', onPopState );
			return function () {
				window.removeEventListener( 'popstate', onPopState );
			};
		}, [] );

		var selectNote = useCallback( function ( nextSlug ) {
			setSlugState( nextSlug );
			setMobileOpen( false );
			var url = config.homeUrl.replace( /\/$/, '' ) + '/' + nextSlug + '/';
			window.history.pushState( { slug: nextSlug }, '', url );
		}, [] );

		return e(
			React.Fragment,
			null,
			e(
				'div',
				{ className: 'on-mobile-bar' },
				e(
					'button',
					{
						onClick: function () {
							setMobileOpen( ! mobileOpen );
						},
					},
					mobileOpen ? 'Close' : 'Notes'
				)
			),
			e( Sidebar, {
				activeSlug: slug,
				onSelect: selectNote,
				theme: theme,
				setTheme: setThemeState,
				font: font,
				setFont: setFontState,
				isOpenOnMobile: mobileOpen,
			} ),
			e( ReadingPane, { slug: slug } )
		);
	}

	function mount() {
		var container = document.getElementById( 'obsidian-notes-app' );
		if ( ! container ) {
			return;
		}
		document.body.classList.add( 'obsidian-notes-body' );
		var root = ReactDOM.createRoot( container );
		root.render( e( App, null ) );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', mount );
	} else {
		mount();
	}
} )();
