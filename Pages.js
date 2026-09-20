/* ==========================================================================
   MoneyMate — pages.js
   One function per screen. Every function returns an HTML string; App
   (app.js) inserts it and wires up listeners afterwards. Buttons call back
   into global `App.*` methods via inline onclick — simple and explicit.
   ========================================================================== */

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "transactions", label: "Transactions", icon: "transactions" },
  { id: "budgets", label: "Budgets", icon: "budgets" },
  { id: "goals", label: "Goals", icon: "goals" },
  { id: "bills", label: "Bills", icon: "bills" },
  { id: "analytics", label: "Analytics", icon: "analytics" },
  { id: "insights", label: "AI Assistant", icon: "insights" },
  { id: "reports", label: "Reports", icon: "reports" },
];

/* ------------------------------- Auth ------------------------------------ */

function renderAuth(state) {
  return `
  <div class="mm-auth">
    <button class="mm-icon-btn mm-auth-theme" onclick="App.toggleTheme()">${icon(state.dark ? "sun" : "moon", 16)}</button>
    <div class="mm-card" style="padding:34px;width:400px;max-width:100%;border-top:3px solid var(--pos)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <div style="width:38px;height:38px;border-radius:8px;background:var(--pos);display:flex;align-items:center;justify-content:center">${icon("wallet", 18)}</div>
        <div class="mm-font-display" style="font-weight:700;font-size:23px;color:var(--text)">MoneyMate</div>
      </div>
      <p style="color:var(--sub);font-size:12.5px;margin:0 0 24px">Your AI co-pilot for smarter money decisions.</p>

      <div class="mm-tabswitch">
        <button class="${state.authMode !== "register" ? "active" : ""}" onclick="App.setAuthMode('login')">Sign In</button>
        <button class="${state.authMode === "register" ? "active" : ""}" onclick="App.setAuthMode('register')">Register</button>
      </div>

      <form onsubmit="return App.submitAuth(event)">
        ${state.authMode === "register" ? `
        <label class="mm-field"><span>Full name</span><input class="mm-input" id="auth-name" placeholder="Vathsala"></label>` : ""}
        <label class="mm-field"><span>Email</span><input class="mm-input" id="auth-email" type="email" placeholder="you@example.com"></label>
        <label class="mm-field"><span>Password</span>
          <div style="position:relative">
            <input class="mm-input" id="auth-pass" type="${state.showPw ? "text" : "password"}" placeholder="••••••••">
            <button type="button" class="mm-eye" onclick="App.toggleShowPw()">${icon(state.showPw ? "eyeOff" : "eye", 15)}</button>
          </div>
        </label>
        ${state.authError ? `<div style="color:var(--neg);font-size:12px;margin-bottom:12px">${esc(state.authError)}</div>` : ""}
        <button type="submit" class="mm-btn mm-btn-pos" style="width:100%;padding:12px 0;margin-top:4px">${state.authMode === "register" ? "Create Account" : "Sign In"}</button>
      </form>

      <div class="mm-divider"><span></span><em>OR</em><span></span></div>
      <button class="mm-btn-outline" style="width:100%;padding:11px 0" onclick="App.demoLogin()">Continue with Demo Account</button>
      <p style="font-size:10.5px;color:var(--faint);text-align:center;margin:18px 0 0;line-height:1.5">
        ${icon("shield", 12)} Prototype only — credentials stay in this session and are never sent anywhere.
      </p>
    </div>
  </div>`;
}

/* --------------------------- Sidebar + Topbar ------------------------------ */

function renderSidebar(state) {
  const items = NAV.map((n) => {
    const active = state.page === n.id;
    return `<button class="mm-nav-item ${active ? "active" : ""}" onclick="App.nav('${n.id}')">
      <span class="${active ? "mm-nav-icon-active" : ""}">${icon(n.icon, 16)}</span> ${n.label}
    </button>`;
  }).join("");
  return `
  <div class="mm-sidebar ${state.mobileOpen ? "open" : ""}">
    <div class="mm-sidebar-logo">
      <div class="mm-logo-mark">${icon("wallet", 15)}</div>
      <span class="mm-font-display">MoneyMate</span>
    </div>
    <div class="mm-nav-list">${items}</div>
    <div class="mm-sidebar-foot mm-font-mono">MoneyMate v1.0 · Prototype</div>
  </div>`;
}

