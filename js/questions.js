const qGrid = document.getElementById("qGrid");

// Dùng QUESTION_META nếu có, không thì tự tạo 30 câu
const DATA =
  typeof QUESTION_META !== "undefined" && Array.isArray(QUESTION_META)
    ? QUESTION_META
    : Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));

function pad2(n) {
  return String(n).padStart(2, "0");
}

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

// Gộp chung logic xử lý khi người chơi chọn 1 ô
function handleTileAction(tile) {
  if (!tile) return;

  // Nếu câu này đã giải quyết rồi, có thể báo lỗi nhẹ hoặc chặn lại
  if (tile.classList.contains("done")) {
    alert("Câu này đã bị hack xong rồi! Vui lòng chọn mục tiêu khác.");
    return;
  }

  const id = Number(tile.dataset.id);

  // ĐIỀU HƯỚNG THÔNG MINH (ROUTING)
  if (id <= 10) {
    // 10 câu đầu tiên trỏ về form Q&A trắc nghiệm
    window.location.href = `qna.html?id=${id}`;
  } else if (id === 11) {
    // Nếu click vào câu 11 -> Mở thẳng trang Mini-game kéo thả
    window.location.href = `mg11.html`;
  } else {
    // Các câu từ 12 trở đi vẫn tạm khóa chờ cậu xây dựng tiếp
    alert(`Mini-game ${id} đang được xây dựng! Chúng ta sẽ sớm hoàn thiện nó.`);
  }
}

qGrid.addEventListener("click", (e) => {
  handleTileAction(e.target.closest(".q-tile"));
});

qGrid.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault(); // Tránh bị cuộn trang khi bấm Space
    handleTileAction(e.target.closest(".q-tile"));
  }
});

// Chạy hàm vẽ bảng
render();
