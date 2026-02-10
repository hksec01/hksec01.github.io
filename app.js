// app.js
const $ = (q) => document.querySelector(q);

// ---------- i18n dictionary ----------
const I18N = {
  az: {
    nav_home: "Ana səhifə",
    nav_about: "Haqqımda",
    nav_blog: "Blog",
    nav_contact: "Əlaqə",

    hero_kicker: "Penetration Testing • Red Team • DevSecOps",
    hero_title: "Salam, mən Hikmət Kövsərov.",
    hero_sub: "Web tətbiq təhlükəsizliyi, zəiflik analizi, DevSecOps security pipeline-ları və log analizi üzrə praktiki təcrübə.",
    hero_btn_blog: "Blog yazılarım",
    hero_btn_contact: "Əlaqə",

    stat_intern: "Pentest internship",
    stat_tools: "Security tools",
    stat_posts: "Blog paylaşımı",

    about_h2: "Haqqımda",
    about_role: "Penetration Tester",
    about_p1: "Mən Hikmət Kövsərov — Bakı şəhərində fəaliyyət göstərən Penetration Testerəm. Şəbəkə və kibertəhlükəsizlik sahəsində praktiki təcrübəyə sahibəm. Web tətbiqlərdə zəifliklərin aşkarlanması, exploit edilməsi və müdafiə mexanizmlərinin qurulması üzərində işləyirəm.",
    about_p2: "OWASP Top 10 zəiflikləri, DevSecOps inteqrasiyası, log analizi, OSINT və fuzzing üzrə real sistemlərdə təhlükəsizlik testləri aparmışam. Məqsədim daim inkişaf edib daha güclü Red Team / AppSec mütəxəssisi olmaqdır.",
    about_quick: "Qısa info",
    info_location: "Location",
    info_email: "Email",

    blog_h2: "Blog",
    blog_sub: "Medium və LinkedIn paylaşımlarım.",

    contact_h2: "Əlaqə",
    form_name: "Ad",
    form_email: "Email",
    form_message: "Mesaj",
    form_send: "Göndər",

    modal_open: "Aç →",
    modal_close: "Bağla",

    form_sending: "Göndərilir...",
    form_ok: "Mesaj göndərildi ✅",
    form_err: "Xəta baş verdi ❌ (limit/verifikasiya ola bilər)",
    form_net: "Network xətası ❌",
    form_ok_bot: "Göndərildi ✅"
  },
  en: {
    nav_home: "Home",
    nav_about: "About",
    nav_blog: "Blog",
    nav_contact: "Contact",

    hero_kicker: "Penetration Testing • Red Team • DevSecOps",
    hero_title: "Hi, I'm Hikmet Kovsarov.",
    hero_sub: "Hands-on experience in web application security, vulnerability analysis, DevSecOps security pipelines, and log analysis.",
    hero_btn_blog: "My blog posts",
    hero_btn_contact: "Contact",

    stat_intern: "Pentest internships",
    stat_tools: "Security tools",
    stat_posts: "Posts",

    about_h2: "About",
    about_role: "Penetration Tester",
    about_p1: "I'm Hikmet Kovsarov, a Penetration Tester based in Baku. I have hands-on experience in cybersecurity and focus on finding and exploiting web vulnerabilities and improving defensive mechanisms.",
    about_p2: "I work across OWASP Top 10, DevSecOps integration, log analysis, OSINT, and fuzzing. My goal is to keep improving and grow into a stronger Red Team / AppSec specialist.",
    about_quick: "Quick info",
    info_location: "Location",
    info_email: "Email",

    blog_h2: "Blog",
    blog_sub: "My Medium and LinkedIn posts.",

    contact_h2: "Contact",
    form_name: "Name",
    form_email: "Email",
    form_message: "Message",
    form_send: "Send",

    modal_open: "Open →",
    modal_close: "Close",

    form_sending: "Sending...",
    form_ok: "Message sent ✅",
    form_err: "Something went wrong ❌ (limit/verification possible)",
    form_net: "Network error ❌",
    form_ok_bot: "Sent ✅"
  }
};

