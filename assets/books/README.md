# Personal library covers

These small catalog images illustrate the 31 books on James's 2026 shelf. Native Son was confirmed by James. Cover artwork belongs to its respective rights holders. Some front covers show a different printing from the photographed copy.

Cover download sources and catalog records are recorded in `sources.json`. Images are served locally so browsing the shelf does not contact a third-party cover service.

`spines/` contains 26 cropped, straightened spine photographs and five flat SVG recreations for obscured spines. Original room photographs are not published. `spines/sources.json` distinguishes photographed and recreated artwork. The recreations are based on visible spine lettering, cover colors, and reference research, and are not represented as complete scans of the originals.

All 31 ratings were supplied by James: 30 in his completed spreadsheet and Nothing but the Night at 5/10 in his follow-up message. Review and quote text is hidden until supplied.

## Updating the library

Edit `books-data.js` in the site root. Each book has `rating` and `quote` fields. Leave `rating` as `null` until a personal rating is supplied, then enter a number from 1 to 10. Leave `quote` as an empty string until the selected passage is supplied. The displayed stars and passage update from those fields.

To add a book, add an entry and a local cover image. The visible count and the bookshelf's accessible label update automatically. No build step or additional library is required.
