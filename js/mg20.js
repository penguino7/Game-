const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const clearBtn = document.getElementById("clearBtn");
const startBtn = document.getElementById("startBtn");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");
const levelDisplay = document.getElementById("levelDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");

// =========================================
// 1. CẤU HÌNH 4 LEVEL (ĐÃ FIX KHE HỞ ĐỂ ĐI LỌT)
// =========================================
const LEVELS = [
  {
    name: "Standard Routing (Giao thức cơ bản)",
    desc: "Đi qua Trạm Định Tuyến (ROUTER)",
    start: { x: 70, y: 210, r: 25, label: "CLIENT" },
    end: { x: 730, y: 210, r: 35, label: "SERVER" },
    checkpoints: [{ x: 400, y: 210, r: 35, label: "ROUTER", hit: false }],
    obstacles: [
      { x: 400, y: 60, r: 50 }, // Đã nới rộng
      { x: 400, y: 360, r: 50 }, // Đã nới rộng
    ],
  },
  {
    name: "Proxy Server (Máy chủ ủy quyền)",
    desc: "Đổi IP qua Trạm PROXY trước khi tới Server",
    start: { x: 70, y: 350, r: 25, label: "CLIENT" },
    end: { x: 730, y: 350, r: 35, label: "SERVER" },
    checkpoints: [{ x: 400, y: 80, r: 35, label: "PROXY", hit: false }],
    obstacles: [
      { x: 400, y: 260, r: 60 },
      { x: 200, y: 150, r: 40 }, // Đã thu nhỏ
      { x: 600, y: 150, r: 40 }, // Đã thu nhỏ
    ],
  },
  {
    name: "VPN Tunneling (Đường hầm riêng ảo)",
    desc: "Vào đường hầm VPN -> Lọc qua FIREWALL -> Server",
    start: { x: 70, y: 80, r: 25, label: "CLIENT" },
    end: { x: 730, y: 350, r: 35, label: "SERVER" },
    checkpoints: [
      { x: 200, y: 350, r: 35, label: "VPN", hit: false },
      { x: 600, y: 80, r: 35, label: "FIREWALL", hit: false },
    ],
    obstacles: [
      { x: 400, y: 210, r: 50 }, // Đã thu nhỏ cục ở giữa (từ 80 -> 50)
      { x: 400, y: 30, r: 40 }, // Đẩy lên cao
      { x: 400, y: 390, r: 40 }, // Đẩy xuống thấp
    ],
  },
  {
    name: "Onion Routing (Mạng ẩn danh Tor)",
    desc: "Gói tin nảy qua 3 Node (ENTRY -> RELAY -> EXIT)",
    start: { x: 70, y: 210, r: 25, label: "CLIENT" },
    end: { x: 730, y: 210, r: 35, label: "SERVER" },
    checkpoints: [
      { x: 250, y: 80, r: 30, label: "ENTRY", hit: false },
      { x: 400, y: 350, r: 30, label: "RELAY", hit: false },
      { x: 550, y: 80, r: 30, label: "EXIT", hit: false },
    ],
    obstacles: [
      { x: 250, y: 260, r: 45 },
      { x: 400, y: 180, r: 50 },
      { x: 550, y: 260, r: 45 },
    ],
  },
];

let currentLevel = 0;
let isDrawing = false;
let path = [];
let packet = null;
let animationId = null;
let gameState = "MISSION_INTRO";

function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY,
  };
}

// 2. Logic Vẽ đường
canvas.addEventListener("mousedown", (e) => {
  if (gameState !== "DRAWING") return;
  isDrawing = true;
  path = [getMousePos(e)];
  drawScene();
});
canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing || gameState !== "DRAWING") return;
  path.push(getMousePos(e));
  drawScene();
});
window.addEventListener("mouseup", () => (isDrawing = false));

// Cho màn hình cảm ứng
canvas.addEventListener("touchstart", (e) => {
  if (gameState !== "DRAWING") return;
  isDrawing = true;
  path = [getMousePos(e.touches[0])];
  drawScene();
});
canvas.addEventListener(
  "touchmove",
  (e) => {
    if (!isDrawing || gameState !== "DRAWING") return;
    e.preventDefault();
    path.push(getMousePos(e.touches[0]));
    drawScene();
  },
  { passive: false },
);
window.addEventListener("touchend", () => (isDrawing = false));

