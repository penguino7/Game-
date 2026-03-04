const gridEl = document.getElementById("grid");
const trayEl = document.getElementById("tray");
const scoreDisplay = document.getElementById("scoreDisplay");
const targetBox = document.getElementById("targetBox");
const targetDisplay = document.getElementById("targetDisplay");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const finalScoreText = document.getElementById("finalScore");
const retryBtn = document.getElementById("retryBtn");
const finishBtn = document.getElementById("finishBtn");
const statusMsg = document.getElementById("statusMessage");

// CÁC MỐC ĐIỂM (MILESTONES)
const MILESTONES = [500, 1000, 1500];
let currentMilestoneIndex = 0;

const SHAPES = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1, 1, 1, 1]],
  [[1], [1], [1], [1], [1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
  [
    [1, 1],
    [1, 0],
  ],
  [
    [1, 1],
    [0, 1],
  ],
  [
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 0],
  ],
  [
    [0, 1],
    [1, 1],
    [0, 1],
  ],
];

const COLORS = [
  "#FF44CC",
  "#FF9500",
  "#34C759",
  "#007AFF",
  "#FFCC00",
  "#FF3B30",
  "#5AC8FA",
  "#AF52DE",
  "#D1D1D6",
];

const GRID_SIZE = 8;

let board = Array(GRID_SIZE)
  .fill(null)
  .map(() => Array(GRID_SIZE).fill(0));
let trayShapes = [null, null, null];
let score = 0;
let isDragging = false;
let dragShape = null;
let dragElement = null;
let dragIndex = -1;
let hoverCoords = null;

function initGame() {
  board = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0));
  score = 0;
  scoreDisplay.textContent = score;

  // Reset mốc điểm
  currentMilestoneIndex = 0;
  targetDisplay.textContent = MILESTONES[currentMilestoneIndex];

  overlay.classList.add("hidden");
  finishBtn.style.display = "none";
  statusMsg.classList.add("hidden");

  createGrid();
  refillTray();
}

function createGrid() {
  gridEl.innerHTML = "";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      let cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      gridEl.appendChild(cell);
    }
  }
}

function drawGrid() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      let cell = gridEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
      if (board[r][c]) {
        cell.className = "cell filled";
        cell.style.backgroundColor = board[r][c];
      } else {
        cell.className = "cell";
        cell.style.backgroundColor = "";
      }
    }
  }
}

function refillTray() {
  if (trayShapes.every((s) => s === null)) {
    for (let i = 0; i < 3; i++) {
      let randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      let color = COLORS[Math.floor(Math.random() * COLORS.length)];
      trayShapes[i] = { matrix: randomShape, color: color };
    }
  }
  renderTray();
  setTimeout(checkGameOver, 100);
}

function renderTray() {
  trayEl.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    let slot = document.createElement("div");
    slot.className = "tray-slot";

    if (trayShapes[i]) {
      let shapeEl = createShapeElement(trayShapes[i]);
      shapeEl.dataset.index = i;
      shapeEl.addEventListener("pointerdown", handleDragStart);

      if (!canFitAnywhere(trayShapes[i].matrix)) {
        shapeEl.classList.add("dragging-disabled");
      }

      slot.appendChild(shapeEl);
    }
    trayEl.appendChild(slot);
  }
}

function createShapeElement(shapeObj) {
  let el = document.createElement("div");
  el.className = "shape";
  shapeObj.matrix.forEach((row) => {
    let rEl = document.createElement("div");
    rEl.className = "shape-row";
    row.forEach((val) => {
      let bEl = document.createElement("div");
      bEl.className = "shape-block" + (val === 0 ? " empty" : "");
      if (val === 1) bEl.style.backgroundColor = shapeObj.color;
      rEl.appendChild(bEl);
    });
    el.appendChild(rEl);
  });
  return el;
}

