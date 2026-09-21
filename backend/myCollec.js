const fs = require("fs/promises");
const path = require("path");

const DATA_FILE = path.join(
  __dirname,
  "..",
  "data",
  "books.json"
);

async function readBooks() {
  const data = await fs.readFile(
    DATA_FILE,
    "utf8"
  );

  return JSON.parse(data);
}

async function saveBooks(books) {
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(books, null, 2) + "\n",
    "utf8"
  );
}

function normalizeGenres(genres) {
  if (!Array.isArray(genres)) return [];

  return [
    ...new Set(
      genres
        .filter(
          genre => typeof genre === "string"
        )
        .map(
          genre => genre.trim()
        )
        .filter(Boolean)
    )
  ];
}


// Get only books owned by the logged-in user
async function getBooksByOwner(ownerId) {
  const books = await readBooks();

  return books.filter(
    book =>
      Number(book.ownerId) ===
      Number(ownerId)
  );
}


// Find one book owned by the logged-in user
async function getBookById(id, ownerId) {
  const books = await readBooks();

  return books.find(
    book =>
      Number(book.id) === Number(id) &&
      Number(book.ownerId) === Number(ownerId)
  );
}


// Add book and automatically attach owner
async function addBook(bookData, ownerId) {
  const books = await readBooks();

  const newId = books.length
    ? Math.max(
        ...books.map(
          book => Number(book.id)
        )
      ) + 1
    : 1;

  const newBook = {
    id: newId,

    title:
      bookData.title.trim(),

    author:
      bookData.author.trim(),

    genre:
      normalizeGenres(bookData.genre),

    // Authorization ownership
    ownerId:
      Number(ownerId)
  };

  books.push(newBook);

  await saveBooks(books);

  return newBook;
}


// Update only a book owned by the logged-in user
async function updateBook(
  id,
  bookData,
  ownerId
) {
  const books = await readBooks();

  const index = books.findIndex(
    book =>
      Number(book.id) === Number(id) &&
      Number(book.ownerId) === Number(ownerId)
  );

  if (index === -1) {
    return null;
  }

  const updatedBook = {
    id:
      books[index].id,

    title:
      bookData.title.trim(),

    author:
      bookData.author.trim(),

    genre:
      normalizeGenres(bookData.genre),

    // Preserve ownership
    ownerId:
      books[index].ownerId
  };

  books[index] = updatedBook;

  await saveBooks(books);

  return updatedBook;
}


// Delete only a book owned by the logged-in user
async function deleteBook(id, ownerId) {
  const books = await readBooks();

  const index = books.findIndex(
    book =>
      Number(book.id) === Number(id) &&
      Number(book.ownerId) === Number(ownerId)
  );

  if (index === -1) {
    return null;
  }

  const [deletedBook] =
    books.splice(index, 1);

  await saveBooks(books);

  return deletedBook;
}


module.exports = {
  getBooksByOwner,
  getBookById,
  addBook,
  updateBook,
  deleteBook
};