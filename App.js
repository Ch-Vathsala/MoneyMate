/* ==========================================================================
   MoneyMate — app.js
   State + derived-data computation + the global `App` object that every
   inline onclick/onchange/oninput in pages.js calls back into.
   ========================================================================== */

const state = {
  dark: true,
  user: null,
  authMode: "login",
  showPw: false,
  authError: "",
  page: "dashboard",
  mobileOpen: false,
  bellOpen: false,
  modal: null,          // null | 'addTx' | 'addGoal' | 'addBill'
  smsPreview: null,
  tx: seedTransactions(),
  goals: seedGoals(),
  bills: seedBills(),
  budget: seedBudget(),
};

const CURRENT_MONTH = "2026-08";
const LAST_MONTH = "2026-07";

function sumByCat(list) {
  const map = {};
  list.filter((x) => x.type === "debit").forEach((x) => { map[x.category] = (map[x.category] || 0) + x.amount; });
  return map;
}

function computeDerived() {
  const monthTx = state.tx.filter((x) => x.date.startsWith(CURRENT_MONTH));
  const lastMonthTx = state.tx.filter((x) => x.date.startsWith(LAST_MONTH));
  const expenseByCat = sumByCat(monthTx);
  const lastExpenseByCat = sumByCat(lastMonthTx);

  const income = monthTx.filter((x) => x.type === "credit").reduce((s, x) => s + x.amount, 0);
  const expense = monthTx.filter((x) => x.type === "debit").reduce((s, x) => s + x.amount, 0);
  const balance = state.tx.reduce((s, x) => s + (x.type === "credit" ? x.amount : -x.amount), 20000);
  const saved = Math.max(0, income - expense);
  const remainingBudget = Math.max(0, state.budget.monthly - expense);
  const totals = {
    balance, income, expense, saved, remainingBudget,
    expensePct: income ? Math.round((expense / income) * 100) : 0,
    savedPct: income ? Math.round((saved / income) * 100) : 0,
    budgetUsedPct: Math.round((expense / state.budget.monthly) * 100),
  };

  const savingsRate = income ? saved / income : 0;
  const budgetAdherence = Math.max(0, 1 - Math.max(0, expense - state.budget.monthly) / state.budget.monthly);
  const goalsProgress = state.goals.length ? state.goals.reduce((s, g) => s + Math.min(1, g.saved / g.target), 0) / state.goals.length : 0;
  const billHealth = 0.9;
  const rawScore = savingsRate * 35 + budgetAdherence * 30 + goalsProgress * 20 + billHealth * 15;
  const healthScore = {
    score: Math.max(0, Math.min(100, rawScore)),
    factors: [
      { label: "Savings rate", value: Math.round(savingsRate * 100) + "%" },
      { label: "Budget adherence", value: Math.round(budgetAdherence * 100) + "%" },
      { label: "Goals progress", value: Math.round(goalsProgress * 100) + "%" },
      { label: "Bill punctuality", value: Math.round(billHealth * 100) + "%" },
    ],
  };

  const weekData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date("2026-08-06T00:00:00"); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const amount = state.tx.filter((x) => x.date === key && x.type === "debit").reduce((s, x) => s + x.amount, 0);
    weekData.push({ day: d.toLocaleDateString("en-IN", { weekday: "short" }), amount });
  }

  const insights = [];
  EXPENSE_CATS.forEach((cat) => {
    const cur = expenseByCat[cat] || 0, prev = lastExpenseByCat[cat] || 0;
    if (prev > 0 && cur > 0) {
      const diffPct = Math.round((((cur / 6) - (prev / 31)) / (prev / 31)) * 100);
      if (Math.abs(diffPct) >= 20) insights.push({ text: `Your ${cat.toLowerCase()} spending pace is ${diffPct > 0 ? "up" : "down"} ${Math.abs(diffPct)}% versus last month's daily average.`, color: diffPct > 0 ? COLOR.NEG : COLOR.POS, iconName: diffPct > 0 ? "trend" : "down" });
    }
  });
  const top = Object.entries(expenseByCat).sort((a, b) => b[1] - a[1])[0];
  if (top) insights.push({ text: `Your highest spending category this month is ${top[0]} at ${fmt(top[1])}.`, color: COLOR.WARN, iconName: "warning" });
  const foodPerOrder = expenseByCat.Food ? expenseByCat.Food / monthTx.filter((x) => x.category === "Food").length : 0;
  if (foodPerOrder > 400) insights.push({ text: `You could save around ${fmt(foodPerOrder * 2)} this month by cutting back on food delivery orders.`, color: COLOR.POS, iconName: "bulb" });
  monthTx.filter((x) => x.type === "debit" && x.amount >= 5000).forEach((x) => insights.push({ text: `Large expense flagged: ${fmt(x.amount)} at ${x.merchant} on ${fmtDate(x.date)}.`, color: COLOR.NEG, iconName: "warning" }));
  if (insights.length === 0) insights.push({ text: "Your spending looks steady and consistent with last month — nice work!", color: COLOR.POS, iconName: "check" });

  const tips = [];
  if (totals.savedPct < 20) tips.push("Aim to save at least 20% of your income — try automating a transfer right after payday.");
  if ((expenseByCat.Food || 0) > (state.budget.categories.Food || 0)) tips.push("Food spending is over budget — batch-cooking twice a week could cut delivery orders significantly.");
  if ((expenseByCat.Shopping || 0) > (state.budget.categories.Shopping || 0)) tips.push("Shopping is running high this month — consider a 24-hour rule before non-essential purchases.");
  tips.push("Round up daily expenses and sweep the change into your Emergency Fund goal.");
  tips.push("Review subscriptions (OTT, music) quarterly — cancel anything unused in the last 60 days.");

  const notifications = [];
  if (totals.budgetUsedPct >= 90) notifications.push({ title: "Budget alert", body: `You've used ${totals.budgetUsedPct}% of your monthly budget.`, color: COLOR.NEG, icon: "warning" });
  else if (totals.budgetUsedPct >= 50) notifications.push({ title: "Budget alert", body: `You've used ${totals.budgetUsedPct}% of your monthly budget.`, color: COLOR.WARN, icon: "warning" });
  if (totals.balance < 2000) notifications.push({ title: "Low balance", body: `Your balance is below ₹2,000.`, color: COLOR.NEG, icon: "wallet" });
  state.bills.forEach((b) => { const d = daysUntil(b.dueDate); if (d <= 1 && d >= 0) notifications.push({ title: "Upcoming bill", body: `${b.name} is due ${d === 0 ? "today" : "tomorrow"}.`, color: COLOR.ORANGE, icon: "bills" }); });
  monthTx.filter((x) => x.type === "debit" && x.amount >= 5000).forEach((x) => notifications.push({ title: "Large expense", body: `You spent ${fmt(x.amount)} at ${x.merchant}.`, color: COLOR.NEG, icon: "warning" }));
  const foodToday = weekData[weekData.length - 1]?.amount || 0;
  const foodAvg = weekData.slice(0, 6).reduce((s, d) => s + d.amount, 0) / 6;
  if (foodAvg > 0 && foodToday > foodAvg * 1.8) notifications.push({ title: "Unusual spending", body: `Today's spending is well above your weekly average.`, color: COLOR.WARN, icon: "trend" });
  notifications.push({ title: "Savings reminder", body: `Save ${fmt(1500)} this week to stay on track for your goals.`, color: COLOR.GOLD, icon: "budgets" });

  return { totals, healthScore, weekData, insights, tips, notifications, expenseByCat, lastExpenseByCat, totalExpense: expense };
}

