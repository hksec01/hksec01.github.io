/* Blog-like vanilla JS: posts list + search + tag filter + localStorage */
const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

const STORAGE_KEY = "hikmet_blog_posts_v1";
const THEME_KEY = "hikmet_blog_theme";

const seedPosts = [
  {
    id: crypto.randomUUID(),
    title: "Subdomain recon checklist (praktik)",
    tag: "pentest",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    body: `
Bu, sürətli recon checklist-dir:

\`\`\`bash
subfinder -d example.com -all -silent | tee subs.txt
dnsx -l subs.txt -silent | tee alive.txt
httpx -l alive.txt -silent -title -status-code -tech-detect | tee http.txt
\`\`\`

Sonra pattern hunting:
- admin/login panellər
- API endpointlər
- S3 bucket referansları
`
  },
  {
    id: crypto.randomUUID(),
    title: "XSS üçün input mapping (qısa)",
    tag: "web",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    body: `
Reflected/Stored XSS üçün ilkin mapping:

\`\`\`bash
gau example.com | uro | grep -E "([?&](q|s|search|redirect|next|url)=)" | head
\`\`\`

Sonra context yoxla:
- HTML
- attribute
- JS string
- URL
`
  },
  {
    id: crypto.randomUUID(),
    title: "CTF notes: DNS cache niyə aldadır?",
    tag: "ctf",
    date: new Date().toISOString(),
    body: `
Bu gün gördük: eyni domain üçün fərqli resolver fərqli cavab verə bilər.

\`\`\`bash
dig k.hikmet.xyz            # router DNS (cache)
dig @8.8.8.8 k.hikmet.xyz   # public resolver
\`\`\`

NXDOMAIN cache (negative caching) real dünyada çox rast gəlinir.
`
  },
];

function loadPosts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
    return [...seedPosts];
  }
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error("Invalid posts");
    return data;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
    return [...seedPosts];
  }
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { year:"numeric", month:"short", day:"2-digit" });
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* minimal markdown-ish renderer: headings, code fences, lists */
function renderBody(text) {
  const lines = text.replaceAll("\r\n", "\n").split("\n");
  let html = "";
  let inCode = false;
  let codeBuf = [];

  const flushCode = () => {
    const code = escapeHtml(codeBuf.join("\n"));
    html += `<pre><code>${code}</code></pre>`;
    codeBuf = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];

    if (ln.trim().startsWith("```")) {
      if (!inCode) { inCode = true; continue; }
      inCode = false; flushCode(); continue;
    }

    if (inCode) { codeBuf.push(ln); continue; }

    // headings
    if (ln.startsWith("# ")) { html += `<h3>${escapeHtml(ln.slice(2))}</h3>`; continue; }
    if (ln.startsWith("## ")) { html += `<h4>${escapeHtml(ln.slice(3))}</h4>`; continue; }

    // lists
    if (ln.trim().startsWith("- ")) {
      // gather contiguous list lines
      const items = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith("- ")) {
        items.push(`<li>${escapeHtml(lines[j].trim().slice(2))}</li>`);
        j++;
      }
      html += `<ul>${items.join("")}</ul>`;
      i = j - 1;
      continue;
    }

    // paragraph
    const t = ln.trim();
    if (t.length === 0) { html += ""; continue; }
    html += `<p>${escapeHtml(t)}</p>`;
  }

  if (inCode && codeBuf.length) flushCode();
  return html;
}

let posts = loadPosts().sort((a,b) => new Date(b.date) - new Date(a.date));
let activeTag = "all";
let query = "";

