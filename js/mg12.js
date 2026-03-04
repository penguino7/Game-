const memBoard = document.getElementById("memBoard");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");

// Bộ dữ liệu 6 cặp (12 thẻ)
// matchId dùng để nhận diện 2 thẻ là 1 cặp
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
let lockBoard = false;
let firstCard, secondCard;
let matchedPairs = 0;
const totalPairs = 6;

// 1. Hàm trộn mảng (Fisher-Yates Shuffle)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 2. Dàn bài ra bàn chơi
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

// 3. Logic lật thẻ
function flipCard() {
  // Khóa bàn khi đang xử lý hoặc click lại thẻ đã lật
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

// 4. Kiểm tra xem 2 thẻ có khớp không
function checkForMatch() {
  let isMatch = firstCard.dataset.match === secondCard.dataset.match;

  if (isMatch) {
    disableCards(); // Giữ nguyên mặt lật và đổi màu xanh
  } else {
    unflipCards(); // Úp lại nếu sai
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
    setTimeout(() => {
      statusMsg.textContent = "Memory Decrypted! Hệ thống đã được mở khóa.";
      statusMsg.className = "feedback-box success";
      statusMsg.classList.remove("hidden");
      finishBtn.style.display = "block";

      // Lưu trạng thái DONE cho câu 12
      let states = JSON.parse(localStorage.getItem("game_states") || "{}");
      states[12] = "DONE";
      localStorage.setItem("game_states", JSON.stringify(states));
    }, 500);
  }
}

function unflipCards() {
  lockBoard = true; // Khóa bàn phím tạm thời

  // Thêm class báo lỗi đỏ (nhìn cho kịch tính)
  firstCard.classList.add("wrong");
  secondCard.classList.add("wrong");

  // Đợi 1.2s cho khán giả kịp nhìn chữ rồi mới úp lại
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

// Bắt đầu game
initGame();