// =========================================
// 3. HIỂN THỊ THÔNG BÁO GIAO NHIỆM VỤ
// =========================================
function loadLevel() {
  resetPath();
  const lvl = LEVELS[currentLevel];
  gameState = "MISSION_INTRO";

  // Popup Nhiệm vụ
  overlayTitle.innerHTML = `VÒNG ${currentLevel + 1}/4<br>
    <span style="font-size:26px; color:#93c5fd; margin-top:15px; display:block;">Cấu hình: ${lvl.name}</span>
    <span style="font-size:18px; color:#cbd5e1; font-weight:normal; display:block; margin-top:5px;">Yêu cầu: ${lvl.desc}</span>`;
  overlayTitle.style.color = "#60a5fa";

  nextLevelBtn.innerHTML = 'BẮT ĐẦU VẼ <i class="fas fa-pencil-alt"></i>';
  nextLevelBtn.style.display = "block";
  overlay.classList.remove("hidden");

  if (levelDisplay)
    levelDisplay.textContent = `${currentLevel + 1}/${LEVELS.length}`;

  nextLevelBtn.onclick = () => {
    overlay.classList.add("hidden");
    gameState = "DRAWING";
    drawScene();
  };
  drawScene();
}

function resetPath() {
  cancelAnimationFrame(animationId);
  path = [];
  packet = null;
  LEVELS[currentLevel].checkpoints.forEach((cp) => (cp.hit = false));
}

