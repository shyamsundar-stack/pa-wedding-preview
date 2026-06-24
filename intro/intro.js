/* =====================================================================
   Cinematic envelope-open intro (real video)  +  hero looped-video fade-in
   Vetiver & Blush · self-contained (no dependencies). Load before </body>.

   - assets/video/intro-envelope.mp4 plays once per visit (sessionStorage),
     then dissolves into the hero as its white-light burst peaks.
   - Autoplays muted (reliable); offers Skip + a Play-sound toggle. If a
     browser blocks autoplay, a "tap to open" prompt appears (the tap also
     unmutes, since it's a user gesture).
   - Disabled entirely for prefers-reduced-motion.
   - Any load error → skip straight to the hero (graceful fallback).

   Turn the intro off with PA_INTRO = false.
   ===================================================================== */
(function () {
  var PA_INTRO = true;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- hero looped-video background (separate, optional file) ---- */
  var hero = document.querySelector('.hero');
  var bg   = document.querySelector('.hero-bg');
  if (hero && bg) {
    // phones get a portrait couple slideshow that fills the screen edge-to-edge
    if (window.matchMedia && matchMedia('(max-width: 768px)').matches) {
      var hsrc = bg.querySelector('source');
      if (hsrc) hsrc.src = 'assets/video/hero-mobile.mp4';
      bg.setAttribute('poster', 'assets/img/hero-poster-m.jpg');
      bg.load();
    }
    // reduced motion: don't autoplay the couple clip — hold its poster still
    if (RM) { bg.removeAttribute('autoplay'); bg.removeAttribute('loop'); }
    var reveal = function () { hero.classList.add('has-video'); if (RM) { try { bg.pause(); } catch (e) {} } };
    if (bg.readyState >= 2) reveal();
    else bg.addEventListener('loadeddata', reveal, { once: true });
    bg.addEventListener('error', function () {}, { once: true }); // no file → hero as designed
  }

  /* ---- envelope intro ----
     CLIENT-PREVIEW BUILD: replays on every page load (refresh to rewatch).
     The production site/ keeps the once-per-visit sessionStorage guard. */
  if (!PA_INTRO || RM) return;

  // pick the vertical clip on phones, the landscape clip on wider screens
  var portrait  = window.matchMedia && matchMedia('(max-width: 768px)').matches;
  var vidSrc    = portrait ? 'assets/video/intro-envelope-portrait.mp4' : 'assets/video/intro-envelope.mp4';
  var vidPoster = portrait ? 'assets/img/intro-poster-portrait.jpg'     : 'assets/img/intro-poster.jpg';

  var ov = document.createElement('div');
  ov.className = 'pa-intro';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-label', 'Wedding invitation');
  ov.innerHTML =
      '<video class="pa-vid" playsinline muted autoplay preload="auto" ' +
             'poster="' + vidPoster + '">' +
        '<source src="' + vidSrc + '" type="video/mp4">' +
      '</video>' +
      '<div class="pa-flash"></div>' +
      '<button class="pa-skip" type="button">Skip &rsaquo;</button>' +
      '<div class="pa-tap" role="button" tabindex="0" aria-label="Open the invitation">' +
        '<span class="dot">&#10022;</span><span>Open the invitation</span></div>';

  document.body.appendChild(ov);
  document.body.classList.add('pa-lock');

  var vid  = ov.querySelector('.pa-vid');
  var skip = ov.querySelector('.pa-skip');
  var bloomed = false, done = false;

  // Stage 1: the clip's burst blooms to full blinding white.
  function bloom() {
    if (bloomed || done) return;
    bloomed = true;
    ov.classList.add('blooming');          // white veil fades in over ~.55s
    setTimeout(dissipate, 700);            // hold an instant, then dissolve
  }
  // Stage 2: the white dissipates and the hero comes to life beneath.
  function dissipate() {
    if (done) return;
    done = true;
    ov.classList.add('gone');              // whole overlay (white) fades to reveal hero
    document.body.classList.remove('pa-lock');
    try { vid.pause(); } catch (e) {}
    setTimeout(function () { ov.remove(); }, 1200);
  }

  // bloom into white as the burst peaks (just before the trimmed end)
  vid.addEventListener('timeupdate', function () {
    if (vid.duration && vid.currentTime >= vid.duration - 0.5) bloom();
  });
  vid.addEventListener('ended', bloom);
  vid.addEventListener('error', dissipate); // missing/broken file → straight to hero

  // try to autoplay (muted); if blocked, invite a tap (which also unmutes)
  var attempt = vid.play && vid.play();
  if (attempt && attempt.catch) {
    attempt.catch(function () { ov.classList.add('blocked'); });
  }

  // the entry is silent — the video stays muted always (no audio to cut off)
  function startPlayback() {
    if (done) return;
    ov.classList.remove('blocked');
    vid.muted = true;
    vid.play();
  }

  skip.addEventListener('click', function (e) { e.stopPropagation(); dissipate(); });

  // if autoplay was blocked, a tap starts the (muted) clip
  ov.addEventListener('click', function (e) {
    if (e.target === skip) return;
    if (vid.paused || ov.classList.contains('blocked')) startPlayback();
  });
})();
