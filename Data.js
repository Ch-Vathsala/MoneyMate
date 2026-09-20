/* ==========================================================================
   MoneyMate — data.js
   Semantic palette, categories, seed data, and pure helper functions.
   No DOM code lives here — everything is plain data + functions.
   ========================================================================== */

const COLOR = {
  POS: "#2f6f5e",   // passbook green — income / good
  NEG: "#a63d40",   // stamp red — expense / alerts
  WARN: "#b08b2e",  // brass — caution
  INFO: "#3b6e8f",  // steel blue — informational
  GOLD: "#c69749",  // brass gold — goals / highlights
  ORANGE: "#c1622d",
};

const CATS = {
  Food: { emoji: "🍔", c: "#c1622d" },
  Transport: { emoji: "🚕", c: COLOR.INFO },
  Shopping: { emoji: "🛒", c: "#8b5e83" },
  Entertainment: { emoji: "🎬", c: "#b5446e" },
  Healthcare: { emoji: "🏥", c: COLOR.NEG },
  Education: { emoji: "📚", c: "#3e6259" },
  Bills: { emoji: "💡", c: COLOR.WARN },
  Rent: { emoji: "🏠", c: "#4c6b4f" },
  Others: { emoji: "📦", c: "#746c5e" },
  Income: { emoji: "💰", c: COLOR.POS },
};
const EXPENSE_CATS = Object.keys(CATS).filter((c) => c !== "Income");
const PAY_METHODS = ["UPI", "Card", "Cash", "NetBanking"];

const KEYWORD_MAP = [
  [/swiggy|zomato|dominos|food|cafe|restaurant|dine/i, "Food"],
  [/uber|ola|rapido|petrol|fuel|metro|transport|parking/i, "Transport"],
  [/amazon|flipkart|myntra|mall|store|digital|reliance/i, "Shopping"],
  [/netflix|prime|hotstar|bookmyshow|spotify|movie|cinema/i, "Entertainment"],
  [/pharmacy|hospital|clinic|apollo|medical|doctor/i, "Healthcare"],
  [/udemy|coursera|school|college|tuition|course/i, "Education"],
  [/electricity|water board|broadband|recharge|wifi|jio|airtel|bill/i, "Bills"],
  [/rent|landlord/i, "Rent"],
];
function categorize(merchant) {
  for (const [re, cat] of KEYWORD_MAP) if (re.test(merchant)) return cat;
  return "Others";
}

/* ------------------------------- helpers --------------------------------- */

