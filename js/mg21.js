const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const retryBtn = document.getElementById("retryBtn");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");
const levelDisplay = document.getElementById("levelDisplay");
const hintBtn = document.getElementById("hintBtn");
const hintText = document.getElementById("hintText");

// UI CÂU HỎI
const questionBox = document.getElementById("questionBox");
const questionText = document.getElementById("questionText");
const answersContainer = document.getElementById("answersContainer");

const LEVELS = [
  {
    board: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: { x: 1, y: 2 },
    question:
      "Which type of malware can self-replicate and spread over a network without user interaction?",
    answers: ["Trojan", "Worm", "Ransomware", "Spyware"],
    correct: 1,
  },
  {
    board: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: { x: 1, y: 1 },
    question: "What is the primary purpose of a firewall in network security?",
    answers: [
      "To monitor and control incoming and outgoing network traffic based on security rules",
      "To physically cool down computer hardware",
      "To speed up the Internet connection",
      "To recover deleted files automatically",
    ],
    correct: 0,
  },
  {
    board: [
      [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 2, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    ],
    start: { x: 3, y: 0 },
    question:
      "Which statement best describes how a stateful firewall differs from a basic packet-filtering firewall?",
    answers: [
      "It tracks the state of active connections and allows traffic based on the context of a session, not just packet headers",
      "It encrypts all network traffic end-to-end automatically",
      "It blocks all incoming traffic by default and cannot be configured",
      "It only scans files for viruses and removes them",
    ],
    correct: 0,
  },
];

let currentLevel = 0;
let board = [];
let block = {};
let oldBlock = {};

let gameState = "PLAYING";
let isAutoPlaying = false;
let autoPlayTimer = null;

let isAnimating = false;
let animStart = 0;
let currentMoveDir = null;
const ANIM_DURATION = 400;

const TW = 40;
const TH = 20;
const TZ = 40;
let originX = 0;
let originY = 0;

function initLevel() {
  const lvl = LEVELS[currentLevel];
  board = lvl.board;
  block = { x: lvl.start.x, y: lvl.start.y, state: "UPRIGHT" };
  oldBlock = { ...block };
  gameState = "PLAYING";
  isAnimating = false;
  isAutoPlaying = false;
  currentMoveDir = null;
  if (autoPlayTimer) clearInterval(autoPlayTimer);

  hintText.style.display = "none";
  overlay.classList.add("hidden");
  questionBox.classList.add("hidden");

  levelDisplay.textContent = `${currentLevel + 1}/${LEVELS.length}`;
  centerCamera();
}

function centerCamera() {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] !== 0) {
        let px = (x - y) * TW;
        let py = (x + y) * TH;
        minX = Math.min(minX, px - TW);
        maxX = Math.max(maxX, px + TW);
        minY = Math.min(minY, py - TH);
        maxY = Math.max(maxY, py + TH);
      }
    }
  }
  const boardW = maxX - minX;
  const boardH = maxY - minY;
  originX = (canvas.width - boardW) / 2 - minX;
  originY = (canvas.height - boardH) / 2 - minY + 20;
}

function moveBlock(dir) {
  if (gameState !== "PLAYING" || isAnimating) return;

  oldBlock = { x: block.x, y: block.y, state: block.state };
  currentMoveDir = dir;

  if (block.state === "UPRIGHT") {
    if (dir === "RIGHT") {
      block.x += 1;
      block.state = "FLAT_X";
    } else if (dir === "LEFT") {
      block.x -= 2;
      block.state = "FLAT_X";
    } else if (dir === "DOWN") {
      block.y += 1;
      block.state = "FLAT_Y";
    } else if (dir === "UP") {
      block.y -= 2;
      block.state = "FLAT_Y";
    }
  } else if (block.state === "FLAT_X") {
    if (dir === "RIGHT") {
      block.x += 2;
      block.state = "UPRIGHT";
    } else if (dir === "LEFT") {
      block.x -= 1;
      block.state = "UPRIGHT";
    } else if (dir === "DOWN") {
      block.y += 1;
    } else if (dir === "UP") {
      block.y -= 1;
    }
  } else if (block.state === "FLAT_Y") {
    if (dir === "RIGHT") {
      block.x += 1;
    } else if (dir === "LEFT") {
      block.x -= 1;
    } else if (dir === "DOWN") {
      block.y += 2;
      block.state = "UPRIGHT";
    } else if (dir === "UP") {
      block.y -= 1;
      block.state = "UPRIGHT";
    }
  }

  isAnimating = true;
  animStart = performance.now();
}

