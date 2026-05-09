/* ==============================================================
   IBÉRICOS MACARENA · script.js
   - Productos:  GET /api/products (fallback estático)
   - Reseñas:    GET /api/reviews   (fallback estático)
   - Auth:       POST /api/auth/login | /api/auth/register
   - Cookies:    banner + modal + localStorage
   - Animaciones: scroll reveal, contadores, parallax sutil,
                  magnetic hover, productos en stagger
   ============================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     Configuración base
  ------------------------------------------------------------ */
  // Mismo origen → rutas relativas. En desarrollo apunta al backend.
  const API_BASE = "";
  const ENDPOINTS = {
    products: API_BASE + "/api/products",
    reviews: API_BASE + "/api/reviews",
    login: API_BASE + "/api/auth/login",
    register: API_BASE + "/api/auth/register",
    me: API_BASE + "/api/auth/me",
    logout: API_BASE + "/api/auth/logout",
    business: API_BASE + "/api/business/status",
  };

  const COOKIE_KEY = "im_cookie_consent_v1";

  /* ------------------------------------------------------------
     Helpers
  ------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function toast(msg, ms = 2600) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove("is-visible"), ms);
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  const escapeAttr = escapeHtml;

  function formatRelativeDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];
    return `${months[d.getMonth()]} de ${d.getFullYear()}`;
  }

  /* ------------------------------------------------------------
     Año en el footer
  ------------------------------------------------------------ */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------
     Header sticky con clase al hacer scroll
  ------------------------------------------------------------ */
  const header = $("#siteHeader");
  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------
     Drawer lateral (menú hamburguesa siempre visible)
  ------------------------------------------------------------ */
  const navToggle = $("#navToggle");
  const navDrawer = $("#navDrawer");
  const navOverlay = $("#navOverlay");
  const navClose = $("#navClose");

  function openDrawer() {
    if (!navDrawer) return;
    navDrawer.classList.add("is-open");
    navOverlay.hidden = false;
    requestAnimationFrame(() => navOverlay.classList.add("is-open"));
    navToggle?.setAttribute("aria-expanded", "true");
    navDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    if (!navDrawer) return;
    navDrawer.classList.remove("is-open");
    navOverlay.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    // Esperar a la transición antes de hidden=true (para a11y)
    setTimeout(() => { if (navOverlay) navOverlay.hidden = true; }, 400);
  }

  navToggle?.addEventListener("click", () => {
    const isOpen = navDrawer?.classList.contains("is-open");
    if (isOpen) closeDrawer(); else openDrawer();
  });
  navClose?.addEventListener("click", closeDrawer);
  navOverlay?.addEventListener("click", closeDrawer);

  // Cerrar al hacer clic en cualquier enlace del drawer
  $$(".nav-drawer .nav a").forEach((a) =>
    a.addEventListener("click", () => closeDrawer())
  );

  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navDrawer?.classList.contains("is-open")) {
      closeDrawer();
    }
  });

  /* ------------------------------------------------------------
     Scroll reveal genérico
  ------------------------------------------------------------ */
  function observeReveals(els) {
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay || "0", 10);
            setTimeout(() => entry.target.classList.add("is-visible"), delay);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    els.forEach((el) => io.observe(el));
  }
  observeReveals($$(".reveal"));

  /* ------------------------------------------------------------
     Contadores animados (about-points)
  ------------------------------------------------------------ */
  function animateCounter(el, target, duration = 1400) {
    const isInt = Number.isInteger(target);
    const t0 = performance.now();
    const start = 0;
    function tick(t) {
      const p = Math.min(1, (t - t0) / duration);
      // easing easeOutQuart
      const e = 1 - Math.pow(1 - p, 4);
      const v = start + (target - start) * e;
      el.textContent = isInt ? Math.round(v) : v.toFixed(1);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = isInt ? String(target) : target.toFixed(1);
    }
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const raw = el.dataset.count;
          const num = parseFloat(raw);
          if (!isNaN(num)) animateCounter(el, num);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    $$("[data-count]").forEach((el) => counterObserver.observe(el));
  }

  /* ------------------------------------------------------------
     Parallax sutil en el hero (decoraciones SVG)
  ------------------------------------------------------------ */
  const heroDecos = $$(".hero-deco");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (heroDecos.length && !reduceMotion) {
    let raf = null;
    const onParallax = () => {
      const y = window.scrollY;
      heroDecos.forEach((d, i) => {
        const speed = i % 2 === 0 ? 0.12 : 0.18;
        d.style.transform = `translate3d(0, ${y * speed}px, 0) ${
          d.classList.contains("hero-deco--right") ? "scaleX(-1)" : ""
        }`;
      });
      raf = null;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (raf == null) raf = requestAnimationFrame(onParallax);
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------
     Magnetic hover sobre los CTA principales del hero
  ------------------------------------------------------------ */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    $$(".hero-cta .btn").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ============================================================
     PRODUCTOS · /api/products + fallback estático
  ============================================================ */
  const FALLBACK_PRODUCTS = [
    { id: "jamon-bellota", slug: "jamon-iberico-bellota",
      name: "Jamón Ibérico de Bellota",
      description: "Pieza entera curada en secadero, con paseo, dulzor y vetas de grasa infiltrada.",
      price: 34, priceUnit: "kg", tag: "Estrella", category: "jamon" },
    { id: "paleta-bellota", slug: "paleta-iberica-bellota",
      name: "Paleta Ibérica de Bellota",
      description: "Sabor intenso y formato manejable. Ideal para casa o como regalo.",
      price: 28, priceUnit: "kg", tag: "Bellota", category: "paleta" },
    { id: "cana-lomo", slug: "cana-de-lomo-iberico",
      name: "Caña de Lomo Ibérico",
      description: "Adobo tradicional, curado en pieza. Aromático, fino y elegante al corte.",
      price: 26, priceUnit: "pieza", tag: "Artesanal", category: "embutido" },
    { id: "chorizo-iberico", slug: "chorizo-iberico",
      name: "Chorizo Ibérico",
      description: "Pimentón de la Vera, ajo y carne ibérica. Curado lento, bocado redondo.",
      price: 12, priceUnit: "pieza", tag: "Pimentón", category: "embutido" },
    { id: "salchichon-iberico", slug: "salchichon-iberico",
      name: "Salchichón Ibérico",
      description: "Mezcla de pimienta y especias en su justa medida. Textura suave y aromática.",
      price: 12, priceUnit: "pieza", tag: "Tradición", category: "embutido" },
    { id: "loncheado-jamon", slug: "sobre-jamon-loncheado",
      name: "Sobre de Jamón Loncheado",
      description: "Cortado a cuchillo y envasado al vacío. Listo para tabla o bocadillo.",
      price: 6.5, priceUnit: "100g", tag: "Listo", category: "loncheado" },
    { id: "loncheado-mixto", slug: "tabla-iberica-loncheada",
      name: "Tabla Ibérica Loncheada",
      description: "Selección de jamón, lomo, chorizo y salchichón. Para compartir sin esfuerzo.",
      price: 12, priceUnit: "pack", tag: "Para compartir", category: "loncheado" },
    { id: "jamon-cebo", slug: "jamon-iberico-cebo",
      name: "Jamón Ibérico de Cebo",
      description: "Curado más corto, sabor accesible y aroma característico del ibérico.",
      price: 22, priceUnit: "kg", tag: "Cebo", category: "jamon" },
  ];

  let allProducts = [];
  let currentFilter = "all";
  const grid = $("#productGrid");

  function priceLabel(p) {
    if (typeof p.price === "number") {
      return `${p.price.toFixed(2).replace(/\.00$/, "")} €/${p.priceUnit || "kg"}`;
    }
    return p.price || "";
  }

  async function loadProducts() {
    try {
      const res = await fetch(ENDPOINTS.products, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("API not ready");
      const data = await res.json();
      const list = Array.isArray(data) ? data
                 : Array.isArray(data?.products) ? data.products
                 : null;
      if (list && list.length) {
        allProducts = list;
      } else {
        throw new Error("Empty");
      }
    } catch {
      allProducts = FALLBACK_PRODUCTS;
    }
    renderProducts();
  }

  function renderProducts() {
    if (!grid) return;
    const list =
      currentFilter === "all"
        ? allProducts
        : allProducts.filter((p) => p.category === currentFilter);

    if (!list.length) {
      grid.innerHTML =
        '<p class="products-empty" style="grid-column:1/-1;text-align:center;color:var(--ink-soft);">No hay productos en esta categoría todavía.</p>';
      return;
    }

    grid.innerHTML = list
      .map(
        (p, i) => `
      <article class="product-card" data-id="${escapeAttr(p.id || p.slug || "")}" style="animation-delay:${i * 70}ms">
        <div class="product-media">
          ${
            p.image
              ? `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy" />`
              : `<span class="product-mark" aria-hidden="true">M</span>`
          }
          ${p.tag ? `<span class="product-tag">${escapeHtml(p.tag)}</span>` : ""}
        </div>
        <div class="product-body">
          <h3 class="product-name">${escapeHtml(p.name)}</h3>
          <p class="product-desc">${escapeHtml(p.description || "")}</p>
          <div class="product-foot">
            <span class="product-price">${escapeHtml(priceLabel(p))}</span>
            <span class="product-cta">
              Consultar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </div>
        </div>
      </article>`
      )
      .join("");

    // Click → ir a contacto y mostrar producto en toast
    $$(".product-card", grid).forEach((card) =>
      card.addEventListener("click", () => {
        const name = card.querySelector(".product-name")?.textContent || "";
        document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
        toast(`Pregúntanos por: ${name}`);
      })
    );
  }

  // Filtros
  $$(".chip[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".chip").forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      currentFilter = btn.dataset.filter;
      renderProducts();
    });
  });

  loadProducts();

  /* ============================================================
     RESEÑAS · GET /api/reviews + POST /api/reviews
     Carga inicial + formulario que publica directo en la página
  ============================================================ */
  const reviewsGrid = $("#reviewsGrid");

  function reviewCardHTML(r, opts = {}) {
    const extraClass = opts.isNew ? " is-new" : " reveal";
    const dateLabel = opts.isNew
      ? "Hace un momento"
      : formatRelativeDate(r.createdAt);
    const delay = opts.isNew ? 0 : (opts.index || 0) * 70;
    return `
      <article class="review-card${extraClass}" data-delay="${delay}">
        <div class="review-stars" aria-label="${r.rating} de 5 estrellas">
          ${'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'.repeat(r.rating)}
        </div>
        <p class="review-text">"${escapeHtml(r.comment)}"</p>
        <div class="review-author">
          <span class="review-avatar" aria-hidden="true">${escapeHtml((r.name || "?").charAt(0))}</span>
          <div>
            <div class="review-name">${escapeHtml(r.name)}</div>
            <div class="review-date">${escapeHtml(dateLabel)}</div>
          </div>
        </div>
      </article>`;
  }

  function reviewsEmptyHTML() {
    return `
      <div class="reviews-empty">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <h3>Sé la primera persona en opinar</h3>
        <p>Aún no hay reseñas publicadas. Si ya nos has visitado, nos encantaría leerte.</p>
      </div>`;
  }

  async function loadReviews() {
    if (!reviewsGrid) return;
    let reviews = [];
    try {
      const res = await fetch(ENDPOINTS.reviews, { headers: { Accept: "application/json" } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.reviews)) reviews = data.reviews;
      }
    } catch { /* sin conexión: lista vacía */ }

    if (reviews.length === 0) {
      reviewsGrid.innerHTML = reviewsEmptyHTML();
      return;
    }

    reviewsGrid.innerHTML = reviews
      .map((r, i) => reviewCardHTML(r, { index: i }))
      .join("");

    observeReveals($$(".review-card.reveal", reviewsGrid));
  }

  loadReviews();

  // -------------------------------------------------------------
  // FORMULARIO DE RESEÑAS
  // -------------------------------------------------------------
  const reviewForm = $("#reviewForm");
  const reviewCounter = $("#reviewCounter");

  // Contador de caracteres en vivo
  if (reviewForm && reviewCounter) {
    const ta = reviewForm.querySelector('textarea[name="comment"]');
    ta?.addEventListener("input", () => {
      reviewCounter.textContent = ta.value.length;
    });
  }

  reviewForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fb = reviewForm.querySelector("[data-feedback]");
    const submitBtn = reviewForm.querySelector('button[type="submit"]');
    fb.className = "review-form-feedback is-loading";
    fb.textContent = "Publicando…";
    submitBtn.disabled = true;

    const data = Object.fromEntries(new FormData(reviewForm).entries());
    // El rating es radio → string. El backend acepta string y lo coerce, pero
    // por claridad lo enviamos como número.
    if (data.rating) data.rating = Number(data.rating);

    try {
      const res = await fetch(ENDPOINTS.reviews, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => ({}));

      if (res.status === 401) {
        // No hay sesión: pedir login
        fb.className = "review-form-feedback is-error";
        fb.textContent = "Inicia sesión para publicar tu reseña.";
        openAuth("login");
        return;
      }

      if (!res.ok) {
        const msg =
          payload?.error?.details?.[0]?.message ||
          payload?.error?.message ||
          "No hemos podido publicar tu reseña.";
        throw new Error(msg);
      }

      // Inserta la reseña al principio de la cuadrícula con animación.
      if (payload?.review && reviewsGrid) {
        reviewsGrid.insertAdjacentHTML(
          "afterbegin",
          reviewCardHTML(payload.review, { isNew: true })
        );
      }

      fb.className = "review-form-feedback is-success";
      fb.textContent = "¡Reseña publicada! Muchas gracias 🐷";
      reviewForm.reset();
      if (reviewCounter) reviewCounter.textContent = "0";
      toast("Gracias por tu reseña");

      // Tras 4 s recargamos del servidor para asegurar consistencia
      setTimeout(() => {
        loadReviews();
        fb.className = "review-form-feedback";
        fb.textContent = "";
      }, 4000);
    } catch (err) {
      fb.className = "review-form-feedback is-error";
      fb.textContent = err.message || "Error al publicar la reseña.";
    } finally {
      submitBtn.disabled = false;
    }
  });



  /* ============================================================
     AUTH · Modal Login / Registro
  ============================================================ */
  const authOverlay = $("#authOverlay");
  const authClose = $("#authClose");

  function openAuth(tab = "login") {
    if (!authOverlay) return;
    switchAuthTab(tab);
    authOverlay.classList.add("is-open");
    authOverlay.setAttribute("aria-hidden", "false");
    setTimeout(() => {
      $(`.auth-form[data-panel="${tab}"]`)?.querySelector("input")?.focus();
    }, 200);
  }
  function closeAuth() {
    authOverlay?.classList.remove("is-open");
    authOverlay?.setAttribute("aria-hidden", "true");
  }
  function switchAuthTab(tab) {
    $$(".auth-tab").forEach((t) => {
      const active = t.dataset.tab === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    $$(".auth-form").forEach((f) => {
      f.classList.toggle("is-active", f.dataset.panel === tab);
    });
  }

  $$("[data-open-auth]").forEach((b) =>
    b.addEventListener("click", () => openAuth(b.dataset.openAuth))
  );
  authClose?.addEventListener("click", closeAuth);
  authOverlay?.addEventListener("click", (e) => {
    if (e.target === authOverlay) closeAuth();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAuth();
      closeCookieConfig();
    }
  });
  $$(".auth-tab").forEach((t) =>
    t.addEventListener("click", () => switchAuthTab(t.dataset.tab))
  );
  $$("[data-switch]").forEach((b) =>
    b.addEventListener("click", () => switchAuthTab(b.dataset.switch))
  );

  // Submit: LOGIN
  const loginForm = $("#loginForm");
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fb = loginForm.querySelector("[data-feedback]");
    fb.className = "auth-feedback";
    fb.textContent = "Conectando…";

    const data = Object.fromEntries(new FormData(loginForm).entries());

    try {
      const res = await fetch(ENDPOINTS.login, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = payload?.error?.message || "No se pudo iniciar sesión.";
        throw new Error(msg);
      }
      fb.className = "auth-feedback is-success";
      fb.textContent = "¡Bienvenida! Redirigiendo…";
      // Refrescar UI: menú de usuario + gate de reseñas
      await refreshAuthState();
      setTimeout(closeAuth, 800);
      toast("Sesión iniciada");
    } catch (err) {
      fb.className = "auth-feedback is-error";
      fb.textContent = err.message || "Error al iniciar sesión.";
    }
  });

  // Submit: REGISTER
  const registerForm = $("#registerForm");
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fb = registerForm.querySelector("[data-feedback]");
    fb.className = "auth-feedback";
    fb.textContent = "Creando cuenta…";

    // Validación contraseña mínima en cliente para feedback rápido
    const data = Object.fromEntries(new FormData(registerForm).entries());
    const pwd = data.password || "";
    if (pwd.length < 8) {
      fb.className = "auth-feedback is-error";
      fb.textContent = "La contraseña debe tener al menos 8 caracteres.";
      return;
    }
    if (!/[a-zA-Z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      fb.className = "auth-feedback is-error";
      fb.textContent = "La contraseña debe incluir letras y números.";
      return;
    }

    try {
      const res = await fetch(ENDPOINTS.register, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = payload?.error?.message || "No se pudo crear la cuenta.";
        throw new Error(msg);
      }
      fb.className = "auth-feedback is-success";
      fb.textContent = "¡Cuenta creada! Te damos la bienvenida.";
      await refreshAuthState();
      setTimeout(closeAuth, 800);
      toast("Cuenta creada con éxito");
    } catch (err) {
      fb.className = "auth-feedback is-error";
      fb.textContent = err.message || "Error al crear la cuenta.";
    }
  });

  /* ============================================================
     ESTADO DE SESIÓN · UI dinámica
     - Si hay sesión: menú de usuario con avatar + opción cerrar sesión
     - Si no:        botón Acceder + gate en la sección de reseñas
  ============================================================ */
  const navLogin = $("#navLogin");
  const userMenu = $("#userMenu");
  const userTrigger = $("#userTrigger");
  const userDropdown = $("#userDropdown");
  const userAvatar = $("#userAvatar");
  const userName = $("#userName");
  const userFullName = $("#userFullName");
  const userEmail = $("#userEmail");
  const logoutBtn = $("#logoutBtn");
  const reviewGate = $("#reviewGate");
  const reviewFormWrap = $("#reviewFormWrap");
  const reviewSignAs = $("#reviewSignAs");

  let currentUser = null;

  function firstName(fullName) {
    if (!fullName) return "";
    return String(fullName).trim().split(/\s+/)[0];
  }

  function initials(fullName, email) {
    if (fullName && fullName.trim()) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    if (email) return email.charAt(0).toUpperCase();
    return "?";
  }

  function applyAuthUI(user) {
    currentUser = user;
    const isAuth = !!user;

    // Header: alterna botón Acceder ↔ menú de usuario
    // Usamos clase .is-hidden (forzada con !important en CSS) porque el atributo
    // `hidden` lo sobrescriben las reglas display: inline-flex de Acceder y .user-menu.
    if (navLogin) navLogin.classList.toggle("is-hidden", isAuth);
    if (userMenu) userMenu.classList.toggle("is-hidden", !isAuth);

    // Sección de reseñas: alterna gate ↔ formulario
    if (reviewGate) reviewGate.classList.toggle("is-hidden", isAuth);
    if (reviewFormWrap) reviewFormWrap.classList.toggle("is-hidden", !isAuth);

    if (isAuth) {
      const display = firstName(user.name) || user.email;
      if (userName) userName.textContent = display;
      if (userAvatar) userAvatar.textContent = initials(user.name, user.email);
      if (userFullName) userFullName.textContent = user.name || user.email;
      if (userEmail) userEmail.textContent = user.email || "";
      if (reviewSignAs) reviewSignAs.textContent = user.name || user.email;
    }
  }

  async function refreshAuthState() {
    try {
      const res = await fetch(ENDPOINTS.me, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        applyAuthUI(data?.user || null);
        return;
      }
    } catch { /* sin red */ }
    applyAuthUI(null);
  }

  // Toggle del dropdown del menú de usuario
  userTrigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = userMenu.classList.toggle("is-open");
    userTrigger.setAttribute("aria-expanded", String(open));
  });

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!userMenu) return;
    if (!userMenu.contains(e.target)) {
      userMenu.classList.remove("is-open");
      userTrigger?.setAttribute("aria-expanded", "false");
    }
  });

  // Cerrar dropdown con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      userMenu?.classList.remove("is-open");
      userTrigger?.setAttribute("aria-expanded", "false");
    }
  });

  // Logout
  logoutBtn?.addEventListener("click", async () => {
    try {
      await fetch(ENDPOINTS.logout, { method: "POST", credentials: "include" });
    } catch { /* da igual: limpiamos UI */ }
    userMenu?.classList.remove("is-open");
    applyAuthUI(null);
    toast("Sesión cerrada");
  });

  // Comprobación inicial al cargar la página
  refreshAuthState();


  /* ============================================================
     HORARIO DINÁMICO + STATUS PILL
     Se actualiza cada 60s para que "abierto/cerrado" sea preciso
     incluso si el usuario deja la pestaña abierta.
  ============================================================ */
  const statusPill = $("#statusPill");
  const hoursTable = $("#hoursTable");
  const hoursBadge = $("#hoursBadge");
  const hoursStatus = $("#hoursStatus");

  const DAYS_LABEL = {
    1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue",
    5: "Vie", 6: "Sáb", 0: "Dom",
  };

  function formatSlots(slots) {
    if (!slots || slots.length === 0) return "Cerrado";
    return slots.map((s) => `${s.opens} – ${s.closes}`).join(" · ");
  }

  /** Agrupa días con el mismo horario. */
  function groupSchedule(schedule) {
    const order = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 0: 7 };
    const ordered = [...schedule].sort((a, b) => order[a.weekday] - order[b.weekday]);
    const groups = [];
    let current = null;
    for (const day of ordered) {
      const key = JSON.stringify(day.slots);
      if (current && current.key === key) {
        current.end = day;
      } else {
        if (current) groups.push(current);
        current = { key, start: day, end: day, slots: day.slots };
      }
    }
    if (current) groups.push(current);
    return groups;
  }

  function isWeekdayInRange(target, start, end) {
    const order = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 0: 7 };
    return order[target] >= order[start] && order[target] <= order[end];
  }

  function renderSchedule(data) {
    if (!data) return;

    // Status pill en el header
    if (statusPill && data.status) {
      const s = data.status;
      statusPill.classList.remove("is-open", "is-closed");
      statusPill.classList.add(s.open ? "is-open" : "is-closed");
      const text = statusPill.querySelector(".status-text");
      if (text) {
        text.innerHTML = s.open
          ? `<strong>Abierto ahora</strong><span class="status-text-extra"> · cierra ${s.closesAt}</span>`
          : `<strong>Cerrado</strong>`;
      }
      statusPill.title = s.message || "";
    }

    // Badge de temporada
    if (hoursBadge) {
      hoursBadge.textContent = data.season === "summer" ? "Verano" : "Invierno";
    }

    // Tabla agrupada
    if (hoursTable && Array.isArray(data.schedule)) {
      const groups = groupSchedule(data.schedule);
      const today = new Date().getDay();
      hoursTable.innerHTML = groups.map((g) => {
        const label = g.start.weekday === g.end.weekday
          ? DAYS_LABEL[g.start.weekday]
          : `${DAYS_LABEL[g.start.weekday]} – ${DAYS_LABEL[g.end.weekday]}`;
        const inRange = isWeekdayInRange(today, g.start.weekday, g.end.weekday);
        return `
          <tr${inRange ? ' class="is-today"' : ""}>
            <th>${label}</th>
            <td>${escapeHtml(formatSlots(g.slots))}</td>
          </tr>`;
      }).join("");
    }

    // Mensaje de estado
    if (hoursStatus && data.status) {
      const s = data.status;
      hoursStatus.classList.remove("is-open", "is-closed");
      hoursStatus.classList.add(s.open ? "is-open" : "is-closed");
      hoursStatus.textContent = s.message || "";
    }
  }

  async function loadBusinessStatus() {
    try {
      const res = await fetch(ENDPOINTS.business, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        renderSchedule(await res.json());
        return;
      }
    } catch { /* fallback */ }

    if (statusPill) {
      const text = statusPill.querySelector(".status-text");
      if (text) text.textContent = "Consulta horario";
    }
  }

  loadBusinessStatus();
  setInterval(loadBusinessStatus, 60_000);

  /* ============================================================
     GALERÍA + LIGHTBOX
     Si window.GALLERY_IMAGES está definido (en index.html cuando
     lleguen las fotos), renderiza el grid. Si no, deja el estado
     vacío que ya hay en el HTML.
  ============================================================ */
  const galleryGrid = $("#galleryGrid");
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxCaption = $("#lightboxCaption");
  const lightboxClose = $("#lightboxClose");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");

  let galleryImages = [];
  let lightboxIndex = 0;

  function renderGallery(images) {
    if (!galleryGrid || !Array.isArray(images) || images.length === 0) return;
    galleryImages = images;
    galleryGrid.innerHTML = images.map((img, i) => `
      <figure class="gallery-item" data-index="${i}" tabindex="0" role="button" aria-label="Ampliar: ${escapeHtml(img.caption || img.alt || '')}">
        <img src="${escapeHtml(img.src)}"
             alt="${escapeHtml(img.alt || '')}"
             loading="lazy"
             decoding="async" />
        ${img.caption ? `<figcaption class="gallery-caption">${escapeHtml(img.caption)}</figcaption>` : ""}
      </figure>
    `).join("");

    $$(".gallery-item", galleryGrid).forEach((el) => {
      el.addEventListener("click", () => openLightbox(Number(el.dataset.index)));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(Number(el.dataset.index));
        }
      });
    });
  }

  function openLightbox(index) {
    if (!lightbox || galleryImages.length === 0) return;
    lightboxIndex = index;
    const img = galleryImages[index];
    if (!img) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    lightboxCaption.textContent = img.caption || "";
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => { lightbox.hidden = true; }, 350);
  }
  function shiftImage(dir) {
    if (galleryImages.length === 0) return;
    lightboxIndex = (lightboxIndex + dir + galleryImages.length) % galleryImages.length;
    openLightbox(lightboxIndex);
  }

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxNext?.addEventListener("click", () => shiftImage(1));
  lightboxPrev?.addEventListener("click", () => shiftImage(-1));
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") shiftImage(1);
    if (e.key === "ArrowLeft") shiftImage(-1);
  });

  if (Array.isArray(window.GALLERY_IMAGES) && window.GALLERY_IMAGES.length > 0) {
    renderGallery(window.GALLERY_IMAGES);
  }


  const banner = $("#cookieBanner");
  const cfg = $("#cookieConfig");
  const cookieAnalytics = $("#cookieAnalytics");
  const cookieMarketing = $("#cookieMarketing");

  function readConsent() {
    try {
      const raw = localStorage.getItem(COOKIE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  function writeConsent(consent) {
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify({ ...consent, ts: Date.now() }));
    } catch {}
  }
  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add("is-visible"));
  }
  function hideBanner() {
    banner?.classList.remove("is-visible");
    setTimeout(() => banner && (banner.hidden = true), 500);
  }
  function openCookieConfig() {
    if (!cfg) return;
    const c = readConsent() || {};
    if (cookieAnalytics) cookieAnalytics.checked = !!c.analytics;
    if (cookieMarketing) cookieMarketing.checked = !!c.marketing;
    cfg.classList.add("is-open");
    cfg.setAttribute("aria-hidden", "false");
  }
  function closeCookieConfig() {
    cfg?.classList.remove("is-open");
    cfg?.setAttribute("aria-hidden", "true");
  }

  function applyConsent(consent) {
    writeConsent(consent);
    // Aquí cargarías GA / Pixel según consent.analytics / consent.marketing
    hideBanner();
    closeCookieConfig();
    toast("Preferencias guardadas");
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-cookie]");
    if (!t) return;
    const action = t.dataset.cookie;
    if (action === "accept") {
      applyConsent({ necessary: true, analytics: true, marketing: true });
    } else if (action === "reject") {
      applyConsent({ necessary: true, analytics: false, marketing: false });
    } else if (action === "config") {
      openCookieConfig();
    } else if (action === "save") {
      applyConsent({
        necessary: true,
        analytics: !!cookieAnalytics?.checked,
        marketing: !!cookieMarketing?.checked,
      });
    } else if (action === "close") {
      closeCookieConfig();
    }
  });

  $$("[data-cookie-open]").forEach((b) =>
    b.addEventListener("click", openCookieConfig)
  );

  cfg?.addEventListener("click", (e) => {
    if (e.target === cfg) closeCookieConfig();
  });

  if (!readConsent()) {
    setTimeout(showBanner, 600);
  }

  /* ============================================================
     Animación CSS auxiliar (fadeUp)
  ============================================================ */
  const css = document.createElement("style");
  css.textContent = `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .product-card { animation: fadeUp .55s var(--ease, cubic-bezier(.2,.7,.2,1)) both; }
  `;
  document.head.appendChild(css);
})();
