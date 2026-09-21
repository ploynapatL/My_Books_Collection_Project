# myBook — My Books Collection

A responsive full-stack web application for managing a personal book collection.

Users can register, log in with either their **username or email**, and manage their own books through a browser interface. The application uses Node.js/Express, JSON files for storage, JWT authentication, and bcrypt password hashing.

## Features

- User registration
- Login using **username or email**
- Password hashing with `bcryptjs`
- JWT-based authentication
- Personal book collections
- Add, view, edit, and delete books
- Search books by title or author
- Filter books by genre
- Multiple genres per book
- Responsive frontend
- JSON-file data storage
- REST API
- Postman API testing

## Technology Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API
- Browser `localStorage` for JWT storage

### Backend
- Node.js
- Express.js
- `bcryptjs`
- `jsonwebtoken`
- `dotenv`

### Data Storage
- `data/users.json` — registered users and hashed passwords
- `data/books.json` — stored books and their owners

## Project Structure

```text
My_Books_Collection_Project/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── .env.example
│   ├── API-TESTING.md
│   ├── myCollec.js
│   ├── package.json
│   ├── server.js
│   └── userAuth.js
│
├── data/
│   ├── books.json
│   └── users.json
│
├── frontend/
│   ├── auth.js
│   ├── books.html
│   ├── login.html
│   ├── main.html
│   ├── register.html
│   ├── script.js
│   └── style.css
│
├── postman/
│   └── ...
│
├── .gitignore
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ploynapatL/My_Books_Collection_Project.git
cd My_Books_Collection_Project
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

## Environment Variables

The application requires a JWT secret.

Create this file:

```text
backend/.env
```

Add:

```env
JWT_SECRET=replace_this_with_your_own_secret_key
```

If `.env.example` is provided, use it as a template.

Do **not** commit the real `.env` file to GitHub. The JWT secret must remain private.

> The server reads the secret from `process.env.JWT_SECRET`.

## Run the Application

From the `backend` directory:

```bash
npm start
```

If no start script is configured, use:

```bash
node server.js
```

The application runs on:

```text
http://localhost:3000
```

Open:

```text
http://localhost:3000/main.html
```

Do not open the HTML files directly with `file://`, because the frontend communicates with the Express backend through API requests.

## Authentication

### Registration

A new user registers with:

```json
{
  "username": "Belle",
  "email": "belle@example.com",
  "password": "MyPassword123"
}
```

The server hashes the password with bcrypt before storing it in `users.json`.

### Login

Users can log in using either their **username** or **email**.

Using username:

```json
{
  "identifier": "Belle",
  "password": "MyPassword123"
}
```

Using email:

```json
{
  "identifier": "belle@example.com",
  "password": "MyPassword123"
}
```

If authentication succeeds, the server returns a signed JWT.

The frontend stores the token in `localStorage` and sends it with protected requests:

```http
Authorization: Bearer <token>
```

The JWT is currently configured to expire after **15 minutes**.

Stopping and restarting the server does not automatically remove an unexpired JWT from the browser. The token remains valid until it expires, provided the server continues using the same `JWT_SECRET`.

## API Endpoints

Base URL:

```text
http://localhost:3000
```

| Method | Endpoint | Authentication | Description |
|---|---|---:|---|
| POST | `/api/register` | No | Register a new user |
| POST | `/api/login` | No | Login using username or email and receive a JWT |
| GET | `/api/auth/verify` | Yes | Verify the current JWT |
| GET | `/api/books` | Yes | Get books owned by the authenticated user |
| GET | `/api/books/:id` | No in the current server code | Get one book by ID |
| POST | `/api/books` | Yes | Add a book to the authenticated user's collection |
| PUT | `/api/books/:id` | Yes | Update a book owned by the authenticated user |
| DELETE | `/api/books/:id` | Yes | Delete a book owned by the authenticated user |

### Book Request Format

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

`title` and `author` must be non-empty strings.

`genre` must be an array containing at least one non-empty string.

## HTTP Status Codes Used

- `200 OK` — successful read, update, delete, login, or token verification
- `201 Created` — successful registration or book creation
- `400 Bad Request` — required fields or book data are invalid
- `401 Unauthorized` — authentication is missing, invalid, or expired
- `404 Not Found` — requested book or API route does not exist
- `409 Conflict` — email is already registered
- `500 Internal Server Error` — unexpected server/data operation failure

## Book Ownership

Books are associated with the authenticated user's ID.

For:

```text
GET /api/books
```

the backend uses the user ID from the verified JWT to return that user's collection.

Create, update, and delete operations also use the authenticated user ID when calling the book data module.

## Frontend Flow

```text
User action
   ↓
HTML / JavaScript
   ↓
fetch()
   ↓
Express REST API
   ↓
JWT authentication middleware
   ↓
myCollec.js / userAuth.js
   ↓
JSON files
   ↓
HTTP JSON response
   ↓
Frontend updates the page
```

## Testing with Postman

A detailed guide is provided in:

```text
backend/API-TESTING.md
```

Recommended tests include registration, login, JWT verification, protected-route access, invalid/expired tokens, book CRUD, invalid book data, ownership checks, and 404 cases.

## Known Limitations

- Data is stored in JSON files rather than a database.
- Concurrent file writes are not designed for production-scale use.
- JWTs are stored in browser `localStorage`.
- Logout currently removes the token from the frontend; there is no server-side JWT revocation list.
- There is no refresh-token mechanism.
- The server currently uses a fixed port (`3000`).
- `GET /api/books/:id` is not protected by `authenticateToken` in the current server code. Before production use, this route should also enforce authentication and ownership.
- The application is intended as an educational project and is not production-ready.

## AI Tools Used

AI tools were used as development support for:
- Code explanation and debugging
- Reviewing authentication and authorization logic
- Improving documentation
- Identifying frontend/backend integration issues

All generated or suggested code should be reviewed and understood before submission or deployment.

## Author

Developed as a CBE204 Web Technology project.
