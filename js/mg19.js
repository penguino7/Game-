const gridEl = document.getElementById("wordGrid");
const listEl = document.getElementById("wordList");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");
const hintBtn = document.getElementById("hintBtn");

const WORDS = ["TROJAN", "WORM", "FIREWALL", "VPN"];
const GRID_SIZE = 8;
let grid = Array(GRID_SIZE)
  .fill(null)
  .map(() => Array(GRID_SIZE).fill(""));
let foundWords = [];
let wordPositions = [];
let isSelecting = false;
let selectedCells = [];
let isHinting = false; // Biến chống spam nút Hint

function initGame() {
  for (let i = 0; i < GRID_SIZE; i++)
    for (let j = 0; j < GRID_SIZE; j++)
      grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  WORDS.forEach((word) => {
    let placed = false;
    while (!placed) {
      let dir = Math.random() > 0.5 ? "H" : "V";
      let r = Math.floor(Math.random() * GRID_SIZE);
      let c = Math.floor(Math.random() * GRID_SIZE);
      if (canPlace(word, r, c, dir)) {
        place(word, r, c, dir);
        placed = true;
      }
    }
  });
  render();
}

function canPlace(word, r, c, dir) {
  if (dir === "H" && c + word.length > GRID_SIZE) return false;
  if (dir === "V" && r + word.length > GRID_SIZE) return false;
  return true;
}

function place(word, r, c, dir) {
  let coords = [];
  for (let i = 0; i < word.length; i++) {
    let currR = dir === "H" ? r : r + i;
    let currC = dir === "H" ? c + i : c;
    grid[currR][currC] = word[i];
    coords.push({ r: currR, c: currC });
  }
  wordPositions.push({ word, coords });
}

function render() {
  gridEl.innerHTML = "";
  listEl.innerHTML = "";

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.addEventListener("pointerdown", startSelect);
      cell.addEventListener("pointerover", moveSelect);
      gridEl.appendChild(cell);
    }
  }

  WORDS.forEach((w) => {
    const div = document.createElement("div");
    div.className = "word-item";
    div.id = "word-" + w;
    div.textContent = w;
    listEl.appendChild(div);
  });

  window.addEventListener("pointerup", endSelect);
}

// LOGIC GỢI Ý (ĐÃ FIX LỖI VÀ THÊM HIỆU ỨNG NHÁY VÀNG)
hintBtn.onclick = () => {
  if (isHinting) return; // Nếu đang chạy hiệu ứng thì không cho bấm tiếp

  let unfound = wordPositions.filter((wp) => !foundWords.includes(wp.word));

  if (unfound.length > 0) {
    isHinting = true;
    unfound[0].coords.forEach((pos) => {
      const cell = document.querySelector(
        `[data-r="${pos.r}"][data-c="${pos.c}"]`,
      );
      if (cell && !cell.classList.contains("found")) {
        cell.classList.add("hint-pulse");
        // Xóa hiệu ứng sau 1.5s
        setTimeout(() => cell.classList.remove("hint-pulse"), 1500);
      }
    });

    // Mở khóa nút Hint sau 1.5s
    setTimeout(() => {
      isHinting = false;
    }, 1500);
  }
};

function startSelect(e) {
  if (e.button !== 0 && e.type !== "touchstart") return; // Chỉ nhận chuột trái
  isSelecting = true;
  selectedCells = [];
  selectCell(e.target);
}

function moveSelect(e) {
  if (isSelecting) selectCell(e.target);
}

function selectCell(cell) {
  if (!selectedCells.includes(cell) && !cell.classList.contains("found")) {
    cell.classList.add("selected");
    selectedCells.push(cell);
  }
}

function endSelect() {
  if (!isSelecting) return;
  isSelecting = false;

  let word = selectedCells.map((c) => c.textContent).join("");
  let reversed = word.split("").reverse().join("");

  // FIX LỖI: Luôn lấy từ GỐC để so sánh với mảng Hint
  let originalWord = WORDS.find((w) => w === word || w === reversed);

  if (originalWord && !foundWords.includes(originalWord)) {
    foundWords.push(originalWord);
    selectedCells.forEach((c) => {
      c.classList.remove("selected", "hint-pulse"); // Xóa cả class hint nếu đang chạy
      c.classList.add("found");
    });
    document.getElementById("word-" + originalWord).classList.add("found");

    if (foundWords.length === WORDS.length) victory();
  } else {
    // Trả lại màu cũ nếu chọn sai
    selectedCells.forEach((c) => c.classList.remove("selected"));
  }
  selectedCells = [];
}

function victory() {
  statusMsg.textContent = "Tuyệt vời! Bạn đã tìm thấy tất cả mật mã!";
  statusMsg.className = "feedback-box success";
  statusMsg.classList.remove("hidden");
  finishBtn.style.display = "block";
  let states = JSON.parse(localStorage.getItem("game_states") || "{}");
  states[19] = "DONE";
  localStorage.setItem("game_states", JSON.stringify(states));
}

finishBtn.onclick = () => (window.location.href = "questions.html");
initGame();
