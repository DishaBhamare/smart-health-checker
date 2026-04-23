const form = document.getElementById("loginForm");
const messageDiv = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      messageDiv.innerHTML = `<span class="text-danger">${data.message}</span>`;
      return;
    }

    // ✅ STORE TOKEN
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data._id);
    localStorage.setItem("userName", data.name);
    localStorage.setItem("userEmail", data.email);

    messageDiv.innerHTML = `<span class="text-success">Login successful!</span>`;

    // Redirect after 1 second
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);

  } catch (error) {
    messageDiv.innerHTML = `<span class="text-danger">Server error</span>`;
  }
});
