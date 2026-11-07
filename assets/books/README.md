# Personal library covers

These small catalog images illustrate the 35 books on James's 2026 shelf. Native Son was confirmed by James. Cover artwork belongs to its respective rights holders. Some front covers show a different printing from the photographed copy.

Cover download sources and catalog records are recorded in `sources.json`. Images are served locally so browsing the shelf does not contact a third-party cover service.

`spines/` contains 28 cropped, straightened spine photographs and seven flat SVG recreations for obscured or unavailable spines. Original room photographs are not published. `spines/sources.json` distinguishes photographed and recreated artwork. The recreations are based on visible spine lettering, cover colors, and reference research, and are not represented as complete scans of the originals.

All 35 ratings were supplied by James: 30 in his completed spreadsheet, Nothing but the Night at 5/10 in his follow-up message, and four additions at 9, 8, 7, and 6 respectively: Batman Vol. 1: The Court of Owls, The Ruins, The Disposable Man, and Come With Me. Review and quote text is hidden until supplied.

The new Ruins and Come With Me spines are real photo crops found online. Batman and The Disposable Man use flat recreations. The photographed Come With Me printing is not verified against the publisher cover's ISBN; both represent the same title and publisher, with the distinction retained in provenance.

## Updating the library

Edit `books-data.js` in the site root. Each book has `rating` and `quote` fields. Leave `rating` as `null` until a personal rating is supplied, then enter a number from 1 to 10. Leave `quote` as an empty string until the selected passage is supplied. The displayed stars and passage update from those fields.

To add a book, add an entry and a local cover image. The visible count and the bookshelf's accessible label update automatically. No build step or additional library is required.

## Arranging books

Drag a spine to move it along the shelf. On touchscreens, a short swipe browses the shelf and a press-and-hold begins a move. A focused book can be moved with Alt + Left/Right. Reset order returns to the published catalog order. Arrangement is stored as book IDs in localStorage on that browser; ratings, covers, and titles stay tied to their IDs. New books append to a saved arrangement automatically. This changes the visitor's local view, not the published order for other visitors.