function applyLang(lang) {
  const dict = I18N[lang] || I18N.az;

  // html lang attribute
  document.documentElement.lang = lang;

  // buttons active
  $("#langAz").classList.toggle("is-active", lang === "az");
  $("#langEn").classList.toggle("is-active", lang === "en");

  // apply all data-i18n nodes
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  // update placeholders
  const nameInput = document.querySelector('input[name="name"]');
  const emailInput = document.querySelector('input[name="email"]');
  const msgInput = document.querySelector('textarea[name="message"]');
  if (lang === "en") {
    if (nameInput) nameInput.placeholder = "Your name";
    if (emailInput) emailInput.placeholder = "email@...";
    if (msgInput) msgInput.placeholder = "Your message...";
  } else {
    if (nameInput) nameInput.placeholder = "Adın";
    if (emailInput) emailInput.placeholder = "email@...";
    if (msgInput) msgInput.placeholder = "Mesajın...";
  }

  // store
  localStorage.setItem("lang", lang);
}

let CURRENT_LANG = localStorage.getItem("lang") || "az";

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

// ---------- Typewriter (re-run on language change) ----------
function runTypewriter() {
  const tw = $("#typewriter");
  const full = tw.textContent;
  tw.textContent = "";
  let ti = 0;
  const type = () => {
    tw.textContent = full.slice(0, ti++);
    if (ti <= full.length) requestAnimationFrame(type);
  };
  type();
}

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

// ---------- Blog data ----------
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

// ---------- Render blog cards ----------
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
  const el = document.createElement("article");
  el.className = "card";
  el.innerHTML = `
    <div class="meta">
      <span class="tag">${escapeHtml(item.platform)}</span>
    </div>
    <h3>${escapeHtml(item.title || `Post #${idx+1}`)}</h3>
    <p>${escapeHtml(item.desc || "Post link.")}</p>
    <div class="actions">
      <a class="open" href="${item.url}" target="_blank" rel="noreferrer">${CURRENT_LANG === "en" ? "Open →" : "Aç →"}</a>
      <button class="details" data-open="${idx}">${CURRENT_LANG === "en" ? "Preview" : "Preview"}</button>
    </div>
  `;
  return el;
}

function renderBlogs() {
  blogGrid.innerHTML = "";
  BLOGS.forEach((b, i) => blogGrid.appendChild(makeCard(b, i)));
}

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
    modalBody.textContent = item.desc || "";
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

// ---------- Formspree AJAX submit with i18n messages ----------
const form = $("#contactForm");
const note = $("#formNote");
const sendBtn = $("#sendBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dict = I18N[CURRENT_LANG] || I18N.az;

  const gotcha = form.querySelector('input[name="_gotcha"]')?.value?.trim();
  if (gotcha) {
    note.textContent = dict.form_ok_bot;
    form.reset();
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = dict.form_sending;
  note.textContent = "";

  const fd = new FormData(form);

  try {
    const r = await fetch(form.action, {
      method: "POST",
      body: fd,
      headers: { "Accept": "application/json" },
    });

    if (r.ok) {
      note.textContent = dict.form_ok;
      form.reset();
    } else {
      note.textContent = dict.form_err;
    }
  } catch (err) {
    note.textContent = dict.form_net;
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = dict.form_send;
  }
});

// ---------- Language buttons ----------
$("#langAz").addEventListener("click", () => {
  CURRENT_LANG = "az";
  applyLang(CURRENT_LANG);
  runTypewriter();
  renderBlogs();
});
$("#langEn").addEventListener("click", () => {
  CURRENT_LANG = "en";
  applyLang(CURRENT_LANG);
  runTypewriter();
  renderBlogs();
});

// ---------- init ----------
applyLang(CURRENT_LANG);
renderBlogs();
runTypewriter();
