const sentenceContainer = document.getElementById("sentenceContainer");
const questionText = document.getElementById("questionText"); // Trỏ đến ô câu hỏi
const startBtn = document.getElementById("startBtn");
const startOverlay = document.getElementById("startOverlay");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");

// =========================================
// DATA: CÂU HỎI VÀ ĐÁP ÁN (Được băm nhỏ)
// =========================================
const GAME_DATA = {
  question:
    "Đâu là định nghĩa chính xác nhất về lỗ hổng Cross-Site Scripting (XSS)?",
  answer: [
    "XSS",
    "là",
    "lỗ hổng",
    "cho phép",
    "kẻ tấn công",
    "chèn",
    "mã độc",
    "vào",
    "trang web",
    "của",
    "người dùng.",
  ],
};

let isGameOver = false;

// 1. Khởi tạo Game
function initGame() {
  sentenceContainer.innerHTML = "";
  isGameOver = false;

  // Hiển thị câu hỏi lên giao diện
  questionText.textContent = GAME_DATA.question;

  // Xáo trộn mảng đáp án (Đảm bảo không vô tình đúng ngay từ đầu)
  let shuffled;
  do {
    shuffled = [...GAME_DATA.answer].sort(() => Math.random() - 0.5);
  } while (shuffled.join(" ") === GAME_DATA.answer.join(" "));

  // Tạo các khối chữ
  shuffled.forEach((word) => {
    const block = document.createElement("div");
    block.classList.add("word-block");
    block.textContent = word;
    block.draggable = true;
    sentenceContainer.appendChild(block);

    addDragEvents(block); // Kích hoạt kéo thả
  });
}

// 2. Logic Kéo Thả (Drag & Drop)
function addDragEvents(item) {
  item.addEventListener("dragstart", () => {
    if (isGameOver) return;
    item.classList.add("dragging");
  });

  item.addEventListener("dragend", () => {
    if (isGameOver) return;
    item.classList.remove("dragging");
    checkWin(); // Xếp xong 1 từ là check xem đã trúng mánh chưa
  });
}

// Tính toán vị trí chèn
sentenceContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (isGameOver) return;

  const draggingItem = document.querySelector(".dragging");
  if (!draggingItem) return;

  const afterElement = getDragAfterElement(
    sentenceContainer,
    e.clientX,
    e.clientY,
  );

  if (afterElement == null) {
    sentenceContainer.appendChild(draggingItem);
  } else {
    sentenceContainer.insertBefore(draggingItem, afterElement);
  }
});

function getDragAfterElement(container, x, y) {
  const draggableElements = [
    ...container.querySelectorAll(".word-block:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offsetX = x - box.left - box.width / 2;
      const offsetY = y - box.top - box.height / 2;

      // Nếu chuột lướt qua nửa bên trái của một khối thì chèn vào trước khối đó
      if (
        offsetX < 0 &&
        offsetX > closest.offsetX &&
        Math.abs(offsetY) < box.height
      ) {
        return { offsetX: offsetX, element: child };
      } else {
        return closest;
      }
    },
    { offsetX: Number.NEGATIVE_INFINITY },
  ).element;
}

// 3. Nút Start
startBtn.addEventListener("click", () => {
  startOverlay.classList.add("hidden");
  initGame();
});

// 4. Kiểm tra Chiến thắng
function checkWin() {
  const currentOrder = [
    ...sentenceContainer.querySelectorAll(".word-block"),
  ].map((el) => el.textContent);

  // So sánh mảng đang xếp với đáp án gốc
  if (currentOrder.join(" ") === GAME_DATA.answer.join(" ")) {
    isGameOver = true;

    // Xanh lá báo hiệu đúng
    document
      .querySelectorAll(".word-block")
      .forEach((el) => el.classList.add("correct"));

    statusMsg.textContent =
      "Chính xác! Bạn đã hiểu rõ bản chất của lỗ hổng này.";
    statusMsg.className = "feedback-box success";
    statusMsg.classList.remove("hidden");
    finishBtn.style.display = "block";

    let states = JSON.parse(localStorage.getItem("game_states") || "{}");
    states[16] = "DONE";
    localStorage.setItem("game_states", JSON.stringify(states));
  }
}

finishBtn.onclick = () => (window.location.href = "questions.html");
