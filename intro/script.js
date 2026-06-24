/* =========================================================================
   PRIYANKA & ARAVIND — site behaviour
   ── EDIT ONLY THIS CONFIG BLOCK to drop in the real details ──────────────
   ========================================================================= */
const CONFIG = {
  // Wedding day / muhurtham — ISO format "YYYY-MM-DDTHH:MM:SS" (IST).
  // Set this to the real date and the countdown + labels update automatically.
  weddingDateISO: "2026-07-12T10:30:00",    // Muhurtham — Sun 12 July 2026, 10:30 AM IST (countdown target)
  dateDisplay:    "12 July 2026",           // muhurtham day (used in countdown note)
  dateRange:      "11 & 12 July 2026",      // shown in the hero (Reception 11th eve + Muhurtham 12th morning)
  rsvpBy:         "30 June 2026",           // PLACEHOLDER — confirm RSVP-by date
  liveStreamURL:  "",            // e.g. "https://youtube.com/live/xxxx"
};
/* ====================== (no need to edit below) ========================== */

(function () {
  // ---- Inject configured text where provided ----
  const heroDate = CONFIG.dateRange || CONFIG.dateDisplay;
  if (heroDate) {
    document.querySelectorAll('[data-cfg="dateShort"]').forEach(el => el.textContent = heroDate);
  }
  if (CONFIG.rsvpBy) {
    document.querySelectorAll('.sec-lead em').forEach(el => {
      if (el.textContent.includes('RSVP date')) el.textContent = CONFIG.rsvpBy;
    });
  }
  if (CONFIG.liveStreamURL) {
    const lb = document.getElementById('liveBtn');
    if (lb) { lb.href = CONFIG.liveStreamURL; lb.textContent = 'Watch the live stream'; lb.removeAttribute('aria-disabled'); lb.target = '_blank'; }
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

  // ---- Countdown ----
  const pad = n => String(n).padStart(2, '0');
  const cd = {
    d: document.getElementById('cd-d'), h: document.getElementById('cd-h'),
    m: document.getElementById('cd-m'), s: document.getElementById('cd-s'),
    note: document.getElementById('cd-date')
  };
  const target = CONFIG.weddingDateISO ? new Date(CONFIG.weddingDateISO) : null;

  function tick() {
    if (!target || isNaN(target)) { return; } // leave placeholders until date is set
    const now = new Date();
    let diff = Math.floor((target - now) / 1000);
    if (diff <= 0) {
      cd.d.textContent = cd.h.textContent = cd.m.textContent = cd.s.textContent = '00';
      cd.note.innerHTML = 'Today is the day. &#10022;';
      return;
    }
    const days = Math.floor(diff / 86400); diff %= 86400;
    const hrs = Math.floor(diff / 3600); diff %= 3600;
    const mins = Math.floor(diff / 60); const secs = diff % 60;
    cd.d.textContent = days; cd.h.textContent = pad(hrs);
    cd.m.textContent = pad(mins); cd.s.textContent = pad(secs);
    if (CONFIG.dateDisplay) cd.note.textContent = 'Until the muhurtham · ' + CONFIG.dateDisplay;
  }
  if (target) { tick(); setInterval(tick, 1000); }

  // ---- Reveal on scroll ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---- FAQ accordion ----
  document.querySelectorAll('.faq button').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const ans = item.querySelector('.ans');
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      ans.style.maxHeight = open ? ans.scrollHeight + 'px' : '0';
    });
  });

  // ---- Expandable event cards ----
  document.querySelectorAll('.ev-card').forEach(card => {
    const more = card.querySelector('.ev-more');
    const toggle = () => {
      const open = card.classList.toggle('open');
      card.setAttribute('aria-expanded', String(open));
      more.style.maxHeight = open ? more.scrollHeight + 'px' : '0';
    };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  // ---- RSVP -> Google Sheet (+ email notify) ----
  const RSVP_SHEET = "https://script.google.com/macros/s/AKfycbyK7hBn96P5wy4Oz3Wwg1rKRTpNnC0qNGZ6Aq8FcLIuDBOuDRJfAcuw2__2CmzMOoGhcQ/exec";
  const RSVP_MAIL  = "https://formsubmit.co/ajax/f277fb078ff7281e849b7b69058a8e32";
  const form = document.getElementById('rsvpForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.first || !data.last || !data.contact) {
      alert('Please fill in your name and a way to reach you.');
      return;
    }
    const btn = form.querySelector('button[type="submit"], .btn-primary');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    data.formType = 'RSVPs';
    data._subject = 'Wedding RSVP — ' + data.first + ' ' + data.last;
    try { await fetch(RSVP_SHEET, { method:'POST', headers:{'Content-Type':'text/plain'}, body: JSON.stringify(data) }); } catch (_) {}
    try { await fetch(RSVP_MAIL,  { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }); } catch (_) {}
    const name = data.first;
    form.innerHTML = '<div style="text-align:center;padding:20px 0;">' +
      '<div style="font-family:\'Instr\',serif;font-size:34px;color:var(--sage-deep);">Thank you, ' + name + '.</div>' +
      '<p style="font-style:italic;color:var(--ink-soft);margin-top:10px;">Your response has been noted with joy. ' +
      'We can\'t wait to celebrate with you.</p></div>';
  });

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
      }
      blessForm.innerHTML = '<div style="text-align:center;padding:18px 0;">' +
        '<div style="font-family:\'Cormorant\',serif;font-size:30px;color:var(--sage-deep);">Thank you.</div>' +
        '<p style="font-style:italic;color:var(--ink-soft);margin-top:8px;">Your blessing means the world to us.</p></div>';
      setTimeout(closeBless, 2000);
    });
  }
})();
