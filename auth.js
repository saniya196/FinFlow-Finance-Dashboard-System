const AUTH_STORAGE_KEYS = {
  users: "ff_users",
  currentUser: "ff_current_user"
};

function getUsers() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.users) || "[]";
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_STORAGE_KEYS.users, JSON.stringify(users));
}

function setCurrentUser(email) {
  localStorage.setItem(AUTH_STORAGE_KEYS.currentUser, email);
}

function getCurrentUserEmail() {
  return localStorage.getItem(AUTH_STORAGE_KEYS.currentUser);
}

function getCurrentUser() {
  const email = getCurrentUserEmail();
  if (!email) return null;
  return getUsers().find((user) => user.email === email) || null;
}

function clearCurrentUser() {
  localStorage.removeItem(AUTH_STORAGE_KEYS.currentUser);
}

function getUserTransactionsKey(email) {
  return `ff_transactions_${String(email).toLowerCase()}`;
}

function seedDemoUser() {
  const demoEmail = "demo@finflow.com";
  const users = getUsers();
  const exists = users.some((user) => user.email === demoEmail);

  if (!exists) {
    users.push({
      id: Date.now(),
      name: "Demo User",
      email: demoEmail,
      password: "Demo@123"
    });
    saveUsers(users);
  }

  const txKey = getUserTransactionsKey(demoEmail);
  if (!localStorage.getItem(txKey)) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");

    const sampleTransactions = [
      { id: Date.now() + 1, title: "Salary", category: "Income", type: "income", amount: 60000, date: `${y}-${m}-01`, status: "Completed" },
      { id: Date.now() + 2, title: "Rent", category: "Housing", type: "expense", amount: 22000, date: `${y}-${m}-02`, status: "Completed" },
      { id: Date.now() + 3, title: "Groceries", category: "Food", type: "expense", amount: 3500, date: `${y}-${m}-04`, status: "Pending" }
    ];

    localStorage.setItem(txKey, JSON.stringify(sampleTransactions));
  }
}

function setMessage(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.className = `auth-msg ${type}`;
}

function handleLoginSubmit(event) {
  event.preventDefault();

  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const messageEl = document.getElementById("loginMessage");

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !password) {
    setMessage(messageEl, "Please enter email and password.", "error");
    return;
  }

  const user = getUsers().find((item) => item.email === email && item.password === password);

  if (!user) {
    setMessage(messageEl, "Invalid email or password.", "error");
    return;
  }

  setCurrentUser(user.email);
  setMessage(messageEl, "Login successful. Redirecting...", "success");
  window.location.href = "index.html";
}

function handleSignupSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById("signupName");
  const emailInput = document.getElementById("signupEmail");
  const passwordInput = document.getElementById("signupPassword");
  const messageEl = document.getElementById("signupMessage");

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!name || !email || password.length < 6) {
    setMessage(messageEl, "Enter valid name, email, and password (min 6 chars).", "error");
    return;
  }

  const users = getUsers();
  const duplicate = users.some((user) => user.email === email);

  if (duplicate) {
    setMessage(messageEl, "This email is already registered.", "error");
    return;
  }

  users.push({
    id: Date.now(),
    name,
    email,
    password
  });

  saveUsers(users);
  localStorage.setItem(getUserTransactionsKey(email), JSON.stringify([]));
  setCurrentUser(email);

  setMessage(messageEl, "Account created. Redirecting...", "success");
  window.location.href = "index.html";
}

function initAuthPage() {
  seedDemoUser();

  const page = document.body.dataset.page;
  const currentUser = getCurrentUser();

  if ((page === "login" || page === "signup") && currentUser) {
    window.location.href = "index.html";
    return;
  }

  if (page === "login") {
    const form = document.getElementById("loginForm");
    if (form) form.addEventListener("submit", handleLoginSubmit);
  }

  if (page === "signup") {
    const form = document.getElementById("signupForm");
    if (form) form.addEventListener("submit", handleSignupSubmit);
  }
}

window.AppAuth = {
  getUsers,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  getUserTransactionsKey,
  seedDemoUser
};

document.addEventListener("DOMContentLoaded", initAuthPage);
