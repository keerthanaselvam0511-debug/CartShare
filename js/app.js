const USERS_KEY = 'cartshare_users';
const form = document.getElementById('login-form');
const box = document.getElementById('message');

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}

function showMessage(text, type) {
  box.textContent = text;
  box.className = 'alert alert-' + type;
}

function startSession(name) {
  sessionStorage.setItem('cartshare_user', JSON.stringify({ name: name }));
  window.location.href = 'dashboard.html';
}

// Login
form.addEventListener('submit', function (event) {
  event.preventDefault();
  const name = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  const account = getUsers()[name.toLowerCase()];
  if (!account || account.password !== password) {
    showMessage('Wrong username or password. New here? Click Create Account.', 'danger');
    return;
  }
  startSession(account.name);
});

// Register
document.getElementById('register-btn').addEventListener('click', function () {
  if (!form.reportValidity()) return;

  const name = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const users = getUsers();

  if (users[name.toLowerCase()]) {
    showMessage('That username is taken. Try logging in instead.', 'warning');
    return;
  }

  users[name.toLowerCase()] = { name: name, password: password };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  startSession(name);
});