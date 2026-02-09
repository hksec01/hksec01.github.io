/* ===== UUID FIX (CRITICAL) ===== */
function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}

/* ===== Helpers ===== */

const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

const STORAGE_KEY = "hikmet_blog_posts_v1";
const THEME_KEY = "hikmet_blog_theme";

/* ===== Seed Posts ===== */

const seedPosts = [
  {
    id: uid(),
    title: "Subdomain recon checklist (praktik)",
    tag: "pentest",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    body:
      "Bu, sürətli recon checklist-dir:\n\n" +
      "```bash\n" +
      "subfinder -d example.com -all -silent | tee subs.txt\n" +
      "dnsx -l subs.txt -silent | tee alive.txt\n" +
      "httpx -l alive.txt -silent -title -status-code -tech-detect | tee http.txt\n" +
      "```\n\n" +
      "Sonra pattern hunting:\n" +
      "- admin/login panellər\n" +
      "- API endpointlər\n" +
      "- S3 bucket referansları\n"
  }
];

/* ===== Storage ===== */

function loadPosts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
    return [...seedPosts];
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
    return [...seedPosts];
  }
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

/* ===== Markdown Renderer ===== */

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderBody(text) {
  const lines = text.split("\n");
  let html = "";
  let inCode = false;
  let code = [];

  const flush = () => {
    html += `<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`;
    code = [];
  };

  for (let ln of lines) {
    if (ln.startsWith("```")) {
      if (!inCode) {
        inCode = true;
      } else {
        inCode = false;
        flush();
      }
      continue;
    }

    if (inCode) {
      code.push(ln);
      continue;
    }

    if (ln.startsWith("# ")) {
      html += `<h3>${escapeHtml(ln.slice(2))}</h3>`;
      continue;
    }

    if (ln.startsWith("- ")) {
      html += `<li>${escapeHtml(ln.slice(2))}</li>`;
      continue;
    }

    if (ln.trim()) {
      html += `<p>${escapeHtml(ln)}</p>`;
    }
  }

  return html;
}

/* ===== UI State ===== */

let posts = loadPosts();
let activeTag = "all";
let query = "";

/* ===== Render ===== */

function render() {
  const container = $("#posts");
  if (!container) return;

  container.innerHTML = "";

  const filtered = posts.filter((p) => {
    const tagOk = activeTag === "all" || p.tag === activeTag;
    const q = query.toLowerCase();
    const qOk =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.body.toLowerCase().includes(q);

    return tagOk && qOk;
  });

  const count = $("#postCount");
  if (count) count.textContent = `${filtered.length} post`;

  for (const p of filtered) {
    const el = document.createElement("article");
    el.className = "post";

    el.innerHTML = `
      <div class="post-head">
        <h2>${escapeHtml(p.title)}</h2>
        <span class="badge">${p.tag}</span>
      </div>
      <div class="post-body">
        ${renderBody(p.body)}
      </div>
    `;

    container.appendChild(el);
  }
}

/* ===== Theme ===== */

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  localStorage.setItem(THEME_KEY, theme);

  const btn = $("#themeBtn");
  if (btn) btn.textContent = theme === "light" ? "☀️" : "🌙";
}

function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(current === "dark" ? "light" : "dark");
}

/* ===== Events ===== */

function initEvents() {
  const themeBtn = $("#themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  const search = $("#searchInput");
  if (search) {
    search.addEventListener("input", (e) => {
      query = e.target.value;
      render();
    });
  }

  $$(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeTag = chip.dataset.tag;
      render();
    });
  });

  const form = $("#postForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = $("#titleInput").value.trim();
      const tag = $("#tagInput").value;
      const body = $("#bodyInput").value.trim();

      if (!title || !body) return;

      const post = {
        id: uid(),
        title,
        tag,
        date: new Date().toISOString(),
        body
      };

      posts.unshift(post);
      savePosts(posts);
      form.reset();
      render();
    });
  }
}

/* ===== Init ===== */

function init() {
  applyTheme(localStorage.getItem(THEME_KEY) || "dark");
  initEvents();
  render();
}

document.addEventListener("DOMContentLoaded", init);
