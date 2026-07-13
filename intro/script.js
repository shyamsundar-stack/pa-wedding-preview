/* =========================================================================
   PRIYANKA & ARAVIND — site behaviour
   ── EDIT ONLY THIS CONFIG BLOCK to drop in the real details ──────────────
   ========================================================================= */
const CONFIG = {
  marriedISO: "2026-07-12T10:30:00+05:30", // the muhurtham — "married for" counts up from here
  dateRange:  "12 July 2026",              // shown in the hero
};
/* ====================== (no need to edit below) ========================== */

(function () {
  // ---- Inject configured text where provided ----
  const heroDate = CONFIG.dateRange || CONFIG.dateDisplay;
  if (heroDate) {
    document.querySelectorAll('[data-cfg="dateShort"]').forEach(el => el.textContent = heroDate);
  }
  // ---- Nav: solid on scroll ----
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > 40);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // ---- Mobile menu ----
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  burger.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

  // ---- "Married for" counter (counts up from the muhurtham) ----
  const pad = n => String(n).padStart(2, '0');
  const cd = {
    d: document.getElementById('cd-d'), h: document.getElementById('cd-h'),
    m: document.getElementById('cd-m'), s: document.getElementById('cd-s')
  };
  const married = new Date(CONFIG.marriedISO);
  function tick() {
    let diff = Math.max(0, Math.floor((new Date() - married) / 1000));
    const days = Math.floor(diff / 86400); diff %= 86400;
    const hrs = Math.floor(diff / 3600); diff %= 3600;
    cd.d.textContent = pad(days); cd.h.textContent = pad(hrs);
    cd.m.textContent = pad(Math.floor(diff / 60)); cd.s.textContent = pad(diff % 60);
  }
  if (cd.d && cd.h && cd.m && cd.s) { tick(); setInterval(tick, 1000); }

  // ---- Reveal on scroll ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---- Backends (shared by the wishes wall) ----
  const RSVP_SHEET = "https://script.google.com/macros/s/AKfycbyK7hBn96P5wy4Oz3Wwg1rKRTpNnC0qNGZ6Aq8FcLIuDBOuDRJfAcuw2__2CmzMOoGhcQ/exec";
  const RSVP_MAIL  = "https://formsubmit.co/ajax/f277fb078ff7281e849b7b69058a8e32";

  // ---- Wishes wall: live feed from the Google Sheet (Apps Script doGet) ----
  // Paste the same /exec URL into WISHES_FEED once the doGet snippet is deployed;
  // until then the wall shows the seeded wishes plus anything sent this visit.
  const WISHES_FEED = "";
  if (WISHES_FEED) {
    fetch(WISHES_FEED + '?list=blessings')
      .then(r => r.json())
      .then(data => {
        const list = (Array.isArray(data) ? data : (data.blessings || []))
          .filter(w => w && String(w.message || '').trim());
        if (!list.length) return;
        const grid = document.getElementById('blessGrid');
        if (!grid) return;
        grid.innerHTML = '';
        list.slice(-200).reverse().forEach(w => {   // newest first, latest 200
          const el = document.createElement('div');
          el.className = 'bless';
          el.innerHTML = '<div class="q">&ldquo;</div><p></p><div class="by"></div>';
          el.querySelector('p').textContent = String(w.message).trim().slice(0, 280);
          el.querySelector('.by').textContent = '— ' + (String(w.name || '').trim() || 'A well-wisher').slice(0, 40);
          grid.appendChild(el);
        });
        wallFit();
      }).catch(() => {});
  }

  // ---- Wall clamp: compact until "Read all wishes" ----
  const wallClip = document.getElementById('wallClip');
  const wallMore = document.getElementById('wallMore');
  function wallFit() {
    if (!wallClip || !wallMore) return;
    const open = wallClip.classList.contains('open');
    const overflows = wallClip.scrollHeight > wallClip.clientHeight + 24;
    wallMore.hidden = !open && !overflows;
  }
  if (wallClip && wallMore) {
    wallMore.addEventListener('click', () => {
      const open = wallClip.classList.toggle('open');
      wallMore.textContent = open ? 'Show fewer wishes' : 'Read all wishes';
      if (!open) document.getElementById('blessings').scrollIntoView({ behavior: 'smooth' });
      wallFit();
    });
    wallFit();
    window.addEventListener('resize', wallFit);
  }

  // ---- Leave a blessing (modal -> same Google Sheet, "Blessings" formType) ----
  const blessModal = document.getElementById('blessModal');
  const blessForm  = document.getElementById('blessForm');
  if (blessModal && blessForm) {
    const openBless  = () => { blessModal.hidden = false; document.body.style.overflow = 'hidden';
      const t = blessForm.querySelector('textarea'); if (t) t.focus(); };
    const closeBless = () => { blessModal.hidden = true; document.body.style.overflow = ''; };
    const ob = document.getElementById('blessOpen');  if (ob) ob.addEventListener('click', openBless);
    const cb = document.getElementById('blessClose'); if (cb) cb.addEventListener('click', closeBless);
    blessModal.addEventListener('click', (e) => { if (e.target === blessModal) closeBless(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !blessModal.hidden) closeBless(); });
    blessForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(blessForm).entries());
      const msg = (data.message || '').trim();
      if (!msg) { const t = blessForm.querySelector('textarea'); if (t) t.focus(); return; }
      data.name = (data.name || '').trim() || 'A well-wisher';
      data.message = msg;
      data.formType = 'Blessings';
      data._subject = 'Wedding blessing — ' + data.name;
      const sb = blessForm.querySelector('button[type="submit"]');
      if (sb) { sb.disabled = true; sb.textContent = 'Sending…'; }
      try { await fetch(RSVP_SHEET, { method:'POST', headers:{'Content-Type':'text/plain'}, body: JSON.stringify(data) }); } catch (_) {}
      try { await fetch(RSVP_MAIL,  { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }); } catch (_) {}
      // surface the blessing on the guestbook straight away
      const grid = document.getElementById('blessGrid');
      if (grid) {
        const el = document.createElement('div');
        el.className = 'bless';
        el.innerHTML = '<div class="q">&ldquo;</div><p></p><div class="by"></div>';
        el.querySelector('p').textContent = msg;
        el.querySelector('.by').textContent = '— ' + data.name;
        grid.insertBefore(el, grid.firstChild);
        wallFit();
      }
      blessForm.innerHTML = '<div style="text-align:center;padding:18px 0;">' +
        '<div style="font-family:\'Cormorant\',serif;font-size:30px;color:var(--sage-deep);">Thank you.</div>' +
        '<p style="font-style:italic;color:var(--ink-soft);margin-top:8px;">Your blessing means the world to us.</p></div>';
      setTimeout(closeBless, 2000);
    });
  }
})();