function checkGameState() {
  let tiles = getBlockTiles(block);
  for (let t of tiles) {
    if (
      t.y < 0 ||
      t.y >= board.length ||
      t.x < 0 ||
      t.x >= board[0].length ||
      board[t.y][t.x] === 0
    ) {
      showFinalResult(false, "VĂNG KHỎI HỆ THỐNG!");
      return;
    }
  }

  if (block.state === "UPRIGHT" && board[block.y][block.x] === 2) {
    gameState = "QUESTION";
    clearInterval(autoPlayTimer);
    isAutoPlaying = false;
    showQuestionModal();
  }
}

function showQuestionModal() {
  setTimeout(() => {
    overlayTitle.textContent = "HỆ THỐNG YÊU CẦU XÁC THỰC";
    overlayTitle.style.color = "#fbbf24";

    questionBox.classList.remove("hidden");
    nextLevelBtn.style.display = "none";
    retryBtn.style.display = "none";

    const lvl = LEVELS[currentLevel];
    questionText.textContent = lvl.question;
    answersContainer.innerHTML = "";

    lvl.answers.forEach((ans, idx) => {
      const btn = document.createElement("button");
      btn.className = "ans-btn";
      btn.textContent = ans;
      btn.onclick = () => handleAnswer(idx, btn);
      answersContainer.appendChild(btn);
    });

    overlay.classList.remove("hidden");
  }, 100);
}

function handleAnswer(selectedIndex, btnElement) {
  const lvl = LEVELS[currentLevel];
  const allBtns = answersContainer.querySelectorAll(".ans-btn");
  allBtns.forEach((b) => (b.disabled = true));

  if (selectedIndex === lvl.correct) {
    btnElement.classList.add("correct");
    setTimeout(() => {
      showFinalResult(true, "MÃ HÓA & XÁC THỰC THÀNH CÔNG!");
    }, 1000);
  } else {
    btnElement.classList.add("wrong");
    allBtns[lvl.correct].classList.add("correct");

    setTimeout(() => {
      // Sửa ở đây: Tham số thứ 3 (forceNext = true) giúp người chơi sai vẫn được đi tiếp
      showFinalResult(
        false,
        `SAI MÃ!\nNhưng hệ thống vẫn cho phép đi tiếp!`,
        true,
      );
    }, 2000); // Kéo dài thời gian để khán giả kịp đọc đáp án đúng
  }
}

// Thêm tham số `forceNext` để ép qua bài dù trả lời sai
function showFinalResult(isWin, msg, forceNext = false) {
  gameState = isWin ? "WIN" : "LOSE";

  // Dùng innerHTML để cho phép ngắt dòng nếu text dài
  overlayTitle.innerHTML = msg.replace("\n", "<br>");
  overlayTitle.style.color = isWin ? "#4ade80" : "#f87171";

  questionBox.classList.add("hidden");
  overlay.classList.remove("hidden");

  // Nếu thắng HOẶC được ép qua bài (forceNext)
  if (isWin || forceNext) {
    retryBtn.style.display = "none";
    if (currentLevel < LEVELS.length - 1) {
      nextLevelBtn.style.display = "block";
    } else {
      nextLevelBtn.style.display = "none";
      statusMsg.textContent =
        "BẠN ĐÃ GIẢI MÃ THÀNH CÔNG TOÀN BỘ KHỐI DỮ LIỆU! MINI-GAME 21 HOÀN TẤT!";
      statusMsg.className = "feedback-box success";
      statusMsg.classList.remove("hidden");
      finishBtn.style.display = "block";

      let states = JSON.parse(localStorage.getItem("game_states") || "{}");
      states[21] = "DONE";
      localStorage.setItem("game_states", JSON.stringify(states));
    }
  } else {
    // Rớt khỏi map thì bắt buộc phải retry
    nextLevelBtn.style.display = "none";
    retryBtn.style.display = "block";
  }
}

function getBlockTiles(b) {
  if (b.state === "UPRIGHT") return [{ x: b.x, y: b.y }];
  if (b.state === "FLAT_X")
    return [
      { x: b.x, y: b.y },
      { x: b.x + 1, y: b.y },
    ];
  if (b.state === "FLAT_Y")
    return [
      { x: b.x, y: b.y },
      { x: b.x, y: b.y + 1 },
    ];
}

window.addEventListener("keydown", (e) => {
  // Chỉ nhận phím khi đang chơi và không trong trạng thái animation
  if (gameState !== "PLAYING" || isAnimating) return;

  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      e.preventDefault();
      moveBlock("LEFT"); // Mũi tên lên -> Đi lên (Tăng Y âm)
      break;

    case "ArrowDown":
    case "s":
    case "S":
      e.preventDefault();
      moveBlock("RIGHT"); // Mũi tên xuống -> Lùi/Đi xuống (Tăng Y dương)
      break;

    case "ArrowLeft":
    case "a":
    case "A":
      e.preventDefault();
      moveBlock("DOWN"); // Mũi tên trái -> Sang trái (Tăng X âm)
      break;

    case "ArrowRight":
    case "d":
    case "D":
      e.preventDefault();
      moveBlock("UP"); // Mũi tên phải -> Sang phải (Tăng X dương)
      break;
  }
});