function renderTopBar(state, notifications) {
  const unread = notifications.length;
  const pageLabel = (NAV.find((n) => n.id === state.page) || {}).label || "Dashboard";
  const notifList = notifications.length === 0
    ? `<div style="font-size:12px;color:var(--sub);padding:10px">You're all caught up.</div>`
    : notifications.map((n, i) => `
      <div style="display:flex;gap:10px;padding:9px 6px;align-items:flex-start;${i < notifications.length - 1 ? "border-bottom:1px solid var(--border)" : ""}">
        <div style="width:26px;height:26px;border-radius:6px;background:${n.color}1c;color:${n.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon(n.icon, 13)}</div>
        <div><div style="font-size:12.5px;color:var(--text);font-weight:600;line-height:1.3">${esc(n.title)}</div><div style="font-size:11.5px;color:var(--sub);margin-top:1px">${esc(n.body)}</div></div>
      </div>`).join("");
  return `
  <div class="mm-topbar">
    <div style="display:flex;align-items:center;gap:12px">
      <button class="mm-icon-btn mm-hamburger" onclick="App.setMobileOpen(true)">${icon("menu", 16)}</button>
      <div>
        <div class="mm-font-display" style="font-weight:700;font-size:19px;color:var(--text)">${pageLabel}</div>
        <div style="font-size:11.5px;color:var(--sub)">Welcome back, ${esc((state.user.name || "").split(" ")[0])}</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:9px">
      <button class="mm-icon-btn" onclick="App.toggleTheme()">${icon(state.dark ? "sun" : "moon", 15)}</button>
      <div style="position:relative">
        <button class="mm-icon-btn" style="position:relative" onclick="App.toggleBell()">
          ${icon("bell", 15)}
          ${unread > 0 ? `<span class="mm-badge-pulse mm-font-mono">${unread}</span>` : ""}
        </button>
        ${state.bellOpen ? `<div class="mm-notif-panel">
          <div style="font-size:11px;font-weight:700;color:var(--sub);letter-spacing:.08em;text-transform:uppercase;padding:4px 6px 10px">Notifications</div>
          ${notifList}
        </div>` : ""}
      </div>
      <button class="mm-icon-btn" title="Log out" onclick="App.logout()">${icon("logout", 14)}</button>
    </div>
  </div>`;
}

/* ------------------------------- Dashboard --------------------------------- */

