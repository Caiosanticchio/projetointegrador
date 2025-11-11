 /* ===== STATE e SELECTORS (seu script, ajustado) ===== */
  const cartOpenBtn = document.getElementById('cartOpenBtn');
  const cartSidebar = document.getElementById('cartSidebar');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsWrap = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartBadge = document.getElementById('cartBadge');

  // modal elements
  const productModal = document.getElementById('productModal');
  const modalClose = document.getElementById('modalClose');
  const modalImage = document.getElementById('modal-image');
  const modalName = document.getElementById('modal-name');
  const modalQuant = document.getElementById('modal-quant');
  const modalTotal = document.getElementById('modal-total');
  const addToCartBtn = document.getElementById('addToCartBtn');

  // payment elements
  const finalizeBtn = document.getElementById('finalizeBtn');
  const paymentOptions = document.getElementById('paymentOptions');
  const confirmPayment = document.getElementById('confirmPayment');
  const paymentMessage = document.getElementById('paymentMessage');

  // payment forms & fields
  const paymentOptionEls = document.querySelectorAll('.payment-option');
  const formPix = document.getElementById('form-pix');
  const formCartao = document.getElementById('form-cartao');
  const formBoleto = document.getElementById('form-boleto');

  // cart state (persistente)
  let cart = JSON.parse(localStorage.getItem('ch_cart_v1')) || [];

  let currentProduct = null;

  /* ===== helpers ===== */
  function saveCart() {
    localStorage.setItem('ch_cart_v1', JSON.stringify(cart));
    updateBadge();
  }

  function updateBadge() {
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    if (count > 0) {
      cartBadge.style.display = 'inline-block';
      cartBadge.textContent = count;
    } else {
      cartBadge.style.display = 'none';
    }
  }

  function updateHeaderTotal() {
    const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);
    const headerTotalSpan = document.getElementById('valorTotalCarrinho');
    if (headerTotalSpan) headerTotalSpan.textContent = `R$ ${total.toFixed(2)}`;
  }

  /* ===== render cart ===== */
  function renderCart() {
    cartItemsWrap.innerHTML = '';
    if (cart.length === 0) {
      cartItemsWrap.innerHTML = '<div class="cart-empty">Seu carrinho está vazio.</div>';
    } else {
      cart.forEach((item, idx) => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
          <img src="${item.image}" alt="${escapeHtml(item.name)}">
          <div class="info">
            <p style="font-weight:600">${escapeHtml(item.name)}</p>
            <p>R$ ${(item.price * item.quantity).toFixed(2)}</p>
            <div class="controls">
              <div class="cart-controls">
                <button class="qty-btn" data-idx="${idx}" data-delta="-1">-</button>
                <span style="margin:0 8px">${item.quantity}</span>
                <button class="qty-btn" data-idx="${idx}" data-delta="1">+</button>
              </div>
              <button class="remove-btn" data-idx="${idx}">Remover</button>
            </div>
          </div>
        `;
        cartItemsWrap.appendChild(el);
      });
    }
    updateCartTotal();
    bindCartButtons();
    saveCart();
  }

  function updateCartTotal() {
    const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);
    cartTotalEl.textContent = `Total: R$ ${total.toFixed(2)}`;
    updateHeaderTotal();
  }

  /* ===== bind buttons after render ===== */
  function bindCartButtons() {
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.onclick = (ev) => {
        const idx = Number(btn.getAttribute('data-idx'));
        const delta = Number(btn.getAttribute('data-delta'));
        if (cart[idx]) {
          cart[idx].quantity += delta;
          if (cart[idx].quantity <= 0) cart.splice(idx, 1);
          renderCart();
        }
      };
    });
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.getAttribute('data-idx'));
        if (cart[idx]) {
          cart.splice(idx, 1);
          renderCart();
        }
      };
    });
  }

  /* ===== open/close cart sidebar ===== */
  cartOpenBtn.addEventListener('click', () => {
    cartSidebar.classList.add('open');
    renderCart();
  });
  closeCartBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    paymentOptions.classList.remove('show');
    paymentOptions.setAttribute('aria-hidden','true');
    // hide active payment forms
    paymentOptionEls.forEach(o => o.classList.remove('active'));
    [formPix, formCartao, formBoleto].forEach(f => f.classList.remove('active'));
  });

  /* ===== open product modal from any precobtn in swiper ===== */
  document.querySelectorAll('.precobtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const el = e.currentTarget;
      const name = el.dataset.name || el.closest('.produto')?.querySelector('.texto_prod')?.textContent || 'Produto';
      const price = parseFloat(el.dataset.price || '0');
      const image = el.dataset.image || el.closest('.produto')?.querySelector('img')?.src || '';

      currentProduct = { name, price, image };
      modalImage.src = image;
      modalName.textContent = name;
      modalQuant.value = 1;
      modalTotal.textContent = `Total: R$ ${price.toFixed(2)}`;
      productModal.classList.add('show');
      productModal.setAttribute('aria-hidden', 'false');
    });
  });

  modalClose.addEventListener('click', () => {
    productModal.classList.remove('show');
    productModal.setAttribute('aria-hidden', 'true');
  });

  modalQuant.addEventListener('input', () => {
    let q = parseInt(modalQuant.value) || 1;
    if (q < 1) { q = 1; modalQuant.value = 1; }
    const total = (currentProduct.price * q);
    modalTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
  });

  /* ===== add to cart ===== */
  addToCartBtn.addEventListener('click', () => {
    const qty = Math.max(1, parseInt(modalQuant.value) || 1);
    const existing = cart.find(i => i.name === currentProduct.name);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ name: currentProduct.name, price: currentProduct.price, image: currentProduct.image, quantity: qty });
    }
    saveCart();
    renderCart();
    productModal.classList.remove('show');
    cartSidebar.classList.add('open');
  });

  /* ===== clear cart ===== */
  document.getElementById('clearCart').addEventListener('click', () => {
    if (!confirm('Limpar todo o carrinho?')) return;
    cart = [];
    saveCart();
    renderCart();
  });

  /* ===== finalize -> show payment options inside sidebar ===== */
  finalizeBtn.addEventListener('click', () => {
    // ensure cart open
    cartSidebar.classList.add('open');
    // toggle payment area visibility (we use a class 'show')
    if (paymentOptions.classList.contains('show')) {
      paymentOptions.classList.remove('show');
      paymentOptions.setAttribute('aria-hidden','true');
      // hide forms
      paymentOptionEls.forEach(o => o.classList.remove('active'));
      [formPix, formCartao, formBoleto].forEach(f => f.classList.remove('active'));
    } else {
      paymentOptions.classList.add('show');
      paymentOptions.setAttribute('aria-hidden','false');
      // optionally pre-select pix if present
    }
  });

  /* ===== payment option switching ===== */
  paymentOptionEls.forEach(opt => {
    opt.addEventListener('click', () => {
      paymentOptionEls.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      // hide all forms then show selected
      [formPix, formCartao, formBoleto].forEach(f => f.classList.remove('active'));
      const method = opt.dataset.method;
      if (method === 'pix') formPix.classList.add('active');
      if (method === 'cartao') formCartao.classList.add('active');
      if (method === 'boleto') formBoleto.classList.add('active');
      paymentMessage.textContent = '';
    });
  });

  /* ===== confirm payment (simulação com validação básica) ===== */
  confirmPayment.addEventListener('click', () => {
    const active = document.querySelector('.payment-option.active');
    if (!active) {
      paymentMessage.style.color = '#b13a3a';
      paymentMessage.textContent = 'Escolha uma forma de pagamento.';
      return;
    }
    const method = active.dataset.method;
    // basic field checks
    if (method === 'pix') {
      const v = document.getElementById('pixKey').value.trim();
      if (!v) { paymentMessage.style.color = '#b13a3a'; paymentMessage.textContent = 'Preencha a chave Pix.'; return; }
    } else if (method === 'cartao') {
      const num = document.getElementById('cardNumber').value.trim();
      const name = document.getElementById('cardName').value.trim();
      const exp = document.getElementById('cardExp').value.trim();
      const cvv = document.getElementById('cardCvv').value.trim();
      if (!num || !name || !exp || !cvv) { paymentMessage.style.color = '#b13a3a'; paymentMessage.textContent = 'Preencha todos os dados do cartão.'; return; }
    } else if (method === 'boleto') {
      const cpf = document.getElementById('boletoCpf').value.trim();
      const email = document.getElementById('boletoEmail').value.trim();
      if (!cpf || !email) { paymentMessage.style.color = '#b13a3a'; paymentMessage.textContent = 'Preencha CPF e e-mail para boleto.'; return; }
    }

    // simulate success
    paymentMessage.style.color = '#0a7a0a';
    paymentMessage.textContent = `Pagamento via ${method.toUpperCase()} confirmado. Obrigado!`;

    // clear cart after short delay, close payment area and cart
    setTimeout(() => {
      cart = [];
      saveCart();
      renderCart();
      paymentOptions.classList.remove('show');
      paymentOptions.setAttribute('aria-hidden','true');
      cartSidebar.classList.remove('open');
      paymentOptionEls.forEach(o => o.classList.remove('active'));
      [formPix, formCartao, formBoleto].forEach(f => f.classList.remove('active'));
      paymentMessage.textContent = '';
    }, 1400);
  });

  /* ===== initial render ===== */
  renderCart();
  updateBadge();

  /* small helper to escape html in names (just in case) */
  function escapeHtml(str) {
    return (''+str).replace(/[&<>"'`]/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[m] });
  }