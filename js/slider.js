const track = document.getElementById("imgTrack");
const dots = document.getElementById("imgDots");
const prev = document.getElementById("imgPrev");
const next = document.getElementById("imgNext");

if (track && dots && prev && next) {
  const slides = Array.from(track.children);
  const total = slides.length;
  let index = 0;
  let timer = null;

  function renderDots() {
    dots.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const b = document.createElement("button");
      b.className = "img-dot" + (i === index ? " active" : "");
      b.type = "button";
      b.addEventListener("click", () => goTo(i, true));
      dots.appendChild(b);
    }
  }

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    renderDots();
  }

  function goTo(i, user) {
    index = (i + total) % total;
    update();
    if (user) restartAuto();
  }

  function nextSlide() {
    goTo(index + 1, false);
  }
  function prevSlide() {
    goTo(index - 1, false);
  }

  prev.addEventListener("click", () => goTo(index - 1, true));
  next.addEventListener("click", () => goTo(index + 1, true));

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

  update();
  startAuto();
}
