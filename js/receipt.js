const user = JSON.parse(sessionStorage.getItem('cartshare_user') || 'null');

if (!user || !user.room) {
  window.location.replace(user ? 'dashboard.html' : 'index.html');
}

// Keep this the same as FREE_DELIVERY_AT in shop.js
const FREE_DELIVERY_AT = 500;

const raw = user ? localStorage.getItem('cartshare_room_' + user.room) : null;
const data = raw ? JSON.parse(raw) : { cart: [] };

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.getElementById('receipt-room').textContent =
  user ? 'Room ' + user.room : '';
document.getElementById('receipt-date').textContent = new Date().toLocaleString();

const total = data.cart.reduce((sum, i) => sum + i.price * i.qty, 0);

// Delivery status
document.getElementById('delivery-status').textContent =
  total >= FREE_DELIVERY_AT
    ? 'Free delivery unlocked 🎉'
    : '₹' + (FREE_DELIVERY_AT - total) + ' short of free delivery';

// Item rows (or a friendly empty message)
const rows = document.getElementById('receipt-rows');

if (data.cart.length === 0) {
  rows.innerHTML =
    '<tr><td colspan="4" class="text-center text-muted py-4">' +
    'The cart is empty. <a href="shop.html">Go back to the shop</a> and add some items.' +
    '</td></tr>';
  document.getElementById('print-btn').disabled = true;
  document.getElementById('copy-btn').disabled = true;
} else {
  rows.innerHTML = data.cart.map(function (item) {
    return `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.addedBy)}</td>
        <td class="text-end">${item.qty}</td>
        <td class="text-end">₹${item.price * item.qty}</td>
      </tr>`;
  }).join('');
}

document.getElementById('receipt-total').textContent = '₹' + total;

// Per-person totals
const perPerson = {};
data.cart.forEach(function (item) {
  perPerson[item.addedBy] = (perPerson[item.addedBy] || 0) + item.price * item.qty;
});

document.getElementById('split-list').innerHTML =
  Object.keys(perPerson).map(function (name) {
    return `<li class="d-flex justify-content-between py-1">
              <span>${escapeHtml(name)}</span><span>₹${perPerson[name]}</span>
            </li>`;
  }).join('');

// Print
document.getElementById('print-btn').addEventListener('click', function () {
  window.print();
});

// Copy summary (for WhatsApp, etc.)
document.getElementById('copy-btn').addEventListener('click', function () {
  let text = 'CartShare - Room ' + user.room + '\n\n';
  data.cart.forEach(function (i) {
    text += i.name + ' x' + i.qty + ' - Rs.' + (i.price * i.qty) + ' (' + i.addedBy + ')\n';
  });
  text += '\nTotal: Rs.' + total + '\n\nSplit:\n';
  Object.keys(perPerson).forEach(function (n) {
    text += n + ': Rs.' + perPerson[n] + '\n';
  });

  navigator.clipboard.writeText(text).then(function () {
    alert('Summary copied!');
  });
});