function handleDragStart(e) {
  if (e.button !== 0 && e.type !== "touchstart") return;
  let target = e.currentTarget;
  if (target.classList.contains("dragging-disabled")) return;

  isDragging = true;
  dragIndex = target.dataset.index;
  dragShape = trayShapes[dragIndex];

  dragElement = createShapeElement(dragShape);
  dragElement.classList.add("dragging");
  document.body.appendChild(dragElement);

  moveGhost(e);
  target.style.opacity = "0";

  document.addEventListener("pointermove", handleDragMove);
  document.addEventListener("pointerup", handleDragEnd);
}

function handleDragMove(e) {
  if (!isDragging) return;
  e.preventDefault();
  moveGhost(e);

  document
    .querySelectorAll(".cell")
    .forEach((c) => c.classList.remove("preview"));

  let firstBlock = dragElement.querySelector(".shape-block:not(.empty)");
  if (!firstBlock) return;

  let rect = firstBlock.getBoundingClientRect();
  let centerX = rect.left + rect.width / 2;
  let centerY = rect.top + rect.height / 2;

  let elemBelow = document.elementFromPoint(centerX, centerY);
  if (elemBelow && elemBelow.classList.contains("cell")) {
    let r = parseInt(elemBelow.dataset.r);
    let c = parseInt(elemBelow.dataset.c);
    hoverCoords = { r, c };
    previewShape(r, c);
  } else {
    hoverCoords = null;
  }
}

function moveGhost(e) {
  let x = e.clientX || (e.touches && e.touches[0].clientX);
  let y = e.clientY || (e.touches && e.touches[0].clientY);
  dragElement.style.left = x + "px";
  dragElement.style.top = y - 50 + "px";
}

function handleDragEnd(e) {
  if (!isDragging) return;

  isDragging = false;
  document.removeEventListener("pointermove", handleDragMove);
  document.removeEventListener("pointerup", handleDragEnd);

  dragElement.remove();
  document
    .querySelectorAll(".cell")
    .forEach((c) => c.classList.remove("preview"));

  let originalSlot = trayEl.children[dragIndex].querySelector(".shape");
  if (originalSlot) originalSlot.style.opacity = "1";

  if (
    hoverCoords &&
    isValidPlacement(dragShape.matrix, hoverCoords.r, hoverCoords.c)
  ) {
    placeShape(dragShape, hoverCoords.r, hoverCoords.c);
    trayShapes[dragIndex] = null;

    let baseScore = dragShape.matrix.flat().filter((v) => v === 1).length * 10;
    addScore(baseScore);

    checkLines();
    refillTray();
  }

  hoverCoords = null;
  dragShape = null;
  dragIndex = -1;
}

function previewShape(r, c) {
  if (!isValidPlacement(dragShape.matrix, r, c)) return;
  let mat = dragShape.matrix;
  for (let i = 0; i < mat.length; i++) {
    for (let j = 0; j < mat[0].length; j++) {
      if (mat[i][j] === 1) {
        let cell = gridEl.querySelector(
          `[data-r="${r + i}"][data-c="${c + j}"]`,
        );
        if (cell) cell.classList.add("preview");
      }
    }
  }
}

function isValidPlacement(matrix, r, c) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (matrix[i][j] === 1) {
        let pr = r + i;
        let pc = c + j;
        if (pr >= GRID_SIZE || pc >= GRID_SIZE || board[pr][pc] !== 0)
          return false;
      }
    }
  }
  return true;
}

function placeShape(shapeObj, r, c) {
  let mat = shapeObj.matrix;
  for (let i = 0; i < mat.length; i++) {
    for (let j = 0; j < mat[0].length; j++) {
      if (mat[i][j] === 1) board[r + i][c + j] = shapeObj.color;
    }
  }
  drawGrid();
}

function checkLines() {
  let rowsToClear = [];
  let colsToClear = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    if (board[r].every((cell) => cell !== 0)) rowsToClear.push(r);
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    let colFilled = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (board[r][c] === 0) colFilled = false;
    }
    if (colFilled) colsToClear.push(c);
  }

  let lines = rowsToClear.length + colsToClear.length;
  if (lines > 0) {
    rowsToClear.forEach((r) => {
      for (let c = 0; c < GRID_SIZE; c++) {
        let cell = gridEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
        cell.classList.add("blasting");
        board[r][c] = 0;
      }
    });
    colsToClear.forEach((c) => {
      for (let r = 0; r < GRID_SIZE; r++) {
        let cell = gridEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
        cell.classList.add("blasting");
        board[r][c] = 0;
      }
    });

    setTimeout(() => {
      document
        .querySelectorAll(".blasting")
        .forEach((el) => el.classList.remove("blasting"));
      drawGrid();
      renderTray();
    }, 300);

    let bonus = lines * 50;
    if (lines > 1) bonus *= lines; // Combo point x lines
    addScore(bonus);
  }
}

