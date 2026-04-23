const picInput = document.getElementById("picInput");
const profilePic = document.getElementById("profile-pic");

const token = localStorage.getItem("token");

// ===============================
// Profile Picture Upload
// ===============================
picInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function () {
            const imgData = reader.result;
            profilePic.src = imgData;
            localStorage.setItem("profilePic", imgData);
        };
        reader.readAsDataURL(file);
    }
});

// ===============================
// Load Profile + History
// ===============================
window.onload = async function () {
    // console.log("Profile page loaded");
    // console.log("Token:", token);

    // Redirect if not logged in
    if (!token) {
        window.location.href = "Log.html";
        return;
    }

    // Load profile picture
    const savedPic = localStorage.getItem("profilePic");
    if (savedPic) {
        profilePic.src = savedPic;
    }

    // Load user info
    const username = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");

  if (!token) {
    window.location.href = "Log.html";
    return;
}

    document.getElementById("name").textContent = username;
    document.getElementById("email").textContent = email;

    // Fetch history from backend
    try {
        const response = await fetch("http://localhost:5000/api/checks/history", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log("History response:", data);

        if (data.success) {
            displayHistory(data.data);
        }

    } catch (error) {
        console.error("Error fetching history:", error);
    }
};

// ===============================
// Display History
// ===============================
function displayHistory(checks) {

    const historyDiv = document.getElementById("historyList");
    const totalChecks = document.getElementById("totalChecks");
    const highRiskCount = document.getElementById("highRiskCount");

    historyDiv.innerHTML = "";
    totalChecks.textContent = checks.length;

    let highRisk = 0;

    if (checks.length === 0) {
        historyDiv.innerHTML = "<p class='text-muted'>No history available</p>";
        return;
    }

    checks.forEach(check => {

        const symptoms = Array.isArray(check.symptoms)
            ? check.symptoms.join(", ")
            : "Not Available";

        // ✅ get first result object safely
        const result = check.results && check.results.length > 0
            ? check.results[0]
            : null;

        const diagnosis = result && result.diagnosis
            ? result.diagnosis
            : "Not Available";

        const precautions = result && Array.isArray(result.precautions) && result.precautions.length > 0
            ? result.precautions.join(", ")
            : "Not Available";

        if (result && result.severity === "High") {
            highRisk++;
        }

        const div = document.createElement("div");
div.className = "history-item";

/* Add severity border color */
if (result?.severity === "High") {
    div.classList.add("high-risk");
} else if (result?.severity === "Moderate") {
    div.classList.add("moderate-risk");
} else {
    div.classList.add("low-risk");
}

div.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="fw-bold">${diagnosis}</h6>
        ${result?.severity ? `
            <span class="badge ${
                result.severity === "High"
                    ? "bg-danger"
                    : result.severity === "Moderate"
                    ? "bg-warning text-dark"
                    : "bg-success"
            }">
                ${result.severity}
            </span>
        ` : ""}
    </div>

    <p><strong>Symptoms:</strong> ${symptoms}</p>
    <p><strong>Precautions:</strong> ${precautions}</p>

    <small class="text-muted">
        ${check.createdAt ? new Date(check.createdAt).toLocaleString() : ""}
    </small>
`;



        historyDiv.appendChild(div);
    });

    highRiskCount.textContent = highRisk;
}

// ===============================
// Logout
// ===============================
function logout() {
    localStorage.clear();
    window.location.href = "Log.html";
}
