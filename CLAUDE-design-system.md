# Design system — The Caring Group

This file is the brand and UI reference for this codebase. Follow it for all colour,
type, spacing, logo, and copywriting decisions. When a value here conflicts with what
is already in the code, ask before changing existing screens.

## Overview

This is the design system for **The Caring Group**, a multi-location funeral services
company. It is being handed to the **CG Connect** codebase so the app's UI can be built
in the group's brand: its colour tokens, type system, logo rules, voice, and the
Martin Brothers location sub-brand.

CG Connect should be built in the **parent Caring Group brand** (terracotta / ink / cream),
not a location brand. The Martin Brothers material is included because it lives in the same
system and may be needed for location-scoped screens — see "Sub-brand: Martin Brothers".

## About the design files

The files in this bundle are **design references created in HTML** — specimen sheets and
prototypes that document the intended look, wording, and behaviour. They are **not
production code to copy**. The task is to express this system in CG Connect's existing
environment (React/Vue/Tailwind/native — whatever is already there), using its established
component patterns. If CG Connect has no styling layer yet, choose the appropriate approach
for the stack and implement the tokens below as the foundation.

The one file that *is* directly usable is `styles.css` — the root token declaration. Port
those custom properties (or map them to the codebase's token format, e.g. a Tailwind theme
extension) and reference tokens rather than raw hex everywhere.

## Fidelity

**High fidelity.** Colours, typography, and spacing values are final and exact. Recreate
faithfully. The specimen sheets themselves are documentation layouts — do not reproduce
their page layout, only the values and rules they specify.

---

## Design tokens

### Colour — The Caring Group (use these for CG Connect)

| Token | Hex | Use |
|---|---|---|
| `--brand-ink` | `#232A26` | Navigation, footer, headings |
| `--brand-ink-soft` | `#2E3630` | Cards on dark |
| `--brand-ink-light` | `#37423A` | Announcement bar |
| `--accent-primary` | `#C96F53` | Buttons, links, eyebrows (terracotta) |
| `--accent-dark` | `#A6543A` | Hover, stat figures |
| `--accent-soft` | `#EDBB9E` | Accents on dark |
| `--bg-primary` | `#FAF8F2` | Page background (cream) |
| `--bg-secondary` | `#F1EFE8` | Alternating bands |
| `--text-primary` | `#2E332F` | Headings |
| `--text-secondary` | `#5F655E` | Body copy |
| `--brand-sage` | `#71766F` | Muted labels, metadata |

Rules: terracotta is an accent, never a large field. Ink frames the page (nav + footer).
Cream carries the body. Long body copy sits in `--text-secondary`, never in ink or accent.

### Typography

Brand typefaces are licensed: **Baskerville Pro** (serif) and **Forma DJR Display** (sans).
On screen, substitute the Google Fonts equivalents already declared in `styles.css`:

