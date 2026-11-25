/* Portfolio — Salim Zabeirou | interactions & animations (vanilla JS) */
(() => {
  'use strict';

  const root = document.getElementById('pf-root');
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const CONFIG = window.SITE_CONFIG || {};

  // Défini dans <head> : réglage système, ou choix fait avec le bouton « Animations ».
  const reduce = document.documentElement.classList.contains('reduce-motion');
  const finePointer = matchMedia('(pointer: fine)').matches;

  const state = { sy: 0, mouse: { x: -9999, y: -9999 } };
  const SECTIONS = ['accueil', 'apropos', 'competences', 'projets', 'parcours', 'contact'];

  const setIf = (name, on) => $$(`[data-if="${name}"]`).forEach((w) => w.classList.toggle('off', !on));
  const restart = (el) => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; };

  /* ================= Menu mobile ================= */
  const burger = $('.burger');
  const menuWrap = $('[data-if="menuOpen"]');
  const menuIsOpen = () => !!menuWrap && !menuWrap.classList.contains('off');
  const setMenu = (open) => {
    setIf('menuOpen', open);
    if (!burger) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ================= Fenêtres projets ================= */
  let modal = null, opener = null;
  const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
  // Rend le reste de la page inactif pendant qu'une fenêtre est ouverte.
  const setBackgroundInert = (on) => Array.from(root.children).forEach((el) => {
    if (el !== modal && !el.matches('[data-modal], [data-if="showCursor"]')) el.inert = on;
  });
  const openModal = (id, from) => {
    const next = $(`[data-modal="${id}"]`);
    if (!next) return;
    setMenu(false);
    modal = next; opener = from || null;
    modal.classList.remove('off');
    document.body.classList.add('modal-open');
    setBackgroundInert(true);
    $('.mpanel', modal).scrollTop = 0;
    $('.mclose', modal).focus({ preventScroll: true });
  };
  const closeModal = () => {
    if (!modal) return;
    setBackgroundInert(false);
    modal.classList.add('off');
    modal = null;
    document.body.classList.remove('modal-open');
    if (opener) opener.focus({ preventScroll: true });
  };

  /* ================= Onglets de compétences ================= */
  const tabs = $$('.tabs .tab');
  const pickTab = (tab) => {
    tabs.forEach((b) => {
      const on = b === tab;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    $$('[data-tabpanel]').forEach((p) => {
      const on = p.dataset.tabpanel === tab.dataset.id;
      p.classList.toggle('off', !on);
      if (on) $$('.skt', p).forEach(restart);
    });
  };
  const tablist = $('.tabs');
  if (tablist) tablist.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const tab = tabs[(to + tabs.length) % tabs.length];
    pickTab(tab); tab.focus();
  });

  /* ================= Actions (délégation de clics) ================= */
  const actions = {
    toggleMenu() { setMenu(!menuIsOpen()); },
    closeMenu() { setMenu(false); },
    't.pick'(el) { pickTab(el); },
    'f.pick'(el) {
      const id = el.dataset.id;
      $$('.filters .flt').forEach((b) => { b.classList.toggle('on', b === el); b.setAttribute('aria-pressed', String(b === el)); });
      let n = 0;
      $$('.pgrid .pcard').forEach((card) => {
        const visible = id === 'all' || card.dataset.cats.split(' ').includes(id);
        card.style.display = visible ? '' : 'none';
        if (visible) { restart(card); card.style.animationDelay = (n++ * 0.08) + 's'; }
      });
      const status = document.getElementById('flt-status');
      if (status) status.textContent = `${n} projet${n > 1 ? 's' : ''} affiché${n > 1 ? 's' : ''}`;
    },
    'p.open'(el) { openModal(el.dataset.id, el); },
    closeModal() { closeModal(); },
    resetForm() { resetForm(); }
  };

  document.addEventListener('click', (e) => {
    if (menuIsOpen() && !e.target.closest('.mmenu, .burger')) setMenu(false);
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    // Un clic dans le panneau ne ferme pas la fenêtre (seuls le fond et la croix le font).
    if (act === 'closeModal' && el.classList.contains('modal') && e.target.closest('.mpanel')) return;
    if (actions[act]) actions[act](el);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal) closeModal();
      else if (menuIsOpen()) { setMenu(false); burger.focus(); }
      return;
    }
    if (e.key !== 'Tab' || !modal) return;
    // Garde le focus clavier dans la fenêtre ouverte.
    const items = $$(FOCUSABLE, modal);
    const first = items[0], last = items[items.length - 1];
    const inside = modal.contains(document.activeElement);
    if (e.shiftKey && (!inside || document.activeElement === first)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (!inside || document.activeElement === last)) { e.preventDefault(); first.focus(); }
  });

  /* ================= Coordonnées (config.js) ================= */
  const value = (k) => String(CONFIG[k] || '').trim();
  const showContact = (name, fill) => $$(`[data-contact="${name}"]`).forEach((el) => { fill(el); el.hidden = false; });
  const email = value('email');
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) showContact('email', (el) => {
    const a = $('[data-link]', el); a.textContent = email; a.href = 'mailto:' + email;
  });
  const wa = value('whatsapp').replace(/\D/g, '');
  if (wa.length >= 8) showContact('whatsapp', (el) => { el.href = 'https://wa.me/' + wa; });
  if (/^https:\/\//.test(value('linkedin'))) showContact('linkedin', (el) => { el.href = value('linkedin'); });
  if (value('availability')) showContact('availability', (el) => { $('[data-text]', el).textContent = value('availability'); });

  // Le bouton CV n'apparaît que si le PDF répond réellement.
  if (value('cv')) fetch(value('cv'), { method: 'HEAD', cache: 'no-store' })
    .then((r) => {
      if (!r.ok || !/pdf/i.test(r.headers.get('content-type') || '')) return;
      $$('[data-cv]').forEach((a) => { a.href = value('cv'); a.hidden = false; });
    })
    .catch(() => {});

  const motion = document.getElementById('motion-toggle');
  if (motion) {
    motion.textContent = reduce ? 'Activer les animations' : 'Réduire les animations';
    motion.addEventListener('click', () => {
      try { localStorage.setItem('pf-motion', reduce ? 'on' : 'off'); } catch (_) { return; }
      location.reload();
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ================= Formulaire de contact ================= */
  const form = document.getElementById('contact-form');
  const endpoint = value('formEndpoint');
  const COOLDOWN = 60000;
  let startedAt = Date.now();

  const formError = (msg, withMail) => {
    const box = document.getElementById('form-err');
    box.textContent = msg;
    if (withMail && email) {
      const g = (k) => form.elements.namedItem(k).value.trim();
      const a = document.createElement('a');
      a.href = `mailto:${email}?subject=${encodeURIComponent(g('sujet'))}&body=${encodeURIComponent(g('message') + '\n\n' + g('nom'))}`;
      a.textContent = 'Ouvrir ma messagerie avec ce message';
      box.append(' ', a);
    }
  };

  const RULES = {
    nom: (v) => (v.length >= 2 ? '' : 'Indiquez votre nom (2 caractères minimum).'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Indiquez une adresse e-mail valide.'),
    message: (v) => (v.length >= 10 ? '' : 'Votre message doit contenir au moins 10 caractères.')
  };
  const check = (key) => {
    const input = form.elements.namedItem(key);
    const msg = RULES[key](input.value.trim());
    input.setAttribute('aria-invalid', String(!!msg));
    document.getElementById('e-' + key).textContent = msg;
    return !msg;
  };

  const ERRORS = {
    invalid: 'Certains champs sont refusés par le serveur. Vérifiez votre saisie.',
    spam: 'Envoi bloqué par la protection anti-spam. Patientez quelques secondes et réessayez.',
    rate_limit: 'Trop de messages envoyés. Réessayez plus tard.',
    not_configured: 'Votre message n’a pas été envoyé : l’envoi n’est pas encore configuré.'
  };

  const resetForm = () => {
    setIf('sent', false); setIf('notSent', true);
    if (!form) return;
    form.reset(); startedAt = Date.now(); formError('');
    $$('[aria-invalid]', form).forEach((i) => i.removeAttribute('aria-invalid'));
    $$('.ferr', form).forEach((s) => { s.textContent = ''; });
    form.elements.namedItem('nom').focus();
  };

  if (form) {
    if (!endpoint) {
      const note = document.getElementById('form-off');
      note.textContent = 'L’envoi direct n’est pas encore activé : les messages saisis ici ne sont pas transmis.';
      note.hidden = false;
    }
    Object.keys(RULES).forEach((k) => form.elements.namedItem(k).addEventListener('input', (e) => {
      if (e.target.getAttribute('aria-invalid') === 'true') check(k);
    }));

    let sending = false;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;
      formError('');
      const bad = Object.keys(RULES).filter((k) => !check(k));
      if (bad.length) { form.elements.namedItem(bad[0]).focus(); return; }
      if (!endpoint) { formError('Votre message n’a pas été envoyé : l’envoi n’est pas encore activé.', true); return; }

      let last = 0;
      try { last = +localStorage.getItem('pf-last-send') || 0; } catch (_) { /* stockage indisponible */ }
      if (Date.now() - last < COOLDOWN) { formError('Veuillez patienter une minute avant un nouvel envoi.'); return; }

      const button = document.getElementById('form-btn'), label = $('span', button);
      sending = true; button.disabled = true; label.textContent = 'Envoi en cours…';
      const data = new FormData(form);
      data.append('elapsed', String(Math.floor((Date.now() - startedAt) / 1000)));
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), 15000);
      try {
        const res = await fetch(endpoint, { method: 'POST', body: data, signal: abort.signal, headers: { Accept: 'application/json' } });
        const json = await res.json();
        // Succès affiché uniquement si le serveur le confirme explicitement.
        if (!res.ok || json.ok !== true) {
          formError(ERRORS[json.code] || 'Votre message n’a pas été envoyé. Réessayez plus tard.', true);
          return;
        }
        try { localStorage.setItem('pf-last-send', String(Date.now())); } catch (_) { /* ignoré */ }
        document.getElementById('sent-name').textContent = form.elements.namedItem('nom').value.trim().split(' ')[0];
        setIf('notSent', false); setIf('sent', true);
        $('.ok-title').focus();
      } catch (_) {
        formError('Votre message n’a pas pu être confirmé comme envoyé. Vérifiez votre connexion et réessayez.', true);
      } finally {
        clearTimeout(timer);
        sending = false; button.disabled = false; label.textContent = 'Envoyer le signal';
      }
    });
  }

  /* ================= Inclinaison 3D des cartes ================= */
  if (finePointer && !reduce) $$('[data-tilt]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', ((0.5 - py) * 8).toFixed(2) + 'deg');
      el.style.setProperty('--ry', ((px - 0.5) * 10).toFixed(2) + 'deg');
      el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    el.addEventListener('mouseleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });

  /* ================= Apparition au défilement + compteurs ================= */
  const count = (c) => {
    const target = +c.dataset.count, suf = c.dataset.suf || '';
    if (reduce) { c.textContent = target + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
      const k = Math.max(0, Math.min(1, (t - t0) / dur)), e = 1 - Math.pow(1 - k, 3);
      c.textContent = Math.round(target * e) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const show = (el) => {
    if (el.classList.contains('in')) return;
    el.classList.add('in');
    $$('[data-count]', el).forEach(count);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -60px 0px' });
    $$('.rv').forEach((el) => io.observe(el));

    // Met en pause les animations des sections hors écran.
    const idle = new IntersectionObserver((entries) => entries.forEach((en) => {
      en.target.classList.toggle('paused', !en.isIntersecting);
    }), { rootMargin: '100px 0px' });
    SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) idle.observe(el); });
  } else $$('.rv').forEach(show);

  /* ================= Particules en arrière-plan ================= */
  (() => {
    const cv = document.getElementById('pf-particles');
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    const cs = getComputedStyle(root);
    const cols = ['--cr', '--br', '--vr'].map((k) => cs.getPropertyValue(k).trim().replace(/\s+/g, '') || '159,232,255');
    // Halo pré-calculé : bien moins coûteux que shadowBlur à chaque image.
    const sprites = cols.map((col) => {
      const s = document.createElement('canvas'); s.width = s.height = 32;
      const g = s.getContext('2d'), grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, `rgba(${col},1)`); grad.addColorStop(0.2, `rgba(${col},.9)`);
      grad.addColorStop(0.35, `rgba(${col},.28)`); grad.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = grad; g.fillRect(0, 0, 32, 32);
      return s;
    });
    let W = 0, H = 0, P = [], lastSy = 0, frame = 0;
    const draw = (move) => {
      const dy = state.sy - lastSy; lastSy = state.sy;
      ctx.clearRect(0, 0, W, H);
      if (move) for (const p of P) {
        p.x += p.vx; p.y += p.vy - dy * p.z * 0.2;
        const mx = p.x - state.mouse.x, my = p.y - state.mouse.y, dd = mx * mx + my * my;
        if (dd < 25600) { const d = Math.sqrt(dd) + 0.01, f = (1 - d / 160) * 1.4; p.x += (mx / d) * f; p.y += (my / d) * f; }
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      }
      ctx.lineWidth = 0.6;
      for (let i = 0; i < P.length; i++) {
        const a = P[i];
        for (let j = i + 1; j < P.length; j++) {
          const b = P[j], dx = a.x - b.x, dy2 = a.y - b.y, q = dx * dx + dy2 * dy2;
          if (q < 13000) {
            ctx.strokeStyle = `rgba(${cols[a.k]},${(0.2 * (1 - q / 13000)).toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const p of P) {
        const size = p.r * (0.6 + p.z) * 6;
        ctx.globalAlpha = 0.45 + p.z * 0.55;
        ctx.drawImage(sprites[p.k], p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };
    const resize = () => {
      const dpr = Math.min(1.5, devicePixelRatio || 1);
      W = innerWidth; H = innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(100, Math.max(28, Math.round((W * Math.min(H, 1400)) / 13000)));
      P = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.4, k: Math.floor(Math.random() * 3), z: Math.random() * 0.8 + 0.2
      }));
      if (reduce) draw(false);
    };
    let lastW = 0;
    // Sur mobile, la barre d'adresse change la hauteur : on ne recrée que si la largeur change.
    addEventListener('resize', () => { if (innerWidth !== lastW || finePointer) { lastW = innerWidth; resize(); } });
    lastW = innerWidth; resize();
    if (reduce) return;
    const tick = () => {
      requestAnimationFrame(tick);
      if (!document.hidden && !modal && (finePointer || (frame++ & 1) === 0)) draw(true);
    };
    tick();
  })();

  /* ================= Curseur personnalisé + parallaxe souris ================= */
  if (finePointer && !reduce) {
    root.classList.add('cc');
    setIf('showCursor', true);
    const st = { x: -200, y: -200, rx: -200, ry: -200, running: false };
    const dot = document.getElementById('pf-dot'), ring = document.getElementById('pf-ring');
    // La boucle s'arrête dès que l'anneau a rejoint la souris.
    const loop = () => {
      st.rx += (st.x - st.rx) * 0.16; st.ry += (st.y - st.ry) * 0.16;
      dot.style.transform = `translate3d(${st.x}px,${st.y}px,0)`;
      ring.style.transform = `translate3d(${st.rx.toFixed(1)}px,${st.ry.toFixed(1)}px,0)`;
      st.running = Math.abs(st.x - st.rx) + Math.abs(st.y - st.ry) > 0.2;
      if (st.running) requestAnimationFrame(loop);
    };
    addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      st.x = e.clientX; st.y = e.clientY; state.mouse.x = e.clientX; state.mouse.y = e.clientY;
      root.style.setProperty('--mx', (e.clientX / innerWidth * 2 - 1).toFixed(3));
      root.style.setProperty('--my', (Math.min(1, e.clientY / Math.min(innerHeight, 1000)) * 2 - 1).toFixed(3));
      root.classList.add('cur-on');
      if (!st.running) { st.running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      ring.classList.toggle('hov', !!e.target.closest('a,button,.pcard'));
      // Dans les champs de saisie, on revient au curseur natif.
      root.classList.toggle('cur-text', !!e.target.closest('input,textarea,select'));
    });
    document.documentElement.addEventListener('mouseleave', () => { root.classList.remove('cur-on'); state.mouse.x = state.mouse.y = -9999; });
    addEventListener('pointerdown', () => ring.classList.add('down'));
    addEventListener('pointerup', () => ring.classList.remove('down'));
  }

  /* ================= En-tête : indicateur, lien actif, horloge ================= */
  const links = $('.links'), ind = document.getElementById('pf-ind');
  const moveInd = (el) => {
    if (!ind) return;
    if (!el || !el.offsetWidth) { ind.style.opacity = '0'; return; }
    ind.style.left = el.offsetLeft + 'px'; ind.style.width = el.offsetWidth + 'px'; ind.style.opacity = '1';
  };
  const moveToActive = () => moveInd(links && $('.lk.on', links));
  if (links && ind) {
    links.classList.add('has-ind');
    links.addEventListener('mouseover', (e) => { const a = e.target.closest('.lk'); if (a) moveInd(a); });
    links.addEventListener('mouseleave', moveToActive);
    addEventListener('resize', moveToActive);
    setTimeout(moveToActive, reduce ? 0 : 3700);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveToActive);
  }
  const setActive = (id) => {
    $$('.lk').forEach((a) => {
      const on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    moveToActive();
  };
  const clock = () => {
    const el = document.getElementById('pf-clock'); if (!el) return;
    el.textContent = 'NIGER · ' + new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Niamey', hour: '2-digit', minute: '2-digit' }).format(new Date());
  };
  clock(); setInterval(clock, 15000);

  /* ================= Défilement : parallaxe, progression, section active ================= */
  let pending = false, active = '';
  const onScroll = () => {
    pending = false;
    const de = document.documentElement;
    const sy = scrollY || de.scrollTop || 0; state.sy = sy;
    const max = Math.max(1, de.scrollHeight - innerHeight);
    // La parallaxe est désactivée en une colonne (elle ferait chevaucher les blocs).
    root.style.setProperty('--sy', reduce || innerWidth <= 1000 ? '0' : sy.toFixed(1));
    root.style.setProperty('--sp', Math.min(1, sy / max).toFixed(4));
    const nav = document.getElementById('pf-nav'); if (nav) nav.classList.toggle('scrolled', sy > 40);
    let act = 'accueil'; const lim = Math.min(innerHeight, 1000) * 0.4;
    for (const id of SECTIONS) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < lim) act = id; }
    if (sy >= max - 2) act = 'contact';
    if (act !== active) { active = act; setActive(act); }
  };
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ================= Machine à écrire (spécialités) ================= */
  (() => {
    const el = document.getElementById('pf-type');
    if (reduce || !el) return;
    const words = ['plateformes SaaS', 'applications de gestion', 'digitalisation des entreprises'];
    const home = document.getElementById('accueil');
    let r = 0, i = words[0].length, del = true;
    const step = () => {
      if (document.hidden || home.classList.contains('paused')) { setTimeout(step, 600); return; }
      if (!del) {
        i++;
        if (i >= words[r].length) { el.textContent = words[r]; del = true; setTimeout(step, 2200); return; }
      } else {
        i--;
        if (i <= 0) { i = 0; del = false; r = (r + 1) % words.length; }
      }
      el.textContent = words[r].slice(0, i) || '​';
      setTimeout(step, del ? 36 : 70);
    };
    setTimeout(step, 4600);
  })();

  /* ================= Boutons magnétiques ================= */
  if (finePointer && !reduce) {
    let mag = null;
    document.addEventListener('pointermove', (e) => {
      const b = e.target.closest('.btn, .logo-mark');
      if (mag && mag !== b) { mag.style.translate = ''; mag = null; }
      if (!b) return;
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.12, dy = (e.clientY - (r.top + r.height / 2)) * 0.18;
      b.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`; mag = b;
    }, { passive: true });
  }
})();
