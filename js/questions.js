const qGrid = document.getElementById("qGrid");

// Dùng QUESTION_META nếu có, không thì tự tạo 30 câu
const DATA =
  typeof QUESTION_META !== "undefined" && Array.isArray(QUESTION_META)
    ? QUESTION_META
    : Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));

function pad2(n) {
  return String(n).padStart(2, "0");
}

// HÀM VẼ BẢNG CÂU HỎI
function render() {
  if (!qGrid) return;

  // Lấy danh sách các câu đã làm từ bộ nhớ trình duyệt
  const savedStates = JSON.parse(localStorage.getItem("game_states") || "{}");

  qGrid.innerHTML = DATA.map((item) => {
    // Kiểm tra xem câu này đã làm xong chưa
    const isDone = savedStates[item.id] === "DONE";

    // Nếu xong rồi thì thêm class 'done' để CSS làm mờ đi
    const tileClass = isDone ? "q-tile done" : "q-tile";
    const icon = isDone ? "✓" : "?";

    // Đổi màu dấu chấm nhỏ (dot)
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

// GỘP CHUNG LOGIC XỬ LÝ KHI NGƯỜI CHƠI CHỌN 1 Ô
function handleTileAction(tile) {
  if (!tile) return;

  const id = Number(tile.dataset.id);

  // Nếu câu này đã làm xong, hiện hộp thoại hỏi xem có muốn chơi lại không
  if (tile.classList.contains("done")) {
    const replay = confirm(
      `Câu Q${pad2(id)} đã hoàn thành. Bạn có muốn chơi lại không?`,
    );
    if (!replay) return; // Nếu bấm Cancel thì dừng lại, không làm gì cả
  }

  // ĐIỀU HƯỚNG THÔNG MINH (ROUTING)
  // ĐIỀU HƯỚNG THÔNG MINH (ROUTING)
  if (id <= 10) {
    window.location.href = `qna.html?id=${id}`;
  } else if (id === 11) {
    window.location.href = `mg11.html`;
  } else if (id === 12) {
    window.location.href = `mg12.html`;
  } else if (id === 13) {
    window.location.href = `mg13.html`; // <--- Thêm dòng này
  } else if (id === 14) {
    window.location.href = `mg14.html`; // <--- Thêm dòng này
  } else if (id === 15) {
    window.location.href = `mg15.html`; // <--- Thêm dòng này
  } else if (id === 16) {
    window.location.href = `mg16.html`; // <--- Thêm dòng này
  } else if (id === 17) {
    window.location.href = `mg17.html`; // <--- Mở Maze Chase
  } else if (id === 18) {
    window.location.href = `mg18.html`; // <--- Whack-a-mole
  } else if (id === 19) {
    window.location.href = `mg19.html`; // <--- Cậu thêm dòng này vào nhé!
  } else {
    alert(`Mini-game ${id} đang được xây dựng!`);
  }
}

// LẮNG NGHE SỰ KIỆN CLICK VÀ BÀN PHÍM TRÊN BẢNG
qGrid.addEventListener("click", (e) => {
  handleTileAction(e.target.closest(".q-tile"));
});

qGrid.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault(); // Tránh bị cuộn trang khi bấm Space
    handleTileAction(e.target.closest(".q-tile"));
  }
});

// LOGIC CHO NÚT RESET TOÀN BỘ BẢNG
const resetBtn = document.getElementById("resetBoardBtn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    const isConfirm = confirm(
      "⚠ Cảnh báo: Bạn có chắc chắn muốn xóa toàn bộ tiến trình và chơi lại từ đầu không?",
    );
    if (isConfirm) {
      // Xóa dữ liệu trong bộ nhớ
      localStorage.removeItem("game_states");
      // Render lại bảng ngay lập tức
      render();
    }
  });
}

// Chạy hàm vẽ bảng lần đầu khi load trang
render();
