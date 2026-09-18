# myBook

A simple full-stack web application for managing a personal book collection.

Users can browse, search, filter, add, edit, and delete books. The frontend is built with HTML, CSS, and Vanilla JavaScript, while the backend uses Node.js and Express.js to provide a REST API. Book data is stored in a JSON file instead of a database.

## 1. Application Description

myBook is a small book collection management web application.

### Main Features

- View all books in the collection
- Search for books by title or author
- Filter books by genre
- Add new books
- Edit existing books
- Delete books
- Support multiple genres for each book
- Communicate between the frontend and backend using a REST API

### Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Node.js
- Express.js
- REST API
- JSON
- Postman for API testing

### Project Structure

```text
myBook/
├── frontend/
│   ├── main.html
│   ├── books.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── myCollec.js
│   └── node_modules/
│
├── data/
|   └── books.json
│
└── postman/   
    └── myBooks.postman_collection.json