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
    word: "PROTOCOL",
    hint: "A set of rules that defines how devices communicate and exchange data over a network.",
  },
  {
    word: "FIREWALL",
    hint: "A security system that blocks or allows network traffic based on rules to prevent unauthorized access.",
  },
  {
    word: "DNS",
    hint: "The system that translates domain names (like example.com) into IP addresses.",
  },
  {
    word: "MALWARE",
    hint: "A general term for malicious software designed to harm or exploit systems.",
  },
  {
    word: "BACKDOOR",
    hint: "A hidden method of bypassing normal authentication to access a system.",
  },
  {
    word: "BOTNET",
    hint: "A network of infected devices controlled remotely, often used for large-scale attacks.",
  },
  {
    word: "ENDPOINTS",
    hint: "Devices (like PCs, phones, or servers) at the edge of a network that communicate with each other.",
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
