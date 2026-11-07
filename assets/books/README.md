# Personal library covers

These small catalog images illustrate the 35 books on James's 2026 shelf. Native Son was confirmed by James. Cover artwork belongs to its respective rights holders. Some front covers show a different printing from the photographed copy.

Cover download sources and catalog records are recorded in `sources.json`. Images are served locally so browsing the shelf does not contact a third-party cover service.

`spines/` contains 35 flat SVG designs inspired by the displayed front covers. Each design uses the cover's palette, typography, and simple graphic motifs. The Batman and Disposable Man example artwork is preserved. `spines/sources.json` records the cover reference for every design. These are cover-based illustrations rather than scans of physical book spines.

All 35 ratings were supplied by James: 30 in his completed spreadsheet, Nothing but the Night at 5/10 in his follow-up message, and four additions at 9, 8, 7, and 6 respectively: Batman Vol. 1: The Court of Owls, The Ruins, The Disposable Man, and Come With Me. Review and quote text is hidden until supplied.

## Updating the library

Edit `books-data.js` in the site root. Each book has `rating` and `quote` fields. Leave `rating` as `null` until a personal rating is supplied, then enter a number from 1 to 10. Leave `quote` as an empty string until the selected passage is supplied. The displayed stars and passage update from those fields.

To add a book, add an entry, a local front-cover image, and a matching flat SVG spine. The visible count and the bookshelf's accessible label update automatically. No build step or additional library is required.

## Arranging books

Drag a spine to move it along the shelf. On touchscreens, a short swipe browses the shelf and a press-and-hold begins a move. A focused book can be moved with Alt + Left/Right. Reset order returns to the published catalog order. Arrangement is stored as book IDs in localStorage on that browser; ratings, covers, and titles stay tied to their IDs. New books append to a saved arrangement automatically. This changes the visitor's local view, not the published order for other visitors.
