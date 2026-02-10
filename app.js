// app.js
const $ = (q) => document.querySelector(q);

// ---------- Mobile nav ----------
const burger = $("#burger");
const nav = $("#nav");

burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", open ? "true" : "false");
});

nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }
});

// ---------- Year ----------
$("#year").textContent = String(new Date().getFullYear());

// ---------- Typewriter ----------
const tw = $("#typewriter");
const full = tw.textContent;
tw.textContent = "";
let ti = 0;
const type = () => {
  tw.textContent = full.slice(0, ti++);
  if (ti <= full.length) requestAnimationFrame(type);
};
type();

// ---------- Count-up stats ----------
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

const ioCount = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      animateCount(en.target);
      ioCount.unobserve(en.target);
    }
  });
}, { threshold: 0.6 });

counters.forEach((c) => ioCount.observe(c));

// ---------- Skill bar animate on view ----------
const bars = [...document.querySelectorAll(".bar span[data-w]")];
const ioBars = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const w = el.getAttribute("data-w");
    el.style.width = `${w}%`;
    ioBars.unobserve(el);
  });
}, { threshold: 0.45 });

bars.forEach((b) => ioBars.observe(b));

// ---------- Blog data (YOUR LINKS) ----------
const BLOGS = [
  {
    url: "https://www.linkedin.com/feed/update/urn:li:activity:7369688723002789888/?originTrackingId=h7fGXPSImhacgIYxj73sxQ%3D%3D",
    title: "NotDoor-APT28 Outlook Backdor",
    platform: "LinkedIn",
    desc: "LinkedIn paylaşımı — security mövzulu post.",
  },
  {
    url: "https://www.linkedin.com/feed/update/urn:li:activity:7327527946791890944/?originTrackingId=TYJUzyawEMejNzeg4eqNQA%3D%3D",
    title: "Azure DevOps-da Token Hijacking",
    platform: "LinkedIn",
    desc: "LinkedIn paylaşımı — security mövzulu post.",
  },
  {
    url: "https://www.linkedin.com/feed/update/urn:li:activity:7318543764313006080/?originTrackingId=ekeXtrUbPzRnR0Ov2e0O1w%3D%3D",
    title: "Gamma AI vasitəsi ile yeni formada fişinq hücumu",
    platform: "LinkedIn",
    desc: "LinkedIn paylaşımı — security mövzulu post.",
  },
  {
    url: "https://medium.com/@hikmetkovsarov/cve-2025-21311-ntlmv1-authentication-bypass-aed8c1de6f11",
    title: "CVE-2025-21311: NTLMv1 Authentication Bypass",
    platform: "Medium",
    desc: "CVE analizi və təhlükəsizlik baxışı.",
  },
  {
    url: "https://medium.com/@hikmetkovsarov/iot-v%C9%99-ot-t%C9%99hl%C3%BCk%C9%99sizliyi-recon-v%C9%99-analiz-40467e2ec5a4",
    title: "IoT və OT təhlükəsizliyi: Recon və Analiz",
    platform: "Medium",
    desc: "IoT/OT recon addımları və analiz yanaşması.",
  },
];

// ---------- Render blog cards (ONLY ONE TAG: LinkedIn/Medium) ----------
const blogGrid = $("#blogGrid");

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeCard(item, idx) {
  const tag = item.platform;

  const el = document.createElement("article");
  el.className = "card";
  el.innerHTML = `
    <div class="meta">
      <span class="tag">${escapeHtml(tag)}</span>
    </div>
    <h3>${escapeHtml(item.title || `Post #${idx+1}`)}</h3>
    <p>${escapeHtml(item.desc || "Paylaşım linki.")}</p>
    <div class="actions">
      <a class="open" href="${item.url}" target="_blank" rel="noreferrer">Aç →</a>
      <button class="details" data-open="${idx}">Preview</button>
    </div>
  `;
  return el;
}

BLOGS.forEach((b, i) => blogGrid.appendChild(makeCard(b, i)));

// ---------- Modal preview ----------
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");
const modalOpen = $("#modalOpen");

document.addEventListener("click", (e) => {
  const openBtn = e.target.closest("[data-open]");
  const closeBtn = e.target.closest("[data-close]");

  if (openBtn) {
    const idx = Number(openBtn.getAttribute("data-open"));
    const item = BLOGS[idx];
    modalTitle.textContent = item.title || "Post";
    modalBody.textContent = item.desc || "Preview yoxdur.";
    modalOpen.setAttribute("href", item.url);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  if (closeBtn) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("is-open")) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }
});

// ---------- Contact (demo) ----------
$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#formNote").textContent = "Mesaj hazırlandı (demo). Real göndərmə üçün backend / Email API lazımdır.";
});
