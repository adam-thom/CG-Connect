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

## Martin Brothers — full brand layer

Martin Brothers Funeral Services, Lethbridge, serving families since 1907. This is a
**complete brand of its own**, not a colour variant of the parent. Where a CG Connect
screen represents Martin Brothers, swap the whole token set together — colour, type, and
radius — keyed on location. Never mix the two shape or colour languages on one screen.

### MB colour tokens

| Token | Hex | Use |
|---|---|---|
| `--mb-ink` | `#1F2124` | Navigation, footer, hero overlays, campaign panels |
| `--mb-ink-soft` | `#2A2D31` | Urgent bar, cards on dark |
| `--mb-gold` | `#B4975A` | Monogram, eyebrows, keylines, small marks. **Never a large fill** |
| `--mb-gold-deep` | `#8E7440` | Links and eyebrow text on light backgrounds |
| `--mb-gold-soft` | `#E4D3AE` | Gold on dark — kickers and marks inside ink panels |
| `--mb-ivory` | `#FBF9F5` | Page background; also text colour on ink |
| `--mb-stone` | `#F2EFE9` | Alternating bands, quiet panels |
| `--mb-text` | `#2A2C2F` | Headings on light backgrounds |
| `--mb-text-2` | `#5E6167` | Body copy |
| `--mb-muted` | `#8A8578` | Dates, addresses, metadata, captions |
| `--mb-line` | `rgba(31,33,36,.10)` | Hairline borders |

Gold is an accent and a keyline, never a field. Ink frames the page top and bottom; ivory
carries the body. Long paragraphs never sit in gold or ink.

### MB typography

- Serif: **Cormorant Garamond** (`--mb-serif`) — headlines, campaign lines, names, pull
  quotes, section titles. Weight 400 almost always; the elegance comes from size and space,
  not weight. Never below 20px.
- Sans: **Archivo** (`--mb-sans`) — body, navigation, buttons, forms, captions, eyebrows.
  Shared with the parent, which keeps a family resemblance across locations.

| Role | Family / weight | Size | Line height | Tracking |
|---|---|---|---|---|
| Display | Cormorant 400 | 64px | 64px | −1.5% |
| Section | Cormorant 400 | 42px | 46px | — |
| Sub | Cormorant 400 | 28px | 34px | — |
| Eyebrow | Archivo 600 | 12px, uppercase | 16px | 0.22em |
| Body | Archivo 400 | 16px | 28px | — |
| Caption | Archivo 400 | 13px | 21px | — |

### MB shape and layout

