document.addEventListener("DOMContentLoaded", () => {

  const token = localStorage.getItem("token");

  // 🔐 Protect Page
  if (!token) {
    window.location.href = "log.html";
    return;
  }

  const checkBtn = document.getElementById("checkBtn");

  checkBtn.addEventListener("click", async () => {

    const selectedSymptoms = Array.from(
      document.querySelectorAll('input[name="symptoms"]:checked')
    ).map(input => input.value);

    if (selectedSymptoms.length === 0) {
      alert("Please select at least one symptom.");
      return;
    }

    try {

      const response = await fetch("http://localhost:5000/api/checks/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userName: localStorage.getItem("userName"),
          userEmail: localStorage.getItem("userEmail"),
          symptoms: selectedSymptoms
        })
      });

      const data = await response.json();
      console.log("Backend response:", data);
  
      

      if (!response.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      // ✅ Save full backend result
      localStorage.setItem("diagnosisResult", JSON.stringify(data));

      // Redirect
      window.location.href = "result.html";
      

    } catch (error) {
      alert("Server error. Make sure backend is running.");
    }

  });
});