function renderDashboard(state, derived) {
  const { totals, healthScore, insights } = derived;
  const upcomingBills = [...state.bills].sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate)).slice(0, 4);
  const recent = [...state.tx].slice(0, 6).map((tx) => txRow(tx)).join("");

  const bills = upcomingBills.map((b) => {
    const d = daysUntil(b.dueDate);
    const color = d <= 1 ? COLOR.NEG : d <= 3 ? COLOR.WARN : COLOR.POS;
    return `<div style="display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-size:12px;font-weight:600;color:var(--text)">${esc(b.name)}</div><div class="mm-font-mono" style="font-size:10.5px;color:var(--sub)">${fmt(b.amount)}</div></div>
      ${pill(d <= 0 ? "Due today" : `${d}d left`, color)}
    </div>`;
  }).join("");

  const goalsMini = state.goals.slice(0, 3).map((g) => {
    const pct = (g.saved / g.target) * 100;
    return `<div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
        <span style="color:var(--text);font-weight:600">${g.emoji} ${esc(g.name)}</span>
        <span class="mm-font-mono" style="color:var(--sub);font-size:11px">${fmt(g.saved)} / ${fmt(g.target)}</span>
      </div>${bar1(pct, COLOR.GOLD)}
    </div>`;
  }).join("");

  const snapshot = insights.slice(0, 3).map((ins) => `<div style="display:flex;gap:9px;margin-bottom:11px;font-size:12px;color:var(--sub);line-height:1.45"><span style="color:${ins.color}">●</span> ${esc(ins.text)}</div>`).join("");

  return `
  <div class="mm-stack">
    <div class="mm-grid5">
      ${statCard({ label: "Total Balance", raw: totals.balance, iconName: "wallet", color: COLOR.INFO, sub: "Available now", id: "sc-balance" })}
      ${statCard({ label: "Monthly Income", raw: totals.income, iconName: "trend", color: COLOR.POS, sub: "this month", trend: "up", id: "sc-income" })}
      ${statCard({ label: "Monthly Expenses", raw: totals.expense, iconName: "down", color: COLOR.NEG, sub: totals.expensePct + "% of income", trend: "down", id: "sc-expense" })}
      ${statCard({ label: "Amount Saved", raw: totals.saved, iconName: "budgets", color: COLOR.GOLD, sub: totals.savedPct + "% savings rate", trend: "up", id: "sc-saved" })}
      ${statCard({ label: "Remaining Budget", raw: totals.remainingBudget, iconName: "card", color: COLOR.WARN, sub: totals.budgetUsedPct + "% used", id: "sc-remaining" })}
    </div>

    <div class="mm-grid3">
      ${card({ style: "padding:22px", content: `
        <div style="font-size:11px;font-weight:700;color:var(--sub);letter-spacing:.07em;text-transform:uppercase;margin-bottom:12px;text-align:center">Financial Health Seal</div>
        ${gauge(healthScore.score, "dash-gauge")}
        <div style="margin-top:16px;display:flex;flex-direction:column;gap:7px">
          ${healthScore.factors.map((f) => `<div class="mm-font-mono" style="display:flex;justify-content:space-between;font-size:11px;color:var(--sub)"><span>${f.label}</span><span style="color:var(--text);font-weight:600">${f.value}</span></div>`).join("")}
        </div>` })}
      ${card({ style: "padding:22px", content: `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text)">Savings Goals</div>${icon("goals", 14)}
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">${goalsMini}</div>` })}
      ${card({ style: "padding:22px", content: `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text)">Upcoming Bills</div>${icon("bills", 14)}
        </div>
        <div style="display:flex;flex-direction:column;gap:11px">${bills}</div>` })}
    </div>

    <div class="mm-grid2">
      ${card({ style: "padding:22px", content: `
        <div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:6px">Recent Transactions</div>
        <div>${recent}</div>` })}
      ${card({ accent: COLOR.POS, style: "padding:22px;background:var(--surface-alt)", content: `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">${icon("insights", 15)}<div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text)">AI Snapshot</div></div>
        ${snapshot}` })}
    </div>
  </div>`;
}

function txRow(tx) {
  const meta = CATS[tx.category] || CATS.Others;
  const credit = tx.type === "credit";
  return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 4px">
    <div style="display:flex;align-items:center;gap:11px">
      <div style="width:32px;height:32px;border-radius:7px;background:${meta.c}1c;display:flex;align-items:center;justify-content:center;font-size:15px">${meta.emoji}</div>
      <div><div style="font-size:13px;font-weight:600;color:var(--text)">${esc(tx.merchant)}</div><div style="font-size:10.5px;color:var(--sub)">${fmtDate(tx.date)} · ${tx.paymentMethod}</div></div>
    </div>
    <div class="mm-font-mono" style="font-weight:600;font-size:13.5px;color:${credit ? "var(--pos)" : "var(--neg)"}">${credit ? "+" : "-"}${fmt(tx.amount)}</div>
  </div>`;
}

/* ----------------------------- Transactions --------------------------------- */

