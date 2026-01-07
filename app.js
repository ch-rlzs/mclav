const $ = (sel) => document.querySelector(sel);

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function projectCard(p) {
  const tags = (p.tags || []).map(t => `<span class="badge">${escapeHtml(t)}</span>`).join("");
  const links = (p.links || [])
    .map(l => `<a class="chip" href="${escapeHtml(l.url)}" target="_blank" rel="noreferrer">${escapeHtml(l.label)}</a>`)
    .join("");

  const img = p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}">` : "";

  return `
    <div class="card project" data-title="${escapeHtml(p.title.toLowerCase())}" data-tags="${escapeHtml((p.tags||[]).join(" ").toLowerCase())}">
      <div class="thumb">${img}</div>
      <div class="meta">
        <div>
          <h3>${escapeHtml(p.title)}</h3>
          <div class="muted">${escapeHtml(p.description)}</div>
        </div>
        <div class="badges">${tags}</div>
        <div class="links">${links}</div>
      </div>
    </div>
  `;
}

function achievementRow(a) {
  return `
    <div class="card">
      <div style="display:flex; justify-content:space-between; gap:10px;">
        <div>
          <strong>${escapeHtml(a.title)}</strong>
          <div class="muted">${escapeHtml(a.detail || "")}</div>
        </div>
        <div class="muted" style="white-space:nowrap;">${escapeHtml(a.date || "")}</div>
      </div>
    </div>
  `;
}

function commandRow(c) {
  return `
    <div class="cmd">
      <div><code>${escapeHtml(c.slash)}</code></div>
      <div class="muted">${escapeHtml(c.description)}</div>
    </div>
  `;
}

function setNow() {
  $("#year").textContent = new Date().getFullYear();
  $("#nowText").textContent = "Building projects + shipping them";
}

function applyProjectFilter() {
  const q = ($("#projectSearch").value || "").trim().toLowerCase();
  document.querySelectorAll("#projects .project").forEach(card => {
    const hay = `${card.dataset.title} ${card.dataset.tags}`;
    card.style.display = hay.includes(q) ? "" : "none";
  });
}

async function main() {
  setNow();

  const [projects, achievements, bot] = await Promise.all([
    loadJSON("./data/projects.json"),
    loadJSON("./data/achievements.json"),
    loadJSON("./data/bot.json"),
  ]);

  // Projects
  $("#projects").innerHTML = projects.map(projectCard).join("");
  $("#projectSearch").addEventListener("input", applyProjectFilter);

  // Achievements
  $("#achievements").innerHTML = achievements.map(achievementRow).join("");

  // Bot
  $("#botName").textContent = bot.name;
  $("#botDesc").textContent = bot.description;
  $("#botTag").textContent = bot.tagline || "";
  $("#botInvite").href = bot.invite_url || "#";
  $("#botSupport").href = bot.support_server_url || "#";
  $("#botCommands").innerHTML = (bot.commands || []).map(commandRow).join("");

  // Optional server widget embed (Discord server widget)
  // NOTE: this is a server widget, not “bot running in the site”.
  if (bot.widget_iframe_url) {
    $("#botWidget").innerHTML = `
      <iframe
        title="Discord Widget"
        src="${escapeHtml(bot.widget_iframe_url)}"
        width="100%" height="260"
        style="border:0; border-radius:12px;"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts">
      </iframe>
    `;
  }
}

main().catch(err => {
  console.error(err);
  alert("Site failed to load data files. Check console.");
});