- **Radius 0–4px throughout.** Rounded, bubbly shapes read as consumer software; this brand
  reads as printed matter. (The parent's 13–16px radius does not apply here.)
- Shadow: `0 2px 10px rgba(60,48,28,.04)` — barely there.
- Hairlines, not boxes: sections separate with a 1px rule or a change of background, not
  cards and shadows. A short gold keyline may mark the start of a section.
- Alternating bands: ivory, then stone, then ivory. Ink for navigation, the campaign panel,
  and the footer only.
- Content measure 1180px, 80px desktop margins / 24px mobile. Body copy never wider than
  66 characters.
- One focal point per section. Motion: fades and slow reveals under 400ms; nothing bounces,
  slides fast, or auto-plays with sound.
- Buttons: 2px radius, gold fill with ink text (primary), or a 1px `rgba(251,249,245,.45)`
  ghost outline on dark. Padding 14px/30px, Archivo 600 at 13px, 0.05em tracking.

### The three MB anchors

Each answers a different question a family is quietly asking. Use the one that fits the
moment; do not stack all three.

1. **Because You Lived** — the emotional anchor. Answers *why does this matter?* Puts the
   person first and the service second. For hero lines, celebration-of-life copy, tribute
   material, the emotional close of a page.
2. **People You Know. Friends You Trust.** — the relationship anchor. Answers *who am I
   calling?* Neighbours, not a company. For about and team pages, careers, community
   sponsorship, local advertising.
3. **Serving Lethbridge Since 1907** — the proof anchor. Answers *can I rely on them?* A
   date does the reassuring so no adjective has to. For eyebrows, footers, the About story,
   first-time-visitor pages.

**These campaign lines belong to Martin Brothers alone.** They must never appear under The
Caring Group's name or another location's name. What is shared across the group is the
underlying voice discipline — the lexicon, the rhythm rules, life-first framing — not the
taglines. Use at most **one anchor per page**, and never place a campaign line next to a
call to action.

### MB narrative triad

Every piece of copy should be able to name which of these it is doing. If it does none, it
is filler.

- **Story** — the life, not the logistics. Write about ordinary moments. Specific, small,
  sensory detail carries more weight than any tribute adjective. Never abstract a person
  into "your loved one" when a detail is available.
- **Community** — neighbours in Southern Alberta. Speak as someone who lives here. Name the
  coulees, the Oldman River valley, the chapel on 13 Street North.
- **Privilege** — stewardship, not entitlement. Families choose us; we never assume, expect,
  or claim them. Use *honoured*, *entrusted*, *invited* — never *leading*, *premier*,
  *number one*.

### Saying the heritage

1907 is the most powerful fact and the easiest to say badly. Test: does it sound like
something the community gave us, or something we are claiming over others?

**Approved**
- Serving Lethbridge since 1907.
- Four generations of one family, in one city.
- Ben Martin arrived in Lethbridge in 1904; by 1907 he was in this profession.
- A century of families have trusted us with their stories. It remains a privilege.
- The oldest funeral home in the region — which mostly means we have been here long enough
  to know the families we serve.

**Never**
- Lethbridge's most trusted funeral home since 1907.
- Over 115 years of industry leadership.
- The name Lethbridge has relied on for generations.
- Nobody knows funeral care in Southern Alberta like we do.
- Proudly the #1 choice for Lethbridge families.

### MB message hierarchy

- **Promise:** Because You Lived. A life happened here and it deserves to be marked.
- **Pillars:** *A century of trust* (can I rely on you) · *Neighbours, not a company* (who
  am I calling) · *Your choices, clearly priced* (can I do this my way, and afford it).
- **Proof we use:** 1907 · four generations · the largest chapel in Lethbridge · all faiths
  and cultures · 24/7, 365 · grief care open to the whole city · after-care and subsidy
  guidance · green burial.
- **Proof we never use:** rankings, review counts as a boast, competitor comparisons, "#1",
  "premier", "award-winning", volume figures.

### MB headline and action library

| Element | Ours | Not ours |
|---|---|---|
| Eyebrow | Lethbridge Funeral Home Since 1907. · Honouring Every Life · Reviews & Testimonies | Welcome! · Discover more · Our difference |
| Hero headline | Because You Lived · People You Know. Friends You Trust. · Serving Lethbridge Since 1907. | Your Trusted Partner in End-of-Life Solutions |
| Section headline | Our Founding Story · Funeral & Cremation Services in Lethbridge · What Lethbridge Families are Saying | Why Choose Us? · Our Value Proposition |
| Primary action | View Our Services · Reach Out To Us · Explore Details · Speak With Someone Now | Get a Quote · Buy Now · Submit · Learn More |
| Quiet action | View All · Read Their Story · Send Flowers · Share a Memory | Click here · See our packages |
| Punctuation | Full stops in headlines are welcome — they slow the reader down | Ellipses · exclamation marks · emoji |

### MB standing lines — use verbatim

- **Availability:** We are available 24/7, 365 days a year. *(always paired with the phone
  number, never alone)*
- **First contact:** We will begin the process of bringing your loved one into our care
  right away.
- **Grief care:** You don't have to have walked through our doors before to find a seat at
  our table now. *(grief care is open to the whole city, free)*
- **Inclusion:** We serve families of all faiths and cultures across Southern Alberta.
- **Cost:** We will show you what each choice costs before you decide anything. *(replaces
  every instance of "affordable options")*
- **Pace:** There is no hurry. We will move at whatever speed suits your family.

Phone: (403) 328-2361.

### MB page architecture

The standard descent. Not every page uses every band, but the order never changes.

1. **Urgent bar** — 24 hours a day, 365 days a year, plus the tappable phone number, on
   every page.
2. **Navigation** — ink. Monogram left, six items maximum, the call action always visible
   right.
3. **Hero** — full-bleed photograph, ink veil, gold eyebrow, serif headline, **one** action.
   Scroll cue lower right. If a second action is unavoidable it is a ghost button — never
   two golds competing.
4. **Opening statement** — ivory. Two or three sentences on what this page is for.
5. **Recent obituaries** — stone. Four portraits, name and years, nothing else. The
   most-visited section.
6. **Services** — ivory. Split image and text, or a plain list with an honest one-line
   description each.
7. **Facilities** — four rooms, photographed empty.
8. **Trust marks** — a slow, quiet ticker. No claims attached.
9. **Resources** — grief and planning articles, three at a time, with a real excerpt.
10. **Families' words** — three short attributed quotes from real reviews. Never a star
    rating or a count.
11. **Contact** — stone. The availability line, the first-contact reassurance, one action.
12. **Footer** — ink. Locations, hours, the 1907 line.

### MB interface micro-copy

| Moment | Ours | Not ours |
|---|---|---|
| Contact form intro | Tell us as much or as little as you'd like. Someone will call you back today. | Complete the form below and a representative will be in touch. |
| Required field | We'll need a phone number so we can reach you. | This field is required. |
| Form sent | Thank you. We have your note, and we will call you shortly. | Submission successful! |
| Error | Something went wrong on our end. Please call us at (403) 328-2361 — we're here now. | An unexpected error occurred. Please try again later. |
| No obituaries | No notices are published today. | Sorry, no results found! |
| Empty search | We couldn't find that name. Try a surname on its own, or call us and we'll look for you. | 0 results matched your query. |
| Loading | One moment. | Loading, please wait… |
| Cookie notice | We use a small number of cookies to keep the site working. | We value your privacy! Accept all cookies for the best experience. |

### MB monogram

The engraved **MB** monogram is the primary mark. Clear space of at least the monogram's own
height on every side. Gold on ink is primary; ink on ivory is the alternate — no other colour
pairs. One mark per surface: if the monogram is in the header, the footer uses the wordmark
alone. Never place it on a photograph without a solid ink panel beneath, and never stretch,
outline, shadow, rotate, or animate it. *(Production artwork is not yet in the system.)*

### MB photography

Documentary, warm, quiet. Real staff, real rooms, real Southern Alberta light. Hands and
gestures rather than posed faces. Keep the grade warm and slightly desaturated so gold and
ivory sit naturally inside the photograph. Give heritage images an honest caption — a year,
a place, a name. **Never** stock grief imagery (crying models, silhouettes at sunset, doves,
clasped hands on white), and never text over a busy area of a photograph.

### MB hard rules

- Keep the phone number reachable at every scroll position on mobile — it is the most
  important element.
- Obituaries findable in one tap from anywhere; it is the majority of traffic.
- Minimum 44px touch targets and 16px body text. Many families read on a phone, at night,
  in distress.
- No pop-ups, chat bubbles, newsletter interstitials, or exit intent anywhere.
- No auto-play video with sound; no animation on obituary pages.
- Never put pricing behind a form — transparency is a brand pillar.
- Never use a family's grief as marketing. Testimonials and photographs run only with
  explicit permission, and never as a boast.

### MB persona, for AI-assisted copy

Give this frame verbatim before anything else:

- **Role.** You are the lead copywriter and brand voice custodian for Martin Brothers
  Funeral Services, Lethbridge, serving families since 1907.
- **Philosophy.** All communication is human interaction. You do not write sales copy; you
  write editorial narrative that protects a family's story.
- **Lexicon check.** Before returning any text, verify no forbidden transactional word
  appears. If one does, rewrite the sentence with the approved vocabulary.
- **Formatting.** Two to three sentences per paragraph. Clear hierarchy, generous negative
  space, one idea per block.
- **Campaign lines.** Because You Lived and People You Know. Friends You Trust. belong to
  Martin Brothers alone. Use at most one per piece, and only where it lands naturally.
- **Never.** Emoji, exclamation marks, urgency, superlatives, competitor comparison, or
  telling a family how to feel.

---

## Suggested first steps in Claude Code

1. Port the colour and type tokens from `styles.css` into CG Connect's token layer.
2. Load Playfair Display + Archivo, and set the type scale above as the app's scale.
3. Build the base primitives against those tokens: button (pill, terracotta), card
   (16px radius, hairline border, soft warm shadow), section band, eyebrow label.
4. Extract or request vector logo assets; wire the correct variant per background.
5. For Martin Brothers screens, define the `--mb-*` token set as a separate theme and
   switch the whole set together — colour, type, and radius — keyed on location.
6. Apply the lexicon and micro-copy table to every existing string in the app —
   this is usually the largest single change and the most visible.
