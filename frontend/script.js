const API_URL = "/api/books";

let books = [];
let selectedFilterGenres = new Set();

const booksGrid = document.getElementById("booksGrid");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const genreOptions = document.getElementById("genreOptions");
const emptyState = document.getElementById("emptyState");
const message = document.getElementById("message");

const modal = document.getElementById("bookModal");
const bookForm = document.getElementById("bookForm");
const modalTitle = document.getElementById("modalTitle");
const bookId = document.getElementById("bookId");
const titleInput = document.getElementById("titleInput");
const authorInput = document.getElementById("authorInput");

function showMessage(text = "", isError = false) {
  if (!message) return;
  message.textContent = text;
  message.className = isError ? "message error" : "message";
}

function getBookGenres(book) {
  return Array.isArray(book.genre) ? book.genre : [];
}

async function loadBooks() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Could not load books.");
    }

    books = await response.json();
    populateGenreFilter();
    renderBooks();
  } catch (error) {
    showMessage(error.message, true);
  }
}

function populateGenreFilter() {
  if (!genreFilter) return;

  const allGenres = [...new Set(
    books.flatMap(book => getBookGenres(book)).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  // Remove filters for genres that no longer exist.
  selectedFilterGenres = new Set(
    [...selectedFilterGenres].filter(genre => allGenres.includes(genre))
  );

  genreFilter.innerHTML = "";

  const allLabel = document.createElement("label");
  allLabel.className = "genre-check all-genres";
  allLabel.innerHTML = '<input type="checkbox" value=""> <span>All Genres</span>';

  const allCheckbox = allLabel.querySelector("input");
  allCheckbox.checked = selectedFilterGenres.size === 0;
  allCheckbox.addEventListener("change", () => {
    selectedFilterGenres.clear();
    populateGenreFilter();
    renderBooks();
  });

  genreFilter.appendChild(allLabel);

  allGenres.forEach(genre => {
    const label = document.createElement("label");
    label.className = "genre-check";
    label.innerHTML = `<input type="checkbox" value=""> <span></span>`;
    const checkbox = label.querySelector("input");
    checkbox.value = genre;
    checkbox.checked = selectedFilterGenres.has(genre);
    label.querySelector("span").textContent = genre;

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedFilterGenres.add(genre);
      } else {
        selectedFilterGenres.delete(genre);
      }
      populateGenreFilter();
      renderBooks();
    });

    genreFilter.appendChild(label);
  });
}

function populateModalGenres(selectedGenres = []) {
  if (!genreOptions) return;

  const allGenres = [...new Set(
    books.flatMap(book => getBookGenres(book)).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  // Keep a small starter list if the dataset is empty.
  const genres = allGenres.length
    ? allGenres
    : ["Fantasy", "Adventure", "Romance", "Mystery", "Thriller", "Classic", "Self-help", "Non-fiction"];

  genreOptions.innerHTML = "";

  genres.forEach(genre => {
    const label = document.createElement("label");
    label.className = "genre-check";
    label.innerHTML = `<input type="checkbox" name="genre" value=""> <span></span>`;
    const checkbox = label.querySelector("input");
    checkbox.value = genre;
    checkbox.checked = selectedGenres.includes(genre);
    label.querySelector("span").textContent = genre;
    genreOptions.appendChild(label);
  });
}

function getSelectedModalGenres() {
  if (!genreOptions) return [];
  return [...genreOptions.querySelectorAll('input[name="genre"]:checked')]
    .map(input => input.value);
}

function getFilteredBooks() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

  return books.filter(book => {
    const genres = getBookGenres(book);

    const matchesSearch =
      !query ||
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query);

    // A book passes if it contains at least one selected genre.
    const matchesGenre =
      selectedFilterGenres.size === 0 ||
      [...selectedFilterGenres].some(genre => genres.includes(genre));

    return matchesSearch && matchesGenre;
  });
}

function renderBooks() {
  if (!booksGrid) return;

  const filteredBooks = getFilteredBooks();
  booksGrid.innerHTML = "";

  filteredBooks.forEach(book => {
    const card = document.createElement("article");
    card.className = "book-card";

    card.innerHTML = `
      <div class="book-decoration" aria-hidden="true"></div>
      <h3></h3>
      <p class="author"></p>
      <div class="card-genres"></div>
      <div class="card-actions">
        <button type="button" class="edit-btn">Edit</button>
        <button type="button" class="delete-btn">Delete</button>
      </div>
    `;

    card.querySelector("h3").textContent = book.title;
    card.querySelector(".author").textContent = `by ${book.author}`;

    const genresContainer = card.querySelector(".card-genres");
    getBookGenres(book).forEach(genre => {
      const tag = document.createElement("span");
      tag.className = "genre-tag";
      tag.textContent = genre;
      genresContainer.appendChild(tag);
    });

    card.querySelector(".edit-btn").addEventListener("click", () => openEditModal(book));
    card.querySelector(".delete-btn").addEventListener("click", () => deleteBook(book.id));

    booksGrid.appendChild(card);
  });

  if (emptyState) {
    emptyState.classList.toggle("hidden", filteredBooks.length !== 0);
  }
}

function openAddModal() {
  if (!modal) return;

  modalTitle.textContent = "Add a book";
  bookForm.reset();
  bookId.value = "";
  populateModalGenres([]);
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  titleInput.focus();
}

function openEditModal(book) {
  modalTitle.textContent = "Edit your book";
  bookId.value = book.id;
  titleInput.value = book.title;
  authorInput.value = book.author;
  populateModalGenres(getBookGenres(book));

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  titleInput.focus();
}

function closeModal() {
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

async function saveBook(event) {
  event.preventDefault();

  const data = {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    genre: getSelectedModalGenres()
  };

  if (!data.title || !data.author || data.genre.length === 0) {
    showMessage("Please enter a title, author, and select at least one genre.", true);
    return;
  }

  const id = bookId.value;
  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Request failed.");
    }

    closeModal();
    showMessage(id ? "Book updated successfully." : "Book added successfully.");
    await loadBooks();
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function deleteBook(id) {
  const book = books.find(item => item.id === id);
  if (!book) return;

  const confirmed = window.confirm(`Delete "${book.title}" from your collection?`);
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not delete book.");
    }

    showMessage("Book deleted successfully.");
    await loadBooks();
  } catch (error) {
    showMessage(error.message, true);
  }
}

if (booksGrid) {
  document.getElementById("openAddBtn").addEventListener("click", openAddModal);
  document.getElementById("closeModalBtn").addEventListener("click", closeModal);
  document.getElementById("modalBackdrop").addEventListener("click", closeModal);
  bookForm.addEventListener("submit", saveBook);

  searchInput.addEventListener("input", renderBooks);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  loadBooks();
}