/* ==========================================================================
   App — every DOM-facing action lives here.
   ========================================================================== */

const App = {
  charts: {},

  init() {
    document.documentElement.setAttribute("data-theme", state.dark ? "dark" : "light");
    this.render();
  },

  render() {
    const root = document.getElementById("app");
    const modalRoot = document.getElementById("modal-root");
    document.documentElement.setAttribute("data-theme", state.dark ? "dark" : "light");

    if (!state.user) {
      root.innerHTML = renderAuth(state);
      modalRoot.innerHTML = "";
      return;
    }

    const derived = computeDerived();
    let pageHTML = "";
    if (state.page === "dashboard") pageHTML = renderDashboard(state, derived);
    else if (state.page === "transactions") pageHTML = renderTransactions(state);
    else if (state.page === "budgets") pageHTML = renderBudgets(state, derived);
    else if (state.page === "goals") pageHTML = renderGoals(state);
    else if (state.page === "bills") pageHTML = renderBills(state);
    else if (state.page === "analytics") pageHTML = renderAnalytics();
    else if (state.page === "insights") pageHTML = renderInsights(state, derived);
    else if (state.page === "reports") pageHTML = renderReports(state, derived);

    root.innerHTML = `
      ${renderSidebar(state)}
      ${state.mobileOpen ? `<div class="mm-scrim" onclick="App.setMobileOpen(false)"></div>` : ""}
      <div class="mm-content">
        ${renderTopBar(state, derived.notifications)}
        <div class="mm-page" key="${state.page}">${pageHTML}</div>
      </div>`;

    modalRoot.innerHTML = state.modal === "addTx" ? modalAddTx() : state.modal === "addGoal" ? modalAddGoal() : state.modal === "addBill" ? modalAddBill() : "";

    animateCounts(root);
    if (state.page === "transactions") this.filterTx();
    if (state.page === "analytics") this.buildCharts(derived);
    if (state.page === "top-categories-placeholder") {}
    const topCatsEl = document.getElementById("top-categories");
    const monthCmpEl = document.getElementById("month-comparison");
    if (topCatsEl) topCatsEl.innerHTML = topCategoriesHTML(derived.expenseByCat, derived.totalExpense);
    if (monthCmpEl) monthCmpEl.innerHTML = monthComparisonHTML();
  },

  /* ---------- chrome ---------- */
  nav(page) { state.page = page; state.mobileOpen = false; state.bellOpen = false; this.render(); },
  toggleTheme() { state.dark = !state.dark; this.render(); },
  setMobileOpen(v) { state.mobileOpen = v; this.render(); },
  toggleBell() { state.bellOpen = !state.bellOpen; this.render(); },
  logout() { state.user = null; this.render(); },

  /* ---------- auth ---------- */
  setAuthMode(m) { state.authMode = m; state.authError = ""; this.render(); },
  toggleShowPw() { state.showPw = !state.showPw; this.render(); },
  submitAuth(e) {
    e.preventDefault();
    const email = (document.getElementById("auth-email") || {}).value || "";
    const pass = (document.getElementById("auth-pass") || {}).value || "";
    const name = (document.getElementById("auth-name") || {}).value || "";
    if (!email || !pass || (state.authMode === "register" && !name)) { state.authError = "Please fill in all fields."; this.render(); return false; }
    if (pass.length < 6) { state.authError = "Password must be at least 6 characters."; this.render(); return false; }
    state.user = { name: name || email.split("@")[0], email };
    this.render();
    return false;
  },
  demoLogin() { state.user = { name: "Demo User", email: "demo@moneymate.app", demo: true }; this.render(); },

  /* ---------- transactions ---------- */
  parseSms() {
    const text = (document.getElementById("sms-text") || {}).value || "";
    const amtM = text.match(/Rs\.?\s?([\d,]+\.?\d*)/i);
    const typeM = /credited/i.test(text) ? "credit" : "debit";
    const merchM = text.match(/at\s+([A-Za-z0-9&\-'.\s]+?)(?:\.|via|$)/i);
    const methodM = text.match(/via\s+(UPI|Card|NetBanking|Cash)/i);
    const dateM = text.match(/on\s+([\d]{1,2}[-\/][A-Za-z]{3}|[\d]{1,2}[-\/]\d{1,2}(?:[-\/]\d{2,4})?)/i);
    if (!amtM || !merchM) { state.smsPreview = { error: true }; document.getElementById("sms-preview").innerHTML = smsPreviewHTML(state.smsPreview); return; }
    const amount = parseFloat(amtM[1].replace(/,/g, ""));
    const merchant = merchM[1].trim();
    state.smsPreview = { amount, merchant, category: categorize(merchant), paymentMethod: methodM ? methodM[1] : "UPI", type: typeM, date: new Date().toISOString().slice(0, 10), dateLabel: dateM ? dateM[1] : "today" };
    document.getElementById("sms-preview").innerHTML = smsPreviewHTML(state.smsPreview);
  },
  confirmSms() {
    const p = state.smsPreview;
    if (!p || p.error) return;
    state.tx.unshift({ id: uid(), amount: p.amount, merchant: p.merchant, category: p.category, paymentMethod: p.paymentMethod, type: p.type, date: p.date, notes: "", source: "sms" });
    state.smsPreview = null;
    this.render();
  },
  filterTx() {
    const q = ((document.getElementById("tx-search") || {}).value || "").toLowerCase();
    const cat = (document.getElementById("tx-filter-cat") || {}).value || "All";
    const method = (document.getElementById("tx-filter-method") || {}).value || "All";
    document.querySelectorAll(".tx-row").forEach((row) => {
      const match = (cat === "All" || row.dataset.cat === cat) && (method === "All" || row.dataset.method === method) && (q === "" || row.dataset.merchant.includes(q));
      row.style.display = match ? "" : "none";
    });
  },
  updateTxCategory(id, cat) { const t = state.tx.find((x) => x.id === id); if (t) t.category = cat; this.render(); },
  deleteTx(id) { state.tx = state.tx.filter((x) => x.id !== id); this.render(); },
  submitAddTx(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("mtx-amount").value);
    const merchant = document.getElementById("mtx-merchant").value.trim();
    if (!amount || !merchant) return false;
    state.tx.unshift({
      id: uid(), amount, merchant,
      type: document.getElementById("mtx-type").value,
      category: document.getElementById("mtx-category").value,
      paymentMethod: document.getElementById("mtx-method").value,
      date: document.getElementById("mtx-date").value || new Date().toISOString().slice(0, 10),
      notes: document.getElementById("mtx-notes").value,
      source: "manual",
    });
    state.modal = null;
    this.render();
    return false;
  },

  /* ---------- budgets ---------- */
  setMonthlyBudget(v) { state.budget.monthly = parseFloat(v) || 0; this.render(); },
  setCategoryBudget(cat, v) { state.budget.categories[cat] = parseFloat(v) || 0; this.render(); },

  /* ---------- goals ---------- */
  contributeGoal(id) {
    const input = document.getElementById("goal-add-" + id);
    const amt = parseFloat(input.value);
    if (!amt) return;
    const g = state.goals.find((x) => x.id === id);
    if (g) g.saved += amt;
    this.render();
  },
  deleteGoal(id) { state.goals = state.goals.filter((g) => g.id !== id); this.render(); },
  submitAddGoal(e) {
    e.preventDefault();
    const name = document.getElementById("mg-name").value.trim();
    const target = parseFloat(document.getElementById("mg-target").value);
    if (!name || !target) return false;
    state.goals.push({
      id: uid(), name, emoji: document.getElementById("mg-emoji").value || "🎯",
      target, saved: parseFloat(document.getElementById("mg-saved").value) || 0,
      deadline: document.getElementById("mg-deadline").value || null,
    });
    state.modal = null;
    this.render();
    return false;
  },

  /* ---------- bills ---------- */
  markBillPaid(id) {
    const b = state.bills.find((x) => x.id === id);
    if (b) { const d = new Date(b.dueDate); d.setMonth(d.getMonth() + 1); b.dueDate = d.toISOString().slice(0, 10); }
    this.render();
  },
  deleteBill(id) { state.bills = state.bills.filter((b) => b.id !== id); this.render(); },
  submitAddBill(e) {
    e.preventDefault();
    const name = document.getElementById("mb-name").value.trim();
    const amount = parseFloat(document.getElementById("mb-amount").value);
    const dueDate = document.getElementById("mb-due").value;
    if (!name || !amount || !dueDate) return false;
    state.bills.push({ id: uid(), name, amount, dueDate, category: document.getElementById("mb-category").value, recurring: document.getElementById("mb-recur").value });
    state.modal = null;
    this.render();
    return false;
  },

  /* ---------- modals ---------- */
  openModal(type) { state.modal = type; this.render(); },
  closeModal() { state.modal = null; this.render(); },

  /* ---------- reports ---------- */
  downloadCSV() {
    const header = "Date,Merchant,Category,Type,Payment Method,Amount\n";
    const rows = state.tx.map((x) => `${x.date},${x.merchant},${x.category},${x.type},${x.paymentMethod},${x.amount}`).join("\n");
    this._downloadBlob(header + rows, "moneymate_transactions.csv");
  },
  downloadSummaryCSV() {
    const d = computeDerived();
    const rows = ["Metric,Value", `Total Balance,${d.totals.balance}`, `Monthly Income,${d.totals.income}`, `Monthly Expenses,${d.totals.expense}`, `Amount Saved,${d.totals.saved}`, `Remaining Budget,${d.totals.remainingBudget}`].join("\n");
    this._downloadBlob(rows, "moneymate_summary.csv");
  },
  _downloadBlob(text, filename) {
    const blob = new Blob([text], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },
  printReport() { window.print(); },

  /* ---------- charts (Chart.js) ---------- */
  buildCharts(derived) {
    if (typeof Chart === "undefined") return;
    Object.values(this.charts).forEach((c) => c && c.destroy());
    this.charts = {};
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue("--border").trim();
    const textColor = getComputedStyle(document.documentElement).getPropertyValue("--sub").trim();
    Chart.defaults.font.family = "'IBM Plex Mono', monospace";
    Chart.defaults.font.size = 11;
    Chart.defaults.color = textColor;

    const ieCtx = document.getElementById("chart-income-expense");
    if (ieCtx) this.charts.ie = new Chart(ieCtx, {
      type: "bar",
      data: { labels: monthlyHistory.map((m) => m.month), datasets: [
        { label: "Income", data: monthlyHistory.map((m) => m.income), backgroundColor: COLOR.POS, borderRadius: 3 },
        { label: "Expense", data: monthlyHistory.map((m) => m.expense), backgroundColor: COLOR.NEG, borderRadius: 3 },
      ] },
      options: { maintainAspectRatio: false, scales: { x: { grid: { color: gridColor } }, y: { grid: { color: gridColor } } }, plugins: { legend: { labels: { color: textColor } } } },
    });

    const pieCtx = document.getElementById("chart-category-pie");
    const pieData = EXPENSE_CATS.map((c) => ({ name: c, value: derived.expenseByCat[c] || 0 })).filter((d) => d.value > 0);
    if (pieCtx) this.charts.pie = new Chart(pieCtx, {
      type: "doughnut",
      data: { labels: pieData.map((d) => d.name), datasets: [{ data: pieData.map((d) => d.value), backgroundColor: pieData.map((d) => CATS[d.name].c), borderColor: getComputedStyle(document.documentElement).getPropertyValue("--surface"), borderWidth: 2 }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { color: textColor, boxWidth: 10, font: { size: 10 } } } } },
    });

    const trendCtx = document.getElementById("chart-trend");
    if (trendCtx) this.charts.trend = new Chart(trendCtx, {
      type: "line",
      data: { labels: monthlyHistory.map((m) => m.month), datasets: [{ label: "Expense", data: monthlyHistory.map((m) => m.expense), borderColor: COLOR.INFO, backgroundColor: COLOR.INFO + "33", fill: true, tension: 0.35 }] },
      options: { maintainAspectRatio: false, scales: { x: { grid: { color: gridColor } }, y: { grid: { color: gridColor } } }, plugins: { legend: { display: false } } },
    });

    const weekCtx = document.getElementById("chart-week");
    if (weekCtx) this.charts.week = new Chart(weekCtx, {
      type: "line",
      data: { labels: derived.weekData.map((d) => d.day), datasets: [{ label: "Spending", data: derived.weekData.map((d) => d.amount), borderColor: COLOR.GOLD, backgroundColor: COLOR.GOLD, tension: 0.3, pointRadius: 3 }] },
      options: { maintainAspectRatio: false, scales: { x: { grid: { color: gridColor } }, y: { grid: { color: gridColor } } }, plugins: { legend: { display: false } } },
    });
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());