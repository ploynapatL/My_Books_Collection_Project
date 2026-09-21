require("dotenv").config();
// console.log("JWT secret loaded:", !!process.env.JWT_SECRET);

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const myCollec = require("./myCollec");
const userAuth = require("./userAuth");
const authenticateToken = require("./middleware/auth");

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

app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Token is valid",
    user: req.user
  });
});

// GET CURRENT USER
app.get("/api/me", authenticateToken, (req, res) => {
  res.status(200).json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

// REGISTER
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: "Username, email, and password are required"
    });
  }

  try {
    const existingUser = await userAuth.getUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        error: "Email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userAuth.addUser({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to register user"
    });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      error: "Username/email and password are required"
    });
  }

  try {
    const user = await userAuth.getUserByIdentifier(identifier);

    if (!user) {
      return res.status(401).json({
        error: "Invalid username/email or password"
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        error: "Invalid username/email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to login"
    });
  }
});

// READ all books
app.get("/api/books", authenticateToken , async (req, res) => {
  try {
    const books = await myCollec.getBooksByOwner(req.user.id);
    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to read books" });
  }
});

// READ one book
app.get("/api/books/:id", authenticateToken, async (req, res) => {
  try {
    const book = await myCollec.getBookById(req.params.id, req.user.id);

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
app.post("/api/books", authenticateToken, async (req, res) => {
  if (!validateBookBody(req.body)) {
    return res.status(400).json({
      error: "Title, author, and at least one genre are required"
    });
  }

  try {
    const book = await myCollec.addBook(req.body, req.user.id);
    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add book" });
  }
});

// UPDATE a book
app.put("/api/books/:id", authenticateToken, async (req, res) => {
  if (!validateBookBody(req.body)) {
    return res.status(400).json({
      error: "Title, author, and at least one genre are required"
    });
  }

  try {
    const book = await myCollec.updateBook(req.params.id, req.body, req.user.id);

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
app.delete("/api/books/:id", authenticateToken, async (req, res) => {
  try {
    const book = await myCollec.deleteBook(req.params.id, req.user.id);

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