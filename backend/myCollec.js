const fs = require("fs/promises");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "books.json");

async function readBooks() {
  const data = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(data);
}

async function saveBooks(books) {
  await fs.writeFile(DATA_FILE, JSON.stringify(books, null, 2) + "\n", "utf8");
}

function normalizeGenres(genres) {
  if (!Array.isArray(genres)) return [];

  return [...new Set(
    genres
      .filter(genre => typeof genre === "string")
      .map(genre => genre.trim())
      .filter(Boolean)
  )];
}

async function getBooks() {
  return readBooks();
}

async function getBookById(id) {
  const books = await readBooks();
  return books.find(book => book.id === Number(id));
}

async function addBook(bookData) {
  const books = await readBooks();
  const newId = books.length
    ? Math.max(...books.map(book => Number(book.id))) + 1
    : 1;

  const newBook = {
    id: newId,
    title: bookData.title.trim(),
    author: bookData.author.trim(),
    genre: normalizeGenres(bookData.genre)
  };

  books.push(newBook);
  await saveBooks(books);
  return newBook;
}

async function updateBook(id, bookData) {
  const books = await readBooks();
  const index = books.findIndex(book => book.id === Number(id));

  if (index === -1) return null;

  const updatedBook = {
    id: books[index].id,
    title: bookData.title.trim(),
    author: bookData.author.trim(),
    genre: normalizeGenres(bookData.genre)
  };

  books[index] = updatedBook;
  await saveBooks(books);
  return updatedBook;
}

async function deleteBook(id) {
  const books = await readBooks();
  const index = books.findIndex(book => book.id === Number(id));

  if (index === -1) return null;

  const [deletedBook] = books.splice(index, 1);
  await saveBooks(books);
  return deletedBook;
}

module.exports = {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook
};