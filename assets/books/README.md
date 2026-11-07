# Personal library covers

These small catalog images illustrate the 31 books identified from James's five bookshelf photographs. Native Son was confirmed by James. The images are book covers, not copies of the books; artwork belongs to its respective rights holders. Some covers show a different printing from the photographed copy.

Cover download sources and catalog records are recorded in `sources.json`. Images are served locally so browsing the shelf does not contact a third-party cover service.

## Updating the library

Edit `books-data.js` in the site root. Each book has `rating` and `quote` fields. Leave `rating` as `null` until a personal rating is supplied, then enter a number from 1 to 10. Leave `quote` as an empty string until the selected passage is supplied. The displayed stars and passage update from those fields.

To add a book, add an entry and a local cover image. The visible count and the bookshelf's accessible label update automatically. No build step or additional library is required.
