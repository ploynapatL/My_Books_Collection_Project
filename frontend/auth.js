const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");

function showAuthMessage(text, isError = false) {
  if (!authMessage) return;

  authMessage.textContent = text;
  authMessage.className =
    isError ? "message error" : "message";
}

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