# myBook API — Postman Examples

Base URL: `http://localhost:3000/api/books`

## GET all
GET `/api/books`

## GET one
GET `/api/books/1`

## POST
POST `/api/books`

Body → raw → JSON:

```json
{
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "genre": ["Fantasy", "Adventure"]
}
```

Returns `201 Created`.

## PUT
PUT `/api/books/1`

```json
{
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "genre": ["Fantasy", "Adventure", "Classic"]
}
```

The book ID stays unchanged.

## DELETE
DELETE `/api/books/1`

Returns `200 OK` when successful.

## Validation

`POST` and `PUT` return `400 Bad Request` when title/author is missing or `genre` is not a non-empty array.

Example:

```json
{
  "error": "Title, author, and at least one genre are required"
}
```

## Status codes

- `200 OK` — successful GET/PUT/DELETE
- `201 Created` — successful POST
- `400 Bad Request` — invalid request data
- `404 Not Found` — book does not exist
- `500 Internal Server Error` — server/data error
