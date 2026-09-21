const API_URL = "/api/books";

const DEFAULT_GENRES = [
  "Fantasy",
  "Adventure",
  "Romance",
  "Mystery",
  "Thriller",
  "Classic",
  "Self-help",
  "Non-fiction"
];

function getAuthHeaders(includeJson = false) {
  const token =
    localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  if (includeJson) {
    headers["Content-Type"] =
      "application/json";
  }

  return headers;
}

let books = [];
let selectedFilterGenres = new Set();
let pendingDeleteId = null;

const booksGrid = document.getElementById("booksGrid");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const genreOptions = document.getElementById("genreOptions");
const emptyState = document.getElementById("emptyState");
const message = document.getElementById("message");

const modal = document.getElementById("bookModal");
const bookForm = document.getElementById("bookForm");
const modalTitle = document.getElementById("modalTitle");
const modalError = document.getElementById("modalError");
const bookId = document.getElementById("bookId");
const titleInput = document.getElementById("titleInput");
const authorInput = document.getElementById("authorInput");

const deleteModal = document.getElementById("deleteModal");
const deleteModalText = document.getElementById("deleteModalText");

function showMessage(text = "", isError = false) {
  if (!message) return;

  message.textContent = text;
  message.className =
    isError ? "message error" : "message";
}

// Errors that happen while the Add/Edit modal is open must render inside the
// modal itself -- the page-level #message div sits behind the modal overlay
// (z-index), so showMessage() alone would be invisible to the user here.
function showModalError(text = "") {
  if (!modalError) return;

  modalError.textContent = text;
  modalError.classList.toggle(
    "visible",
    Boolean(text)
  );
}

function getBookGenres(book) {
  return Array.isArray(book.genre)
    ? book.genre
    : [];
}

async function checkAuthentication() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return false;
  }

  try {
    const response =
      await fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

    if (!response.ok) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return false;
    }

    return true;

  } catch (error) {
    console.error(
      "Authentication check failed:",
      error
    );

    window.location.href = "login.html";
    return false;
  }
}

// checkAuthentication();

