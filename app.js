// ==========================================================================
// STATE MANAGEMENT & LOCALSTORAGE
// ==========================================================================

let cart = JSON.parse(localStorage.getItem("velour_cart")) || [];
let activeCategory = "all";
let searchQuery = "";
let sortBy = "default";

// DOM Elements
const productsGrid = document.getElementById("products-grid");
const resultsCount = document.getElementById("results-count");
const categoryButtons = document.querySelectorAll(".category-btn");
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

// Cart Drawer elements
const cartDrawer = document.getElementById("cart-drawer");
const cartDrawerOverlay = document.getElementById("cart-drawer-overlay");
const cartToggleBtn = document.getElementById("cart-toggle-btn");
const cartCloseBtn = document.getElementById("cart-close-btn");
const cartBadge = document.getElementById("cart-badge-count");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartContinueShopping = document.getElementById("cart-continue-shopping");
const cartDrawerFooter = document.getElementById("cart-drawer-footer");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartShipping = document.getElementById("cart-shipping");
const cartTax = document.getElementById("cart-tax");
const cartTotal = document.getElementById("cart-total");

// Modal elements
const productModal = document.getElementById("product-modal");
const productModalClose = document.getElementById("product-modal-close");
const productModalContent = document.getElementById("product-modal-content");

const checkoutModal = document.getElementById("checkout-modal");
const checkoutModalClose = document.getElementById("checkout-modal-close");
const checkoutBtnTrigger = document.getElementById("checkout-btn-trigger");
const checkoutShippingForm = document.getElementById("checkout-shipping-form");
const checkoutFormState = document.getElementById("checkout-form-state");
const checkoutSuccessState = document.getElementById("checkout-success-state");
const successCloseBtn = document.getElementById("success-close-btn");
const checkoutItemsList = document.getElementById("checkout-items-list");
const checkoutSubtotal = document.getElementById("checkout-subtotal");
const checkoutShipping = document.getElementById("checkout-shipping");
const checkoutTax = document.getElementById("checkout-tax");
const checkoutTotal = document.getElementById("checkout-total");
const successInvoiceId = document.getElementById("success-invoice-id");

// Mobile Menu elements
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileNavDrawer = document.getElementById("mobile-nav-drawer");
const mobileMenuClose = document.getElementById("mobile-menu-close");

// Theme Toggle elements
const themeToggleBtn = document.getElementById("theme-toggle");

// Toast Notification element
const toast = document.getElementById("toast-notification");
const toastText = document.getElementById("toast-message-text");

// ==========================================================================
// INITIALIZATION
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Load Theme Preference
  const savedTheme = localStorage.getItem("velour_theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  // Render Page Content
  renderProducts();
  updateCartBadge();
  renderCart();

  // Attach Event Listeners
  setupEventListeners();

  // Initialize Lucide Icons
  lucide.createIcons();
});

// ==========================================================================
// EVENT LISTENERS SETUP
// ==========================================================================

