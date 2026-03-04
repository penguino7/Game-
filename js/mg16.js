const sentenceContainer = document.getElementById("sentenceContainer");
const sentenceBoard = document.getElementById("sentenceBoard");
const questionText = document.getElementById("questionText");
const startBtn = document.getElementById("startBtn");
const startOverlay = document.getElementById("startOverlay");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");

// Các nút mới
const gameControls = document.getElementById("gameControls");
const checkBtn = document.getElementById("checkBtn");
const hintBtn = document.getElementById("hintBtn");
const hintText = document.getElementById("hintText");

// =========================================
// DATA: BỔ SUNG THÊM TRƯỜNG "HINT"
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
  hint: "Cụm từ bắt đầu bằng 'XSS là...', và hành động chính là 'chèn mã độc' vào một nơi nào đó.",
};

let isGameOver = false;

// 1. Khởi tạo Game
function initGame() {
  sentenceContainer.innerHTML = "";
  isGameOver = false;

  // Hiện thanh công cụ khi bắt đầu
  gameControls.style.display = "flex";

  questionText.textContent = GAME_DATA.question;

  let shuffled;
  do {
    shuffled = [...GAME_DATA.answer].sort(() => Math.random() - 0.5);
  } while (shuffled.join(" ") === GAME_DATA.answer.join(" "));

  shuffled.forEach((word) => {
    const block = document.createElement("div");
    block.classList.add("word-block");
    block.textContent = word;
    block.draggable = true;
    sentenceContainer.appendChild(block);

    addDragEvents(block);
  });
}

// 2. Logic Kéo Thả (Drag & Drop) siêu mượt
function addDragEvents(item) {
  item.addEventListener("dragstart", (e) => {
    if (isGameOver) return;

    // Tuyệt chiêu setTimeout 0s: Giúp trình duyệt giữ lại hình ảnh "Bóng" (Ghost) trên chuột,
    // trong khi phần tử gốc ở dưới bảng sẽ bị làm mờ đi.
    setTimeout(() => {
      item.classList.add("dragging");
    }, 0);
  });

  item.addEventListener("dragend", () => {
    if (isGameOver) return;
    item.classList.remove("dragging");
  });
}

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

// THUẬT TOÁN TÍNH TỌA ĐỘ MỚI (Hỗ trợ xếp nhiều dòng flex-wrap)
function getDragAfterElement(container, x, y) {
  const draggableElements = [
    ...container.querySelectorAll(".word-block:not(.dragging)"),
  ];

  return draggableElements.find((child) => {
    const box = child.getBoundingClientRect();

    // Kiểm tra xem chuột có đang nằm trên cùng 1 hàng với phần tử này không
    const isSameRow = y >= box.top && y <= box.bottom;

    if (isSameRow) {
      // Nếu cùng hàng, kiểm tra xem chuột đã vượt qua 50% chiều rộng của thẻ chưa
      return x < box.left + box.width / 2;
    }

    // Nếu không cùng hàng, kiểm tra xem chuột có nằm hẳn ở dòng phía trên thẻ này không
    return y < box.top;
  });
}

// 3. Xử lý nút chức năng
startBtn.addEventListener("click", () => {
  startOverlay.classList.add("hidden");
  initGame();
});

// NÚT GỢI Ý
hintBtn.addEventListener("click", () => {
  hintText.textContent = `💡 Gợi ý: ${GAME_DATA.hint}`;
  hintText.classList.remove("hidden");
});

// NÚT KIỂM TRA ĐÁP ÁN
checkBtn.addEventListener("click", () => {
  if (isGameOver) return;

  const currentOrder = [
    ...sentenceContainer.querySelectorAll(".word-block"),
  ].map((el) => el.textContent);

  if (currentOrder.join(" ") === GAME_DATA.answer.join(" ")) {
    // NẾU ĐÚNG:
    isGameOver = true;

    document
      .querySelectorAll(".word-block")
      .forEach((el) => el.classList.add("correct"));

    // Ẩn thanh công cụ đi
    gameControls.style.display = "none";
    hintText.classList.add("hidden");

    statusMsg.textContent = "Chính xác! Bạn đã xếp đúng câu.";
    statusMsg.className = "feedback-box success";
    statusMsg.classList.remove("hidden");
    finishBtn.style.display = "block";

    let states = JSON.parse(localStorage.getItem("game_states") || "{}");
    states[16] = "DONE";
    localStorage.setItem("game_states", JSON.stringify(states));
  } else {
    // NẾU SAI: Rung bảng chữ và nháy đỏ
    sentenceBoard.classList.add("board-shake");

    // Tắt hiệu ứng sau 400ms để lần sau bấm sai còn rung tiếp
    setTimeout(() => {
      sentenceBoard.classList.remove("board-shake");
    }, 400);
  }
});

finishBtn.onclick = () => (window.location.href = "questions.html");
