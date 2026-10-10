const user = JSON.parse(sessionStorage.getItem('cartshare_user') || 'null');

if (!user || !user.room) {
  window.location.replace(user ? 'dashboard.html' : 'index.html');
}

document.getElementById('user-info').textContent =
  user ? user.name + ' · Room ' + user.room : '';

// Change this to the delivery minimum given in your course
const FREE_DELIVERY_AT = 500;

const roomKey = 'cartshare_room_' + (user ? user.room : '');

const products =[
  { id: 1,  name: 'Milk (1L)',    price: 48,  category: 'Dairy',     image: 'assets/milk.jpg'},
  { id: 2,  name: 'Cheese',       price: 75,  category: 'Dairy',     image: 'assets/cheese.jpg'},
  { id: 3,  name: 'Broom',        price: 90,  category: 'Household', image: 'assets/Brooms.jpg'},
  { id: 4,  name: 'Chips',        price: 30,  category: 'Snacks',    image: 'assets/chips.jpg'},
  { id: 5,  name: 'Cookies',      price: 40,  category: 'Snacks',    image: 'assets/cookies.jpg'},
  { id: 6,  name: 'Orange',       price: 65,  category: 'Drinks',    image: 'assets/apple.jpg'},
  { id: 7,  name: 'Fresh juice',   price: 50,  category: 'Drinks',    image: 'assets/fresh-juice.jpg'},
  { id: 8,  name: 'Icecream',     price: 95,  category: 'Dessert',   image: 'assets/ice-cream.jpg'},
  { id: 9,  name: 'Cupcake',      price: 70, category: 'Dessert',    image: 'assets/cupcakes.jpg'},
  { id: 10, name: 'Cleaning products', price: 85,  category: 'Household', image:'assets/liquids.jpg '},
  { id: 11, name: 'Tissue Pack',  price: 55,  category: 'Household', image: 'assets/tissues.jpg'},
  { id: 12, name: 'Trash Bin',    price: 70,  category: 'Household', image: 'assets/thrashbin.jpg'},
  { id: 13, name: 'Yogurt bowl',  price: 100,  category: 'Dairy',     image: 'assets/yogurt-bowl.jpg'}
  ];

let activeCategory = 'All';
let searchText = '';

/* ---------- Room data (shared through localStorage) ---------- */

function getRoom() {
  const raw = localStorage.getItem(roomKey);
  return raw ? JSON.parse(raw) : { cart: [], log: [] };
}

function saveRoom(data) {
  localStorage.setItem(roomKey, JSON.stringify(data));
}

function addLog(data, text) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  data.log.unshift({ time: time, text: text });
  data.log = data.log.slice(0, 30);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 1800);
}

/* ---------- Actions ---------- */

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const data = getRoom();

  const mine = data.cart.find(
    i => i.productId === productId && i.addedBy === user.name
  );
  const others = data.cart.filter(
    i => i.productId === productId && i.addedBy !== user.name
  );

  if (mine) {
    mine.qty += 1;
  } else {
    // Duplicate warning: someone else already added this product
    if (others.length > 0) {
      const names = others.map(i => i.addedBy).join(', ');
      const ok = confirm(
        product.name + ' is already in the cart (added by ' + names + ').\nAdd it again?'
      );
      if (!ok) return;
    }
    data.cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      addedBy: user.name
    });
  }

  addLog(data, user.name + ' added ' + product.name);
  saveRoom(data);
  renderCart();
  showToast(product.name + ' added to cart');
}

function changeQty(index, delta) {
  const data = getRoom();
  const item = data.cart[index];
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    data.cart.splice(index, 1);
    addLog(data, user.name + ' removed ' + item.name + ' (added by ' + item.addedBy + ')');
  } else {
    addLog(data, user.name + ' changed ' + item.name + ' to ×' + item.qty);
  }

  saveRoom(data);
  renderCart();
}

function removeFromCart(index) {
  const data = getRoom();
  const item = data.cart[index];
  if (!item) return;

  data.cart.splice(index, 1);
  addLog(data, user.name + ' removed ' + item.name + ' (added by ' + item.addedBy + ')');
  saveRoom(data);
  renderCart();
  showToast(item.name + ' removed');
}

/* ---------- Rendering ---------- */

