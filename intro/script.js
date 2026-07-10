/* =========================================================================
   PRIYANKA & ARAVIND — site behaviour
   ── EDIT ONLY THIS CONFIG BLOCK to drop in the real details ──────────────
   ========================================================================= */
const CONFIG = {
  // Wedding-weekend schedule (IST; the +05:30 keeps countdowns correct for guests abroad).
  // The countdown section walks through these stages automatically, no reload needed.
  receptionISO:   "2026-07-11T18:30:00+05:30", // Reception begins — countdown #1 target
  cdSwapISO:      "2026-07-11T22:30:00+05:30", // 10:30 PM — switch to the muhurtham countdown
  streamDay2ISO:  "2026-07-12T06:00:00+05:30", // wedding-day stream starts (morning rituals)
  muhurthamISO:   "2026-07-12T10:30:00+05:30", // Muhurtham — countdown #2 target
  recordingsISO:  "2026-07-12T13:00:00+05:30", // celebrations over — offer the recordings
  dateRange:      "11 & 12 July 2026",         // shown in the hero
  rsvpBy:         "30 June 2026",
  liveStreamURL:  "",            // unused — streams are embedded in the Watch Live section
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

  // ---- Countdown (staged: reception → live → muhurtham → live → recordings) ----
  const pad = n => String(n).padStart(2, '0');
  const cd = {
    d: document.getElementById('cd-d'), h: document.getElementById('cd-h'),
    m: document.getElementById('cd-m'), s: document.getElementById('cd-s'),
    grid: document.getElementById('cd'), note: document.getElementById('cd-date'),
    eyebrow: document.getElementById('cd-eyebrow'), live: document.getElementById('cd-live'),
    pulse: document.getElementById('cd-pulse'), pulseLabel: document.getElementById('cd-live-label'),
    btn: document.getElementById('cd-live-btn')
  };
  const T = {
    reception:  new Date(CONFIG.receptionISO),
    swap:       new Date(CONFIG.cdSwapISO),
    stream2:    new Date(CONFIG.streamDay2ISO),
    muhurtham:  new Date(CONFIG.muhurthamISO),
    recordings: new Date(CONFIG.recordingsISO)
  };

  function setCounts(target, now) {
    let diff = Math.max(0, Math.floor((target - now) / 1000));
    const days = Math.floor(diff / 86400); diff %= 86400;
    const hrs = Math.floor(diff / 3600); diff %= 3600;
    cd.d.textContent = pad(days); cd.h.textContent = pad(hrs);
    cd.m.textContent = pad(Math.floor(diff / 60)); cd.s.textContent = pad(diff % 60);
  }
  function cdState(o) {
    cd.grid.hidden = !o.grid;
    cd.live.hidden = !o.live;
    cd.pulse.hidden = !o.pulseText;
    if (o.eyebrow) cd.eyebrow.textContent = o.eyebrow;
    if (o.pulseText) cd.pulseLabel.textContent = o.pulseText;
    if (o.btnText) cd.btn.textContent = o.btnText;
    if (o.note) cd.note.textContent = o.note;
  }

  function tick() {
    const now = window.PA_NOW ? new Date(window.PA_NOW) : new Date();
    if (now < T.reception) {
      setCounts(T.reception, now);
      cdState({ grid: true, eyebrow: 'Counting the days',
        note: 'Until the reception · Saturday 11 July, 6:30 PM' });
    } else if (now < T.swap) {
      cdState({ live: true, eyebrow: 'Happening now',
        pulseText: 'The reception is live', btnText: 'Watch the reception live',
        note: 'Muhurtham tomorrow · Sunday 12 July, 10:30 AM' });
    } else if (now < T.muhurtham) {
      setCounts(T.muhurtham, now);
      const streaming = now >= T.stream2;
      cdState({ grid: true, live: streaming, eyebrow: 'Counting the hours',
        pulseText: streaming ? 'The wedding stream is live' : '',
        btnText: 'Watch the morning rituals',
        note: streaming ? 'Muhurtham at 10:30 AM — the stream is already live'
                        : 'Until the muhurtham · Sunday 12 July, 10:30 AM' });
    } else if (now < T.recordings) {
      cdState({ live: true, eyebrow: 'Happening now',
        pulseText: 'The wedding is live', btnText: 'Watch the muhurtham live',
        note: 'Sunday 12 July · Muhurtham 10:30 AM – 12:00 PM' });
    } else {
      cdState({ live: true, eyebrow: 'The celebrations',
        btnText: 'Watch the recordings',
        note: 'Married on 12 July 2026 — relive both celebrations anytime' });
    }
  }
  // guard: a stale cached index.html won't have the staged-countdown elements
  if (cd.grid && cd.live && cd.pulse && cd.eyebrow && cd.pulseLabel && cd.btn) {
    tick(); setInterval(tick, 1000);
  }

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