async function loadBooks() {
  try {
    const response = await fetch(API_URL, {
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(
        "Could not load books."
      );
    }

    books = await response.json();

    buildGenreFilter();
    renderBooks();

  } catch (error) {
    showMessage(error.message, true);
  }
}

// Builds the genre filter checkboxes from scratch. Only call this when the
// underlying genre list can actually change (i.e. after books are (re)loaded)
// -- NOT on every checkbox click, see syncGenreFilterCheckboxes() below.
function buildGenreFilter() {
  if (!genreFilter) return;

  const allGenres = [
    ...new Set(
      books
        .flatMap(book => getBookGenres(book))
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b)
  );

  // Drop filters for genres that no longer exist in the collection.
  selectedFilterGenres = new Set(
    [...selectedFilterGenres].filter(
      genre => allGenres.includes(genre)
    )
  );

  genreFilter.innerHTML = "";

  const allLabel =
    document.createElement("label");

  allLabel.className =
    "genre-check all-genres";

  allLabel.innerHTML =
    '<input type="checkbox" value=""> <span>All Genres</span>';

  const allCheckbox =
    allLabel.querySelector("input");

  allCheckbox.checked =
    selectedFilterGenres.size === 0;

  allCheckbox.addEventListener(
    "change",
    () => {
      selectedFilterGenres.clear();

      syncGenreFilterCheckboxes();
      renderBooks();
    }
  );

  genreFilter.appendChild(allLabel);

  allGenres.forEach(genre => {
    const label =
      document.createElement("label");

    label.className = "genre-check";

    label.innerHTML =
      `<input type="checkbox" value=""> <span></span>`;

    const checkbox =
      label.querySelector("input");

    checkbox.value = genre;

    checkbox.checked =
      selectedFilterGenres.has(genre);

    label.querySelector("span").textContent =
      genre;

    checkbox.addEventListener(
      "change",
      () => {
        if (checkbox.checked) {
          selectedFilterGenres.add(genre);
        } else {
          selectedFilterGenres.delete(genre);
        }

        syncGenreFilterCheckboxes();
        renderBooks();
      }
    );

    genreFilter.appendChild(label);
  });
}

// Keeps every filter checkbox's checked state consistent with
// selectedFilterGenres, without tearing down and rebuilding the whole
// filter list (and re-binding every listener) on each individual click.
function syncGenreFilterCheckboxes() {
  if (!genreFilter) return;

  genreFilter
    .querySelectorAll(
      'input[type="checkbox"]'
    )
    .forEach(checkbox => {
      checkbox.checked =
        checkbox.value === ""
          ? selectedFilterGenres.size === 0
          : selectedFilterGenres.has(
              checkbox.value
            );
    });
}

// Populate the modal with all default genre checkboxes,
// pre-selecting any genres already assigned to the book.
function populateModalGenres(
  selectedGenres = []
) {
  if (!genreOptions) return;

  genreOptions.innerHTML = "";

  DEFAULT_GENRES.forEach(genre => {
    const label =
      document.createElement("label");

    label.className = "genre-check";

    label.innerHTML =
      `<input type="checkbox" name="genre" value=""> <span></span>`;

    const checkbox =
      label.querySelector("input");

    checkbox.value = genre;

    checkbox.checked =
      selectedGenres.includes(genre);

    label.querySelector("span").textContent =
      genre;

    genreOptions.appendChild(label);
  });
}

function getSelectedModalGenres() {
  if (!genreOptions) return [];

  return [
    ...genreOptions.querySelectorAll(
      'input[name="genre"]:checked'
    )
  ].map(input => input.value);
}

function getFilteredBooks() {
  const query = searchInput
    ? searchInput.value
        .trim()
        .toLowerCase()
    : "";

  return books.filter(book => {
    const genres =
      getBookGenres(book);

    const matchesSearch =
      !query ||
      book.title
        .toLowerCase()
        .includes(query) ||
      book.author
        .toLowerCase()
        .includes(query);

    // A book passes only if it contains ALL selected genres.
    // If no genres are selected, all books pass this filter.
    const matchesGenre =
        selectedFilterGenres.size === 0 ||
        [...selectedFilterGenres].every(
            genre =>
                genres.includes(genre)
        );

    return matchesSearch && matchesGenre;
  });
}

function renderBooks() {
  if (!booksGrid) return;

  const filteredBooks =
    getFilteredBooks();

  booksGrid.innerHTML = "";

  filteredBooks.forEach(book => {
    const card =
      document.createElement("article");

    card.className = "book-card";

    card.innerHTML = `
      <div class="book-decoration" aria-hidden="true"></div>

      <h3></h3>

      <p class="author"></p>

      <div class="card-genres"></div>

      <div class="card-actions">
        <button
          type="button"
          class="edit-btn"
        >
          Edit
        </button>

        <button
          type="button"
          class="delete-btn"
        >
          Delete
        </button>
      </div>
    `;

    card
      .querySelector("h3")
      .textContent =
        book.title;

    card
      .querySelector(".author")
      .textContent =
        `by ${book.author}`;

    const genresContainer =
      card.querySelector(
        ".card-genres"
      );

    getBookGenres(book)
      .forEach(genre => {
        const tag =
          document.createElement(
            "span"
          );

        tag.className =
          "genre-tag";

        tag.textContent =
          genre;

        genresContainer
          .appendChild(tag);
      });

    card
      .querySelector(".edit-btn")
      .addEventListener(
        "click",
        () => openEditModal(book)
      );

    card
      .querySelector(".delete-btn")
      .addEventListener(
        "click",
        () => openDeleteModal(book)
      );

    booksGrid.appendChild(card);
  });

  if (emptyState) {
    emptyState.classList.toggle(
      "hidden",
      filteredBooks.length !== 0
    );
  }
}

function openAddModal() {
  if (!modal) return;

  modalTitle.textContent =
    "Add a book";

  bookForm.reset();

  bookId.value = "";

  showModalError("");

  // Always show every genre defined by the application.
  populateModalGenres([]);

  modal.classList.remove(
    "hidden"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  titleInput.focus();
}

function openEditModal(book) {
  modalTitle.textContent =
    "Edit your book";

  bookId.value =
    book.id;

  titleInput.value =
    book.title;

  authorInput.value =
    book.author;

  showModalError("");

  // Show all default genres while checking the genres
  // that are already assigned to this book.
  populateModalGenres(
    getBookGenres(book)
  );

  modal.classList.remove(
    "hidden"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  titleInput.focus();
}

function closeModal() {
  if (!modal) return;

  modal.classList.add(
    "hidden"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  showModalError("");
}

async function saveBook(event) {
  event.preventDefault();

  showModalError("");

  const data = {
    title:
      titleInput.value.trim(),

    author:
      authorInput.value.trim(),

    genre:
      getSelectedModalGenres()
  };

  if (
    !data.title ||
    !data.author ||
    data.genre.length === 0
  ) {
    showModalError(
      "Please enter a title, author, and select at least one genre."
    );

    return;
  }

  const id =
    bookId.value;

  const method =
    id ? "PUT" : "POST";

  const url =
    id
      ? `${API_URL}/${id}`
      : API_URL;

  try {
    const response =
      await fetch(url, {
        method,
        headers:
          getAuthHeaders(true),

        body:
          JSON.stringify(data)
      });

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
        "Request failed."
      );
    }

    closeModal();

    showMessage(
      id
        ? "Book updated successfully."
        : "Book added successfully."
    );

    await loadBooks();

  } catch (error) {
    // Modal is still open at this point (we only close it on success above),
    // so the error must show inside the modal, not the page's message bar.
    showModalError(
      error.message
    );
  }
}

function openDeleteModal(book) {
  if (!deleteModal) return;

  pendingDeleteId =
    book.id;

  if (deleteModalText) {
    deleteModalText.textContent =
      `Delete "${book.title}" from your collection? This can't be undone.`;
  }

  deleteModal.classList.remove(
    "hidden"
  );

  deleteModal.setAttribute(
    "aria-hidden",
    "false"
  );
}

function closeDeleteModal() {
  if (!deleteModal) return;

  pendingDeleteId = null;

  deleteModal.classList.add(
    "hidden"
  );

  deleteModal.setAttribute(
    "aria-hidden",
    "true"
  );
}

async function confirmDelete() {
  if (
    pendingDeleteId === null
  ) {
    return;
  }

  const id =
    pendingDeleteId;

  closeDeleteModal();

  try {
    const response =
      await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          headers:
            getAuthHeaders()
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
        "Could not delete book."
      );
    }

    showMessage(
      "Book deleted successfully."
    );

    await loadBooks();

  } catch (error) {
    showMessage(
      error.message,
      true
    );
  }
}

