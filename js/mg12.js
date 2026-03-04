const memBoard = document.getElementById("memBoard");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");
const timerDisplay = document.getElementById("timerDisplay");

// Các phần tử cho nút Start
const startOverlay = document.getElementById("startOverlay");
const startBtn = document.getElementById("startBtn");

// Bộ dữ liệu 6 cặp (12 thẻ)
const cardData = [
  { text: "XSS", matchId: 1 },
  { text: "Chèn mã độc JS", matchId: 1 },
  { text: "SQLi", matchId: 2 },
  { text: "Tiêm mã SQL", matchId: 2 },
  { text: "CSRF", matchId: 3 },
  { text: "Giả mạo yêu cầu", matchId: 3 },
  { text: "DDoS", matchId: 4 },
  { text: "Từ chối dịch vụ", matchId: 4 },
  { text: "Phishing", matchId: 5 },
  { text: "Lừa đảo mạng", matchId: 5 },
  { text: "CORS", matchId: 6 },
  { text: "Chia sẻ tài nguyên", matchId: 6 },
];

let hasFlippedCard = false;
// KHÓA BÀN CHƠI NGAY TỪ ĐẦU
let lockBoard = true;
let firstCard, secondCard;
let matchedPairs = 0;
const totalPairs = 6;

let timeLeft = 45;
let timerInterval;

// 1. Hàm trộn mảng
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 2. Dàn bài ra bàn chơi (nhưng chưa đếm giờ)
function initGame() {
  const shuffledCards = shuffle([...cardData]);

  shuffledCards.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("mem-card");
    cardElement.dataset.match = card.matchId;

    cardElement.innerHTML = `
      <div class="mem-card-inner">
        <div class="mem-card-front">?</div>
        <div class="mem-card-back">${card.text}</div>
      </div>
    `;

    cardElement.addEventListener("click", flipCard);
    memBoard.appendChild(cardElement);
  });
}

// 3. SỰ KIỆN BẤM NÚT START
startBtn.addEventListener("click", () => {
  // Ẩn lớp phủ đi
  startOverlay.classList.add("hidden");

  // Mở khóa bàn chơi
  lockBoard = false;

  // Bắt đầu đếm ngược
  startTimer();
});

// 4. Logic đồng hồ đếm ngược
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;

    const seconds = String(timeLeft).padStart(2, "0");
    timerDisplay.textContent = `00:${seconds}`;

    if (timeLeft <= 10 && timeLeft > 0) {
      timerDisplay.classList.add("warning");
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleGameOver();
    }
  }, 1000);
}

// Hàm xử lý khi thua (hết thời gian)
function handleGameOver() {
  lockBoard = true;
  timerDisplay.textContent = "00:00";
  timerDisplay.classList.remove("warning");

  statusMsg.textContent =
    "Time's up! Kết nối đã bị ngắt do vượt quá thời gian.";
  statusMsg.className = "feedback-box error";
  statusMsg.classList.remove("hidden");
  finishBtn.style.display = "block";

  let states = JSON.parse(localStorage.getItem("game_states") || "{}");
  states[12] = "DONE";
  localStorage.setItem("game_states", JSON.stringify(states));
}

// 5. Logic lật thẻ
function flipCard() {
  if (lockBoard || this === firstCard || this.classList.contains("matched"))
    return;

  this.classList.add("flipped");

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  checkForMatch();
}

// 6. Kiểm tra xem 2 thẻ có khớp không
function checkForMatch() {
  let isMatch = firstCard.dataset.match === secondCard.dataset.match;

  if (isMatch) {
    disableCards();
  } else {
    unflipCards();
  }
}

function disableCards() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");

  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  resetBoard();
  matchedPairs++;

  // Kiểm tra Win Game
  if (matchedPairs === totalPairs) {
    clearInterval(timerInterval);
    timerDisplay.classList.remove("warning");

    setTimeout(() => {
      statusMsg.textContent = `Memory Decrypted! Bạn còn dư ${timeLeft} giây.`;
      statusMsg.className = "feedback-box success";
      statusMsg.classList.remove("hidden");
      finishBtn.style.display = "block";

      let states = JSON.parse(localStorage.getItem("game_states") || "{}");
      states[12] = "DONE";
      localStorage.setItem("game_states", JSON.stringify(states));
    }, 500);
  }
}

function unflipCards() {
  lockBoard = true;
  firstCard.classList.add("wrong");
  secondCard.classList.add("wrong");

  setTimeout(() => {
    firstCard.classList.remove("flipped", "wrong");
    secondCard.classList.remove("flipped", "wrong");
    resetBoard();
  }, 1200);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

// Nút quay lại
finishBtn.addEventListener("click", () => {
  window.location.href = "questions.html";
});

// Chỉ dàn bài ra thôi, chưa đếm giờ
initGame();
