// Start -> chuyển sang Question Board (nếu bạn đã làm questions.html)
const startBtn = document.getElementById("startBtn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    // nếu bạn chưa tạo questions.html thì tạm để alert
    // window.location.href = "questions.html";
    window.location.href = "questions.html";
  });
}

// How it works (demo)
const howBtn = document.getElementById("howBtn");
if (howBtn) {
  howBtn.addEventListener("click", () => {
    alert(
      "How it works: 4 teams • 22 questions • earn tokens • final boss round.",
    );
  });
}

/* =========================
   Bottom Mission Slider (auto)
   - 5 items
   - desktop show 3 cards/slide (mobile show 1)
   - auto slide every 3.5s
========================= */

const track = document.getElementById("missionTrack");
const dots = document.getElementById("missionDots");
const prev = document.querySelector(".nav-btn.prev");
const next = document.querySelector(".nav-btn.next");

if (track && dots && prev && next) {
  const items = Array.from(track.children);
  const total = items.length;

  // index = “card start index”
  let idx = 0;
  let timer = null;

  function cardsPerView() {
    return window.matchMedia("(max-width: 980px)").matches ? 1 : 3;
  }

  function maxIndex() {
    return Math.max(0, total - cardsPerView());
  }

  function clampIndex(i) {
    return Math.min(Math.max(i, 0), maxIndex());
  }

  function renderDots() {
    const pages = maxIndex() + 1; // số vị trí start hợp lệ
    dots.innerHTML = "";
    for (let p = 0; p < pages; p++) {
      const b = document.createElement("button");
      b.className = "dot" + (p === idx ? " active" : "");
      b.type = "button";
      b.setAttribute("aria-label", `Go to page ${p + 1}`);
      b.addEventListener("click", () => {
        idx = p;
        update(true);
      });
      dots.appendChild(b);
    }
  }

  function update(userAction = false) {
    idx = clampIndex(idx);

    // Tính chiều rộng 1 card theo thực tế (kể cả margin-right)
    const first = items[0];
    const cardW = first.getBoundingClientRect().width;
    const gap = 12; // đúng với CSS margin-right
    const offset = idx * (cardW + gap);

    track.style.transform = `translateX(-${offset}px)`;

    renderDots();
    if (userAction) restartAuto();
  }

  function nextSlide() {
    idx = idx + 1 > maxIndex() ? 0 : idx + 1;
    update(false);
  }

  function prevSlide() {
    idx = idx - 1 < 0 ? maxIndex() : idx - 1;
    update(false);
  }

  prev.addEventListener("click", () => {
    prevSlide();
    restartAuto();
  });
  next.addEventListener("click", () => {
    nextSlide();
    restartAuto();
  });

  function startAuto() {
    stopAuto();
    timer = setInterval(nextSlide, 3500);
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function restartAuto() {
    startAuto();
  }

  window.addEventListener("resize", () => update(false));

  // init
  update(false);
  startAuto();
}