function renderTransactions(state) {
  const rows = state.tx.map((x) => {
    const meta = CATS[x.category] || CATS.Others;
    const credit = x.type === "credit";
    return `<div class="tx-row" data-merchant="${esc(x.merchant.toLowerCase())}" data-cat="${x.category}" data-method="${x.paymentMethod}"
      style="display:flex;align-items:center;justify-content:space-between;padding:12px 10px;border-bottom:1px solid var(--border);gap:10px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:12px;min-width:200px">
        <div style="width:34px;height:34px;border-radius:7px;background:${meta.c}1c;display:flex;align-items:center;justify-content:center;font-size:16px">${meta.emoji}</div>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:7px">${esc(x.merchant)} ${x.source === "sms" ? pill("SMS", COLOR.INFO) : ""}</div>
          <div style="font-size:10.5px;color:var(--sub)">${fmtDate(x.date)} · ${x.paymentMethod}${x.notes ? " · " + esc(x.notes) : ""}</div>
        </div>
      </div>
      <select class="mm-input" style="width:auto;padding:6px 8px;font-size:11.5px" onchange="App.updateTxCategory('${x.id}', this.value)">
        ${Object.keys(CATS).map((c) => `<option ${c === x.category ? "selected" : ""}>${c}</option>`).join("")}
      </select>
      <div class="mm-font-mono" style="font-weight:600;font-size:13.5px;color:${credit ? "var(--pos)" : "var(--neg)"};min-width:88px;text-align:right">${credit ? "+" : "-"}${fmt(x.amount)}</div>
      <button class="mm-icon-plain" onclick="App.deleteTx('${x.id}')">${icon("trash", 14)}</button>
    </div>`;
  }).join("");

  return `
  <div class="mm-stack">
    ${card({ accent: COLOR.INFO, style: "padding:20px", content: `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        ${icon("sms", 15)}<div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text)">Auto-Track via SMS</div>
        <span style="font-size:10.5px;color:var(--faint)">— paste a bank SMS and MoneyMate extracts the transaction</span>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <input class="mm-input" id="sms-text" style="flex:1;min-width:260px" value="Rs.450 debited from A/c XXXX1234 on 06-Aug at Swiggy via UPI.">
        <button class="mm-btn mm-btn-info" onclick="App.parseSms()">Parse SMS</button>
      </div>
      <div id="sms-preview"></div>` })}

    <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
      <div style="position:relative;flex:1;min-width:200px">
        <span style="position:absolute;left:11px;top:9px">${icon("search", 13)}</span>
        <input class="mm-input" id="tx-search" style="padding-left:32px" placeholder="Search merchant..." oninput="App.filterTx()">
      </div>
      <select class="mm-input" id="tx-filter-cat" style="width:auto" onchange="App.filterTx()"><option>All</option>${Object.keys(CATS).map((c) => `<option>${c}</option>`).join("")}</select>
      <select class="mm-input" id="tx-filter-method" style="width:auto" onchange="App.filterTx()"><option>All</option>${PAY_METHODS.map((m) => `<option>${m}</option>`).join("")}</select>
      <button class="mm-btn mm-btn-pos" onclick="App.openModal('addTx')">${icon("plus", 13)} Add Transaction</button>
    </div>

    ${card({ style: "padding:6px", content: `<div style="max-height:560px;overflow-y:auto" id="tx-list">${rows || `<div style="padding:30px;text-align:center;color:var(--sub);font-size:13px">No transactions yet.</div>`}</div>` })}
  </div>`;
}

function smsPreviewHTML(p) {
  if (!p) return "";
  if (p.error) return `<div style="margin-top:12px;font-size:12px;color:var(--neg)">Couldn't parse that message. Try: "Rs.450 debited from A/c XXXX1234 on 06-Aug at Swiggy via UPI."</div>`;
  const meta = CATS[p.category];
  return `<div class="mm-rise" style="margin-top:14px;padding:14px;border-radius:8px;background:var(--input-bg);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
    <div class="mm-font-mono" style="font-size:12px;color:var(--text)">
      <b>${fmt(p.amount)}</b> ${p.type} · ${esc(p.merchant)} · ${pill(meta.emoji + " " + p.category, meta.c)} · ${p.paymentMethod} · ${p.dateLabel}
    </div>
    <button class="mm-btn mm-btn-pos" onclick="App.confirmSms()">Add Transaction</button>
  </div>`;
}

/* ------------------------------- Budgets ------------------------------------ */

function budgetStatusColor(pct) {
  if (pct >= 100) return COLOR.NEG;
  if (pct >= 90) return COLOR.ORANGE;
  if (pct >= 80) return COLOR.WARN;
  if (pct >= 50) return COLOR.INFO;
  return COLOR.POS;
}
function budgetAlert(pct) {
  if (pct >= 100) return { text: "Budget limit exceeded", color: COLOR.NEG, iconName: "warning" };
  if (pct >= 90) return { text: "90% of budget used", color: COLOR.ORANGE, iconName: "warning" };
  if (pct >= 80) return { text: "80% of budget used", color: COLOR.WARN, iconName: "warning" };
  if (pct >= 50) return { text: "50% of budget used", color: COLOR.INFO, iconName: "check" };
  return null;
}

