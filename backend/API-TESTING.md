# myBook API Testing Guide

This guide describes how to test the current myBook backend with Postman.

## 1. Before Testing

Start the server from the `backend` directory:

```bash
npm install
npm start
```

If no `start` script is configured:

```bash
node server.js
```

The server should be available at:

```text
http://localhost:3000
```

Create:

```text
backend/.env
```

with:

```env
JWT_SECRET=replace_this_with_your_own_secret_key
```

## 2. Recommended Postman Variables

Create a Postman environment with:

| Variable | Example |
|---|---|
| `baseUrl` | `http://localhost:3000` |
| `token` | Leave empty initially |
| `bookId` | Leave empty initially |

Use:

```text
{{baseUrl}}
```

For protected endpoints add:

```http
Authorization: Bearer {{token}}
```

## 3. Authentication Tests

### Test 1 — Register User

```text
POST {{baseUrl}}/api/register
```

Headers:

```http
Content-Type: application/json
```

Body:

```json
{
  "username": "Belle",
  "email": "belle@example.com",
  "password": "MyPassword123"
}
```

Expected:

```text
201 Created
```

Example:

```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "username": "Belle",
    "email": "belle@example.com"
  }
}
```

The response must not contain the plaintext password or password hash.

---

### Test 2 — Register With Missing Data

```text
POST {{baseUrl}}/api/register
```

Body:

```json
{
  "username": "Belle"
}
```

Expected:

```text
400 Bad Request
```

Example:

```json
{
  "error": "Username, email, and password are required"
}
```

---

### Test 3 — Duplicate Email

Register another user with the same email.

```json
{
  "username": "AnotherUser",
  "email": "belle@example.com",
  "password": "AnotherPassword123"
}
```

Expected:

```text
409 Conflict
```

Example:

```json
{
  "error": "Email is already registered"
}
```

---

### Test 4 — Login With Username

```text
POST {{baseUrl}}/api/login
```

Body:

```json
{
  "identifier": "Belle",
  "password": "MyPassword123"
}
```

Expected:

```text
200 OK
```

Example:

```json
{
  "message": "Login successful",
  "token": "<JWT>"
}
```

Copy the token to the Postman environment variable `token`.

---

### Test 5 — Login With Email

```text
POST {{baseUrl}}/api/login
```

Body:

```json
{
  "identifier": "belle@example.com",
  "password": "MyPassword123"
}
```

Expected:

```text
200 OK
```

---

### Test 6 — Incorrect Password

```text
POST {{baseUrl}}/api/login
```

Body:

```json
{
  "identifier": "Belle",
  "password": "wrong-password"
}
```

Expected:

```text
401 Unauthorized
```

---

### Test 7 — Unknown User

```text
POST {{baseUrl}}/api/login
```

Body:

```json
{
  "identifier": "not-a-real-user",
  "password": "MyPassword123"
}
```

Expected:

```text
401 Unauthorized
```

## 4. JWT Tests

### Test 8 — Verify Valid JWT

```text
GET {{baseUrl}}/api/auth/verify
```

Header:

```http
Authorization: Bearer {{token}}
```

Expected:

```text
200 OK
```

---

### Test 9 — Verify Without JWT

```text
GET {{baseUrl}}/api/auth/verify
```

Do not send an Authorization header.

Expected:

```text
401 Unauthorized
```

Example:

```json
{
  "error": "Authentication required"
}
```

---

### Test 10 — Modified or Malformed JWT

Change characters in the token and send:

```text
GET {{baseUrl}}/api/auth/verify
```

Expected:

```text
401 Unauthorized
```

Example:

```json
{
  "error": "Invalid or expired token"
}
```

---

### Test 11 — Expired JWT

Login, keep the token until its **15-minute** lifetime has passed, then request:

```text
GET {{baseUrl}}/api/auth/verify
```

Expected:

```text
401 Unauthorized
```

An expired JWT may still remain in browser `localStorage` or Postman. Expiration is enforced when the backend calls `jwt.verify()`.

## 5. Book API Tests

Valid book format:

```json
{
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": [
    "Fantasy",
    "Adventure"
  ]
}
```

### Test 12 — Get Authenticated User's Books

```text
GET {{baseUrl}}/api/books
```

Header:

