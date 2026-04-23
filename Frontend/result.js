document.addEventListener("DOMContentLoaded", () => {
  const raw = localStorage.getItem("diagnosisResult");

  if (!raw) {
    alert("No diagnosis data found.");
    window.location.href = "dashboard.html";
    return;
  }

  const data = JSON.parse(raw);

  // Emergency Box
  const emergencyBox = document.getElementById("emergencyBox");
  emergencyBox.style.display = data.emergency ? "block" : "none";

  const $ = id => document.getElementById(id);

  // User Info
  $("userName").innerText = data.userName || "Guest";
 $("userEmail").innerText = localStorage.getItem("userEmail") || "-";
  $("checkDate").innerText = new Date().toLocaleString();

  const container = $("resultsContainer");
  container.innerHTML = "";

  const results = data.results || [];

  if (results.length === 0) {
    container.innerHTML = "<p>No diagnosis results available.</p>";
    return;
  }

  results.forEach((r, index) => {

    let color = "secondary";

    if (r.severity === "High") color = "danger";
    else if (r.severity === "Moderate") color = "warning";
    else if (r.severity === "Low") color = "success";

    const card = document.createElement("div");
    card.className = `card mb-3 p-3 border-start border-4 border-${color}`;

    card.innerHTML = `
      <h5>Diagnosis ${index + 1}: ${r.diagnosis}</h5>
      <p><strong>Confidence:</strong> ${r.confidence}</p>
      <p><strong>Severity:</strong> ${r.severity}</p>
      <p>
        <strong>Risk Level:</strong> 
        <span class="badge bg-${color}">
          ${r.riskLevel}
        </span>
      </p>
      <p><strong>Medicines:</strong> ${r.medicines?.join(", ") || "Consult Doctor"}</p>
      <p><strong>Precautions:</strong> ${r.precautions?.join(", ") || "-"}</p>
    `;

    container.appendChild(card);
  });
});
function logout() {
    localStorage.clear();
    window.location.href = "Log.html";
}