function renderBudgets(state, derived) {
  const { expenseByCat, totalExpense } = derived;
  const budget = state.budget;
  const daysInMonth = 31, dayOfMonth = new Date().getDate();
  const remaining = budget.monthly - totalExpense;
  const dailyLimit = remaining > 0 ? remaining / Math.max(1, daysInMonth - dayOfMonth) : 0;
  const pctUsed = (totalExpense / budget.monthly) * 100;
  const alert = budgetAlert(pctUsed);

  const catCards = EXPENSE_CATS.map((cat) => {
    const spent = expenseByCat[cat] || 0, cap = budget.categories[cat] || 0, pct = cap ? (spent / cap) * 100 : 0;
    return card({ style: "padding:15px", content: `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-size:12.5px;font-weight:600;color:var(--text)">${CATS[cat].emoji} ${cat}</div>
        <input class="mm-input" type="number" value="${cap}" style="width:88px;padding:5px 8px;font-size:11px" onchange="App.setCategoryBudget('${cat}', this.value)">
      </div>
      ${bar1(pct, budgetStatusColor(pct))}
      <div class="mm-font-mono" style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--sub);margin-top:6px"><span>${fmt(spent)} / ${fmt(cap)}</span><span>${Math.round(pct)}%</span></div>` });
  }).join("");

  return `
  <div class="mm-stack">
    <div class="mm-grid3">
      ${statCard({ label: "Monthly Budget", raw: budget.monthly, iconName: "budgets", color: COLOR.GOLD, id: "sc-budget" })}
      ${statCard({ label: "Remaining", raw: Math.max(0, remaining), iconName: "wallet", color: budgetStatusColor(pctUsed), sub: Math.round(pctUsed) + "% used", id: "sc-budget-remain" })}
      ${statCard({ label: "Daily Spending Limit", raw: dailyLimit, iconName: "bills", color: COLOR.INFO, sub: "to stay on track", id: "sc-daily-limit" })}
    </div>

    ${card({ style: "padding:20px", content: `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text)">Overall Budget</div>
        <input class="mm-input" type="number" value="${budget.monthly}" style="width:130px;padding:6px 10px;font-size:12px" onchange="App.setMonthlyBudget(this.value)">
      </div>
      ${bar1(pctUsed, budgetStatusColor(pctUsed))}
      <div class="mm-font-mono" style="display:flex;justify-content:space-between;font-size:11px;color:var(--sub);margin-top:6px"><span>${fmt(totalExpense)} spent</span><span>${Math.round(pctUsed)}%</span></div>
      ${alert ? `<div style="margin-top:12px;display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:7px;background:${alert.color}16;border:1px solid ${alert.color}40">${icon(alert.iconName, 14)}<span style="font-size:12px;color:var(--text);font-weight:600">${alert.text}</span></div>` : ""}
    ` })}

    <div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text);margin-top:4px">Category-wise Budgets</div>
    <div class="mm-grid2b">${catCards}</div>
  </div>`;
}

/* --------------------------------- Goals ------------------------------------- */

function estCompletion(g) {
  const monthlyRate = g.target * 0.08, remaining = g.target - g.saved;
  if (remaining <= 0) return "Achieved";
  const months = Math.ceil(remaining / monthlyRate);
  const d = new Date(); d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function renderGoals(state) {
  const cards = state.goals.map((g) => {
    const pct = Math.min(100, (g.saved / g.target) * 100), remaining = Math.max(0, g.target - g.saved);
    return card({ accent: COLOR.GOLD, style: "padding:20px", content: `
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="display:flex;gap:10px;align-items:center">
          <div style="font-size:25px">${g.emoji}</div>
          <div><div class="mm-font-display" style="font-size:14.5px;font-weight:700;color:var(--text)">${esc(g.name)}</div><div class="mm-font-mono" style="font-size:11px;color:var(--sub)">Target ${fmt(g.target)}</div></div>
        </div>
        <button class="mm-icon-plain" onclick="App.deleteGoal('${g.id}')">${icon("trash", 14)}</button>
      </div>
      <div style="margin:16px 0 8px">${bar1(pct, COLOR.GOLD)}</div>
      <div class="mm-font-mono" style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--sub);margin-bottom:14px"><span>${fmt(g.saved)} saved (${Math.round(pct)}%)</span><span>${fmt(remaining)} left</span></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--faint);margin-bottom:12px"><span>Est. completion: <b style="color:var(--sub)">${estCompletion(g)}</b></span></div>
      <div style="display:flex;gap:8px">
        <input class="mm-input" type="number" placeholder="Add amount" id="goal-add-${g.id}" style="flex:1">
        <button class="mm-btn" style="background:${COLOR.GOLD};color:#23180b" onclick="App.contributeGoal('${g.id}')">Add</button>
      </div>` });
  }).join("");

  return `
  <div class="mm-stack">
    <div style="display:flex;justify-content:flex-end"><button class="mm-btn" style="background:${COLOR.GOLD};color:#23180b" onclick="App.openModal('addGoal')">${icon("plus", 13)} New Goal</button></div>
    <div class="mm-grid2">${cards}</div>
  </div>`;
}

/* --------------------------------- Bills -------------------------------------- */

function renderBills(state) {
  const sorted = [...state.bills].sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));
  const cards = sorted.map((b) => {
    const d = daysUntil(b.dueDate);
    const color = d <= 1 ? COLOR.NEG : d <= 3 ? COLOR.ORANGE : d <= 7 ? COLOR.WARN : COLOR.POS;
    const meta = CATS[b.category] || CATS.Bills;
    return card({ style: "padding:18px", content: `
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="display:flex;gap:10px">
          <div style="width:36px;height:36px;border-radius:8px;background:${meta.c}1c;display:flex;align-items:center;justify-content:center;font-size:17px">${meta.emoji}</div>
          <div><div class="mm-font-display" style="font-size:13.5px;font-weight:700;color:var(--text)">${esc(b.name)}</div><div class="mm-font-mono" style="font-size:11px;color:var(--sub)">${fmt(b.amount)} · ${b.recurring}</div></div>
        </div>
        <button class="mm-icon-plain" onclick="App.deleteBill('${b.id}')">${icon("trash", 14)}</button>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
        ${pill(d < 0 ? `${-d}d overdue` : d === 0 ? "Due today" : `Due in ${d}d`, color)}
        <span class="mm-font-mono" style="font-size:10.5px;color:var(--faint)">${fmtDate(b.dueDate)}</span>
      </div>
      <button class="mm-btn-outline" style="margin-top:12px;width:100%;padding:8px 0" onclick="App.markBillPaid('${b.id}')">Mark as Paid</button>` });
  }).join("");

  return `
  <div class="mm-stack">
    <div style="display:flex;justify-content:flex-end"><button class="mm-btn" style="background:${COLOR.WARN};color:#241a04" onclick="App.openModal('addBill')">${icon("plus", 13)} Add Bill</button></div>
    <div class="mm-grid2">${cards}</div>
  </div>`;
}