```http
Authorization: Bearer {{token}}
```

Expected:

```text
200 OK
```

---

### Test 13 — Get Books Without Authentication

```text
GET {{baseUrl}}/api/books
```

Without JWT.

Expected:

```text
401 Unauthorized
```

---

### Test 14 — Add Book

```text
POST {{baseUrl}}/api/books
```

Headers:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": [
    "Fantasy",
    "Adventure"
  ]
}
```

Expected:

```text
201 Created
```

Save the returned book ID as `bookId`.

---

### Test 15 — Add Book Without Genre

```text
POST {{baseUrl}}/api/books
```

Body:

```json
{
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": []
}
```

Expected:

```text
400 Bad Request
```

Example:

```json
{
  "error": "Title, author, and at least one genre are required"
}
```

---

### Test 16 — Invalid Genre Type

Body:

```json
{
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": "Fantasy"
}
```

Expected:

```text
400 Bad Request
```

---

### Test 17 — Get One Book

```text
GET {{baseUrl}}/api/books/{{bookId}}
```

Expected when it exists:

```text
200 OK
```

Expected when it does not exist:

```text
404 Not Found
```

### Security Note

In the currently shown `server.js`, this route does **not** use `authenticateToken`, so it can currently be requested without a JWT. This is a known authorization limitation.

---

### Test 18 — Update Book

```text
PUT {{baseUrl}}/api/books/{{bookId}}
```

Headers:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "title": "The Hobbit — Updated",
  "author": "J. R. R. Tolkien",
  "genre": [
    "Fantasy"
  ]
}
```

Expected:

```text
200 OK
```

---

### Test 19 — Delete Book

```text
DELETE {{baseUrl}}/api/books/{{bookId}}
```

Header:

```http
Authorization: Bearer {{token}}
```

Expected:

```text
200 OK
```

---

### Test 20 — Delete Nonexistent Book

```text
DELETE {{baseUrl}}/api/books/999999
```

Header:

```http
Authorization: Bearer {{token}}
```

Expected:

```text
404 Not Found
```

## 6. Ownership / Authorization Test

1. Register User A.
2. Login as User A.
3. Add a book and record its ID.
4. Register User B.
5. Login as User B and replace `{{token}}` with User B's token.
6. Attempt to update and delete User A's book.

```text
PUT {{baseUrl}}/api/books/<USER_A_BOOK_ID>
DELETE {{baseUrl}}/api/books/<USER_A_BOOK_ID>
```

The operation must not modify or delete User A's book.

Also test:

```text
GET {{baseUrl}}/api/books
```

while logged in as User B. User B should only receive their own collection.

> `GET /api/books/:id` is currently a separate limitation because the route is not protected in the shown server code.

## 7. Unknown API Endpoint

```text
GET {{baseUrl}}/api/not-real
```

Expected:

```text
404 Not Found
```

Example:

```json
{
  "error": "API endpoint not found"
}
```

## 8. Security Test Matrix

| # | Test | Expected |
|---|---|---|
| 1 | Register valid user | `201` |
| 2 | Register missing fields | `400` |
| 3 | Duplicate email | `409` |
| 4 | Login with username | `200` |
| 5 | Login with email | `200` |
| 6 | Incorrect password | `401` |
| 7 | Protected endpoint without JWT | `401` |
| 8 | Valid JWT | `200` |
| 9 | Modified JWT | `401` |
| 10 | Expired JWT | `401` |
| 11 | Get own book list | `200` |
| 12 | Add valid book | `201` |
| 13 | Add invalid book | `400` |
| 14 | Update own book | `200` |
| 15 | Delete own book | `200` |
| 16 | Update/delete another user's book | Must be denied |
| 17 | Nonexistent book | `404` |
| 18 | Unknown `/api` route | `404` |
| 19 | `GET /api/books/:id` without JWT | Currently succeeds if the ID exists; documents a limitation |

## 9. Important Notes

- Passwords should be bcrypt hashes in `data/users.json`, never plaintext.
- Never expose the real `JWT_SECRET`.
- The JWT payload is signed but not encrypted.
- The frontend stores JWTs in `localStorage`.
- Restarting Express does not automatically invalidate an unexpired JWT if the same secret is reused.
- Search and genre filtering are frontend features, not separate backend API endpoints.