function toScreen(x, y, z) {
  return { x: originX + (x - y) * TW, y: originY + (x + y) * TH - z * TZ };
}

function drawIsoGridBox(ctx, gx, gy, isGoal) {
  const pT0 = toScreen(gx, gy, 0.3);
  const pTR = toScreen(gx + 1, gy, 0.3);
  const pTB = toScreen(gx + 1, gy + 1, 0.3);
  const pTL = toScreen(gx, gy + 1, 0.3);
  const pBR = toScreen(gx + 1, gy, 0);
  const pBB = toScreen(gx + 1, gy + 1, 0);
  const pBL = toScreen(gx, gy + 1, 0);

  ctx.fillStyle = isGoal ? "#0f172a" : "#cbd5e1";
  ctx.beginPath();
  ctx.moveTo(pT0.x, pT0.y);
  ctx.lineTo(pTR.x, pTR.y);
  ctx.lineTo(pTB.x, pTB.y);
  ctx.lineTo(pTL.x, pTL.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  if (isGoal) {
    ctx.fillStyle = "#020617";
    ctx.fill();
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  ctx.fillStyle = isGoal ? "#000000" : "#94a3b8";
  ctx.beginPath();
  ctx.moveTo(pTR.x, pTR.y);
  ctx.lineTo(pBR.x, pBR.y);
  ctx.lineTo(pBB.x, pBB.y);
  ctx.lineTo(pTB.x, pTB.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isGoal ? "#000000" : "#64748b";
  ctx.beginPath();
  ctx.moveTo(pTL.x, pTL.y);
  ctx.lineTo(pTB.x, pTB.y);
  ctx.lineTo(pBB.x, pBB.y);
  ctx.lineTo(pBL.x, pBL.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawPlayerBlock(ctx, baseBlock, dir, t) {
  let bW = baseBlock.state === "FLAT_X" ? 2 : 1;
  let bL = baseBlock.state === "FLAT_Y" ? 2 : 1;
  let bH = baseBlock.state === "UPRIGHT" ? 2 : 1;
  let bx = baseBlock.x;
  let by = baseBlock.y;

  let verts = [
    { x: bx, y: by, z: 0.3 },
    { x: bx + bW, y: by, z: 0.3 },
    { x: bx + bW, y: by + bL, z: 0.3 },
    { x: bx, y: by + bL, z: 0.3 },
    { x: bx, y: by, z: bH + 0.3 },
    { x: bx + bW, y: by, z: bH + 0.3 },
    { x: bx + bW, y: by + bL, z: bH + 0.3 },
    { x: bx, y: by + bL, z: bH + 0.3 },
  ];

  if (t > 0 && dir) {
    let theta = 0;
    let axis = "";
    let pivot = { x: 0, y: 0, z: 0.3 };
    if (dir === "RIGHT") {
      pivot.x = bx + bW;
      axis = "Y";
      theta = t * (Math.PI / 2);
    } else if (dir === "LEFT") {
      pivot.x = bx;
      axis = "Y";
      theta = -t * (Math.PI / 2);
    } else if (dir === "DOWN") {
      pivot.y = by + bL;
      axis = "X";
      theta = -t * (Math.PI / 2);
    } else if (dir === "UP") {
      pivot.y = by;
      axis = "X";
      theta = t * (Math.PI / 2);
    }

    for (let v of verts) {
      let dx = v.x - pivot.x;
      let dy = v.y - pivot.y;
      let dz = v.z - pivot.z;
      if (axis === "Y") {
        v.x = pivot.x + (dx * Math.cos(theta) + dz * Math.sin(theta));
        v.z = pivot.z + (-dx * Math.sin(theta) + dz * Math.cos(theta));
      } else if (axis === "X") {
        v.y = pivot.y + (dy * Math.cos(theta) - dz * Math.sin(theta));
        v.z = pivot.z + (dy * Math.sin(theta) + dz * Math.cos(theta));
      }
    }
  }

  const facesDef = [
    { verts: [0, 1, 2, 3], color: "#78350f" },
    { verts: [4, 5, 6, 7], color: "#f59e0b" },
    { verts: [0, 1, 5, 4], color: "#92400e" },
    { verts: [3, 2, 6, 7], color: "#d97706" },
    { verts: [0, 3, 7, 4], color: "#92400e" },
    { verts: [1, 2, 6, 5], color: "#b45309" },
  ];

  let faces = facesDef.map((f) => {
    let pV = f.verts.map((i) => verts[i]);
    let centroidDist = pV.reduce((s, v) => s + (v.x + v.y + v.z), 0);
    let sV = pV.map((v) => toScreen(v.x, v.y, v.z));
    return { color: f.color, dist: centroidDist, sV };
  });

  faces.sort((a, b) => a.dist - b.dist);

  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.lineWidth = 1.5;
  for (let f of faces) {
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.moveTo(f.sV[0].x, f.sV[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(f.sV[i].x, f.sV[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function renderLoop(now) {
  requestAnimationFrame(renderLoop);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      let tile = board[y][x];
      if (tile === 1 || tile === 2) drawIsoGridBox(ctx, x, y, tile === 2);
    }
  }

  if (gameState !== "LOSE" || isAnimating) {
    let t = 0;
    if (isAnimating) {
      t = (now - animStart) / ANIM_DURATION;
      if (t >= 1) {
        t = 1;
        isAnimating = false;
        checkGameState();
      }
      t = t * t * (3 - 2 * t);
      drawPlayerBlock(ctx, oldBlock, currentMoveDir, t);
    } else {
      drawPlayerBlock(ctx, block, null, 0);
    }
  }
}

hintBtn.onclick = () => {
  if (gameState !== "PLAYING" || isAutoPlaying || isAnimating) return;

  let tx = -1,
    ty = -1;
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === 2) {
        tx = c;
        ty = r;
        break;
      }
    }
  }

  let queue = [{ x: block.x, y: block.y, state: block.state, path: [] }];
  let visited = new Set();
  visited.add(`${block.x},${block.y},${block.state}`);

  let solution = null;
  while (queue.length > 0) {
    let curr = queue.shift();
    if (curr.state === "UPRIGHT" && curr.x === tx && curr.y === ty) {
      solution = curr.path;
      break;
    }
    const moves = ["UP", "DOWN", "LEFT", "RIGHT"];
    for (let m of moves) {
      let next = getNextState(curr, m);
      if (isValid(next)) {
        let key = `${next.x},${next.y},${next.state}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({
            x: next.x,
            y: next.y,
            state: next.state,
            path: [...curr.path, m],
          });
        }
      }
    }
  }

  if (solution) {
    isAutoPlaying = true;
    let step = 0;
    let arrowPath = solution.map((d) => {
      if (d === "UP") return "↑";
      if (d === "DOWN") return "↓";
      if (d === "LEFT") return "←";
      return "→";
    });

    hintText.style.display = "block";
    hintText.innerHTML = `💡 AI đang giải mã: <span style="letter-spacing: 5px;">${arrowPath.join(" ")}</span>`;

    autoPlayTimer = setInterval(() => {
      if (step >= solution.length || gameState !== "PLAYING") {
        clearInterval(autoPlayTimer);
        isAutoPlaying = false;
        return;
      }
      moveBlock(solution[step]);
      step++;
    }, ANIM_DURATION + 350);
  }
};

function getNextState(b, dir) {
  let n = { x: b.x, y: b.y, state: b.state };
  if (n.state === "UPRIGHT") {
    if (dir === "RIGHT") {
      n.x += 1;
      n.state = "FLAT_X";
    } else if (dir === "LEFT") {
      n.x -= 2;
      n.state = "FLAT_X";
    } else if (dir === "DOWN") {
      n.y += 1;
      n.state = "FLAT_Y";
    } else if (dir === "UP") {
      n.y -= 2;
      n.state = "FLAT_Y";
    }
  } else if (n.state === "FLAT_X") {
    if (dir === "RIGHT") {
      n.x += 2;
      n.state = "UPRIGHT";
    } else if (dir === "LEFT") {
      n.x -= 1;
      n.state = "UPRIGHT";
    } else if (dir === "DOWN") {
      n.y += 1;
    } else if (dir === "UP") {
      n.y -= 1;
    }
  } else if (n.state === "FLAT_Y") {
    if (dir === "RIGHT") {
      n.x += 1;
    } else if (dir === "LEFT") {
      n.x -= 1;
    } else if (dir === "DOWN") {
      n.y += 2;
      n.state = "UPRIGHT";
    } else if (dir === "UP") {
      n.y -= 1;
      n.state = "UPRIGHT";
    }
  }
  return n;
}

function isValid(b) {
  let tiles = getBlockTiles(b);
  for (let t of tiles) {
    if (
      t.y < 0 ||
      t.y >= board.length ||
      t.x < 0 ||
      t.x >= board[0].length ||
      board[t.y][t.x] === 0
    )
      return false;
  }
  return true;
}

retryBtn.onclick = () => initLevel();
nextLevelBtn.onclick = () => {
  currentLevel++;
  initLevel();
};
finishBtn.onclick = () => (window.location.href = "questions.html");

requestAnimationFrame(renderLoop);
initLevel();
