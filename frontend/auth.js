const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");

function showAuthMessage(text, isError = false) {
  if (!authMessage) return;

  authMessage.textContent = text;
  authMessage.className =
    isError ? "message error" : "message";
}

function updateNavbar() {
  const token = localStorage.getItem("token");

  const guestElements =
    document.querySelectorAll(".guest-only");

  const userElements =
    document.querySelectorAll(".user-only");

  if (token) {

    // Logged in
    guestElements.forEach(element => {
      element.style.display = "none";
    });

    userElements.forEach(element => {
      element.style.display = "";

    });

  } else {

    // Not logged in
    guestElements.forEach(element => {
      element.style.display = "";
    });

    userElements.forEach(element => {
      element.style.display = "none";
    });

  }
}


document.addEventListener("DOMContentLoaded", () => {

  updateNavbar();

  const logoutButton =
    document.getElementById("logoutButton");

  if (logoutButton) {

    logoutButton.addEventListener("click", () => {

      localStorage.removeItem("token");

      window.location.href = "login.html";

    });

  }

});

if (registerForm) {
  registerForm.addEventListener("submit", async event => {
    event.preventDefault();

    const username =
      document.getElementById("registerUsername").value.trim();

    const email =
      document.getElementById("registerEmail").value.trim();

    const password =
      document.getElementById("registerPassword").value;

    try {
      const response = await fetch("/api/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          username,
          email,
          password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Registration failed"
        );
      }

      showAuthMessage("Registration successful.");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);

    } catch (error) {
      showAuthMessage(error.message, true);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email =
      document.getElementById("loginEmail").value.trim();

    const password =
      document.getElementById("loginPassword").value;

    try {
      const response = await fetch("/api/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Login failed"
        );
      }

      localStorage.setItem(
        "token",
        result.token
      );

      showAuthMessage("Login successful.");

      setTimeout(() => {
        window.location.href = "books.html";
      }, 1000);

    } catch (error) {
      showAuthMessage(error.message, true);
    }
  });
}

