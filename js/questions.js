const qGrid = document.getElementById("qGrid");

// Dùng QUESTION_META nếu có, không thì tự tạo 22 câu
const DATA =
  typeof QUESTION_META !== "undefined" && Array.isArray(QUESTION_META)
    ? QUESTION_META
    : Array.from({ length: 22 }, (_, i) => ({ id: i + 1 }));

function pad2(n) {
  return String(n).padStart(2, "0");
}

// HÀM VẼ BẢNG CÂU HỎI
function render() {
  if (!qGrid) return;

  // Lấy danh sách các câu đã làm từ bộ nhớ trình duyệt
  const savedStates = JSON.parse(localStorage.getItem("game_states") || "{}");

  qGrid.innerHTML = DATA.map((item) => {
    // Kiểm tra xem câu này đã làm xong chưa (key là id của câu hỏi hoặc mã game)
    const isDone = savedStates[item.id] === "DONE";

    const tileClass = isDone ? "q-tile done" : "q-tile";
    const icon = isDone ? "✓" : "?";
    const dotStyle = isDone ? "background: #64748b; box-shadow: none;" : "";

    return `
      <div class="${tileClass}" role="button" tabindex="0" data-id="${item.id}">
        <div class="q-number">Q${pad2(item.id)}</div>
        <div class="q-icon">${icon}</div>
        <div class="q-dot" style="${dotStyle}"></div>
      </div>
    `;
  }).join("");
}

// HÀM ĐIỀU HƯỚNG THÔNG MINH
function handleTileAction(tile) {
  if (!tile) return;

  const id = Number(tile.dataset.id);

  // Nếu câu này đã làm xong, hiện hộp thoại xác nhận chơi lại
  if (tile.classList.contains("done")) {
    const replay = confirm(
      `Câu Q${pad2(id)} đã hoàn thành. Bạn có muốn chơi lại không?`,
    );
    if (!replay) return;
  }

  // ĐIỀU HƯỚNG TỰ ĐỘNG
  if (id >= 1 && id <= 10) {
    window.location.href = `qna.html?id=${id}`;
  } else if (id >= 11 && id <= 22) {
    // Tự động map: 11 -> mg11.html, 22 -> mg22.html
    window.location.href = `mg${id}.html`;
  } else {
    alert(`Mini-game ${id} đang được xây dựng!`);
  }
}

// LẮNG NGHE SỰ KIỆN CLICK VÀ BÀN PHÍM
qGrid.addEventListener("click", (e) => {
  handleTileAction(e.target.closest(".q-tile"));
});

qGrid.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleTileAction(e.target.closest(".q-tile"));
  }
});

// LOGIC RESET BẢNG
const resetBtn = document.getElementById("resetBoardBtn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    const isConfirm = confirm(
      "⚠ Cảnh báo: Bạn có chắc chắn muốn xóa toàn bộ tiến trình và chơi lại từ đầu không?",
    );
    if (isConfirm) {
      localStorage.removeItem("game_states");
      render();
    }
  });
}

// Khởi chạy
render();
