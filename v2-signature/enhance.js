/* =========================================================================
   ENHANCE LAYER  — feature-flagged. Edit FEATURES per variant.
   "Lit by a lighting designer." Vanilla, performant, reduced-motion aware.
   ========================================================================= */
const FEATURES = {
  scrollProgress:   true,
  heroWarmup:       'full',   // 'full' | 'subtle' | false
  cursorGlow:       true,
  kolamDividers:    true,
  scrollLitTimeline:true,
  embers:           true,
  animatedCountdown:true,
  addToCalendar:    true,
  shareHashtag:     true,
  galleryDevelop:   true,
  galleryDemoImages:true,
  lightbox:         true,
  musicToggle:      false,
  introSequence:    false,
};

(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const EVENTS = [
    { title: 'Reception — Priyanka & Aravind', start: '20260711T130000Z', end: '20260711T163000Z',
      loc: 'Mayor Ramanathan Centre, RA Puram, Chennai', desc: 'Reception. Dress code: casual & smart-casual.' },
    { title: 'Muhurtham — Priyanka & Aravind', start: '20260712T013000Z', end: '20260712T033000Z',
      loc: 'Mayor Ramanathan Centre, RA Puram, Chennai', desc: 'The wedding ceremony. Dress code: traditional attire.' },
  ];

  /* ---- Neutralize placeholder '#' links (no jump-to-top) ---- */
  $$('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));

  /* ---- Scroll progress ---- */
  if (FEATURES.scrollProgress) {
    const bar = document.createElement('div'); bar.className = 'fx-progress'; document.body.appendChild(bar);
    const upd = () => { const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%'; };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* ---- Hero warm-up ---- */
  if (FEATURES.heroWarmup && !RM) {
    document.body.classList.add(FEATURES.heroWarmup === 'subtle' ? 'fx-warmup-subtle' : 'fx-warmup');
  }

  /* ---- Cursor-follow glow ---- */
  if (FEATURES.cursorGlow && finePointer && !RM) {
    const hero = $('.hero');
    if (hero) {
      hero.classList.add('fx-glow-host');
      const g = document.createElement('div'); g.className = 'fx-glow'; hero.appendChild(g);
      let tx = 0, ty = 0, raf = null;
      const move = e => { const r = hero.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(() => { g.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`; raf = null; }); };
      hero.addEventListener('mouseenter', () => g.classList.add('on'));
      hero.addEventListener('mouseleave', () => g.classList.remove('on'));
      hero.addEventListener('mousemove', move);
    }
  }

  /* ---- Self-drawing kolam dividers ---- */
  if (FEATURES.kolamDividers) {
    const kolamSVG = () => {
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 120 120');
      const petal = 'M60 16 C78 40 78 60 60 78 C42 60 42 40 60 16Z';
      for (let i = 0; i < 8; i++) { const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', petal); p.setAttribute('class', 'k1');
        p.setAttribute('transform', `rotate(${i * 45} 60 60)`); svg.appendChild(p); }
      const inner = 'M60 34 C70 47 70 60 60 72 C50 60 50 47 60 34Z';
      for (let i = 0; i < 8; i++) { const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', inner); p.setAttribute('class', 'k2');
        p.setAttribute('transform', `rotate(${i * 45 + 22.5} 60 60)`); svg.appendChild(p); }
      const ring = document.createElementNS(NS, 'circle'); ring.setAttribute('cx', 60); ring.setAttribute('cy', 60);
      ring.setAttribute('r', 50); ring.setAttribute('class', 'k3'); svg.appendChild(ring);
      const dot = document.createElementNS(NS, 'circle'); dot.setAttribute('cx', 60); dot.setAttribute('cy', 60);
      dot.setAttribute('r', 3.4); dot.setAttribute('class', 'dot'); svg.appendChild(dot);
      return svg;
    };
    const place = ['#families', '#venue', '#registry', '#faq'];
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .3 });
    place.forEach(sel => { const sec = $(sel); if (!sec) return;
      const wrap = document.createElement('div'); wrap.className = 'fx-kolam'; wrap.appendChild(kolamSVG());
      sec.parentNode.insertBefore(wrap, sec);
      $$('path,circle', wrap).forEach(p => { if (p.classList.contains('dot')) return;
        try { const len = p.getTotalLength(); p.style.setProperty('--len', Math.ceil(len)); } catch (_) {} });
      io.observe(wrap);
    });
  }

  /* ---- Scroll-lit timeline ---- */
  if (FEATURES.scrollLitTimeline && !RM) {
    const tl = $('.tl');
    if (tl) {
      tl.classList.add('fx-lit');
      const dot = document.createElement('div'); dot.className = 'fx-lit-dot'; tl.appendChild(dot);
      const evs = $$('.ev', tl);
      let raf = null;
      const upd = () => {
        raf = null;
        const r = tl.getBoundingClientRect();
        const mid = innerHeight * 0.5;
        let p = (mid - r.top) / r.height; p = Math.max(0, Math.min(1, p));
        tl.style.setProperty('--lit', (p * 100).toFixed(2));
        dot.style.top = (p * tl.clientHeight) + 'px';
        const litY = p * tl.clientHeight;
        evs.forEach(ev => { const node = $('.node', ev); const ny = node ? node.offsetTop : ev.offsetTop;
          ev.classList.toggle('lit', ny <= litY + 6); });
      };
      addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
      addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
      upd();
    }
  }

  /* ---- Diya embers ---- */
  if (FEATURES.embers && !RM) {
    const host = $('.hero');
    if (host) {
      const cv = document.createElement('canvas'); cv.className = 'fx-embers'; host.appendChild(cv);
      const ctx = cv.getContext('2d'); let W, H, parts = [];
      const DPR = Math.min(devicePixelRatio || 1, 2);
      const resize = () => { W = cv.width = host.clientWidth * DPR; H = cv.height = host.clientHeight * DPR;
        cv.style.width = host.clientWidth + 'px'; cv.style.height = host.clientHeight + 'px'; };
      resize(); addEventListener('resize', resize);
      const N = Math.min(26, Math.round(host.clientWidth / 46));
      for (let i = 0; i < N; i++) parts.push({ x: Math.random() * W, y: Math.random() * H,
        r: (1 + Math.random() * 2.2) * DPR, s: (0.15 + Math.random() * 0.5) * DPR,
        a: 0.15 + Math.random() * 0.45, dx: (Math.random() - 0.5) * 0.3 * DPR, t: Math.random() * 6.28 });
      let run = true;
      const draw = () => { if (!run) return; ctx.clearRect(0, 0, W, H);
        parts.forEach(p => { p.y -= p.s; p.t += 0.01; p.x += p.dx + Math.sin(p.t) * 0.25 * DPR;
          if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          g.addColorStop(0, `rgba(233,184,110,${p.a})`); g.addColorStop(1, 'rgba(233,184,110,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.28); ctx.fill(); });
        requestAnimationFrame(draw); };
      // pause when hero scrolled away
      new IntersectionObserver(es => { run = es[0].isIntersecting; if (run) draw(); }, { threshold: 0 }).observe(host);
      draw();
    }
  }

  /* ---- Animated countdown ---- */
  if (FEATURES.animatedCountdown && !RM) {
    ['cd-d', 'cd-h', 'cd-m', 'cd-s'].forEach(id => { const el = document.getElementById(id); if (!el) return;
      const mo = new MutationObserver(() => { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); });
      mo.observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  /* ---- Add to calendar ---- */
  if (FEATURES.addToCalendar) {
    const icsURI = ev => {
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PA//wedding//EN', 'BEGIN:VEVENT',
        'UID:' + ev.start + '@pa-wedding', 'DTSTAMP:' + ev.start, 'DTSTART:' + ev.start, 'DTEND:' + ev.end,
        'SUMMARY:' + ev.title, 'LOCATION:' + ev.loc, 'DESCRIPTION:' + ev.desc, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      return 'data:text/calendar;charset=utf8,' + encodeURIComponent(ics);
    };
    const gcal = ev => 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
      encodeURIComponent(ev.title) + '&dates=' + ev.start + '/' + ev.end +
      '&details=' + encodeURIComponent(ev.desc) + '&location=' + encodeURIComponent(ev.loc);
    $$('.ev-card').forEach((card, i) => { const ev = EVENTS[i]; if (!ev) return;
      const more = $('.ev-more', card); if (!more) return;
      const row = document.createElement('div'); row.className = 'fx-cal';
      const a1 = document.createElement('a'); a1.href = gcal(ev); a1.target = '_blank'; a1.rel = 'noopener'; a1.textContent = 'Google Calendar';
      const a2 = document.createElement('a'); a2.href = icsURI(ev); a2.download = ev.title.replace(/[^a-z0-9]+/gi, '-') + '.ics'; a2.textContent = 'Apple / Outlook (.ics)';
      // prevent the card toggle from collapsing when clicking a link
      [a1, a2].forEach(a => a.addEventListener('click', e => e.stopPropagation()));
      row.appendChild(a1); row.appendChild(a2); more.appendChild(row);
    });
  }

  /* ---- Share hashtag ---- */
  if (FEATURES.shareHashtag) {
    const foot = $('footer .hash');
    if (foot) {
      const btn = document.createElement('button'); btn.className = 'fx-share'; btn.type = 'button';
      btn.innerHTML = 'Share &nbsp;#PRIDestinedForAravind';
      foot.insertAdjacentElement('afterend', btn);
      const toast = document.createElement('div'); toast.className = 'fx-toast'; toast.textContent = 'Link copied'; document.body.appendChild(toast);
      btn.addEventListener('click', async () => {
        const text = 'Priyanka & Aravind · 11 & 12 July 2026 · #PRIDestinedForAravind';
        const url = location.href.split('#')[0];
        try { if (navigator.share && matchMedia('(pointer: coarse)').matches) { await navigator.share({ title: 'Priyanka & Aravind', text, url }); return; } } catch (_) {}
        try { await navigator.clipboard.writeText(text + ' ' + url); } catch (_) {}
        toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800);
      });
    }
  }

  /* ---- Gallery: demo images + develop + lightbox ---- */
  const cells = $$('.gal .cell');
  if (FEATURES.galleryDemoImages && cells.length) {
    cells.forEach((c, i) => { const img = document.createElement('img'); img.loading = 'lazy';
      img.src = `https://picsum.photos/seed/pa-wed-${i + 1}/700/800`; img.alt = 'Sample photograph';
      const lbl = $('.lbl', c); c.insertBefore(img, lbl || null); c.classList.add('has-img'); });
  }
  if (FEATURES.galleryDevelop && cells.length) {
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('developed'); io.unobserve(e.target); } }), { threshold: .2 });
    cells.forEach(c => { c.classList.add('fx-dev'); io.observe(c); });
  }
  if (FEATURES.lightbox && cells.length) {
    const box = document.createElement('div'); box.className = 'fx-lightbox';
    box.innerHTML = '<span class="x" role="button" aria-label="Close" tabindex="0">&times;</span><img alt="">'; document.body.appendChild(box);
    const big = $('img', box); let lastFocus = null;
    const close = () => { box.classList.remove('open'); if (lastFocus) lastFocus.focus(); };
    const open = (img, cell) => { lastFocus = cell; big.src = img.src; big.alt = img.alt || 'Photograph'; box.classList.add('open'); };
    box.addEventListener('click', e => { if (e.target === box || e.target.classList.contains('x')) close(); });
    $('.x', box).addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close(); } });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    cells.forEach(c => { const img = $('img', c); if (!img) return;
      c.tabIndex = 0; c.setAttribute('role', 'button'); c.setAttribute('aria-label', 'View photograph');
      const fire = () => open(img, c);
      c.addEventListener('click', fire);
      c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); } });
    });
  }

  /* ---- Ambient music (Web Audio drone; opt-in) ---- */
  if (FEATURES.musicToggle) {
    const btn = document.createElement('button'); btn.className = 'fx-music'; btn.type = 'button'; btn.setAttribute('aria-label', 'Toggle ambient music');
    btn.innerHTML = '<span class="lbl">Ambient music</span><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span>';
    document.body.appendChild(btn);
    let ctx, master, nodes = [], playing = false;
    const start = () => {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(master);
      [146.83, 220, 293.66].forEach((f, i) => { const o = ctx.createOscillator(); o.type = i === 2 ? 'triangle' : 'sine';
        o.frequency.value = f; const g = ctx.createGain(); g.gain.value = i === 2 ? 0.18 : 0.34; o.connect(g); g.connect(lp); o.start(); nodes.push(o); });
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12; const lg = ctx.createGain(); lg.gain.value = 0.04;
      lfo.connect(lg); lg.connect(master.gain); lfo.start(); nodes.push(lfo);
      master.gain.linearRampToValueAtTime(0.10, ctx.currentTime + 2.5);
      playing = true; btn.classList.add('playing');
    };
    const stop = () => { if (!ctx) return; master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      setTimeout(() => { nodes.forEach(n => { try { n.stop(); } catch (_) {} }); nodes = []; }, 850);
      playing = false; btn.classList.remove('playing'); };
    btn.addEventListener('click', () => playing ? stop() : start());
  }

  /* ---- House-lights intro ---- */
  if (FEATURES.introSequence && !RM && !sessionStorage.getItem('pa-intro')) {
    sessionStorage.setItem('pa-intro', '1');
    const ov = document.createElement('div'); ov.className = 'fx-intro';
    ov.innerHTML = '<div class="spot"></div>' +
      '<div class="iname">Priyanka<span class="amp">&amp;</span>Aravind</div>' +
      '<button class="iskip" type="button">Skip &rsaquo;</button>';
    document.body.appendChild(ov); document.body.classList.add('fx-introlock');
    const done = () => { ov.classList.add('lift'); document.body.classList.remove('fx-introlock');
      setTimeout(() => ov.remove(), 1100); };
    $('.iskip', ov).addEventListener('click', done);
    setTimeout(done, 3200);
  }
})();
