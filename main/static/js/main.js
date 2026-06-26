/**
 * ThreadTales — BUY NOW → API → WhatsApp
 * Logs order to database, then opens WhatsApp.
 */

// ======================== CONFIG ========================
const WHATSAPP_NUMBER = '97798223858988';   // ⬅️ CHANGE TO YOUR WHATSAPP NUMBER
const SHOP_NAME = 'ThreadTales';

// ======================== DOM READY ========================
document.addEventListener('DOMContentLoaded', () => {
  initBuyNowButtons();
  initContactForm();
  initScrollControls();
});

// ======================== BIG BOTTOM SCROLL CONTROLS ========================
function initScrollControls() {
  const container = document.getElementById('productsScroll');
  const thumb = document.getElementById('scrollThumb');
  const btnLeft = document.getElementById('scrollLeft');
  const btnRight = document.getElementById('scrollRight');
  if (!container || !thumb) return;

  // --- Update thumb position & width ---
  function updateThumb() {
    const scrollWidth = container.scrollWidth - container.clientWidth;
    if (scrollWidth <= 0) {
      thumb.style.width = '100%';
      thumb.style.left = '0';
      return;
    }
    const pct = (container.scrollLeft / scrollWidth) * 100;
    const thumbWidth = Math.max(15, (container.clientWidth / container.scrollWidth) * 100);
    const maxLeft = 100 - thumbWidth;
    thumb.style.width = thumbWidth + '%';
    thumb.style.left = Math.min(pct, maxLeft) + '%';
  }

  container.addEventListener('scroll', updateThumb, { passive: true });
  window.addEventListener('resize', updateThumb);

  // --- Scroll amount = one card width ---
  function getScrollAmount() {
    const card = container.querySelector('.product-card-wrapper');
    return card ? card.offsetWidth + 24 : 340; // 24 = gap
  }

  // --- Left button ---
  if (btnLeft) {
    btnLeft.addEventListener('click', () => {
      container.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });
  }

  // --- Right button ---
  if (btnRight) {
    btnRight.addEventListener('click', () => {
      container.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });
  }

  // --- Keyboard arrow support ---
  document.addEventListener('keydown', (e) => {
    const section = document.getElementById('collection');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    // Only when collection section is visible
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowLeft')  container.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
      if (e.key === 'ArrowRight') container.scrollBy({ left:  getScrollAmount(), behavior: 'smooth' });
    }
  });

  // Initial thumb
  updateThumb();
}

// ======================== LIGHTBOX ========================
function openLightboxFromCarousel(event, carouselId) {
  if (event.target.closest('.carousel-control-prev') || event.target.closest('.carousel-control-next')) return;
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  const activeImg = carousel.querySelector('.carousel-item.active img');
  if (!activeImg) return;
  document.getElementById('lightboxImage').src = activeImg.getAttribute('src');
  new bootstrap.Modal(document.getElementById('lightboxModal')).show();
}

document.getElementById('lightboxModal')?.addEventListener('hidden.bs.modal', () => {
  document.getElementById('lightboxImage').src = '';
});

// ======================== CSRF HELPER ========================
function getCSRFToken() {
  const el = document.querySelector('[name=csrfmiddlewaretoken]');
  return el ? el.value : '';
}

// ======================== BUY NOW ========================
function initBuyNowButtons() {
  document.querySelectorAll('.buy-now-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const name = this.getAttribute('data-name');
      const price = this.getAttribute('data-price');
      const productId = this.getAttribute('data-id');

      // Feed back
      this.textContent = 'OPENING WHATSAPP...';
      this.disabled = true;

      // Build WhatsApp message
      const message = [
        `*${SHOP_NAME} — New Order*`,
        ``,
        `*Product:* ${name}`,
        `*Price:* Rs. ${price}`,
        ``,
        `I'd like to place an order. Please share payment & delivery details.`,
      ].join('%0A');

      const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

      // Log order to database (fire-and-forget)
      fetch('/api/order/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({ product_id: parseInt(productId) }),
      }).then(res => res.json()).then(data => {
        if (data.success) {
          console.log(`Order #${data.order_id} logged`);
        }
      }).catch(err => {
        console.warn('Order logging failed (non-blocking):', err);
      });

      // Open WhatsApp immediately — don't wait for API
      window.open(waURL, '_blank');

      setTimeout(() => {
        this.textContent = 'BUY NOW';
        this.disabled = false;
      }, 2000);
    });
  });
}

// ======================== CONTACT / NEWSLETTER ========================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const nameInp = form.querySelector('input[name="name"]');
    const emailInp = form.querySelector('input[name="email"]');
    const btn = form.querySelector('button[type="submit"]');
    const name = nameInp?.value.trim();
    const email = emailInp?.value.trim();

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      [nameInp, emailInp].forEach(inp => {
        if (inp && !inp.value.trim()) { inp.style.borderColor = '#dc3545'; shake(inp); }
      });
      return;
    }

    // Reset border
    [nameInp, emailInp].forEach(inp => { if (inp) inp.style.borderColor = ''; });

    const orig = btn.textContent;
    btn.textContent = 'SUBSCRIBING...';
    btn.disabled = true;

    fetch('/api/subscribe/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      body: JSON.stringify({ name: name, email: email }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        btn.textContent = '✓ SUBSCRIBED';
        btn.style.background = '#5c3d2e';
        nameInp.value = '';
        emailInp.value = '';
      } else {
        btn.textContent = data.message || 'ERROR';
        btn.style.background = '#dc3545';
      }
    })
    .catch(() => {
      btn.textContent = 'ERROR — TRY AGAIN';
      btn.style.background = '#dc3545';
    })
    .finally(() => {
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
      }, 3000);
    });
  });
}

function shake(el) {
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'shake 0.5s ease';
  setTimeout(() => { el.style.animation = ''; }, 500);
}
