# Three design variations — for client review
*Concept: "lit by a lighting designer" — Aravind designs light, so the site behaves like it's lit.*
All three share the same Vetiver & Blush look, content, and full utility. They differ only in **how much motion / bespoke craft** is layered on. Each folder is a complete, standalone site.

## How to view
From this `variations/` folder:
```
python -m http.server 8000
```
then open:
- V1 → http://localhost:8000/v1-polish/
- V2 → http://localhost:8000/v2-signature/
- V3 → http://localhost:8000/v3-cinematic/
(Gallery sample photos load from the internet; the couple's real photos replace them later.)

---

## V1 · Polish  *(safest, lightest)*
Everything we had, refined:
- Hero **warms up** gently on load.
- Slim **scroll-progress** light bar.
- **Add-to-calendar** on each event (Google + .ics).
- Gallery photos **develop** into view; click to enlarge (lightbox).
- Subtle animated countdown.
Feels polished and intentional, still close to a clean template.

## V2 · Signature  *(recommended — most "wow per risk")*
V1 plus the bespoke "lighting designer" signatures:
- **Light-aware hero** — names warm up like a stage light; a soft glow follows the cursor (desktop).
- **Self-drawing kolam** dividers between sections (hand-crafted, unmistakably a Hindu wedding).
- **Scroll-lit timeline** — a glowing point of light travels the events as you scroll; nodes light up.
- **Diya embers** drifting softly behind the hero.
- **Share** the hashtag (one tap, copies a nice message).
- Gallery develop + lightbox, add-to-calendar.
Clearly custom-made. Nothing here comes out of a template. Still fast and easy to use.

## V3 · Cinematic  *(most immersive)*
Everything in V2 plus:
- A skippable **"house-lights" intro** — the screen dims, a spotlight blooms, the names appear, the curtain lifts. Shows once per visit.
- An **ambient music** toggle (soft, off by default, never auto-plays).
Most memorable; a touch more "produced." Best if they want guests to feel an *event* the moment the page opens.

---

## Notes / honesty
- Motion is **reduced-motion-aware** (respects accessibility settings) and **mobile-safe** (heavy effects scale back or disable on touch).
- Gallery currently uses **sample imagery** (clearly labelled) so the develop + lightbox interaction is visible; swap in real photos later.
- The ambient music in V3 is a gentle synthesized drone so the toggle works without an audio file — we can replace it with a recorded veena/nadaswaram clip if the couple prefers.
- After the couple picks one, I fold it back into the main `site/` and we wire RSVP + deploy.

**My recommendation: V2.** It reads as genuinely bespoke without risking "over-produced," and every effect is tied to Aravind's craft rather than decoration for its own sake.
