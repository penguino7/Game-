// 1. Lấy ID từ URL
const urlParams = new URLSearchParams(window.location.search);
const currentId = parseInt(urlParams.get("id")) || 1;
const questionData =
  typeof QNA_DATABASE !== "undefined" ? QNA_DATABASE[currentId] : null;

// 2. DOM Elements
const qLabel = document.getElementById("qLabel");
const qTopic = document.getElementById("qTopic");
const qText = document.getElementById("qText");
const qSnippetBox = document.getElementById("qSnippetBox");
const qSnippet = document.getElementById("qSnippet");
const qOptions = document.getElementById("qOptions");
const submitBtn = document.getElementById("submitBtn");
const feedbackBox = document.getElementById("feedbackBox");

let selectedOptionIdx = null;

// 3. Render giao diện
if (questionData) {
  if (qLabel)
    qLabel.textContent = `CHALLENGE ${String(currentId).padStart(2, "0")}`;
  if (qTopic) qTopic.textContent = questionData.topic;
  if (qText) qText.textContent = questionData.text;

  // Render code snippet nếu có
  if (questionData.snippet && qSnippetBox && qSnippet) {
    qSnippetBox.style.display = "block";
    qSnippet.textContent = questionData.snippet;
  }

  // Render đáp án
  if (qOptions) {
    qOptions.innerHTML = ""; // Xóa sạch dữ liệu cũ
    const letters = ["A", "B", "C", "D"];
    questionData.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "opt-btn";
      btn.innerHTML = `<span class="opt-letter">${letters[idx]}</span> <span class="opt-text">${opt}</span>`;

      // Xử lý click
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".opt-btn")
          .forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedOptionIdx = idx;
        submitBtn.disabled = false;
      });

      qOptions.appendChild(btn);
    });
  }
} else {
  if (qText) qText.textContent = "Error: Question data not found!";
}

// 4. Xử lý khi bấm Submit
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    if (selectedOptionIdx === null) return;

    submitBtn.disabled = true;
    const buttons = document.querySelectorAll(".opt-btn");
    buttons.forEach((b) => (b.style.pointerEvents = "none"));

    if (selectedOptionIdx === questionData.correctIdx) {
      buttons[selectedOptionIdx].classList.add("correct");
      feedbackBox.textContent = "Access Granted! Payload successful.";
      feedbackBox.className = "feedback-box success";
      feedbackBox.classList.remove("hidden");

      // Lưu vào localStorage
      let states = JSON.parse(localStorage.getItem("game_states") || "{}");
      states[currentId] = "DONE";
      localStorage.setItem("game_states", JSON.stringify(states));
    } else {
      buttons[selectedOptionIdx].classList.add("wrong");
      buttons[questionData.correctIdx].classList.add("correct");
      feedbackBox.textContent = "Access Denied! Payload failed.";
      feedbackBox.className = "feedback-box error";
      feedbackBox.classList.remove("hidden");
    }

    setTimeout(() => {
      submitBtn.textContent = "Return to Board";
      submitBtn.disabled = false;
      submitBtn.onclick = () => (window.location.href = "questions.html");
    }, 1500);
  });
}
