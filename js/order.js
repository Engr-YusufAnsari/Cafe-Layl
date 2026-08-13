// ═══════════════════════════════════════
// CAFE LAYL — ORDERING SYSTEM (menu page only)
// ═══════════════════════════════════════
const cart = {}; // { itemKey: { name, price, qty, cat } }

// ── MENU TABS ──
document.querySelectorAll('.menu-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.menu-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── DEEP LINK: open a specific tab when arriving via #tab-xxx (e.g. from the homepage) ──
(function openTabFromHash() {
  const hash = window.location.hash.replace('#tab-', '');
  if (!hash) return;
  const targetBtn = document.querySelector('.menu-tab[data-tab="' + hash + '"]');
  if (targetBtn) targetBtn.click();
})();

// ── ESCAPE NAME FOR INLINE onclick ──
function escName(name) { return name.replace(/'/g, "\\'"); }

// ── SYNC A SINGLE DISH ROW'S CONTROL (plain + button, or − qty + stepper) ──
function syncRow(row) {
  const name = row.dataset.name;
  const item = cart[name];
  const controls = row.querySelector('.dish-controls');
  if (!controls) return;

  if (item && item.qty > 0) {
    row.classList.add('in-cart');
    controls.innerHTML = `
      <div class="dish-stepper">
        <button class="step-btn minus" onclick="changeQty('${escName(name)}', -1)">−</button>
        <span class="step-qty">${item.qty}</span>
        <button class="step-btn plus" onclick="changeQty('${escName(name)}', 1)">+</button>
      </div>`;
  } else {
    row.classList.remove('in-cart');
    controls.innerHTML = `<button class="add-btn" onclick="addItem(this)">+</button>`;
  }
}

// ── ADD ITEM TO CART (tap + on a dish row) ──
function addItem(btn) {
  const row = btn.closest('.dish-row');
  const name = row.dataset.name;
  const price = parseInt(row.dataset.price);
  const cat = row.dataset.cat;

  if (cart[name]) {
    cart[name].qty++;
  } else {
    cart[name] = { name, price, qty: 1, cat };
  }
  syncRow(row);
  updateUI();
}

// ── UPDATE QTY (from row stepper OR drawer stepper) ──
function changeQty(name, delta) {
  if (!cart[name]) return;
  cart[name].qty += delta;
  if (cart[name].qty <= 0) delete cart[name];
  document.querySelectorAll('.dish-row').forEach(row => {
    if (row.dataset.name === name) syncRow(row);
  });
  updateUI();
}

// ── CLEAR ORDER ──
function clearOrder() {
  Object.keys(cart).forEach(k => delete cart[k]);
  document.querySelectorAll('.dish-row').forEach(syncRow);
  updateUI();
  closeDrawer();
}

// ── COMPUTE TOTALS ──
function getTotal() { return Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0); }
function getCount() { return Object.values(cart).reduce((sum, item) => sum + item.qty, 0); }

// ── RENDER DRAWER ITEMS ──
function renderDrawer() {
  const listEl = document.getElementById('orderItemsList');
  const emptyEl = document.getElementById('drawerEmpty');
  const footerEl = document.getElementById('drawerFooter');
  const items = Object.values(cart);

  if (items.length === 0) {
    listEl.style.display = 'none';
    emptyEl.style.display = 'block';
    footerEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  listEl.style.display = 'flex';
  footerEl.style.display = 'block';

  listEl.innerHTML = items.map(item => `
    <div class="order-item">
      <div class="order-item-name">
        ${item.name}
        <span class="order-item-category">${item.cat}</span>
      </div>
      <div class="order-item-row">
        <div class="qty-controls">
          <button class="qty-btn minus" onclick="changeQty('${escName(item.name)}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn plus" onclick="changeQty('${escName(item.name)}', 1)">+</button>
        </div>
        <div class="order-item-price">₹${(item.price * item.qty).toLocaleString()}</div>
      </div>
    </div>
  `).join('');

  const total = getTotal();
  const count = getCount();
  document.getElementById('subtotal-display').textContent = '₹' + total.toLocaleString('en-IN');
  document.getElementById('total-display').textContent = '₹' + total.toLocaleString('en-IN');
  document.getElementById('items-count-label').textContent = `${count} item${count !== 1 ? 's' : ''}`;
  const delLabel = document.getElementById('delivery-label');
  if (total >= 300) {
    delLabel.textContent = 'FREE 🎉';
    delLabel.style.color = 'var(--whatsapp)';
  } else {
    delLabel.textContent = `₹ TBC (add ₹${300 - total} more for free delivery)`;
    delLabel.style.color = 'var(--gold-deep)';
  }
}

// ── UPDATE FLOATING BUTTON + DRAWER ──
function updateUI() {
  const count = getCount();
  const floatBtn = document.getElementById('floating-order-btn');
  const countBadge = document.getElementById('cart-count');
  countBadge.textContent = count;
  if (count > 0) floatBtn.classList.add('visible');
  else floatBtn.classList.remove('visible');
  renderDrawer();
}

// ── OPEN / CLOSE DRAWER ──
function openDrawer() {
  document.getElementById('order-drawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  document.getElementById('order-drawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── SEND TO WHATSAPP (Name + Address only) ──
function sendWhatsApp() {
  const items = Object.values(cart);
  if (items.length === 0) return;

  const nameEl   = document.getElementById('customerName');
  const addrEl   = document.getElementById('customerAddress');
  const validMsg = document.getElementById('wa-validation-msg');

  const name = nameEl.value.trim();
  const addr = addrEl.value.trim();

  nameEl.classList.remove('error');
  addrEl.classList.remove('error');
  validMsg.style.display = 'none';

  if (!name || !addr) {
    if (!name) nameEl.classList.add('error');
    if (!addr) addrEl.classList.add('error');
    validMsg.style.display = 'block';
    nameEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const total = getTotal();
  const count = getCount();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const deliveryFree = total >= 300;
  const orderId = 'CL-' + Date.now().toString().slice(-6);

  let msg = '';
  msg += `🌙 *CAFE LAYL* — New Order\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🆔 Order ID: *${orderId}*\n`;
  msg += `📅 ${dateStr} at ${timeStr}\n\n`;

  msg += `👤 *CUSTOMER DETAILS*\n`;
  msg += `Name: ${name}\n`;
  msg += `Address: ${addr}\n\n`;

  msg += `🍽️ *ORDER ITEMS*\n`;
  msg += `─────────────────────────\n`;

  const grouped = {};
  items.forEach(item => {
    if (!grouped[item.cat]) grouped[item.cat] = [];
    grouped[item.cat].push(item);
  });

  let sNo = 1;
  Object.entries(grouped).forEach(([cat, catItems]) => {
    msg += `\n*${cat.toUpperCase()}*\n`;
    catItems.forEach(item => {
      const lineTotal = item.price * item.qty;
      msg += `${sNo}. ${item.name}\n`;
      msg += `   ${item.qty} × ₹${item.price} = *₹${lineTotal.toLocaleString('en-IN')}*\n`;
      sNo++;
    });
  });

  msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🛒 *BILL SUMMARY*\n`;
  msg += `Total Items: ${count}\n`;
  msg += `Subtotal: ₹${total.toLocaleString('en-IN')}\n`;
  msg += `Delivery: ${deliveryFree ? 'FREE 🎉' : '₹ (will be confirmed)'}\n`;
  msg += `*Grand Total: ₹${total.toLocaleString('en-IN')}*\n`;
  if (!deliveryFree) msg += `_(Min. ₹300 for free delivery)_\n`;
  msg += `\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📍 *Cafe Layl*\n`;
  msg += `Shaikh Hafizuddin Marg, opp. E ward office, Byculla West, Madanpura, Mumbai – 400008\n`;
  msg += `📞 887 969 4812\n\n`;
  msg += `_Please confirm this order. Estimated prep time: ~20 min._`;

  const encoded = encodeURIComponent(msg);
  const waUrl = `https://wa.me/918879694812?text=${encoded}`;
  window.open(waUrl, '_blank');
}