/* ------------------------------- Analytics ------------------------------------- */

function renderAnalytics() {
  return `
  <div class="mm-stack">
    <div class="mm-grid2">
      ${card({ style: "padding:20px;height:320px", content: `<div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px">Income vs Expenses — 6 Months</div><div style="height:250px"><canvas id="chart-income-expense"></canvas></div>` })}
      ${card({ style: "padding:20px;height:320px", content: `<div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px">Category-wise Spending</div><div style="height:250px"><canvas id="chart-category-pie"></canvas></div>` })}
    </div>
    <div class="mm-grid2">
      ${card({ style: "padding:20px;height:300px", content: `<div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px">Monthly Spending Trend</div><div style="height:230px"><canvas id="chart-trend"></canvas></div>` })}
      ${card({ style: "padding:20px;height:300px", content: `<div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px">Weekly Spending</div><div style="height:230px"><canvas id="chart-week"></canvas></div>` })}
    </div>
    <div id="top-categories"></div>
    <div id="month-comparison"></div>
  </div>`;
}

function topCategoriesHTML(expenseByCat, totalExpense) {
  const pieData = EXPENSE_CATS.map((c) => ({ name: c, value: expenseByCat[c] || 0 })).filter((d) => d.value > 0);
  const top = [...pieData].sort((a, b) => b.value - a.value).slice(0, 5);
  const rows = top.map((c) => `<div>
    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
      <span style="color:var(--text);font-weight:600">${CATS[c.name].emoji} ${c.name}</span>
      <span class="mm-font-mono" style="color:var(--sub)">${fmt(c.value)} (${Math.round((c.value / totalExpense) * 100)}%)</span>
    </div>${bar1((c.value / totalExpense) * 100, CATS[c.name].c)}
  </div>`).join("");
  return card({ style: "padding:20px", content: `<div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:14px">Top Spending Categories</div><div style="display:flex;flex-direction:column;gap:12px">${rows}</div>` });
}

function monthComparisonHTML() {
  const thisMonth = monthlyHistory[monthlyHistory.length - 1], lastMonth = monthlyHistory[monthlyHistory.length - 2];
  const avg = monthlyHistory.reduce((s, m) => s + m.expense, 0) / monthlyHistory.length;
  const stat = (label, val) => `<div><div style="font-size:10.5px;color:var(--sub);text-transform:uppercase;letter-spacing:.05em">${label}</div><div class="mm-font-mono" style="font-size:19px;font-weight:600;color:var(--text)">${fmt(val)}</div></div>`;
  return card({ style: "padding:20px", content: `<div class="mm-font-display" style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:14px">Month-over-Month Comparison</div>
    <div style="display:flex;gap:30px;flex-wrap:wrap">${stat(lastMonth.month + " Expenses", lastMonth.expense)}${stat(thisMonth.month + " Expenses (so far)", thisMonth.expense)}${stat("Yearly Avg / Month", avg)}</div>` });
}

