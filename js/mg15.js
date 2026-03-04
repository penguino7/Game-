const cardDeck = document.getElementById("cardDeck");
const buckets = document.querySelectorAll(".sort-bucket");
const startBtn = document.getElementById("startBtn");
const startOverlay = document.getElementById("startOverlay");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");

// Dữ liệu phân loại
const DATA = [
  { text: "SQL Injection", group: "ATTACK" },
  { text: "WAF (Firewall)", group: "DEFENSE" },
  { text: "Brute Force", group: "ATTACK" },
  { text: "2FA Authentication", group: "DEFENSE" },
  { text: "Phishing Email", group: "ATTACK" },
  { text: "SSL/TLS", group: "DEFENSE" },
  { text: "DDoS Attack", group: "ATTACK" },
  { text: "Antivirus", group: "DEFENSE" },
  { text: "Trojan Horse", group: "ATTACK" },
  { text: "Encryption", group: "DEFENSE" },
];

let deck = [];
let currentCard = null;
let attackCount = 0;
let defenseCount = 0;

// 1. Khởi tạo bài
function initDeck() {
  // Trộn bài
  deck = [...DATA].sort(() => Math.random() - 0.5);
  renderTopCard();
}

function renderTopCard() {
  if (deck.length === 0) {
    endGame();
    return;
  }

  const cardData = deck[deck.length - 1]; // Lấy thẻ trên cùng
  const card = document.createElement("div");
  card.className = "sort-card";
  card.textContent = cardData.text;
  card.dataset.group = cardData.group;
  card.draggable = true;

  // Xử lý sự kiện kéo
  card.addEventListener("dragstart", (e) => {
    currentCard = card;
    card.style.opacity = "0.5";
  });

  card.addEventListener("dragend", () => {
    card.style.opacity = "1";
  });

  cardDeck.appendChild(card);
}

// 2. Xử lý sự kiện thả (Drop)
buckets.forEach((bucket) => {
  bucket.addEventListener("dragover", (e) => {
    e.preventDefault();
    bucket.classList.add("hover");
  });

  bucket.addEventListener("dragleave", () => {
    bucket.classList.remove("hover");
  });

  bucket.addEventListener("drop", (e) => {
    e.preventDefault();
    bucket.classList.remove("hover");

    const targetGroup = bucket.dataset.group;
    const cardGroup = currentCard.dataset.group;

    if (targetGroup === cardGroup) {
      // Đúng -> Xóa thẻ, cộng điểm, hiện thẻ tiếp theo
      currentCard.remove();
      deck.pop();

      if (cardGroup === "ATTACK") {
        attackCount++;
        document.getElementById("countAttack").textContent = attackCount;
      } else {
        defenseCount++;
        document.getElementById("countDefense").textContent = defenseCount;
      }

      renderTopCard();
    } else {
      // Sai -> Hiệu ứng rung báo lỗi
      bucket.style.borderColor = "#ef4444";
      setTimeout(() => (bucket.style.borderColor = ""), 500);
    }
  });
});

// 3. Bắt đầu game
startBtn.addEventListener("click", () => {
  startOverlay.classList.add("hidden");
  initDeck();
});

// 4. Kết thúc
function endGame() {
  statusMsg.textContent = "Phân loại hoàn tất! Hệ thống đã được kiểm tra.";
  statusMsg.className = "feedback-box success";
  statusMsg.classList.remove("hidden");
  finishBtn.style.display = "block";

  // Lưu trạng thái DONE
  let states = JSON.parse(localStorage.getItem("game_states") || "{}");
  states[15] = "DONE";
  localStorage.setItem("game_states", JSON.stringify(states));
}

finishBtn.onclick = () => (window.location.href = "questions.html");