function setupEventListeners() {
  // Category Filter clicks
  categoryButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      categoryButtons.forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      activeCategory = e.currentTarget.dataset.category;
      renderProducts();
    });
  });

  // Footer Category Link clicks
  const footerCategoryLinks = document.querySelectorAll(".footer-category-link");
  footerCategoryLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = e.currentTarget.dataset.category;
      activeCategory = cat;
      
      // Update the main filter buttons state
      categoryButtons.forEach(btn => {
        if (btn.dataset.category === cat) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      renderProducts();
      document.getElementById("products-section").scrollIntoView({ behavior: "smooth" });
    });
  });

  // Sort dropdown change
  sortSelect.addEventListener("change", (e) => {
    sortBy = e.target.value;
    renderProducts();
  });

  // Search input events
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderProducts();
  });

  // Theme Toggle click
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("velour_theme", isDark ? "dark" : "light");
  });

  // Cart Drawer opening/closing
  cartToggleBtn.addEventListener("click", () => {
    cartDrawer.classList.add("active");
    cartDrawerOverlay.classList.add("active");
  });

  const closeCart = () => {
    cartDrawer.classList.remove("active");
    cartDrawerOverlay.classList.remove("active");
  };

  cartCloseBtn.addEventListener("click", closeCart);
  cartDrawerOverlay.addEventListener("click", closeCart);
  cartContinueShopping.addEventListener("click", closeCart);

  // Mobile Menu drawer opening/closing
  mobileMenuBtn.addEventListener("click", () => {
    mobileNavDrawer.classList.add("active");
  });

  const closeMobileMenu = () => {
    mobileNavDrawer.classList.remove("active");
  };

  mobileMenuClose.addEventListener("click", closeMobileMenu);
  
  // Desktop and Mobile Navigation Links active state toggle
  const desktopNavLinks = document.querySelectorAll(".nav-link");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  function setNavActive(href) {
    desktopNavLinks.forEach(link => {
      if (link.getAttribute("href") === href) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    mobileNavLinks.forEach(link => {
      if (link.getAttribute("href") === href) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  desktopNavLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = e.currentTarget.getAttribute("href");
      setNavActive(href);
    });
  });

  mobileNavLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = e.currentTarget.getAttribute("href");
      setNavActive(href);
      closeMobileMenu();
    });
  });

  // Scroll spy to highlight active section on scroll
  const spySections = [
    { id: "products-section", href: "#products-section" },
    { id: "about-section", href: "#about-section" }
  ];

  window.addEventListener("scroll", () => {
    let activeHref = "#"; // Default to Beranda

    spySections.forEach(section => {
      const el = document.getElementById(section.id);
      if (el) {
        const top = el.offsetTop - 150; // offset header height
        const height = el.offsetHeight;
        if (window.scrollY >= top && window.scrollY < top + height) {
          activeHref = section.href;
        }
      }
    });

    const currentActiveLink = document.querySelector(".nav-link.active");
    if (currentActiveLink && currentActiveLink.getAttribute("href") !== activeHref) {
      setNavActive(activeHref);
    }
  });

  // Product modal close
  productModalClose.addEventListener("click", () => {
    productModal.classList.remove("active");
  });

  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) {
      productModal.classList.remove("active");
    }
  });

  // Checkout modal close
  checkoutModalClose.addEventListener("click", () => {
    checkoutModal.classList.remove("active");
  });

  checkoutModal.addEventListener("click", (e) => {
    if (e.target === checkoutModal) {
      checkoutModal.classList.remove("active");
    }
  });

  // Open Checkout Modal
  checkoutBtnTrigger.addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Keranjang Anda kosong!");
      return;
    }
    closeCart();
    openCheckoutModal();
  });

  // Checkout shipping form submission
  checkoutShippingForm.addEventListener("submit", handleCheckoutSubmit);

  // Success checkout state close button
  successCloseBtn.addEventListener("click", () => {
    checkoutModal.classList.remove("active");
    // Reset back to form state for next checkout
    checkoutFormState.style.display = "block";
    checkoutSuccessState.style.display = "none";
    checkoutShippingForm.reset();
  });

  // Newsletter signup simulation
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = e.currentTarget.querySelector("input").value;
      showToast(`Terima kasih! Email ${email} berhasil didaftarkan.`);
      newsletterForm.reset();
    });
  }
}

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

// Format Price to IDR (Indonesian Rupiah)
function formatIDR(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(number);
}

// Render rating star icons HTML
function renderStarsHTML(rating) {
  let starsHTML = "";
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsHTML += `<i data-lucide="star" style="fill: var(--star-color);"></i>`;
    } else if (i === fullStars + 1 && hasHalfStar) {
      // Simplification for standard icons
      starsHTML += `<i data-lucide="star" style="fill: var(--star-color); opacity: 0.7;"></i>`;
    } else {
      starsHTML += `<i data-lucide="star" style="opacity: 0.3;"></i>`;
    }
  }
  return starsHTML;
}

// Show Toast message
function showToast(message) {
  toastText.textContent = message;
  toast.classList.add("active");
  
  // Clear previous timeouts if any
  if (window.toastTimeout) {
    clearTimeout(window.toastTimeout);
  }

  window.toastTimeout = setTimeout(() => {
    toast.classList.remove("active");
  }, 2500);
}

// ==========================================================================
// PRODUCTS RENDERING & CONTROLS
// ==========================================================================

