const wordDisplay = document.getElementById("wordDisplay");
const hintDisplay = document.getElementById("hintDisplay");
const keyboard = document.getElementById("keyboard");
const hangmanFigure = document.getElementById("hangmanFigure");
const mistakeDisplay = document.getElementById("mistakeDisplay");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");

// Kho từ vựng bảo mật (Chỉ dùng chữ cái tiếng Anh A-Z không dấu)
const WORDS = [
  {
    word: "PHISHING",
    hint: "Kỹ thuật lừa đảo qua email giả mạo để lấy cắp mật khẩu.",
  },
  {
    word: "FIREWALL",
    hint: "Bức tường lửa bảo vệ mạng lưới khỏi các truy cập trái phép.",
  },
  { word: "ENCRYPTION", hint: "Quá trình mã hóa dữ liệu để bảo vệ thông tin." },
  { word: "MALWARE", hint: "Tên gọi chung của các phần mềm độc hại." },
  {
    word: "BACKDOOR",
    hint: "Cửa hậu giúp hacker truy cập hệ thống mà không cần xác thực.",
  },
  {
    word: "BOTNET",
    hint: "Mạng lưới các máy tính bị nhiễm mã độc bị điều khiển từ xa.",
  },
];

let selectedWord = "";
let guessedLetters = [];
let mistakes = 0;
const MAX_MISTAKES = 6;
let isGameOver = false;

// 1. Khởi tạo Game
function initGame() {
  // Chọn ngẫu nhiên 1 từ
  const randomItem = WORDS[Math.floor(Math.random() * WORDS.length)];
  selectedWord = randomItem.word.toUpperCase();
  hintDisplay.textContent = `Gợi ý: ${randomItem.hint}`;

  mistakes = 0;
  guessedLetters = [];
  isGameOver = false;
  hangmanFigure.className = "hangman-figure"; // Xóa các class mistake cũ
  mistakeDisplay.textContent = `Lỗi: ${mistakes} / ${MAX_MISTAKES}`;

  renderWord();
  renderKeyboard();
}

// 2. Hiển thị các ô chữ cái (Gạch chân)
function renderWord() {
  wordDisplay.innerHTML = "";

  selectedWord.split("").forEach((letter) => {
    const letterBox = document.createElement("div");

    // Nếu là khoảng trắng
    if (letter === " ") {
      letterBox.className = "letter-box space";
    } else {
      letterBox.className = "letter-box";
      // Nếu chữ đã được đoán đúng thì hiện ra
      if (guessedLetters.includes(letter)) {
        letterBox.textContent = letter;
      }
    }
    wordDisplay.appendChild(letterBox);
  });
}

// 3. Hiển thị bàn phím A-Z
function renderKeyboard() {
  keyboard.innerHTML = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  alphabet.forEach((letter) => {
    const btn = document.createElement("button");
    btn.className = "key-btn";
    btn.textContent = letter;

    btn.addEventListener("click", () => handleGuess(letter, btn));
    keyboard.appendChild(btn);
  });
}

// 4. Xử lý khi click vào 1 chữ cái
function handleGuess(letter, btnElement) {
  if (isGameOver || guessedLetters.includes(letter)) return;

  guessedLetters.push(letter);

  // Nếu đoán ĐÚNG
  if (selectedWord.includes(letter)) {
    btnElement.classList.add("correct");
    renderWord();
    checkWin();
  }
  // Nếu đoán SAI
  else {
    btnElement.classList.add("wrong");
    mistakes++;
    mistakeDisplay.textContent = `Lỗi: ${mistakes} / ${MAX_MISTAKES}`;

    // Thêm class để vẽ người treo cổ
    hangmanFigure.classList.add(`mistake-${mistakes}`);

    checkLoss();
  }

  // Khóa phím vừa bấm
  btnElement.disabled = true;
}

// 5. Kiểm tra Thắng/Thua
function checkWin() {
  // Kiểm tra xem tất cả các chữ cái (trừ khoảng trắng) đã được đoán chưa
  const hasWon = selectedWord
    .split("")
    .every((letter) => letter === " " || guessedLetters.includes(letter));

  if (hasWon) {
    endGame(true, "Truy cập thành công! Bạn đã giải mã được từ khóa.");
  }
}

function checkLoss() {
  if (mistakes >= MAX_MISTAKES) {
    // Hiển thị nốt các chữ còn thiếu cho khán giả xem
    guessedLetters = selectedWord.split("");
    renderWord();
    endGame(false, `System Locked! Từ khóa đúng là: ${selectedWord}`);
  }
}

function endGame(isWin, message) {
  isGameOver = true;

  // Vô hiệu hóa toàn bộ bàn phím
  document.querySelectorAll(".key-btn").forEach((btn) => (btn.disabled = true));

  statusMsg.textContent = message;
  statusMsg.className = `feedback-box ${isWin ? "success" : "error"}`;
  statusMsg.classList.remove("hidden");
  finishBtn.style.display = "block";

  // Lưu trạng thái DONE cho câu 14
  let states = JSON.parse(localStorage.getItem("game_states") || "{}");
  states[14] = "DONE";
  localStorage.setItem("game_states", JSON.stringify(states));
}

// Nút quay lại
finishBtn.addEventListener(
  "click",
  () => (window.location.href = "questions.html"),
);

// Chạy game
initGame();
