const user = JSON.parse(sessionStorage.getItem('cartshare_user'));

if (!user) {
  window.location.href = 'index.html';
}

document.getElementById('welcome').textContent = 'Welcome, ' + user.name + '!';

const myRoomsKey = 'cartshare_myrooms_' + user.name.toLowerCase();

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getMyRooms() {
  return JSON.parse(localStorage.getItem(myRoomsKey) || '[]');
}

function enterRoom(code) {
  const rooms = getMyRooms();
  if (!rooms.includes(code)) {
    rooms.unshift(code);
    localStorage.setItem(myRoomsKey, JSON.stringify(rooms));
  }
  sessionStorage.setItem('cartshare_user', JSON.stringify({ name: user.name, room: code }));
  window.location.href = 'shop.html';
}

function renderRooms() {
  const rooms = getMyRooms();
  const box = document.getElementById('my-rooms');

  if (rooms.length === 0) {
    box.innerHTML = '<p class="text-muted mb-0">You have not joined any rooms yet.</p>';
    return;
  }

  box.innerHTML = rooms.map(function (code) {
    const raw = localStorage.getItem('cartshare_room_' + code);
    const cart = raw ? JSON.parse(raw).cart : [];
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    return `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <div>
          <strong>Room ${escapeHtml(code)}</strong><br>
          <small class="text-muted">${count} items · ₹${total}</small>
        </div>
        <button class="btn btn-outline-primary btn-sm open-btn" data-code="${escapeHtml(code)}">Open</button>
      </div>`;
  }).join('');
}

document.getElementById('create-btn').addEventListener('click', function () {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  enterRoom(code);
});

document.getElementById('join-form').addEventListener('submit', function (e) {
  e.preventDefault();
  enterRoom(document.getElementById('room-code').value.trim().toUpperCase());
});

document.getElementById('my-rooms').addEventListener('click', function (e) {
  const btn = e.target.closest('.open-btn');
  if (btn) enterRoom(btn.dataset.code);
});

document.getElementById('logout-btn').addEventListener('click', function () {
  sessionStorage.removeItem('cartshare_user');
  window.location.href = 'index.html';
});

renderRooms();