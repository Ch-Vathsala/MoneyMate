/* ==========================================================================
   MoneyMate — ui.js
   Small, reusable HTML-fragment builders. Every function returns a string;
   nothing here touches the DOM directly except the count-up animator,
   which is called explicitly after a fragment has been inserted.
   ========================================================================== */

/* Emoji doubles as our icon set — same visual language as category tags,
   zero dependency, and it reads as energetic rather than corporate. */
const ICON = {
  dashboard: "🏠", transactions: "🧾", budgets: "🐖", goals: "🎯", bills: "📅",
  analytics: "📊", insights: "✨", reports: "📄",
  sun: "☀️", moon: "🌙", bell: "🔔", menu: "☰", close: "✕", logout: "🚪",
  search: "🔎", plus: "➕", trash: "🗑️", download: "⬇️", print: "🖨️",
  up: "↗", down: "↘", arrowRight: "→", eye: "👁️", eyeOff: "🙈",
  warning: "⚠️", check: "✅", shield: "🛡️", bulb: "💡", sms: "💬",
  wallet: "👛", card: "💳", trend: "📈",
};

function icon(name, size) {
  return `<span class="mm-ico" style="font-size:${size || 15}px">${ICON[name] || ""}</span>`;
}

/* ---------- Card ---------- */
function card({ content, accent, style = "", cls = "", noAnim }) {
  const top = accent ? `border-top:3px solid ${accent};` : "";
  return `<div class="${noAnim ? "" : "mm-card "}${cls}" style="${top}${style}">${content}</div>`;
}

/* ---------- Pill (outlined ledger-stamp tag) ---------- */
function pill(text, color) {
  return `<span class="mm-pill" style="border-color:${color};color:${color}">${text}</span>`;
}

/* ---------- Progress bar ---------- */
function bar1(pct, color, id) {
  const p = Math.max(0, Math.min(100, pct));
  return `<div class="mm-bar"><div class="mm-bar-fill" ${id ? `id="${id}"` : ""} style="width:${p}%;background:${color}"></div></div>`;
}

/* ---------- Financial Health "stamp" gauge ----------
   Ring offset and number target are stored as data-* attributes; animateCounts()
   reads and animates them after the fragment is actually in the DOM. (Inline
   <script> tags inside an innerHTML string never execute, so we don't use one.) */
function gauge(score, elId) {
  const r = 62, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const color = pct >= 75 ? COLOR.POS : pct >= 50 ? COLOR.WARN : COLOR.NEG;
  const label = pct >= 75 ? "In good standing" : pct >= 50 ? "Fair standing" : "Needs attention";
  const offset = c - (pct / 100) * c;
  return `
  <div class="mm-stamp" style="position:relative;width:168px;height:168px;margin:0 auto">
    <svg width="168" height="168" viewBox="0 0 168 168">
      <circle cx="84" cy="84" r="78" fill="none" stroke="var(--faint)" stroke-width="1" stroke-dasharray="1 4" opacity="0.6" class="mm-spin-slow" style="transform-origin:84px 84px"></circle>
      <circle cx="84" cy="84" r="${r}" fill="none" stroke="var(--border)" stroke-width="10"></circle>
      <circle cx="84" cy="84" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="butt"
        stroke-dasharray="${c}" stroke-dashoffset="${c}" transform="rotate(-90 84 84)"
        id="${elId}-ring" data-gauge-ring data-offset="${offset}" style="transition:stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1);filter:drop-shadow(0 0 6px ${color}55)"></circle>
    </svg>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(3deg)">
      <div id="${elId}-num" class="mm-font-display" data-gauge-num data-target="${pct}" style="font-style:italic;font-size:42px;font-weight:700;color:var(--text);line-height:1;font-variant-numeric:tabular-nums">0</div>
      <div style="font-size:9.5px;color:var(--sub);margin-top:6px;letter-spacing:0.11em;text-transform:uppercase">${label}</div>
    </div>
  </div>`;
}

/* ---------- Stat card (with count-up figure) ---------- */
function statCard({ label, raw, iconName, color, sub, trend, id }) {
  const trendGlyph = trend === "up" ? icon("up", 11) : trend === "down" ? icon("down", 11) : "";
  const trendColor = trend === "up" ? "var(--pos)" : trend === "down" ? "var(--neg)" : "var(--sub)";
  return card({
    accent: color,
    style: "padding:17px",
    content: `
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-size:10.5px;color:var(--sub);font-weight:700;letter-spacing:.06em;text-transform:uppercase">${esc(label)}</div>
          <div id="${id}" class="mm-font-mono" style="font-size:22px;font-weight:600;color:var(--text);margin-top:7px;font-variant-numeric:tabular-nums" data-count="${raw}">₹0</div>
          ${sub ? `<div style="font-size:11px;color:${trendColor};margin-top:6px;display:flex;align-items:center;gap:3px">${trendGlyph} ${esc(sub)}</div>` : ""}
        </div>
        <div style="width:30px;height:30px;border-radius:7px;background:${color}1c;color:${color};display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon(iconName, 16)}</div>
      </div>`,
  });
}

/* ---------- Count-up animator: call after inserting HTML that has [data-count] ---------- */
function animateCounts(root) {
  (root || document).querySelectorAll("[data-count]").forEach((el) => {
    const target = parseFloat(el.getAttribute("data-count")) || 0;
    const from = parseFloat(el.getAttribute("data-from")) || 0;
    const t0 = performance.now();
    const dur = 700;
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (target - from) * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.setAttribute("data-from", target);
    }
    requestAnimationFrame(tick);
  });

  (root || document).querySelectorAll("[data-gauge-ring]").forEach((ring) => {
    const offset = parseFloat(ring.getAttribute("data-offset")) || 0;
    requestAnimationFrame(() => { requestAnimationFrame(() => { ring.style.strokeDashoffset = offset; }); });
  });
  (root || document).querySelectorAll("[data-gauge-num]").forEach((num) => {
    const target = parseFloat(num.getAttribute("data-target")) || 0;
    const t0 = performance.now(), dur = 900;
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      num.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}