function fmt(n) {
  const v = Math.round(Math.abs(n || 0));
  return (n < 0 ? "-₹" : "₹") + v.toLocaleString("en-IN");
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function daysUntil(d) {
  const ms = new Date(d + "T00:00:00") - new Date(new Date().toDateString());
  return Math.round(ms / 86400000);
}
function uid() { return Math.random().toString(36).slice(2, 10); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* ------------------------------ seed data --------------------------------- */

function seedTransactions() {
  const rows = [
    ["2026-07-01", 50000, "Salary Credit", "Income", "NetBanking", "credit"],
    ["2026-07-02", 450, "Swiggy", "Food", "UPI", "debit"],
    ["2026-07-03", 220, "Uber", "Transport", "UPI", "debit"],
    ["2026-07-04", 1850, "Big Bazaar", "Shopping", "Card", "debit"],
    ["2026-07-05", 1200, "Electricity Board", "Bills", "UPI", "debit"],
    ["2026-07-06", 649, "Netflix", "Entertainment", "Card", "debit"],
    ["2026-07-08", 560, "Apollo Pharmacy", "Healthcare", "UPI", "debit"],
    ["2026-07-09", 380, "Zomato", "Food", "UPI", "debit"],
    ["2026-07-10", 12000, "Landlord Rent", "Rent", "NetBanking", "debit"],
    ["2026-07-11", 2400, "Amazon", "Shopping", "Card", "debit"],
    ["2026-07-12", 180, "Ola", "Transport", "UPI", "debit"],
    ["2026-07-13", 900, "BookMyShow", "Entertainment", "UPI", "debit"],
    ["2026-07-15", 799, "Udemy Course", "Education", "Card", "debit"],
    ["2026-07-16", 520, "Swiggy", "Food", "UPI", "debit"],
    ["2026-07-17", 399, "Jio Recharge", "Bills", "UPI", "debit"],
    ["2026-07-18", 1650, "Myntra", "Shopping", "Card", "debit"],
    ["2026-07-19", 1000, "Petrol Pump", "Transport", "Cash", "debit"],
    ["2026-07-21", 410, "Swiggy", "Food", "UPI", "debit"],
    ["2026-07-22", 5000, "Freelance Credit", "Income", "NetBanking", "credit"],
    ["2026-07-23", 650, "Dominos", "Food", "UPI", "debit"],
    ["2026-07-25", 350, "Water Board", "Bills", "UPI", "debit"],
    ["2026-07-27", 119, "Spotify", "Entertainment", "Card", "debit"],
    ["2026-07-28", 900, "Local Store", "Others", "Cash", "debit"],
    ["2026-07-30", 480, "Swiggy", "Food", "UPI", "debit"],
    ["2026-08-01", 50000, "Salary Credit", "Income", "NetBanking", "credit"],
    ["2026-08-02", 600, "Swiggy", "Food", "UPI", "debit"],
    ["2026-08-02", 250, "Uber", "Transport", "UPI", "debit"],
    ["2026-08-03", 8000, "Reliance Digital", "Shopping", "Card", "debit"],
    ["2026-08-04", 1300, "Electricity Board", "Bills", "UPI", "debit"],
    ["2026-08-05", 550, "Zomato", "Food", "UPI", "debit"],
    ["2026-08-05", 300, "Apollo Pharmacy", "Healthcare", "UPI", "debit"],
    ["2026-08-06", 700, "Swiggy", "Food", "UPI", "debit"],
  ];
  return rows.map(([date, amount, merchant, category, method, type]) => ({
    id: uid(), date, amount, merchant, category, paymentMethod: method, type,
    notes: "", source: Math.random() > 0.4 ? "sms" : "manual",
  })).reverse();
}

const monthlyHistory = [
  { month: "Mar", income: 45000, expense: 32000 },
  { month: "Apr", income: 45000, expense: 35500 },
  { month: "May", income: 48000, expense: 31000 },
  { month: "Jun", income: 48000, expense: 37200 },
  { month: "Jul", income: 55000, expense: 24107 },
  { month: "Aug", income: 50000, expense: 11700 },
];

function seedGoals() {
  return [
    { id: uid(), name: "Laptop", emoji: "💻", target: 60000, saved: 32000, deadline: "2026-11-15" },
    { id: uid(), name: "Vacation", emoji: "🏖️", target: 40000, saved: 15000, deadline: "2026-12-20" },
    { id: uid(), name: "Emergency Fund", emoji: "🛟", target: 100000, saved: 45000, deadline: "2027-03-01" },
    { id: uid(), name: "Bike", emoji: "🏍️", target: 80000, saved: 8000, deadline: "2027-01-10" },
  ];
}
function seedBills() {
  return [
    { id: uid(), name: "Mobile Recharge", category: "Bills", amount: 399, dueDate: "2026-08-08", recurring: "Monthly" },
    { id: uid(), name: "Internet", category: "Bills", amount: 999, dueDate: "2026-08-10", recurring: "Monthly" },
    { id: uid(), name: "Electricity", category: "Bills", amount: 1300, dueDate: "2026-08-12", recurring: "Monthly" },
    { id: uid(), name: "Credit Card", category: "Bills", amount: 6200, dueDate: "2026-08-15", recurring: "Monthly" },
    { id: uid(), name: "OTT Subscriptions", category: "Entertainment", amount: 649, dueDate: "2026-08-18", recurring: "Monthly" },
    { id: uid(), name: "Water", category: "Bills", amount: 350, dueDate: "2026-08-20", recurring: "Monthly" },
    { id: uid(), name: "Rent", category: "Rent", amount: 12000, dueDate: "2026-09-05", recurring: "Monthly" },
  ];
}
function seedBudget() {
  return { monthly: 40000, categories: { Food: 6000, Transport: 3000, Shopping: 6000, Entertainment: 2000, Healthcare: 2000, Education: 1500, Bills: 4000, Rent: 12000, Others: 1500 } };
}