// LOGIC XỬ LÝ MỐC ĐIỂM (MILESTONES)
function addScore(points) {
  score += points;
  scoreDisplay.textContent = score;

  scoreDisplay.style.transform = "scale(1.4)";
  scoreDisplay.style.color = "#4ade80";
  setTimeout(() => {
    scoreDisplay.style.transform = "scale(1)";
    scoreDisplay.style.color = "#fff";
  }, 200);

  // Kiểm tra xem có vượt mốc hiện tại không
  if (currentMilestoneIndex < MILESTONES.length) {
    if (score >= MILESTONES[currentMilestoneIndex]) {
      // Nếu là mốc cuối cùng (1500) -> Win luôn
      if (currentMilestoneIndex === MILESTONES.length - 1) {
        endGame(true, "HOÀN TẤT CHIẾN DỊCH!");
      } else {
        // Nâng cấp mục tiêu tiếp theo
        let passedMilestone = MILESTONES[currentMilestoneIndex];
        currentMilestoneIndex++;
        targetDisplay.textContent = MILESTONES[currentMilestoneIndex];
        showMilestoneAlert(passedMilestone);
      }
    }
  }
}

// HÀM HIỂN THỊ CHÚC MỪNG KHI QUA MỐC
function showMilestoneAlert(ms) {
  // Chớp sáng bảng mục tiêu
  targetBox.classList.add("milestone-reached");
  setTimeout(() => targetBox.classList.remove("milestone-reached"), 1000);

  // Hiện text động viên ở footer
  statusMsg.innerHTML = `🔥 Tuyệt vời! Bạn đã vượt mốc <b>${ms}</b> điểm! Tiếp tục chinh phục nào! 🔥`;
  statusMsg.className = "feedback-box success";
  statusMsg.classList.remove("hidden");

  // Ẩn đi sau 3 giây để màn hình gọn gàng
  setTimeout(() => {
    statusMsg.classList.add("hidden");
  }, 3000);
}

function canFitAnywhere(matrix) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (isValidPlacement(matrix, r, c)) return true;
    }
  }
  return false;
}

function checkGameOver() {
  if (score >= MILESTONES[MILESTONES.length - 1]) return;

  let hasMoves = false;
  for (let shape of trayShapes) {
    if (shape && canFitAnywhere(shape.matrix)) {
      hasMoves = true;
      break;
    }
  }

  if (!hasMoves) {
    endGame(false, "TRÀN BỘ NHỚ! HẾT ĐƯỜNG ĐI!");
  }
}

function endGame(isWin, msg) {
  overlayTitle.textContent = msg;
  overlayTitle.style.color = isWin ? "#4ade80" : "#f87171";
  finalScoreText.textContent = `Điểm của bạn: ${score}`;
  overlay.classList.remove("hidden");

  if (isWin) {
    retryBtn.style.display = "none";
    statusMsg.innerHTML =
      "🏆 CHÚC MỪNG BẠN ĐÃ PHÁ ĐẢO TOÀN BỘ 22 MINI-GAME! 🏆";
    statusMsg.className = "feedback-box success";
    statusMsg.style.fontSize = "20px";
    statusMsg.style.padding = "20px";
    statusMsg.classList.remove("hidden");
    finishBtn.style.display = "block";

    let states = JSON.parse(localStorage.getItem("game_states") || "{}");
    states[22] = "DONE";
    localStorage.setItem("game_states", JSON.stringify(states));
  } else {
    retryBtn.style.display = "block";
  }
}

retryBtn.onclick = initGame;
finishBtn.onclick = () => (window.location.href = "questions.html");

initGame();
