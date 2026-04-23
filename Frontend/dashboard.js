window.onload = function () {

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");

  // 🔐 Protect dashboard
  if (!token) {
    window.location.href = "Log.html";
    return;
  }

  document.getElementById("welcome").textContent =
    `Welcome, ${userName}!`;
};

function logout() {
  localStorage.clear();
  window.location.href = "Log.html";
}