async function initializeBooksPage() {
  // Authentication is already enforced by the protected /api/books endpoint.
  // loadBooks() handles a 401 response by removing the invalid token
  // and redirecting the user back to the login page.

  document
    .getElementById("openAddBtn")
    .addEventListener(
      "click",
      openAddModal
    );

  document
    .getElementById("closeModalBtn")
    .addEventListener(
      "click",
      closeModal
    );

  document
    .getElementById("modalBackdrop")
    .addEventListener(
      "click",
      closeModal
    );

  bookForm.addEventListener(
    "submit",
    saveBook
  );

  if (deleteModal) {
    document
      .getElementById(
        "cancelDeleteBtn"
      )
      .addEventListener(
        "click",
        closeDeleteModal
      );

    document
      .getElementById(
        "deleteModalBackdrop"
      )
      .addEventListener(
        "click",
        closeDeleteModal
      );

    document
      .getElementById(
        "confirmDeleteBtn"
      )
      .addEventListener(
        "click",
        confirmDelete
      );
  }

  searchInput.addEventListener(
    "input",
    renderBooks
  );

  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key !== "Escape"
      ) {
        return;
      }

      if (
        deleteModal &&
        !deleteModal.classList
          .contains("hidden")
      ) {
        closeDeleteModal();

      } else if (
        modal &&
        !modal.classList
          .contains("hidden")
      ) {
        closeModal();
      }
    }
  );

  await loadBooks();
}

initializeBooksPage();