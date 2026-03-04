const unsortedList = document.getElementById("unsortedList");
const dropGroups = document.querySelectorAll(".drop-group");
const startBtn = document.getElementById("startBtn");
const startOverlay = document.getElementById("startOverlay");
const statusMsg = document.getElementById("statusMessage");
const finishBtn = document.getElementById("finishBtn");

// 7 Từ khóa như cậu yêu cầu
const DATA = [
  { id: "1", text: "SQL Injection", group: "ATTACK" },
  { id: "2", text: "Web Firewall (WAF)", group: "DEFENSE" },
  { id: "3", text: "Cross-Site Scripting", group: "ATTACK" },
  { id: "4", text: "Multi-Factor Auth", group: "DEFENSE" },
  { id: "5", text: "DDoS Attack", group: "ATTACK" },
  { id: "6", text: "Data Encryption", group: "DEFENSE" },
  { id: "7", text: "Phishing Campaign", group: "ATTACK" },
];

let draggedItem = null;
let correctCount = 0;

// 1. Dàn các thẻ ra cột bên trái
function initGame() {
  unsortedList.innerHTML = "";
  document.getElementById("zoneAttack").innerHTML = "";
  document.getElementById("zoneDefense").innerHTML = "";
  correctCount = 0;

  // Xáo trộn mảng để mỗi lần chơi thứ tự thẻ một khác
  const shuffled = [...DATA].sort(() => Math.random() - 0.5);

  shuffled.forEach((item) => {
    const div = document.createElement("div");
    div.className = "sort-item";
    div.textContent = item.text;
    div.draggable = true;
    div.dataset.group = item.group;

    // Bắt sự kiện bắt đầu kéo
    div.addEventListener("dragstart", function () {
      draggedItem = this;
      setTimeout(() => (this.style.opacity = "0.5"), 0);
    });

    // Bắt sự kiện thả chuột ra
    div.addEventListener("dragend", function () {
      setTimeout(() => {
        this.style.opacity = "1";
        draggedItem = null;
      }, 0);
    });

    unsortedList.appendChild(div);
  });
}

// 2. Xử lý logic cho các Nhóm đích (Cột phải)
dropGroups.forEach((group) => {
  // Khi thẻ bay lơ lửng trên nhóm
  group.addEventListener("dragover", (e) => {
    e.preventDefault(); // Cho phép thả
    group.classList.add("hover");
  });

  // Khi kéo thẻ ra khỏi nhóm
  group.addEventListener("dragleave", () => {
    group.classList.remove("hover");
  });

  // Khi thả thẻ vào nhóm
  group.addEventListener("drop", (e) => {
    e.preventDefault();
    group.classList.remove("hover");

    if (!draggedItem) return;

    const targetGroup = group.dataset.group;
    const itemGroup = draggedItem.dataset.group;

    // KIỂM TRA ĐÚNG SAI CẤP TỐC
    if (targetGroup === itemGroup) {
      // ĐÚNG: Nhét thẻ vào vùng drop-zone bên trong
      const zone = group.querySelector(".drop-zone");
      draggedItem.draggable = false; // Ngăn không cho lôi ra ngoài nữa
      zone.appendChild(draggedItem);
      correctCount++;
      checkWin();
    } else {
      // SAI: Khung nháy đỏ cảnh báo
      group.style.borderColor = "#ef4444";
      group.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
      setTimeout(() => {
        group.style.borderColor = "";
        group.style.backgroundColor = "";
      }, 400);
    }
  });
});

// Nút Start
startBtn.addEventListener("click", () => {
  startOverlay.classList.add("hidden");
  initGame();
});

// Hàm kiểm tra Win
function checkWin() {
  if (correctCount === DATA.length) {
    statusMsg.textContent =
      "Hoàn hảo! Bạn đã phân loại chính xác toàn bộ hệ thống.";
    statusMsg.className = "feedback-box success";
    statusMsg.classList.remove("hidden");
    finishBtn.style.display = "block";

    let states = JSON.parse(localStorage.getItem("game_states") || "{}");
    states[15] = "DONE";
    localStorage.setItem("game_states", JSON.stringify(states));
  }
}

finishBtn.onclick = () => (window.location.href = "questions.html");
