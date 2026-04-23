document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("registerForm");

    function showAlert(message, type) {
    const alertBox = document.getElementById("alertBox");

    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");

    // auto hide after 3 sec
    setTimeout(() => {
      alertBox.classList.add("d-none");
    }, 3000);
  }


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
if (res.ok) {

  const user = data.user || data;

  localStorage.setItem("token", data.token || "");
  localStorage.setItem("userName", user.name || "");
  localStorage.setItem("userEmail", user.email || "");

  localStorage.setItem("userInfo", JSON.stringify(user));

  showAlert("Registration successful!", "success");

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1000);

} else {
      showAlert(data.message || "Registration failed", "danger");
      }

    } catch (error) {
      alert("Server error. Is backend running?");
    }
  });

});