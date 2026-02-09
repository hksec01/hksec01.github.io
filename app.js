// app.js
const $ = (q) => document.querySelector(q);

const burger = $("#burger");
const nav = $("#nav");
burger.addEventListener("click", () => nav.classList.toggle("is-open"));

// close mobile nav on click
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") nav.classList.remove("is-open");
});

// year
$("#year").textContent = new Date().getFullYear();

// count-up stats
const counters = [...document.querySelectorAll("[data-count]")];
const animateCount = (el) => {
  const target = Number(el.dataset.count);
  let cur = 0;
  const step = Math.max(1, Math.floor(target / 40));
  const t = setInterval(() => {
    cur += step;
    if (cur >= target) { cur = target; clearInterval(t); }
    el.textContent = String(cur);
  }, 25);
};

const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      animateCount(en.target);
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.6 });

counters.forEach((c) => io.observe(c));

// simple typewriter
const tw = $("#typewriter");
const full = tw.textContent;
tw.textContent = "";
let i = 0;
const type = () => {
  tw.textContent = full.slice(0, i++);
  if (i <= full.length) requestAnimationFrame(type);
};
type();

// modal for project details
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");

const details = {
  p1: { title: "Layihə #1", body: "Buraya layihə haqqında detallı məlumat yazılacaq." },
  p2: { title: "Layihə #2", body: "Buraya layihə haqqında detallı məlumat yazılacaq." },
  p3: { title: "Layihə #3", body: "Buraya layihə haqqında detallı məlumat yazılacaq." },
};

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-modal]");
  const close = e.target.closest("[data-close]");
  if (btn) {
    const id = btn.dataset.modal;
    modalTitle.textContent = details[id]?.title ?? "Detallar";
    modalBody.textContent = details[id]?.body ?? "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }
  if (close) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }
});

// contact form (demo)
$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const formNote = $("#formNote");
  formNote.textContent = "Mesaj hazırlandı (demo). Real göndərmə üçün backend / Email API lazımdır.";
});