// =========================================
// 4. RENDER ĐỒ HỌA
// =========================================
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const lvl = LEVELS[currentLevel];

  // Hiển thị tên bài test mờ mờ trên góc
  ctx.fillStyle = "#475569";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Mode: ${lvl.name}`, 20, 30);

  ctx.shadowBlur = 10;

  // Vẽ Obstacles (Mã độc)
  lvl.obstacles.forEach((obs) => {
    ctx.shadowColor = "#ef4444";
    ctx.beginPath();
    ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(239, 68, 68, 0.1)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ef4444";
    ctx.stroke();
    ctx.fillStyle = "#ef4444";
    ctx.font = '900 30px "Font Awesome 6 Free"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\uf140", obs.x, obs.y);
  });

  // Vẽ Checkpoints (Trạm trung chuyển) - Tím Neon
  lvl.checkpoints.forEach((cp) => {
    ctx.shadowColor = cp.hit ? "#a855f7" : "#d8b4fe"; // Đổi màu khi đi qua
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, cp.r, 0, Math.PI * 2);
    ctx.fillStyle = cp.hit
      ? "rgba(168, 85, 247, 0.3)"
      : "rgba(168, 85, 247, 0.1)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = cp.hit ? "#a855f7" : "#d8b4fe";
    ctx.stroke();
    ctx.fillStyle = "#d8b4fe";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cp.label, cp.x, cp.y);
  });

  // Vẽ End (Server)
  ctx.shadowColor = "#4ade80";
  ctx.beginPath();
  ctx.arc(lvl.end.x, lvl.end.y, lvl.end.r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(74, 222, 128, 0.1)";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#4ade80";
  ctx.stroke();
  ctx.fillStyle = "#4ade80";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(lvl.end.label, lvl.end.x, lvl.end.y);

  // Vẽ Đường (Line)
  ctx.shadowColor = "#60a5fa";
  if (path.length > 0) {
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  // Vẽ Start / Packet
  const pX = packet ? packet.x : lvl.start.x;
  const pY = packet ? packet.y : lvl.start.y;
  ctx.beginPath();
  ctx.arc(pX, pY, lvl.start.r, 0, Math.PI * 2);
  ctx.fillStyle = "#60a5fa";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#fff";
  ctx.stroke();
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(lvl.start.label, pX, pY);
}

// =========================================
// 5. XỬ LÝ DI CHUYỂN & VA CHẠM
// =========================================
startBtn.onclick = () => {
  if (gameState !== "DRAWING") return;
  if (path.length < 5) return alert("Vui lòng vẽ nét đứt liền mạch!");

  const lvl = LEVELS[currentLevel];
  if (Math.hypot(path[0].x - lvl.start.x, path[0].y - lvl.start.y) > 50)
    return alert("Gói tin phải xuất phát từ CLIENT!");

  lvl.checkpoints.forEach((cp) => (cp.hit = false)); // Reset trạm
  gameState = "MOVING";
  packet = { x: path[0].x, y: path[0].y, targetIndex: 1 };
  animatePacket();
};

function animatePacket() {
  if (gameState !== "MOVING") return;

  const lvl = LEVELS[currentLevel];
  const speed = 6;
  let target = path[packet.targetIndex];

  let dx = target.x - packet.x;
  let dy = target.y - packet.y;
  let dist = Math.hypot(dx, dy);

  if (dist < speed) {
    packet.x = target.x;
    packet.y = target.y;
    packet.targetIndex++;
    if (packet.targetIndex >= path.length) return checkWinCondition();
  } else {
    packet.x += (dx / dist) * speed;
    packet.y += (dy / dist) * speed;
  }

  // Thu thập Checkpoints (Trạm)
  lvl.checkpoints.forEach((cp) => {
    if (
      !cp.hit &&
      Math.hypot(packet.x - cp.x, packet.y - cp.y) < lvl.start.r + cp.r
    ) {
      cp.hit = true;
    }
  });

  // Chạm mã độc
  for (let obs of lvl.obstacles) {
    if (
      Math.hypot(packet.x - obs.x, packet.y - obs.y) <
      lvl.start.r + obs.r - 10
    ) {
      return showResult(
        false,
        "BÙM! Gói tin bị lộ!<br><span style='font-size:20px;'>Dữ liệu đã đi vào vùng kiểm soát của Mã độc.</span>",
      );
    }
  }

  // Chạm đích
  if (
    Math.hypot(packet.x - lvl.end.x, packet.y - lvl.end.y) <
    lvl.start.r + lvl.end.r
  ) {
    return checkWinCondition();
  }

  drawScene();
  animationId = requestAnimationFrame(animatePacket);
}

function checkWinCondition() {
  const lvl = LEVELS[currentLevel];
  const allCheckpointsHit = lvl.checkpoints.every((cp) => cp.hit === true);

  if (!allCheckpointsHit) {
    // Thua vì đi thiếu trạm
    showResult(
      false,
      "LỖI GIAO THỨC!<br><span style='font-size:20px; color:#cbd5e1;'>Gói tin đi sai quy trình, bạn phải đi qua đủ các trạm!</span>",
    );
  } else if (
    Math.hypot(packet.x - lvl.end.x, packet.y - lvl.end.y) >
    lvl.start.r + lvl.end.r
  ) {
    // Thua vì cáp ngắn
    showResult(
      false,
      "ĐƯỜNG TRUYỀN BỊ ĐỨT!<br><span style='font-size:20px; color:#cbd5e1;'>Dữ liệu chưa chạm tới Server đích.</span>",
    );
  } else {
    // Thắng
    showResult(
      true,
      "TRUYỀN TẢI THÀNH CÔNG!<br><span style='font-size:20px; color:#cbd5e1;'>Đường truyền hoàn toàn bảo mật.</span>",
    );
  }
}

// =========================================
// 6. KẾT QUẢ & NÚT ĐIỀU KHIỂN
// =========================================
function showResult(isWin, msg) {
  gameState = "GAMEOVER";
  cancelAnimationFrame(animationId);
  drawScene();
  overlayTitle.innerHTML = msg;
  overlayTitle.style.color = isWin ? "#4ade80" : "#f87171";
  overlay.classList.remove("hidden");

  if (isWin) {
    if (currentLevel < LEVELS.length - 1) {
      nextLevelBtn.innerHTML = 'BÀI TIẾP THEO <i class="fas fa-forward"></i>';
      nextLevelBtn.style.display = "block";
      nextLevelBtn.onclick = () => {
        currentLevel++;
        loadLevel();
      };
    } else {
      nextLevelBtn.style.display = "none";
      if (scoreDisplay) scoreDisplay.textContent = "100";
      statusMsg.textContent =
        "CHÚC MỪNG! BẠN LÀ BẬC THẦY KIẾN TRÚC MẠNG - MINI-GAME 20 HOÀN TẤT!";
      statusMsg.className = "feedback-box success";
      statusMsg.classList.remove("hidden");
      finishBtn.style.display = "block";
      let states = JSON.parse(localStorage.getItem("game_states") || "{}");
      states[20] = "DONE";
      localStorage.setItem("game_states", JSON.stringify(states));
    }
  } else {
    // Nút Thử Lại nếu thua
    nextLevelBtn.innerHTML = 'THỬ LẠI <i class="fas fa-redo"></i>';
    nextLevelBtn.style.display = "block";
    nextLevelBtn.onclick = () => {
      clearBtn.onclick();
    };
  }
}

clearBtn.onclick = () => {
  resetPath();
  gameState = "DRAWING";
  overlay.classList.add("hidden");
  drawScene();
};

finishBtn.onclick = () => (window.location.href = "questions.html");

// Chạy Level đầu tiên
loadLevel();
