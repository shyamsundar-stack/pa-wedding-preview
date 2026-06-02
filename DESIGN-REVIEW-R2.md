# Design Review — Round 2 (three variations)
*gstack /design-review + Taste + frontend-design lens · 2 June 2026 · classifier: Marketing/Landing (editorial)*

Audited the enhancement layer (the new motion + bespoke modules) across V1/V2/V3 via live runtime checks.

## Scores
- **Design Score: A** (V2/V3), **A−** (V1) — the concept ("lit by a lighting designer") now reads as clearly bespoke.
- **AI-Slop Score: A** — still passes; motion is meaning-driven, not decoration.

## Findings & fixes (this round — all applied & verified)
| # | Impact | Finding | Fix |
|---|--------|---------|-----|
| R2-1 | Medium · A11y | Gallery image cells were click-only (0/6 keyboard-focusable) | Cells now `role=button`, `tabindex=0`, Enter/Space open the lightbox |
| R2-2 | Medium · A11y | Lightbox had no focus return / close-key on the X | Focus returns to the cell on close; X is keyboard-operable; image gets a real `alt` |
| R2-3 | Low · Visual | "Photo NN" labels overlapped the sample images | Labels hidden once a cell has an image |
| R2-4 | Low · UX | Placeholder `href="#"` links (concierge, registry, live) jumped to top on click | Global guard: dead `#` links no longer scroll-jump |
| R2-5 | Medium · Share/SEO | No Open Graph tags — links showed no preview when shared (WhatsApp) | Added OG + Twitter card meta + a custom 1200×630 **share image** per variant |
| R2-6 | — | (noted) Skip-to-content link absent | CSS in place; left as optional P3 (deferred) |

## Verified good
- **Reduced-motion**: embers + cursor-glow disabled, kolam shown static, intro skipped — confirmed in CSS + JS guards.
- **Performance**: embers capped (~26 particles, DPR≤2), paused when hero off-screen; audio only on user toggle; 548 DOM nodes (light).
- **No autoplay**: music is opt-in; intro is skippable + once-per-session.
- **Interaction integrity**: event cards `aria-expanded`, calendar links stop card-collapse, music/share are real `<button>`s.
- Contrast (eyebrows), tabular countdown, text-wrap balance/pretty — carried over from round 1, still passing.

## Still deferred (content, not craft)
RSVP-by date · Give-Back cause + link · family names · bios · live-stream link · hotels · concierge numbers · real photos. (These are exactly what the new **feedback form** collects.)

**Verdict:** all three are ship-quality. V2 remains the recommendation.
