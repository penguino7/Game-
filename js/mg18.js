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
// DATA VÀ LUẬT CHƠI
// =========================================
const GAME_DATA = {
  question: "🎯 Mission: Smash all MALWARE to reach 100 Points!",
  targets: [
    // Malware (hit these)
    "Trojan",
    "Worm",
    "Ransomware",
    "Spyware",
    "Adware",
    "Rootkit",
    "Botnet",
    "Keylogger",
    "Backdoor",
    "Cryptominer",
    "Downloader",
    "Dropper",
    "Fileless Malware",
    "Macro Virus",
    "Polymorphic Virus",
    "Logic Bomb",
    "Scareware",
    "Browser Hijacker",
    "RAT (Remote Access Trojan)",
    "Mobile Malware",
    "Malvertising",
    "Exploit Kit",
  ],
  decoys: [
    // Security / safe terms (do NOT hit)
    "Firewall",
    "VPN",
    "Antivirus",
    "HTTPS",
    "WAF",
    "MFA",
    "Token",
    "IDS",
    "IPS",
    "EDR",
    "SIEM",
    "Zero Trust",
    "Patch",
    "Backup",
    "Encryption",
    "Access Control",
    "Least Privilege",
    "Network Segmentation",
    "Sandbox",
    "CAPTCHA",
    "Password Manager",
    "Secure Boot",
    "Biometrics",
  ],
};

const TARGET_SCORE = 100;

let holes = [];
let score = 0;
let timeLeft = 45;
let isGameActive = false;
let gameInterval;
let spawnerInterval; // Bộ sinh chuột liên tục

// 1. Khởi tạo Bàn chơi
function initBoard() {
  whackBoard.innerHTML = "";
  holes = [];

  for (let i = 0; i < 9; i++) {
    const hole = document.createElement("div");
    hole.className = "hole";

    const mole = document.createElement("div");
    mole.className = "mole neutral";

    mole.addEventListener("pointerdown", (e) => {
      if (!e.isTrusted || !isGameActive) return;
      whack(mole);
    });

    hole.appendChild(mole);
    whackBoard.appendChild(hole);
    // Mỗi hố lưu trữ timer riêng để không bị đè lệnh
    holes.push({ holeEl: hole, moleEl: mole, isUp: false, timer: null });
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

// 2. Chuột thò đầu lên
function peep() {
  if (!isGameActive) return;

  const holeObj = randomHole();
  if (!holeObj) return;

  const time = randomTime(1000, 2000);
  const isTarget = Math.random() > 0.4;

  holeObj.isUp = true;
  holeObj.moleEl.className = "mole neutral up";
  holeObj.moleEl.dataset.type = isTarget ? "target" : "decoy";

  holeObj.moleEl.textContent = isTarget
    ? GAME_DATA.targets[Math.floor(Math.random() * GAME_DATA.targets.length)]
    : GAME_DATA.decoys[Math.floor(Math.random() * GAME_DATA.decoys.length)];

  // Lưu timer để hủy lệnh nếu bị đập sớm
  holeObj.timer = setTimeout(() => {
    holeObj.moleEl.classList.remove("up");

    // Đợi chuột tụt hẳn rồi mới mở khóa hố
    setTimeout(() => {
      holeObj.isUp = false;
    }, 300);
  }, time);
}

// 3. Xử lý logic khi ĐẬP
function whack(mole) {
  const holeObj = holes.find((h) => h.moleEl === mole);
  if (!holeObj) return;

  // Hủy lệnh tự động tụt xuống
  clearTimeout(holeObj.timer);
  mole.classList.remove("up");

  // Đợi chuột tụt hẳn rồi mới mở khóa hố (tránh lỗi hiện chữ mới khi chuột chưa kịp lặn)
  setTimeout(() => {
    holeObj.isUp = false;
  }, 300);

  const type = mole.dataset.type;

  if (type === "target") {
    // ĐẬP ĐÚNG -> Cộng điểm
    score += 10;
    mole.className = "mole whacked-correct";
    whackBoard.style.boxShadow = "0 0 30px rgba(34, 197, 94, 0.4)";
    setTimeout(() => (whackBoard.style.boxShadow = "none"), 150);
  } else {
    // ĐẬP SAI -> KHÔNG TRỪ ĐIỂM, chỉ nháy Đỏ cảnh cáo
    mole.className = "mole whacked-wrong";
    whackBoard.style.boxShadow = "0 0 50px rgba(239, 68, 68, 0.8)";
    setTimeout(() => (whackBoard.style.boxShadow = "none"), 300);
  }

  scoreDisplay.textContent = `Điểm: ${score} / ${TARGET_SCORE}`;

  if (score >= TARGET_SCORE) {
    endGame(
      true,
      `Tuyệt vời! Bạn đã đạt ${TARGET_SCORE} điểm và tiêu diệt sạch mã độc!`,
    );
  }
}

// 4. Bắt đầu game
function startGame() {
  score = 0;
  timeLeft = 45;
  scoreDisplay.textContent = `Điểm: 0 / ${TARGET_SCORE}`;
  timerDisplay.textContent = `00:45`;
  isGameActive = true;

  questionBox.classList.remove("hidden");
  questionText.textContent = GAME_DATA.question;

  // BỘ SINH CHUỘT: Tốc độ cao (mỗi 600ms sinh 1 con)
  spawnerInterval = setInterval(() => {
    if (isGameActive) peep();
  }, 600);

  gameInterval = setInterval(() => {
    timeLeft--;
    const seconds = String(timeLeft).padStart(2, "0");
    timerDisplay.textContent = `00:${seconds}`;

    if (timeLeft <= 10 && timeLeft > 0) timerDisplay.classList.add("warning");

    if (timeLeft <= 0) {
      endGame(false, `Hết giờ! Bạn chỉ đạt ${score}/${TARGET_SCORE} điểm.`);
    }
  }, 1000);
}

// 5. Kết thúc game
function endGame(isWin, msg) {
  isGameActive = false;
  clearInterval(gameInterval);
  clearInterval(spawnerInterval);
  timerDisplay.classList.remove("warning");

  holes.forEach((h) => {
    clearTimeout(h.timer);
    h.moleEl.classList.remove("up");
    h.isUp = false;
  });

  statusMsg.textContent = msg;
  statusMsg.className = `feedback-box ${isWin ? "success" : "error"}`;
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
