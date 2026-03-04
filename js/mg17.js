const mazeGrid = document.getElementById("mazeGrid");
const livesDisplay = document.getElementById("livesDisplay");
const nodesDisplay = document.getElementById("nodesDisplay");
const startBtn = document.getElementById("startBtn");
const startOverlay = document.getElementById("startOverlay");
const questionModal = document.getElementById("questionModal");
const modalQuestionText = document.getElementById("modalQuestionText");
const ansGrid = document.getElementById("ansGrid");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");

// =========================================
// BỘ 4 CÂU HỎI (Cho 4 góc)
// =========================================
const QUESTIONS = [
  {
    q: "Which protocol below is used to secure Wi-Fi networks?",
    a: { A: "WPA3", B: "HTTP", C: "FTP", D: "SMTP" },
    correct: "A",
  },
  {
    q: "Which is the most common type of ransomware (extortion malware)?",
    a: { A: "Spyware", B: "Ransomware", C: "Adware", D: "Worm" },
    correct: "B",
  },
  {
    q: "What is the technique of spoofing emails to trick victims called?",
    a: { A: "DDoS", B: "SQLi", C: "Phishing", D: "XSS" },
    correct: "C",
  },
  {
    q: "Which system helps prevent unauthorized access to a network?",
    a: {
      A: "Web browser",
      B: "Firewall",
      C: "Anti-virus",
      D: "VPN",
    },
    correct: "B",
  },
];

let currentQIndex = 0;
let nodesProcessed = 0; // Số Lõi đã chạm vào (Đúng hay Sai đều tính)
let nodesCleared = 0; // Số Lõi trả lời Đúng

// Bản đồ Mê cung: Chỉ giữ lại 4 Lõi ở 4 góc (Số 2)
const mapLayout = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 1], // Góc trái trên, phải trên
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 2, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 1], // Góc trái dưới, phải dưới
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const CELL_SIZE = 48;
let playerPos = { x: 7, y: 5 };
let enemies = [
  { x: 3, y: 1, dirX: 1, dirY: 0 },
  { x: 11, y: 1, dirX: -1, dirY: 0 },
  { x: 7, y: 9, dirX: -1, dirY: 0 },
];

let lives = 3;
let isGameActive = false;
let enemyInterval, playerInterval;

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
};
let lastPlayerMoveTime = 0;
const PLAYER_SPEED = 140;

const playerEl = document.createElement("div");
playerEl.className = "entity player";
const enemyEls = [];

function initMaze() {
  mazeGrid.innerHTML = "";
  nodesDisplay.textContent = `🎯 Đã khám phá: 0/4`;

  for (let y = 0; y < mapLayout.length; y++) {
    for (let x = 0; x < mapLayout[y].length; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const val = mapLayout[y][x];

      if (val === 1) cell.classList.add("wall");
      else if (val === 0) cell.classList.add("path");
      else if (val === 2) cell.classList.add("goal-zone");
      else if (val === 3) cell.classList.add("goal-failed");

      mazeGrid.appendChild(cell);
    }
  }
  mazeGrid.appendChild(playerEl);
  updateEntityPos(playerEl, playerPos.x, playerPos.y);

  enemies.forEach((enemy) => {
    const el = document.createElement("div");
    el.className = "entity enemy";
    mazeGrid.appendChild(el);
    enemyEls.push(el);
    updateEntityPos(el, enemy.x, enemy.y);
  });
}

function updateEntityPos(element, x, y) {
  element.style.left = `${x * CELL_SIZE + x * 2}px`;
  element.style.top = `${y * CELL_SIZE + y * 2}px`;
}

document.addEventListener("keydown", (e) => {
  if (keys[e.key] !== undefined) {
    if (!keys[e.key]) {
      keys[e.key] = true;
      movePlayer();
    }
    e.preventDefault();
  }
});
document.addEventListener("keyup", (e) => {
  if (keys[e.key] !== undefined) {
    keys[e.key] = false;
  }
});

function movePlayer() {
  if (!isGameActive) return;

  const now = Date.now();
  if (now - lastPlayerMoveTime < PLAYER_SPEED) return;

  let newX = playerPos.x;
  let newY = playerPos.y;

  if (keys.ArrowUp || keys.w) newY--;
  else if (keys.ArrowDown || keys.s) newY++;
  else if (keys.ArrowLeft || keys.a) newX--;
  else if (keys.ArrowRight || keys.d) newX++;

  if (
    (newX !== playerPos.x || newY !== playerPos.y) &&
    mapLayout[newY][newX] !== 1
  ) {
    playerPos.x = newX;
    playerPos.y = newY;
    updateEntityPos(playerEl, playerPos.x, playerPos.y);

    lastPlayerMoveTime = now;

    // Mở câu hỏi nếu dẫm vào Lõi Active (Số 2)
    if (mapLayout[playerPos.y][playerPos.x] === 2) {
      triggerQuestionModal(playerPos.x, playerPos.y);
    }
  }
}

function moveEnemies() {
  if (!isGameActive) return;

  enemies.forEach((enemy, idx) => {
    let nx = enemy.x + enemy.dirX;
    let ny = enemy.y + enemy.dirY;

    if (mapLayout[ny][nx] === 1) {
      const possibleDirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ];
      const validDirs = possibleDirs.filter(
        (d) => mapLayout[enemy.y + d.dy][enemy.x + d.dx] !== 1,
      );

      if (validDirs.length > 0) {
        const randomDir =
          validDirs[Math.floor(Math.random() * validDirs.length)];
        enemy.dirX = randomDir.dx;
        enemy.dirY = randomDir.dy;
        nx = enemy.x + enemy.dirX;
        ny = enemy.y + enemy.dirY;
      }
    }
    enemy.x = nx;
    enemy.y = ny;
    updateEntityPos(enemyEls[idx], enemy.x, enemy.y);
  });
  checkPlayerHit();
}

