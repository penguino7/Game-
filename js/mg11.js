const labels = document.querySelectorAll(".mg-label");
const zones = document.querySelectorAll(".drop-zone");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");

let correctCount = 0;
const totalTargets = zones.length;

// 1. Xử lý sự kiện kéo (Drag)
labels.forEach((label) => {
  label.addEventListener("dragstart", (e) => {
    label.classList.add("dragging");
    e.dataTransfer.setData("type", label.dataset.type);
    e.dataTransfer.setData("text", label.textContent);
  });

  label.addEventListener("dragend", () => {
    label.classList.remove("dragging");
  });
});

// 2. Xử lý sự kiện thả (Drop)
zones.forEach((zone) => {
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!zone.classList.contains("filled")) {
      zone.classList.add("hover");
    }
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("hover");
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("hover");

    const draggedType = e.dataTransfer.getData("type");
    const draggedText = e.dataTransfer.getData("text");
    const targetMatch = zone.parentElement.dataset.match;

    // Kiểm tra đúng sai
    if (draggedType === targetMatch) {
      zone.textContent = draggedText;
      zone.classList.add("filled");
      zone.parentElement.classList.add("correct");

      // Ẩn nhãn gốc đã kéo đúng
      const originalLabel = document.querySelector(
        `.mg-label[data-type="${draggedType}"]`,
      );
      if (originalLabel) originalLabel.style.visibility = "hidden";

      correctCount++;
      checkWin();
    } else {
      // Hiệu ứng báo lỗi nếu thả sai
      zone.style.borderColor = "#ef4444";
      setTimeout(() => (zone.style.borderColor = ""), 500);
    }
  });
});

function checkWin() {
  if (correctCount === totalTargets) {
    statusMsg.textContent = "System Secured! All threats identified.";
    statusMsg.className = "feedback-box success";
    statusMsg.classList.remove("hidden");
    finishBtn.style.display = "block";

    // Lưu trạng thái vào localStorage giống như Q&A
    let states = JSON.parse(localStorage.getItem("game_states") || "{}");
    states[11] = "DONE";
    localStorage.setItem("game_states", JSON.stringify(states));
  }
}

finishBtn.onclick = () => (window.location.href = "questions.html");
