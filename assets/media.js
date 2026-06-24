/* ============================================================
   PA Wedding — gallery lightbox
   Enhances <a class="gcell" href="full.jpg"><img src="thumb.jpg"></a>
   inside #gallery. Without JS the links still open the full image.
   Keyboard: Esc close, ←/→ navigate. Touch: swipe. Focus-trapped-ish.
   ============================================================ */
(function () {
  var cells = Array.prototype.slice.call(document.querySelectorAll('#gallery .gcell'));
  if (!cells.length) return;

  var srcs = cells.map(function (c) { return c.getAttribute('href'); });
  var alts = cells.map(function (c) { var i = c.querySelector('img'); return i ? i.alt : ''; });

  var lb = document.createElement('div');
  lb.className = 'pa-lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Photo viewer');
  lb.innerHTML =
    '<button class="pa-x" type="button" aria-label="Close">×</button>' +
    '<button class="pa-nav pa-prev" type="button" aria-label="Previous photo">‹</button>' +
    '<img alt="">' +
    '<button class="pa-nav pa-next" type="button" aria-label="Next photo">›</button>' +
    '<div class="pa-count"></div>';
  document.body.appendChild(lb);

  var img = lb.querySelector('img');
  var countEl = lb.querySelector('.pa-count');
  var idx = 0, lastFocus = null;

  function show(i) {
    idx = (i + srcs.length) % srcs.length;
    img.src = srcs[idx];
    img.alt = alts[idx] || ('Photo ' + (idx + 1));
    countEl.textContent = (idx + 1) + ' / ' + srcs.length;
    [idx + 1, idx - 1].forEach(function (n) { var p = new Image(); p.src = srcs[(n + srcs.length) % srcs.length]; });
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.pa-x').focus();
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  cells.forEach(function (c, i) {
    c.setAttribute('role', 'button');
    c.setAttribute('tabindex', '0');
    c.addEventListener('click', function (e) { e.preventDefault(); open(i); });
    c.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  lb.querySelector('.pa-x').addEventListener('click', close);
  lb.querySelector('.pa-prev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  lb.querySelector('.pa-next').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
  });

  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