function renderFilters() {
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const box = document.getElementById('filters');
  box.innerHTML = '';

  categories.forEach(function (cat) {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = 'btn btn-sm ' +
      (cat === activeCategory ? 'btn-primary' : 'btn-outline-primary');
    btn.addEventListener('click', function () {
      activeCategory = cat;
      renderFilters();
      renderProducts();
    });
    box.appendChild(btn);
  });
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  const term = searchText.trim().toLowerCase();

  const list = products.filter(function (p) {
   const matchCategory = term !== '' || activeCategory === 'All' || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term);
    return matchCategory && matchSearch;
  });

  if (list.length === 0) {
    grid.innerHTML = '<div class="col-12"><p class="text-muted">No products found.</p></div>';
    return;
  }

  grid.innerHTML = list.map(function (p) {
    return `
      <div class="col-6 col-md-4">
        <div class="card product-card h-100 text-center shadow-sm">
          <div class="card-body">
            <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
            <h3 class="h6 mt-2">${p.name}</h3>
            <p class="text-muted mb-2">₹${p.price}</p>
            <button class="btn btn-success btn-sm add-btn" data-id="${p.id}">Add to Cart</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function renderCart() {
  const data = getRoom();
  const itemsBox = document.getElementById('cart-items');

  if (data.cart.length === 0) {
    itemsBox.innerHTML = '<p class="text-muted mb-0">The cart is empty.</p>';
  } else {
    itemsBox.innerHTML = data.cart.map(function (item, index) {
      return `
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <div>
            <div>${escapeHtml(item.name)}</div>
            <small class="text-muted">added by ${escapeHtml(item.addedBy)}</small>
            <div class="btn-group btn-group-sm mt-1" role="group" aria-label="Quantity">
              <button class="btn btn-outline-secondary qty-btn" data-index="${index}" data-delta="-1" aria-label="Decrease quantity">−</button>
              <span class="btn btn-light disabled">${item.qty}</span>
              <button class="btn btn-outline-secondary qty-btn" data-index="${index}" data-delta="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="text-end">
            <div>₹${item.price * item.qty}</div>
            <button class="btn btn-outline-danger btn-sm remove-btn mt-1" data-index="${index}">Remove</button>
          </div>
        </div>`;
    }).join('');
  }

  const total = data.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.getElementById('cart-total').textContent = '₹' + total;

  const percent = Math.min(100, Math.round((total / FREE_DELIVERY_AT) * 100));
  document.getElementById('progress-bar').style.width = percent + '%';
  document.getElementById('progress-text').textContent =
    total >= FREE_DELIVERY_AT
      ? 'Free delivery unlocked! 🎉'
      : '₹' + (FREE_DELIVERY_AT - total) + ' more for free delivery';

  const logBox = document.getElementById('activity-log');
  logBox.innerHTML = data.log.length === 0
    ? '<li class="text-muted">No activity yet.</li>'
    : data.log.map(l =>
        `<li class="mb-1"><span class="text-muted">${l.time}</span> ${escapeHtml(l.text)}</li>`
      ).join('');
}

/* ---------- Events ---------- */

document.getElementById('product-grid').addEventListener('click', function (e) {
  const btn = e.target.closest('.add-btn');
  if (btn) addToCart(Number(btn.dataset.id));
});

document.getElementById('cart-items').addEventListener('click', function (e) {
  const qtyBtn = e.target.closest('.qty-btn');
  if (qtyBtn) {
    changeQty(Number(qtyBtn.dataset.index), Number(qtyBtn.dataset.delta));
    return;
  }
  const removeBtn = e.target.closest('.remove-btn');
  if (removeBtn) removeFromCart(Number(removeBtn.dataset.index));
});

document.getElementById('search').addEventListener('input', function (e) {
  searchText = e.target.value;
  if (searchText.trim() !== '') {
    activeCategory = 'All';
    renderFilters();
  }
  renderProducts();
});

// Sync: when another tab changes this room's data, re-draw the cart
window.addEventListener('storage', function (e) {
  if (e.key === roomKey) renderCart();
});

document.getElementById('logout-btn').addEventListener('click', function () {
  sessionStorage.removeItem('cartshare_user');
  window.location.href = 'index.html';
});

renderFilters();
renderProducts();
renderCart();