function renderProducts() {
  // Filter products by category & search query
  let filtered = PRODUCTS.filter(prod => {
    const matchesCategory = activeCategory === "all" || prod.category === activeCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery) || 
                          prod.description.toLowerCase().includes(searchQuery) ||
                          prod.categoryLabel.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Sort products
  if (sortBy === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  // Update count info
  resultsCount.textContent = `Menampilkan ${filtered.length} produk`;

  // Render Grid
  productsGrid.innerHTML = "";
  
  if (filtered.length === 0) {
    productsGrid.innerHTML = `
      <div class="no-products-found" style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
        <i data-lucide="search-code" style="width: 3.5rem; height: 3.5rem; color: var(--text-secondary); opacity: 0.6; margin-bottom: 1rem;"></i>
        <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem;">Produk Tidak Ditemukan</h3>
        <p style="color: var(--text-secondary);">Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    
    // Star rating markup
    const starsHTML = renderStarsHTML(product.rating);

    card.innerHTML = `
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-badge">${product.categoryLabel}</span>
        <button class="product-quickview-btn" data-id="${product.id}">
          <i data-lucide="eye" style="width: 0.9rem; height: 0.9rem;"></i> Detail
        </button>
      </div>
      <div class="product-info">
        <span class="product-category">${product.categoryLabel}</span>
        <a href="#" class="product-title-link" data-id="${product.id}">${product.name}</a>
        <div class="product-meta">
          <div class="stars">${starsHTML}</div>
          <span class="reviews-count">(${product.reviews})</span>
        </div>
        <div class="product-footer">
          <span class="product-price">${formatIDR(product.price)}</span>
          <button class="btn-add-to-cart-quick" data-id="${product.id}" aria-label="Tambah ke keranjang">
            <i data-lucide="shopping-cart"></i>
          </button>
        </div>
      </div>
    `;

    // Quick view click
    card.querySelector(".product-quickview-btn").addEventListener("click", () => {
      openProductModal(product.id);
    });

    card.querySelector(".product-title-link").addEventListener("click", (e) => {
      e.preventDefault();
      openProductModal(product.id);
    });

    // Add to cart click
    card.querySelector(".btn-add-to-cart-quick").addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(product.id);
    });

    productsGrid.appendChild(card);
  });

  // Re-create icons since we injected dynamic HTML
  lucide.createIcons();
}

// ==========================================================================
// CART OPERATIONS
// ==========================================================================

function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);
  const product = PRODUCTS.find(p => p.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  localStorage.setItem("velour_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCart();
  
  // Animate Badge bump
  cartBadge.classList.add("bump");
  setTimeout(() => {
    cartBadge.classList.remove("bump");
  }, 300);

  showToast(`${product.name} berhasil ditambahkan ke keranjang.`);
}

function updateCartQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    localStorage.setItem("velour_cart", JSON.stringify(cart));
    updateCartBadge();
    renderCart();
  }
}

function removeFromCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem("velour_cart", JSON.stringify(cart));
  
  updateCartBadge();
  renderCart();
  showToast(`${product.name} dihapus dari keranjang.`);
}

function updateCartBadge() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalCount;
}

function renderCart() {
  const emptyCartMessage = cartItemsContainer.querySelector(".empty-cart-message");
  
  if (cart.length === 0) {
    // Show empty cart message
    if (emptyCartMessage) {
      emptyCartMessage.style.display = "flex";
    } else {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart-message">
          <i data-lucide="shopping-bag" class="empty-cart-icon"></i>
          <p>Keranjang belanja Anda masih kosong</p>
          <button class="btn btn-primary" id="cart-continue-shopping">Mulai Belanja</button>
        </div>
      `;
      document.getElementById("cart-continue-shopping").addEventListener("click", () => {
        cartDrawer.classList.remove("active");
        cartDrawerOverlay.classList.remove("active");
      });
    }
    
    // Clear list but keep empty elements
    const itemElements = cartItemsContainer.querySelectorAll(".cart-item");
    itemElements.forEach(el => el.remove());
    
    // Hide footer
    cartDrawerFooter.style.display = "none";
    lucide.createIcons();
    return;
  }

  // Hide empty state message
  if (emptyCartMessage) {
    emptyCartMessage.style.display = "none";
  }

  // Remove existing cart items
  const oldItems = cartItemsContainer.querySelectorAll(".cart-item");
  oldItems.forEach(el => el.remove());

  // Calculations
  let subtotal = 0;

  cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return;

    subtotal += product.price * item.quantity;

    const cartRow = document.createElement("div");
    cartRow.className = "cart-item";
    cartRow.innerHTML = `
      <div class="cart-item-img-wrapper">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="cart-item-info">
        <span class="cart-item-title">${product.name}</span>
        <span class="cart-item-price">${formatIDR(product.price)}</span>
        <div class="cart-item-controls">
          <div class="qty-selector">
            <button class="qty-btn btn-qty-minus" data-id="${product.id}">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn btn-qty-plus" data-id="${product.id}">+</button>
          </div>
          <button class="btn-remove-item" data-id="${product.id}" aria-label="Hapus produk">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;

    // Qty minus click
    cartRow.querySelector(".btn-qty-minus").addEventListener("click", () => {
      updateCartQuantity(product.id, -1);
    });

    // Qty plus click
    cartRow.querySelector(".btn-qty-plus").addEventListener("click", () => {
      updateCartQuantity(product.id, 1);
    });

    // Remove click
    cartRow.querySelector(".btn-remove-item").addEventListener("click", () => {
      removeFromCart(product.id);
    });

    cartItemsContainer.appendChild(cartRow);
  });

  // Calculate taxes and shipping
  // Free shipping above Rp 5.000.000, otherwise Rp 150.000 flat
  const shippingCost = subtotal > 5000000 ? 0 : 150000;
  const taxCost = Math.round(subtotal * 0.11); // 11% PPN
  const totalCost = subtotal + shippingCost + taxCost;

  // Render pricing details
  cartSubtotal.textContent = formatIDR(subtotal);
  cartShipping.textContent = shippingCost === 0 ? "Gratis" : formatIDR(shippingCost);
  cartTax.textContent = formatIDR(taxCost);
  cartTotal.textContent = formatIDR(totalCost);

  // Show footer
  cartDrawerFooter.style.display = "block";
  
  lucide.createIcons();
}

// ==========================================================================
// DETAILS LIGHTBOX MODAL
// ==========================================================================

function openProductModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const starsHTML = renderStarsHTML(product.rating);

  productModalContent.innerHTML = `
    <div class="product-modal-image-wrapper">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="product-modal-info">
      <span class="product-modal-category">${product.categoryLabel}</span>
      <h2 class="product-modal-title">${product.name}</h2>
      
      <div class="product-meta" style="margin-bottom: 1rem;">
        <div class="stars">${starsHTML}</div>
        <span class="reviews-count">(${product.reviews} review pembeli)</span>
      </div>

      <div class="product-modal-price">${formatIDR(product.price)}</div>

      <p class="product-modal-description">${product.description}</p>

      <div class="product-modal-specs">
        <div class="product-modal-specs-row">
          <strong>Material</strong>
          <span>: ${product.material}</span>
        </div>
        <div class="product-modal-specs-row" style="margin-top: 0.25rem;">
          <strong>Dimensi</strong>
          <span>: ${product.dimensions}</span>
        </div>
        <div class="product-modal-specs-row" style="margin-top: 0.25rem;">
          <strong>Status</strong>
          <span>: ${product.inStock ? '<span style="color: green; font-weight: 500;">Tersedia</span>' : '<span style="color: red; font-weight: 500;">Stok Habis</span>'}</span>
        </div>
      </div>

      <button class="btn btn-primary btn-block btn-lg" id="modal-btn-add-to-cart" data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
        <i data-lucide="shopping-cart"></i> ${product.inStock ? 'Tambah Ke Keranjang' : 'Stok Habis'}
      </button>
    </div>
  `;

  // Attach add to cart logic inside modal
  const modalAddToCartBtn = productModalContent.querySelector("#modal-btn-add-to-cart");
  modalAddToCartBtn.addEventListener("click", () => {
    addToCart(product.id);
    productModal.classList.remove("active");
  });

  // Display modal
  productModal.classList.add("active");
  lucide.createIcons();
}

// ==========================================================================
// CHECKOUT FORM & LOGIC
// ==========================================================================

function openCheckoutModal() {
  // Populate Items Summary
  checkoutItemsList.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return;

    subtotal += product.price * item.quantity;

    const summaryItem = document.createElement("div");
    summaryItem.className = "summary-item";
    summaryItem.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="summary-item-img">
      <div class="summary-item-details">
        <div class="summary-item-name">${product.name}</div>
        <div class="summary-item-qty">${item.quantity} x ${formatIDR(product.price)}</div>
      </div>
      <div class="summary-item-price">${formatIDR(product.price * item.quantity)}</div>
    `;
    checkoutItemsList.appendChild(summaryItem);
  });

  // Calculatations
  const shippingCost = subtotal > 5000000 ? 0 : 150000;
  const taxCost = Math.round(subtotal * 0.11);
  const totalCost = subtotal + shippingCost + taxCost;

  // Render prices in summary sidebar
  checkoutSubtotal.textContent = formatIDR(subtotal);
  checkoutShipping.textContent = shippingCost === 0 ? "Gratis" : formatIDR(shippingCost);
  checkoutTax.textContent = formatIDR(taxCost);
  checkoutTotal.textContent = formatIDR(totalCost);

  // Show checkout modal
  checkoutModal.classList.add("active");
}

function handleCheckoutSubmit(e) {
  e.preventDefault();

  // Create loading delay simulation
  const submitBtn = checkoutShippingForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Memproses Transaksi...";

  setTimeout(() => {
    // Generate Random invoice ID
    const randomInvoice = "VL-" + new Date().getFullYear() + 
                         String(new Date().getMonth() + 1).padStart(2, '0') + 
                         String(new Date().getDate()).padStart(2, '0') + 
                         Math.floor(1000 + Math.random() * 9000);
    
    successInvoiceId.textContent = "#" + randomInvoice;

    // Clear state
    cart = [];
    localStorage.removeItem("velour_cart");
    updateCartBadge();
    renderCart();

    // Show success view inside modal
    checkoutFormState.style.display = "none";
    checkoutSuccessState.style.display = "flex";

    // Restore button state
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    
    lucide.createIcons();
  }, 1500);
}
