const whackBoard = document.getElementById("whackBoard");
const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const startBtn = document.getElementById("startBtn");
const startOverlay = document.getElementById("startOverlay");
const questionBox = document.getElementById("questionBox");
const questionText = document.getElementById("questionText");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");

// =========================================
// DATA: CÂU HỎI NHIỆM VỤ VÀ TỪ KHÓA
// =========================================
const GAME_DATA = {
  question: "🎯 Nhiệm vụ: Đập nát tất cả các loại MÃ ĐỘC!",
  targets: [
    "Trojan",
    "Worm",
    "Ransomware",
    "Spyware",
    "Adware",
    "Rootkit",
    "Botnet",
  ], // Đập bọn này ăn điểm
  decoys: ["Firewall", "VPN", "Antivirus", "HTTPS", "WAF", "MFA", "Token"], // Đập nhầm bọn này trừ điểm
};

let holes = [];
let score = 0;
let timeLeft = 45;
let isGameActive = false;
let gameInterval;
let moleTimers = [];

// 1. Khởi tạo Bàn chơi
function initBoard() {
  whackBoard.innerHTML = "";
  holes = [];

  for (let i = 0; i < 9; i++) {
    const hole = document.createElement("div");
    hole.className = "hole";

    const mole = document.createElement("div");
    mole.className = "mole neutral"; // Khởi tạo màu trung tính

    // Bắt sự kiện ĐẬP
    mole.addEventListener("pointerdown", (e) => {
      if (!e.isTrusted || !isGameActive) return;
      whack(mole);
    });

    hole.appendChild(mole);
    whackBoard.appendChild(hole);
    holes.push({ holeEl: hole, moleEl: mole, isUp: false });
  }
}

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole() {
  const availableHoles = holes.filter((h) => !h.isUp);
  if (availableHoles.length === 0) return null;
  const idx = Math.floor(Math.random() * availableHoles.length);
  return availableHoles[idx];
}

// 2. Chuột thò đầu lên (Màu trung tính)
function peep() {
  if (!isGameActive) return;

  const holeObj = randomHole();
  if (!holeObj) {
    setTimeout(peep, 200);
    return;
  }

  // Tốc độ thò lên lặn xuống ngẫu nhiên từ 0.7s đến 1.3s
  const time = randomTime(700, 1300);

  // Tỉ lệ: 60% là Mục tiêu (Targets), 40% là Chim mồi (Decoys)
  const isTarget = Math.random() > 0.4;

  holeObj.isUp = true;
  // Xóa class cũ, gán class Neutral (Xanh dương) cho mọi con để che mắt
  holeObj.moleEl.className = "mole neutral up";
  holeObj.moleEl.dataset.type = isTarget ? "target" : "decoy";

  // Lấy chữ hiển thị
  holeObj.moleEl.textContent = isTarget
    ? GAME_DATA.targets[Math.floor(Math.random() * GAME_DATA.targets.length)]
    : GAME_DATA.decoys[Math.floor(Math.random() * GAME_DATA.decoys.length)];

  // Hết giờ tự động tụt xuống nếu không bị đập
  const timerId = setTimeout(() => {
    holeObj.moleEl.classList.remove("up");
    holeObj.isUp = false;
    if (isGameActive) peep();
  }, time);

  moleTimers.push(timerId);
}

// 3. Xử lý logic khi ĐẬP
function whack(mole) {
  const holeObj = holes.find((h) => h.moleEl === mole);
  if (holeObj) holeObj.isUp = false;

  const type = mole.dataset.type;

  if (type === "target") {
    // ĐẬP ĐÚNG MÃ ĐỘC -> +10 Điểm, nháy Xanh Lá
    score += 10;
    mole.className = "mole whacked-correct";
    whackBoard.style.boxShadow = "0 0 30px rgba(34, 197, 94, 0.4)";
    setTimeout(() => (whackBoard.style.boxShadow = "none"), 150);
  } else {
    // ĐẬP NHẦM ĐỒ NHÀ -> -15 Điểm, nháy Đỏ
    score -= 15;
    if (score < 0) score = 0;
    mole.className = "mole whacked-wrong";
    whackBoard.style.boxShadow = "0 0 50px rgba(239, 68, 68, 0.8)";
    setTimeout(() => (whackBoard.style.boxShadow = "none"), 300);
  }

  scoreDisplay.textContent = `Điểm: ${score}`;
}

// 4. Bắt đầu đếm ngược
function startGame() {
  score = 0;
  timeLeft = 45;
  scoreDisplay.textContent = `Điểm: 0`;
  timerDisplay.textContent = `00:45`;
  isGameActive = true;

  // Hiển thị câu hỏi nhiệm vụ
  questionBox.classList.remove("hidden");
  questionText.textContent = GAME_DATA.question;

  // Gọi 3 con trồi lên liên tục để gây lú
  peep();
  setTimeout(peep, 400);
  setTimeout(peep, 800);

  gameInterval = setInterval(() => {
    timeLeft--;
    const seconds = String(timeLeft).padStart(2, "0");
    timerDisplay.textContent = `00:${seconds}`;

    if (timeLeft <= 10 && timeLeft > 0) timerDisplay.classList.add("warning");

    if (timeLeft <= 0) endGame();
  }, 1000);
}

// 5. Kết thúc game
function endGame() {
  isGameActive = false;
  clearInterval(gameInterval);
  timerDisplay.classList.remove("warning");

  moleTimers.forEach((id) => clearTimeout(id));
  holes.forEach((h) => {
    h.moleEl.classList.remove("up");
    h.isUp = false;
  });

  statusMsg.textContent = `Hết giờ! Nhiệm vụ hoàn tất với ${score} điểm.`;
  statusMsg.className = "feedback-box success";
  statusMsg.classList.remove("hidden");
  finishBtn.style.display = "block";

  let states = JSON.parse(localStorage.getItem("game_states") || "{}");
  states[18] = "DONE";
  localStorage.setItem("game_states", JSON.stringify(states));
}

startBtn.addEventListener("click", () => {
  startOverlay.classList.add("hidden");
  startGame();
});

finishBtn.onclick = () => (window.location.href = "questions.html");

initBoard();