/* ------------------------------ AI Insights -------------------------------------- */

function renderInsights(state, derived) {
  const { insights, tips, healthScore } = derived;
  const cards = insights.map((ins) => card({ accent: ins.color, style: "padding:17px;display:flex;gap:12px", content: `
    <div style="width:32px;height:32px;border-radius:7px;background:${ins.color}1c;color:${ins.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon(ins.iconName, 15)}</div>
    <div style="font-size:12.5px;color:var(--text);line-height:1.5">${esc(ins.text)}</div>` })).join("");

  const tipRows = tips.map((tip) => `<div style="display:flex;gap:10px;font-size:12px;color:var(--sub);align-items:flex-start">${icon("arrowRight", 13)} ${esc(tip)}</div>`).join("");

  return `
  <div class="mm-stack">
    ${card({ accent: COLOR.POS, style: "padding:22px;background:var(--surface-alt)", content: `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">${icon("insights", 19)}<div class="mm-font-display" style="font-size:17px;font-weight:700;color:var(--text)">Your AI Financial Assistant</div></div>
      <p style="font-size:12px;color:var(--sub);margin-top:6px">Insights generated from your recent spending patterns — updated automatically as new transactions come in.</p>` })}

    <div class="mm-grid2">${cards}</div>

    ${card({ style: "padding:22px", content: `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">${icon("bulb", 15)}<div class="mm-font-display" style="font-size:13.5px;font-weight:700;color:var(--text)">Personalized Saving Tips</div></div>
      <div style="display:flex;flex-direction:column;gap:10px">${tipRows}</div>` })}

    ${card({ style: "padding:22px", content: `
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
        ${gauge(healthScore.score, "insights-gauge")}
        <div style="flex:1;min-width:220px">
          <div class="mm-font-display" style="font-size:13.5px;font-weight:700;color:var(--text);margin-bottom:8px">How your Financial Health Score is calculated</div>
          ${healthScore.factors.map((f) => `<div class="mm-font-mono" style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--sub);margin-bottom:6px"><span>${f.label}</span><span style="color:var(--text);font-weight:600">${f.value}</span></div>`).join("")}
        </div>
      </div>` })}
  </div>`;
}

/* -------------------------------- Reports ----------------------------------------- */

function renderReports(state, derived) {
  const { totals } = derived;
  const cards = [
    { title: "Monthly PDF Report", desc: "Printable summary of income, expenses, budgets and goals for this month.", action: "App.printReport()", cta: "Print / Save as PDF", iconName: "reports", color: COLOR.NEG },
    { title: "CSV Export — Transactions", desc: "Every transaction with date, merchant, category and amount.", action: "App.downloadCSV()", cta: "Download CSV", iconName: "download", color: COLOR.INFO },
    { title: "Spending Summary", desc: "Balance, income, expenses, savings and remaining budget in one file.", action: "App.downloadSummaryCSV()", cta: "Download CSV", iconName: "analytics", color: COLOR.POS },
    { title: "Savings Report", desc: "Progress across every active savings goal.", action: "App.printReport()", cta: "Print / Save as PDF", iconName: "budgets", color: COLOR.GOLD },
  ].map((c) => card({ accent: c.color, style: "padding:20px", content: `
    <div style="width:34px;height:34px;border-radius:8px;background:${c.color}1c;color:${c.color};display:flex;align-items:center;justify-content:center;margin-bottom:12px">${icon(c.iconName, 16)}</div>
    <div class="mm-font-display" style="font-size:13.5px;font-weight:700;color:var(--text);margin-bottom:5px">${c.title}</div>
    <div style="font-size:11.5px;color:var(--sub);margin-bottom:14px;line-height:1.45">${c.desc}</div>
    <button class="mm-btn" style="background:${c.color}" onclick="${c.action}">${c.cta}</button>` })).join("");

  const stat = (label, val, color) => `<div><div style="font-size:10.5px;color:var(--sub);text-transform:uppercase;letter-spacing:.05em">${label}</div><div class="mm-font-mono" style="font-size:17px;font-weight:600;color:${color}">${fmt(val)}</div></div>`;

  return `
  <div class="mm-stack">
    <div class="mm-grid2 mm-print-hide">${cards}</div>
    ${card({ style: "padding:22px", content: `
      <div class="mm-font-display" style="font-size:13.5px;font-weight:700;color:var(--text);margin-bottom:14px">Monthly Summary — ${monthlyHistory[monthlyHistory.length - 1].month} 2026</div>
      <div class="mm-grid3">${stat("Total Income", totals.income, "var(--pos)")}${stat("Total Expenses", totals.expense, "var(--neg)")}${stat("Total Savings", totals.saved, "var(--gold)")}</div>` })}
  </div>`;
}

