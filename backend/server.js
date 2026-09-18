const express = require("express");
const myCollec = require("./myCollec");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

function validateBookBody(body) {
  const { title, author, genre } = body || {};

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof author !== "string" ||
    !author.trim() ||
    !Array.isArray(genre) ||
    genre.length === 0 ||
    genre.some(item => typeof item !== "string" || !item.trim())
  ) {
    return false;
  }

  return true;
}

// READ all books
app.get("/api/books", async (req, res) => {
  try {
    const books = await myCollec.getBooks();
    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to read books" });
  }
});

// READ one book
app.get("/api/books/:id", async (req, res) => {
  try {
    const book = await myCollec.getBookById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to find book" });
  }
});

// CREATE a book
app.post("/api/books", async (req, res) => {
  if (!validateBookBody(req.body)) {
    return res.status(400).json({
      error: "Title, author, and at least one genre are required"
    });
  }

  try {
    const book = await myCollec.addBook(req.body);
    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add book" });
  }
});

// UPDATE a book
app.put("/api/books/:id", async (req, res) => {
  if (!validateBookBody(req.body)) {
    return res.status(400).json({
      error: "Title, author, and at least one genre are required"
    });
  }

  try {
    const book = await myCollec.updateBook(req.params.id, req.body);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update book" });
  }
});

// DELETE a book
app.delete("/api/books/:id", async (req, res) => {
  try {
    const book = await myCollec.deleteBook(req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json({
      message: "Book deleted successfully",
      book
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

app.listen(PORT, () => {
  console.log(`myBook server running at http://localhost:${PORT}`);
});