- Serif → **Playfair Display** (`--font-serif`) — names, headings, emotional moments
- Sans → **Archivo** (`--font-sans`) — body, labels, navigation, buttons, forms
- Mono → `--font-mono`: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`

Scale (upper end of each clamp; sizes are fluid on web):

| Role | Family / weight | Size | Line height | Tracking |
|---|---|---|---|---|
| Hero | serif 400 | `clamp(2.85rem, 8vw, 5.75rem)` | 0.98 | −0.035em |
| Section title | serif 400 | `clamp(2.15rem, 4.8vw, 3.5rem)` | 1.06 | −0.025em |
| Card title | serif 500 | `clamp(1.25rem, 2.4vw, 1.65rem)` | 1.2 | — |
| Eyebrow / label | sans 600 | 0.72rem, uppercase | — | 0.16em |
| Body | sans 400 | 1.05rem | 1.72 | — |
| Small / meta | sans 400 | 0.9rem | 1.55 | — |
| Button | sans 500 | 0.95rem | height 46–50px | — |

Rules: headings are serif **400–500 only** — never bold (bold reads as promotional). Never
set long body copy in the serif. Never introduce a third typeface; change size, weight, or
colour instead. Body measure 54–64 characters.

### Shape, elevation, spacing

- **Radius:** 13px on small panels and rules, 16px on cards and code blocks,
  `999px` (pill) on buttons.
- **Shadow:** `0 3px 14px rgba(90,62,48,0.05)` — one soft warm shadow only.
- **Borders:** `1px solid rgba(35,42,38,0.09)` on cards; `rgba(35,42,38,0.07)` on
  table row dividers; `rgba(35,42,38,0.12)` on table header underline.
- **Rule-callout pattern:** cream-secondary panel, 13px radius, `3px` left border in
  terracotta (or sage for a "don't").
- **Section rhythm:** alternating `--bg-primary` / `--bg-secondary` bands; ink for
  navigation and footer only.
- **Minimums:** 16px body text, 44px touch targets.

### Button

Primary: pill, `--accent-primary` background, white text, sans 500 at 0.95rem,
height 46–50px, horizontal padding 26px. Hover moves the fill to `--accent-dark`.

---

## Logo and mark

- The **oak leaf** — split diagonally, with the vein carried through as negative space — is
  the constant across the group. The wordmark changes by location.
- Three background treatments exist; **pick the variant that matches the surface** rather
  than recolouring a file:
  - two-tone terracotta → for cream / white surfaces (primary icon)
  - cream + peach → for dark ink surfaces where the soft half should recede
  - cream + terracotta → for dark surfaces needing more contrast; also works on terracotta
- Horizontal lockup = wordmark with the leaf between the two words, tagline
  **TRUST. LEADERSHIP. CONFIDENCE.** letterspaced beneath.
- **Clear space:** at least the height of the leaf on all sides.
- Use the **leaf alone** where the full lockup would be illegible (favicon, app icon).
- Never redraw or approximate the leaf, stretch, rotate, outline, add shadows, or place it
  on a busy photograph without a scrim.

### Parent vs. location — important for CG Connect

The Caring Group is the **corporate name, not the public one**. Every location trades under
its own name (e.g. Athabasca Community Chapel, Martin Brothers Funeral Services). A
location's site, signage, and stationery carry **that location's** lockup — not the parent
lockup. The parent is credited in text: "A division of The Caring Group".

If CG Connect is internal/corporate, the parent lockup is correct. If any screen represents
a location to the public, use that location's lockup and credit the parent in text.

### Two fixed phrases — do not rewrite either

- **Slogan (public-facing, family-facing):** *Remembering a Life Well Lived* — set in the
  serif, sentence case, exactly as written. For memorial folders, service stationery,
  obituary and tribute material, campaigns.
- **Tagline (corporate):** *TRUST. LEADERSHIP. CONFIDENCE.* — part of the parent lockup,
  addresses the profession, not a grieving family. Never used where the slogan belongs.

### Assets

The logo files are embedded as base64 PNGs inside `foundations/logo-usage.html`
(labelled Asset 20–25). Extract them from there, or request the original vector files from
the brand owner — **vector is strongly preferred for production.**

---

## Voice and tone

Full detail in `foundations/voice-and-tone.html`. The rules that must reach the UI:

- **We do not write sales copy.** Everything is editorial narrative written for one person.
- **Lexicon — never / always:**
  - *cheap, discount, low-cost, deal, budget* → **accessible, mindful of your budget,
    financial transparency**
  - *customers, clients, consumers, the deceased, case* → **our families, the families we
    serve, our neighbours, your family, their name**
  - *standard packages, basic tier, upgrades, add-ons, premium* → **tailored service
    choices, flexible offerings, bespoke details**
  - *process, handle, deal with, manage, execute* → **walk beside you, guide, provide a
    steady hand, protect, look after**
- Also out: *closure*, *moving on*, *the stages of grief*, euphemisms for death, exclamation
  marks, urgency, emoji, superlatives, and industry shorthand (*at-need*, *pre-need*).
  Say **died** and **death** plainly.
- **Canadian spelling** throughout: honour, honouring, neighbour, centre.
- **Paragraphs: two to three sentences maximum.** One idea per block.
- Campaign lines are **not shared** between locations (see below).

### Interface micro-copy — apply to CG Connect's own states

| Moment | Ours | Not ours |
|---|---|---|
| Required field | We'll need a phone number so we can reach you. | This field is required. |
| Form sent | Thank you. We have your note, and we will call you shortly. | Submission successful! |
| Error | Something went wrong on our end. Please call us — we're here now. | An unexpected error occurred. |
| Empty list | No notices are published today. | Sorry, no results found! |
| Empty search | We couldn't find that name. Try a surname on its own. | 0 results matched your query. |
| Loading | One moment. | Loading, please wait… |

---

## Sub-brand: Martin Brothers

Martin Brothers Funeral Services (Lethbridge, since 1907) has its own complete brand layer
inside this system: `martin-brothers/`. **It is scoped to that location only.**

- Its palette is **gold `#B4975A` / ink `#1F2124` / ivory `#FBF9F5`** with
  Cormorant Garamond + Archivo — a different set from the parent's terracotta/cream.
  Tokens are in `martin-brothers/mb.css`, all prefixed `--mb-`.
- **The campaign lines "Because You Lived" and "People You Know. Friends You Trust." belong
  to Martin Brothers alone.** They must never appear under The Caring Group's name or
  another location's name. What *is* shared across the group is the underlying voice
  discipline (the lexicon, the rhythm rules, life-first framing) — not the taglines.
- Radius on MB surfaces is 0–4px, not the parent's 13–16px. Do not mix the two shape
  languages on one screen.

If CG Connect renders location-scoped views, treat this as a **theme**, not a variant of the
parent: swap the full token set (colour, type, radius) together, keyed on location.

---

## Suggested first steps in Claude Code

1. Port the colour and type tokens from `styles.css` into CG Connect's token layer.
2. Load Playfair Display + Archivo, and set the type scale above as the app's scale.
3. Build the base primitives against those tokens: button (pill, terracotta), card
   (16px radius, hairline border, soft warm shadow), section band, eyebrow label.
4. Extract or request vector logo assets; wire the correct variant per background.
5. Apply the lexicon and micro-copy table to every existing string in the app —
   this is usually the largest single change and the most visible.