function checkPlayerHit() {
  enemies.forEach((enemy) => {
    if (enemy.x === playerPos.x && enemy.y === playerPos.y) {
      lives--;
      livesDisplay.textContent = `❤️ Mạng: ${lives}`;
      playerPos = { x: 7, y: 5 };
      updateEntityPos(playerEl, playerPos.x, playerPos.y);

      mazeGrid.style.boxShadow = "inset 0 0 50px rgba(239, 68, 68, 0.8)";
      setTimeout(
        () => (mazeGrid.style.boxShadow = "0 0 40px rgba(0,0,0,0.8)"),
        300,
      );

      if (lives <= 0) endGame(false, "System Failure! Bạn đã hết mạng.");
    }
  });
}

function triggerQuestionModal(nodeX, nodeY) {
  isGameActive = false;
  clearInterval(playerInterval);
  clearInterval(enemyInterval);
  for (let k in keys) keys[k] = false;

  const currentData = QUESTIONS[currentQIndex];
  modalQuestionText.textContent = `Câu ${currentQIndex + 1}/4: ${currentData.q}`;
  ansGrid.innerHTML = "";

  for (const [key, value] of Object.entries(currentData.a)) {
    const btn = document.createElement("button");
    btn.className = "ans-btn";
    btn.textContent = `${key}. ${value}`;

    btn.onclick = () => {
      document
        .querySelectorAll(".ans-btn")
        .forEach((b) => (b.style.pointerEvents = "none"));

      if (key === currentData.correct) {
        btn.classList.add("correct");
        setTimeout(() => handleAnswerResult(nodeX, nodeY, true), 1000);
      } else {
        btn.classList.add("wrong");
        document.querySelectorAll(".ans-btn").forEach((b) => {
          if (b.textContent.startsWith(currentData.correct))
            b.classList.add("correct");
        });
        setTimeout(() => handleAnswerResult(nodeX, nodeY, false), 1500);
      }
    };
    ansGrid.appendChild(btn);
  }
  questionModal.classList.remove("hidden");
}

// Xử lý chung khi trả lời Đúng hoặc Sai
function handleAnswerResult(nodeX, nodeY, isCorrect) {
  questionModal.classList.add("hidden");

  nodesProcessed++;
  currentQIndex++;
  nodesDisplay.textContent = `🎯 Đã khám phá: ${nodesProcessed}/4`;

  if (isCorrect) {
    // Trả lời đúng -> Biến thành đường đi bình thường
    mapLayout[nodeY][nodeX] = 0;
    const cellIndex = nodeY * 15 + nodeX;
    mazeGrid.children[cellIndex].className = "cell path";
    nodesCleared++;
  } else {
    // Trả lời sai -> Biến thành Lõi Hỏng (Trạng thái số 3)
    mapLayout[nodeY][nodeX] = 3;
    const cellIndex = nodeY * 15 + nodeX;
    mazeGrid.children[cellIndex].className = "cell goal-failed";

    lives--;
    livesDisplay.textContent = `❤️ Mạng: ${lives}`;
    playerPos = { x: 7, y: 5 }; // Chết thì đưa về giữa màn hình
    updateEntityPos(playerEl, playerPos.x, playerPos.y);

    mazeGrid.style.boxShadow = "inset 0 0 50px rgba(239, 68, 68, 0.8)";
    setTimeout(
      () => (mazeGrid.style.boxShadow = "0 0 40px rgba(0,0,0,0.8)"),
      300,
    );
  }

  // Kiểm tra kết thúc game
  if (lives <= 0) {
    endGame(
      false,
      "System Failure! Bạn đã hết mạng do trả lời sai hoặc đụng Virus.",
    );
  } else if (nodesProcessed >= 4) {
    if (nodesCleared === 4) {
      endGame(true, "Hoàn hảo! Bạn đã giải mã thành công 4/4 Lõi Dữ Liệu.");
    } else {
      endGame(
        true,
        `Chiến dịch kết thúc! Bạn đã giải mã được ${nodesCleared}/4 Lõi.`,
      );
    }
  } else {
    // Tiếp tục chơi
    isGameActive = true;
    enemyInterval = setInterval(moveEnemies, 400);
    playerInterval = setInterval(movePlayer, 20);
  }
}

function endGame(isWin, msg) {
  questionModal.classList.add("hidden");
  isGameActive = false;
  clearInterval(enemyInterval);
  clearInterval(playerInterval);

  statusMsg.textContent = msg;
  statusMsg.className = `feedback-box ${isWin ? "success" : "error"}`;
  statusMsg.classList.remove("hidden");
  finishBtn.style.display = "block";

  let states = JSON.parse(localStorage.getItem("game_states") || "{}");
  states[17] = "DONE";
  localStorage.setItem("game_states", JSON.stringify(states));
}

startBtn.addEventListener("click", () => {
  startOverlay.classList.add("hidden");
  isGameActive = true;
  enemyInterval = setInterval(moveEnemies, 400);
  playerInterval = setInterval(movePlayer, 20);
});

finishBtn.onclick = () => (window.location.href = "questions.html");

initMaze();