/* -------------------------------- Modals ------------------------------------------- */

function modalShell(title, bodyHTML) {
  return `
  <div class="mm-modal-overlay" onclick="if(event.target===this) App.closeModal()">
    <div class="mm-modal">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 class="mm-font-display" style="margin:0;font-weight:700;font-size:19px;color:var(--text)">${title}</h3>
        <button class="mm-icon-plain" onclick="App.closeModal()">${icon("close", 17)}</button>
      </div>
      ${bodyHTML}
    </div>
  </div>`;
}

function field(label, inputHTML) {
  return `<label class="mm-field"><span>${label}</span>${inputHTML}</label>`;
}

function modalAddTx() {
  return modalShell("Add Manual Transaction", `
    <form onsubmit="return App.submitAddTx(event)">
      ${field("Amount (₹)", `<input required type="number" class="mm-input" id="mtx-amount">`)}
      ${field("Type", `<select class="mm-input" id="mtx-type"><option value="debit">Debit (expense)</option><option value="credit">Credit (income)</option></select>`)}
      ${field("Merchant", `<input required class="mm-input" id="mtx-merchant" placeholder="e.g. Starbucks">`)}
      ${field("Category", `<select class="mm-input" id="mtx-category">${Object.keys(CATS).map((c) => `<option>${c}</option>`).join("")}</select>`)}
      ${field("Payment Method", `<select class="mm-input" id="mtx-method">${PAY_METHODS.map((m) => `<option>${m}</option>`).join("")}</select>`)}
      ${field("Date", `<input type="date" class="mm-input" id="mtx-date" value="${new Date().toISOString().slice(0, 10)}">`)}
      ${field("Notes", `<input class="mm-input" id="mtx-notes" placeholder="Optional">`)}
      <button type="submit" class="mm-btn mm-btn-pos" style="width:100%;padding:12px 0">Save Transaction</button>
    </form>`);
}
function modalAddGoal() {
  return modalShell("Create Savings Goal", `
    <form onsubmit="return App.submitAddGoal(event)">
      ${field("Goal name", `<input required class="mm-input" id="mg-name" placeholder="e.g. New Phone">`)}
      ${field("Emoji", `<input class="mm-input" id="mg-emoji" value="🎯">`)}
      ${field("Target amount (₹)", `<input required type="number" class="mm-input" id="mg-target">`)}
      ${field("Already saved (₹)", `<input type="number" class="mm-input" id="mg-saved" value="0">`)}
      ${field("Target date", `<input type="date" class="mm-input" id="mg-deadline">`)}
      <button type="submit" class="mm-btn" style="width:100%;padding:12px 0;background:${COLOR.GOLD};color:#23180b">Create Goal</button>
    </form>`);
}
function modalAddBill() {
  return modalShell("Add Recurring Bill", `
    <form onsubmit="return App.submitAddBill(event)">
      ${field("Bill name", `<input required class="mm-input" id="mb-name" placeholder="e.g. Broadband">`)}
      ${field("Amount (₹)", `<input required type="number" class="mm-input" id="mb-amount">`)}
      ${field("Due date", `<input required type="date" class="mm-input" id="mb-due">`)}
      ${field("Category", `<select class="mm-input" id="mb-category">${Object.keys(CATS).filter((c) => c !== "Income").map((c) => `<option>${c}</option>`).join("")}</select>`)}
      ${field("Recurrence", `<select class="mm-input" id="mb-recur"><option>Monthly</option><option>Quarterly</option><option>Yearly</option></select>`)}
      <button type="submit" class="mm-btn" style="width:100%;padding:12px 0;background:${COLOR.WARN};color:#241a04">Save Bill</button>
    </form>`);
}