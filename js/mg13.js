const gameArea = document.getElementById("gameArea");
const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const startOverlay = document.getElementById("startOverlay");
const startBtn = document.getElementById("startBtn");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");

// Cấu hình game
const TARGET_SCORE = 10; // Đạt 10 điểm là thắng
let score = 0;
let timeLeft = 30; // 30 giây chơi
let gameInterval, spawnInterval;
let isGameActive = false;

// Kho từ vựng siêu to khổng lồ (Cậu có thể tự thêm bớt tùy thích)
const THREATS = [
  "XSS",
  "SQLi",
  "CSRF",
  "DDoS",
  "Malware",
  "Phishing",
  "IDOR",
  "RCE",
  "MITM",
  "SSRF",
  "LFI",
  "Ransomware",
  "Botnet",
  "Trojan",
  "Keylogger",
  "Zero-day",
  "Spoofing",
  "Brute Force",
  "Logic Flaw",
];

const SAFES = [
  "HTTPS",
  "WAF",
  "JWT",
  "OAuth",
  "CSP",
  "CORS",
  "SSL",
  "VPN",
  "2FA",
  "MFA",
  "TLS",
  "IPS",
  "IDS",
  "RBAC",
  "Encryption",
  "Firewall",
  "Biometrics",
  "SSO",
  "Token",
];

// 1. Kích hoạt Game khi bấm nút Start
startBtn.addEventListener("click", () => {
  startOverlay.classList.add("hidden");
  isGameActive = true;
  score = 0;
  updateScore(0);

  // Bắt đầu đếm ngược đồng hồ
  gameInterval = setInterval(() => {
    timeLeft--;
    const seconds = String(timeLeft).padStart(2, "0");
    timerDisplay.textContent = `00:${seconds}`;

    // Đỏ màn hình/đồng hồ lúc 10 giây cuối
    if (timeLeft <= 10 && timeLeft > 0) {
      timerDisplay.classList.add("warning");
    }

    if (timeLeft <= 0) {
      endGame(false); // Hết giờ = Thua
    }
  }, 1000);

  // Sinh ra vật thể liên tục mỗi 0.7 giây
  spawnInterval = setInterval(spawnItem, 350);
});

// 2. Hàm tạo vật thể bay
function spawnItem() {
  if (!isGameActive) return;

  const item = document.createElement("div");
  item.classList.add("flying-item");

  // Tỉ lệ 60% là mã độc (Đỏ), 40% là an toàn (Xanh)
  const isThreat = Math.random() > 0.4;

  if (isThreat) {
    item.textContent = THREATS[Math.floor(Math.random() * THREATS.length)];
    item.classList.add("threat");
  } else {
    item.textContent = SAFES[Math.floor(Math.random() * SAFES.length)];
    item.classList.add("safe");
  }

  // Vị trí ngang ngẫu nhiên (10% đến 85% chiều rộng)
  const randomX = Math.floor(Math.random() * 75) + 10;
  item.style.left = `${randomX}%`;

  // Tốc độ bay ngẫu nhiên: tăng lên từ 2.5s đến 4.5s (bay chậm và êm hơn)
  // Thời gian càng lớn thì vật thể trôi càng chậm
  const duration = Math.random() * 2.0 + 2.5;
  item.style.transitionDuration = `${duration}s`;

  // Thêm gói tin vào bầu trời
  gameArea.appendChild(item);

  // Kích hoạt animation trôi lên bằng cách đẩy Y âm đi xa
  setTimeout(() => {
    item.style.transform = `translateY(-800px)`;
  }, 50);

  // Lắng nghe sự kiện "chạm/bắn" cực nhạy
  item.addEventListener("pointerdown", (e) => {
    if (!isGameActive) return;

    // Ngăn chặn sự kiện mặc định để thao tác không bị delay
    e.preventDefault();

    if (isThreat) {
      // Bắn trúng mã độc: Phình to ra, mờ dần, ngừng nhận click và cộng điểm
      item.style.transition = "all 0.2s ease-out";
      item.style.transform = `${item.style.transform} scale(1.5) translateY(50px)`;
      item.style.opacity = "0";
      item.style.pointerEvents = "none";
      updateScore(1);
    } else {
      // Bắn nhầm phe ta: Màn hình chớp đỏ, ngừng nhận click và trừ điểm
      gameArea.style.background = "rgba(239, 68, 68, 0.3)";
      setTimeout(() => (gameArea.style.background = "#0b1220"), 250);
      item.style.pointerEvents = "none";
      updateScore(-1);
    }
  });

  // Dọn rác: Xóa thẻ div khi nó bay khuất để không bị lag trình duyệt
  setTimeout(() => {
    if (gameArea.contains(item)) item.remove();
  }, duration * 1000);
}

// 3. Hàm cập nhật điểm
function updateScore(points) {
  score += points;
  if (score < 0) score = 0; // Không cho phép điểm âm
  scoreDisplay.textContent = `Score: ${score} / ${TARGET_SCORE}`;

  if (score >= TARGET_SCORE) {
    endGame(true); // Đủ 10 điểm = Thắng
  }
}

// 4. Hàm kết thúc game
function endGame(isWin) {
  isGameActive = false;
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  timerDisplay.classList.remove("warning");

  // Khóa bầu trời lại không cho bắn nữa
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

  // Lưu trạng thái hoàn thành vào bộ nhớ
  let states = JSON.parse(localStorage.getItem("game_states") || "{}");
  states[13] = "DONE";
  localStorage.setItem("game_states", JSON.stringify(states));
}

// 5. Nút quay lại bảng
finishBtn.addEventListener("click", () => {
  window.location.href = "questions.html";
});
