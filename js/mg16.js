const sentenceContainer = document.getElementById("sentenceContainer");
const startBtn = document.getElementById("startBtn");
const startOverlay = document.getElementById("startOverlay");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");

// Câu gốc hoàn chỉnh (Cậu có thể thay đổi câu khác ở đây)
const CORRECT_SENTENCE = [
  "Tường lửa",
  "ứng dụng",
  "web",
  "giúp",
  "ngăn chặn",
  "tấn công",
  "XSS.",
];

let isGameOver = false;

// 1. Khởi tạo Game
function initGame() {
  sentenceContainer.innerHTML = "";
  isGameOver = false;

  // Xáo trộn mảng nhưng phải đảm bảo nó KHÔNG vô tình bị xếp đúng ngay từ đầu
  let shuffled;
  do {
    shuffled = [...CORRECT_SENTENCE].sort(() => Math.random() - 0.5);
  } while (shuffled.join(" ") === CORRECT_SENTENCE.join(" "));

  // Tạo các khối chữ
  shuffled.forEach((word) => {
    const block = document.createElement("div");
    block.classList.add("word-block");
    block.textContent = word;
    block.draggable = true;
    sentenceContainer.appendChild(block);

    // Kích hoạt tính năng kéo thả
    addDragEvents(block);
  });
}

// 2. Logic Kéo Thả (Drag & Drop) thông minh
function addDragEvents(item) {
  item.addEventListener("dragstart", () => {
    if (isGameOver) return;
    item.classList.add("dragging");
  });

  item.addEventListener("dragend", () => {
    if (isGameOver) return;
    item.classList.remove("dragging");
    checkWin(); // Kiểm tra kết quả mỗi khi nhả chuột
  });
}

// Bắt sự kiện trên vùng chứa (Bảng)
sentenceContainer.addEventListener("dragover", (e) => {
  e.preventDefault(); // Cho phép thả
  if (isGameOver) return;

  const draggingItem = document.querySelector(".dragging");
  if (!draggingItem) return;

  // Tìm phần tử nằm ngay sau vị trí chuột hiện tại
  const afterElement = getDragAfterElement(
    sentenceContainer,
    e.clientX,
    e.clientY,
  );

  if (afterElement == null) {
    // Nếu chuột ở cuối cùng -> Nhét vào cuối
    sentenceContainer.appendChild(draggingItem);
  } else {
    // Nếu chuột chen vào giữa -> Chèn lên trước phần tử đó
    sentenceContainer.insertBefore(draggingItem, afterElement);
  }
});

// Hàm tính toán vị trí chuột so với các khối chữ
function getDragAfterElement(container, x, y) {
  const draggableElements = [
    ...container.querySelectorAll(".word-block:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      // Tính khoảng cách từ chuột đến tâm của khối chữ
      const offsetX = x - box.left - box.width / 2;
      const offsetY = y - box.top - box.height / 2;

      // Tìm phần tử gần nhất mà chuột đang lướt qua phần nửa bên trái của nó
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

// 3. Bắt đầu game
startBtn.addEventListener("click", () => {
  startOverlay.classList.add("hidden");
  initGame();
});

// 4. Kiểm tra Chiến thắng
function checkWin() {
  // Lấy danh sách thứ tự các từ hiện tại trên bảng
  const currentOrder = [
    ...sentenceContainer.querySelectorAll(".word-block"),
  ].map((el) => el.textContent);

  // So sánh mảng hiện tại với mảng gốc
  if (currentOrder.join(" ") === CORRECT_SENTENCE.join(" ")) {
    isGameOver = true;

    // Đổi màu toàn bộ sang xanh lá
    document
      .querySelectorAll(".word-block")
      .forEach((el) => el.classList.add("correct"));

    statusMsg.textContent =
      "Data Reassembled! Thông điệp đã được giải mã chính xác.";
    statusMsg.className = "feedback-box success";
    statusMsg.classList.remove("hidden");
    finishBtn.style.display = "block";

    // Lưu trạng thái DONE cho Q16
    let states = JSON.parse(localStorage.getItem("game_states") || "{}");
    states[16] = "DONE";
    localStorage.setItem("game_states", JSON.stringify(states));
  }
}

// Nút quay lại
finishBtn.onclick = () => (window.location.href = "questions.html");
