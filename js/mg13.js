const gameArea = document.getElementById("gameArea");
const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const startOverlay = document.getElementById("startOverlay");
const startBtn = document.getElementById("startBtn");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");

// Cấu hình game
const TARGET_SCORE = 10;
let score = 0;
let timeLeft = 30; // 30 giây chơi
let gameInterval, spawnInterval;
let isGameActive = false;

// Kho từ vựng bay lơ lửng
const THREATS = ["XSS", "SQLi", "CSRF", "DDoS", "Malware", "Phishing", "IDOR"];
const SAFES = ["HTTPS", "WAF", "JWT", "OAuth", "CSP", "CORS", "SSL"];

// 1. Kích hoạt Game
startBtn.addEventListener("click", () => {
  startOverlay.classList.add("hidden");
  isGameActive = true;
  score = 0;
  updateScore(0);

  // Đếm ngược đồng hồ
  gameInterval = setInterval(() => {
    timeLeft--;
    const seconds = String(timeLeft).padStart(2, "0");
    timerDisplay.textContent = `00:${seconds}`;

    if (timeLeft <= 10) timerDisplay.classList.add("warning");

    if (timeLeft <= 0) endGame(false);
  }, 1000);

  // Liên tục sinh ra vật thể (mỗi 0.7 giây)
  spawnInterval = setInterval(spawnItem, 700);
});

// 2. Tạo vật thể bay
function spawnItem() {
  if (!isGameActive) return;

  const item = document.createElement("div");
  item.classList.add("flying-item");

  // Tỉ lệ 60% là mã độc (đỏ), 40% là an toàn (xanh)
  const isThreat = Math.random() > 0.4;

  if (isThreat) {
    item.textContent = THREATS[Math.floor(Math.random() * THREATS.length)];
    item.classList.add("threat");
  } else {
    item.textContent = SAFES[Math.floor(Math.random() * SAFES.length)];
    item.classList.add("safe");
  }

  // Random vị trí xuất hiện theo chiều ngang (10% đến 85% chiều rộng)
  const randomX = Math.floor(Math.random() * 75) + 10;
  item.style.left = `${randomX}%`;

  // Tốc độ bay ngẫu nhiên (từ 2.5s đến 4s)
  const duration = Math.random() * 1.5 + 2.5;
  item.style.transitionDuration = `${duration}s`;

  // Thêm vào bầu trời
  gameArea.appendChild(item);

  // Kích hoạt animation trôi lên trên
  setTimeout(() => {
    item.style.transform = `translateY(-600px)`; // Bay vút lên trên
  }, 50);

  // Lắng nghe sự kiện click (Bắn trúng)
  item.addEventListener("click", () => {
    if (!isGameActive) return;

    if (isThreat) {
      // Bắn trúng mã độc -> Nổ, Cộng điểm
      item.classList.add("exploded");
      updateScore(1);
    } else {
      // Bắn nhầm phe ta -> Lỗi, Trừ điểm
      gameArea.style.background = "rgba(239, 68, 68, 0.2)"; // Màn hình chớp đỏ
      setTimeout(() => (gameArea.style.background = "#0b1220"), 200);
      updateScore(-1);
    }
  });

  // Xóa rác khi vật thể bay khỏi màn hình
  setTimeout(() => {
    if (gameArea.contains(item)) item.remove();
  }, duration * 1000);
}

// 3. Cập nhật điểm
function updateScore(points) {
  score += points;
  if (score < 0) score = 0; // Không cho điểm âm
  scoreDisplay.textContent = `Score: ${score} / ${TARGET_SCORE}`;

  if (score >= TARGET_SCORE) endGame(true);
}

// 4. Kết thúc game
function endGame(isWin) {
  isGameActive = false;
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  timerDisplay.classList.remove("warning");

  // Khóa tương tác
  gameArea.style.pointerEvents = "none";

  if (isWin) {
    statusMsg.textContent = "Firewall Secured! Chặn đứng thành công mã độc.";
    statusMsg.className = "feedback-box success";
  } else {
    statusMsg.textContent = "System Compromised! Hết thời gian.";
    statusMsg.className = "feedback-box error";
  }

  statusMsg.classList.remove("hidden");
  finishBtn.style.display = "block";

  // Lưu trạng thái
  let states = JSON.parse(localStorage.getItem("game_states") || "{}");
  states[13] = "DONE";
  localStorage.setItem("game_states", JSON.stringify(states));
}

// Nút quay lại
finishBtn.addEventListener(
  "click",
  () => (window.location.href = "questions.html"),
);