function render() {
  const container = $("#posts");
  container.innerHTML = "";

  const filtered = posts.filter(p => {
    const tagOk = activeTag === "all" ? true : p.tag === activeTag;
    const q = query.trim().toLowerCase();
    const qOk = !q ? true : (p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q));
    return tagOk && qOk;
  });

  $("#postCount").textContent = `${filtered.length} post`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="card">
        <h3>No results</h3>
        <p class="tiny">Axtarış və ya tag filter nəticə qaytarmadı.</p>
      </div>`;
    return;
  }

  for (const p of filtered) {
    const el = document.createElement("article");
    el.className = "post";

    const short = p.body.trim().split("\n").slice(0, 6).join("\n");
    const isLong = p.body.trim().split("\n").length > 8;

    el.innerHTML = `
      <div class="post-head">
        <div>
          <h2 class="post-title">${escapeHtml(p.title)}</h2>
        </div>
        <span class="badge">${escapeHtml(p.tag)}</span>
      </div>
      <div class="post-meta">
        <span>📅 ${fmtDate(p.date)}</span>
        <span>🆔 <span style="font-family:var(--mono)">${escapeHtml(p.id.slice(0,8))}</span></span>
      </div>
      <div class="post-body" data-full="0">
        ${renderBody(isLong ? short + "\n\n(…)" : p.body)}
      </div>
      <div class="post-actions">
        <button class="btn ghost" type="button" data-action="toggle">
          ${isLong ? "Read more" : "Collapse"}
        </button>
        <button class="btn ghost" type="button" data-action="delete" data-id="${escapeHtml(p.id)}">Delete</button>
      </div>
    `;

    const body = el.querySelector(".post-body");
    const toggleBtn = el.querySelector('[data-action="toggle"]');

    if (!isLong) toggleBtn.disabled = true;

    toggleBtn?.addEventListener("click", () => {
      const full = body.getAttribute("data-full") === "1";
      if (full) {
        body.innerHTML = renderBody(short + "\n\n(…)");
        body.setAttribute("data-full", "0");
        toggleBtn.textContent = "Read more";
      } else {
        body.innerHTML = renderBody(p.body);
        body.setAttribute("data-full", "1");
        toggleBtn.textContent = "Collapse";
      }
    });

    el.querySelector('[data-action="delete"]')?.addEventListener("click", () => {
      posts = posts.filter(x => x.id !== p.id);
      savePosts(posts);
      render();
    });

    container.appendChild(el);
  }
}

function setActiveChip(tag) {
  activeTag = tag;
  $$(".chip").forEach(c => c.classList.toggle("active", c.dataset.tag === tag));
  render();
}

// Theme
function applyTheme(theme) {
  if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");
  $("#themeBtn").textContent = theme === "light" ? "☀️" : "🌙";
  localStorage.setItem(THEME_KEY, theme);
}
function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(current === "dark" ? "light" : "dark");
}

// Events
$("#themeBtn").addEventListener("click", toggleTheme);

$$(".chip").forEach(chip => {
  chip.addEventListener("click", () => setActiveChip(chip.dataset.tag));
});

$("#searchInput").addEventListener("input", (e) => {
  query = e.target.value;
  render();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
    e.preventDefault();
    $("#searchInput").focus();
  }
});

$("#postForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $("#titleInput").value.trim();
  const tag = $("#tagInput").value;
  const body = $("#bodyInput").value.trim();
  if (!title || !body) return;

  const post = {
    id: crypto.randomUUID(),
    title,
    tag,
    date: new Date().toISOString(),
    body
  };
  posts.unshift(post);
  savePosts(posts);

  $("#titleInput").value = "";
  $("#bodyInput").value = "";
  $("#tagInput").value = "ctf";

  location.hash = "#posts";
  render();
});

$("#clearBtn").addEventListener("click", () => {
  $("#titleInput").value = "";
  $("#bodyInput").value = "";
  $("#titleInput").focus();
});

$("#exportBtn").addEventListener("click", (e) => {
  e.preventDefault();
  const blob = new Blob([JSON.stringify(posts, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "posts.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

$("#resetBtn").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem(STORAGE_KEY);
  posts = loadPosts().sort((a,b) => new Date(b.date) - new Date(a.date));
  render();
});

// Init
$("#year").textContent = String(new Date().getFullYear());
applyTheme(localStorage.getItem(THEME_KEY) || "dark");
render();
