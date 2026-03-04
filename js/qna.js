// 1. Lấy ID từ URL
const urlParams = new URLSearchParams(window.location.search);
const currentId = parseInt(urlParams.get("id")) || 1; // Mặc định là 1 nếu không có id
const questionData = QNA_DATABASE[currentId];

// 2. DOM Elements
const qLabel = document.getElementById("qLabel");
const qTopic = document.getElementById("qTopic");
const qPoints = document.getElementById("qPoints");
const qText = document.getElementById("qText");
const qSnippetBox = document.getElementById("qSnippetBox");
const qSnippet = document.getElementById("qSnippet");
const qOptions = document.getElementById("qOptions");
const submitBtn = document.getElementById("submitBtn");
const feedbackBox = document.getElementById("feedbackBox");

let selectedOptionIdx = null;

// 3. Render giao diện
if (questionData) {
  qLabel.textContent = `CHALLENGE ${String(currentId).padStart(2, "0")}`;
  qTopic.textContent = questionData.topic;
  qPoints.textContent = `${questionData.points} PTS`;
  qText.textContent = questionData.text;

  // Render code snippet nếu có
  if (questionData.snippet) {
    qSnippetBox.style.display = "block";
    qSnippet.textContent = questionData.snippet;
  }

  // Render đáp án
  const letters = ["A", "B", "C", "D"];
  questionData.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";
    btn.innerHTML = `<span class="opt-letter">${letters[idx]}</span> <span class="opt-text">${opt}</span>`;

    // Xử lý sự kiện click chọn đáp án
    btn.addEventListener("click", () => {
      // Bỏ chọn các nút khác
      document
        .querySelectorAll(".opt-btn")
        .forEach((b) => b.classList.remove("selected"));
      // Chọn nút này
      btn.classList.add("selected");
      selectedOptionIdx = idx;
      submitBtn.disabled = false; // Bật nút Submit
    });

    qOptions.appendChild(btn);
  });
} else {
  qText.textContent = "Error: Question data not found!";
}

// 4. Xử lý khi bấm nút Submit
submitBtn.addEventListener("click", () => {
  if (selectedOptionIdx === null) return;

  submitBtn.disabled = true;
  const buttons = document.querySelectorAll(".opt-btn");

  // Khóa không cho click nữa
  buttons.forEach((b) => (b.style.pointerEvents = "none"));

  // Kiểm tra đúng sai
  if (selectedOptionIdx === questionData.correctIdx) {
    buttons[selectedOptionIdx].classList.add("correct");
    feedbackBox.textContent = "Access Granted! Payload successful.";
    feedbackBox.className = "feedback-box success";

    // TẠI ĐÂY: Lưu trạng thái "DONE" vào localStorage để lát quay lại grid nó đổi màu
    let states = JSON.parse(localStorage.getItem("game_states") || "{}");
    states[currentId] = "DONE";
    localStorage.setItem("game_states", JSON.stringify(states));
  } else {
    buttons[selectedOptionIdx].classList.add("wrong");
    buttons[questionData.correctIdx].classList.add("correct"); // Hiện đáp án đúng
    feedbackBox.textContent = "Access Denied! Payload failed.";
    feedbackBox.className = "feedback-box error";
  }

  // Đổi nút Submit thành nút quay lại bảng
  setTimeout(() => {
    submitBtn.textContent = "Return to Board";
    submitBtn.disabled = false;
    submitBtn.onclick = () => (window.location.href = "questions.html");
  }, 1000);
});
