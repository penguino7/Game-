const gridEl = document.getElementById("wordGrid");
const listEl = document.getElementById("wordList");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");
const hintBtn = document.getElementById("hintBtn");

const WORDS = ["TROJAN", "WORM", "FIREWALL", "VPN", "PHISHING"];
const GRID_SIZE = 10;
let grid = Array(GRID_SIZE)
  .fill(null)
  .map(() => Array(GRID_SIZE).fill(""));
let foundWords = [];
let wordPositions = [];
let isSelecting = false;
let selectedCells = [];

function initGame() {
  // 1. Random chữ
  for (let i = 0; i < GRID_SIZE; i++)
    for (let j = 0; j < GRID_SIZE; j++)
      grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  // 2. Chèn từ
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

// Hint button logic
hintBtn.onclick = () => {
  let unfound = wordPositions.filter((wp) => !foundWords.includes(wp.word));
  if (unfound.length > 0) {
    unfound[0].coords.forEach((pos) => {
      const cell = document.querySelector(
        `[data-r="${pos.r}"][data-c="${pos.c}"]`,
      );
      cell.classList.add("selected");
      setTimeout(() => cell.classList.remove("selected"), 1000);
    });
  }
};

function startSelect(e) {
  isSelecting = true;
  selectedCells = [];
  selectCell(e.target);
}
function moveSelect(e) {
  if (isSelecting) selectCell(e.target);
}
function selectCell(cell) {
  if (!selectedCells.includes(cell)) {
    cell.classList.add("selected");
    selectedCells.push(cell);
  }
}

function endSelect() {
  isSelecting = false;
  let word = selectedCells.map((c) => c.textContent).join("");
  let reversed = word.split("").reverse().join("");

  if (WORDS.includes(word) || WORDS.includes(reversed)) {
    let w = WORDS.includes(word) ? word : reversed;
    if (!foundWords.includes(w)) {
      foundWords.push(w);
      selectedCells.forEach((c) => c.classList.add("found"));
      document.getElementById("word-" + w).classList.add("found");
      if (foundWords.length === WORDS.length) victory();
    }
  }
  selectedCells.forEach((c) => c.classList.remove("selected"));
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
