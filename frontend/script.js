async function generateGoals() {
  const topic = document.getElementById("topic").value;
  const outputDiv = document.getElementById("output");

  if (!topic) {
    outputDiv.innerHTML = "<p style='color: red;'>Please enter a topic.</p>";
    return;
  }

  outputDiv.innerHTML = "<p>Generating resolutions...</p>";

  try {
    const response = await fetch("http://localhost:3000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });

    if (response.ok) {
      const data = await response.json();
      outputDiv.innerHTML = `
        <h2>${data.title}</h2>
        <div class="cards-grid">
          ${data.goals
            .map(
              (goal) => `
                <div class="card">
                  <p>${goal}</p>
                </div>
              `
            )
            .join("")}
        </div>`;
    } else {
      const errorData = await response.json();
      outputDiv.innerHTML = `<p style='color: red;'>${errorData.error || "Error generating resolutions"}</p>`;
    }
  } catch (error) {
    console.error("Error:", error);
    outputDiv.innerHTML = "<p style='color: red;'>There was a problem with the request.</p>";
  }
}
