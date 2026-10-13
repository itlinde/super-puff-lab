# The Super Puff Lab — SPEC

Oct 13, 2026 · @isabella · Source of truth for every build session. Anything not covered here: ask, don't guess.

## 1. Purpose and audience

| Item | Decision |
| --- | --- |
| What it is | An unsolicited **concept piece** by Isabella Linde, sent to someone on Aritzia's software team. Demonstrates fast prototyping, product ideas, and comfort with AI-assisted development. |
| In-world purpose | A digital environment to explore The Super Puff™ and its variants, for online shoppers without store access who are confused by the range. |
| One action | Find the right Super Puff and click through to it on aritzia.com. |
| First impression | Elevated, polished, minimal. **Not** techy or bubbly. |
| Voice | Aritzia's copy, verbatim, wherever it exists. Don't write marketing copy; where none exists, use `[COPY: …]` and flag it. |
| Concept labelling | The site must never pass as official. Footer credits Isabella and states "not affiliated with Aritzia". Deploy at an unlisted URL with `noindex`. |

## 2. References

| Reference | What to take | Status |
| --- | --- | --- |
| `references/desktop-4.png` (Isabella's mockup) | Flat light-grey background and overall composition: wordmark top, jacket centred overlapping it, controls bottom-left, product info bottom-right, feature pills under the description. | **Very loose direction.** Everything else is open. Pills in the mockup are placeholders. |
| `references/zenith-poster.jpg` | How the jacket floats: hollow (no body), mid-air, slow idle drift, dangling cords/toggles. | Direction |
| `references/climatte-render.png` + length turntable recording | Jacket shape: quilted horizontal baffles, tall funnel collar, hood with toggles, snap placket, black knit cuffs, logo tab on collar. | Shape reference |
| `references/super-puff-logo.png` | Wordmark. Recreate as a clean vector; don't upscale the PNG. | Asset |
| Climate Lab badge flip recording | Loader motion: a circular badge flipping on its vertical axis like a coin. | Motion reference |
| Aritzia top notification bar screenshot | Footer bar style: thin, black, centred white text, underlined link, no close X. | Match |
| aritzia.com | Brand tokens, colours, copy, product data. Fonts: closest freely licensed match; never copy licensed font files. | Source |

## 3. Design system

| Item | Decision |
| --- | --- |
| Background | Flat light grey (sample from mockup, ~`#EEEEEE`) plus a **subtle static film grain**. |
| Colour, type, spacing tokens | Derived from aritzia.com during build; recorded in `src/styles/tokens.css`. No hardcoded values outside tokens. |
| Icons | Neutral thin-line set (**Phosphor Thin**), not presented as Aritzia's. |
| Wordmark | Huge, crisp vector "THE SUPER PUFF™" behind the jacket. No pixelation effect. |
| Cursor | A small filled circle that morphs into a ring over interactive controls. |

## 4. Structure and content

- **One screen, one page, no scrolling.** It's an interactive digital poster, not a website. No nav.
- **Desktop only.** Below the desktop breakpoint, show a "best viewed on desktop" screen with the spinning logo.
- **Layout zones:**
  - Centre: 3D jacket over the wordmark.
  - Bottom-left: controls under an Aritzia-voice header (the "controls" title, in their words).
  - Bottom-right: variant name, description, feature pills (fill power, temperature rating, fabric, etc.).
  - Bottom-centre, fixed under the jacket: **CTA** to the matching aritzia.com product page, using Aritzia's own button wording.
- **Footer bar:** "The Super Puff Lab — a concept by Isabella Linde. Not affiliated with Aritzia." plus a link to aritzia.com.
- **Loader:** the Super Puff logo in a circle, flipping like a coin.
- **SEO:** title "The Super Puff Lab", `noindex`.
- **Content source:** hardcoded `src/data/variants.ts`, built from real aritzia.com product pages. Every entry has: family, length, fabric, sleeves, colours available, name, description, feature pills, product URL, and whether it's in stock.

## 5. Controls and data model

| Control | Type | Stops |
| --- | --- | --- |
| Colour | Swatches styled to match the sliders | Only colours the current style comes in |
| Length | Slider | XtraShorty → Shorty → Original → Mid → Long |
| Fit | 2-stop slider | Oversized (The Super Puff™) ↔ Slim (The SuperSnug Puff™) |
| Fabric | Segmented selector (5 options) | cliMATTE™ · Rainstop™ · Hi-Gloss · Orbit Stretch™ · Liquid Shine |
| Sleeves | Toggle | Sleeves / Vest |

- **Combinations that don't exist:** greyed out and can't be selected. The jacket only ever shows real products.
- **Excluded:** Super Ruff Puff (dog), Super Après Puff™, Super Chalet Puff™, SuperStuff Puff™, SuperPOP Puff™, Super Resort Puff™, Super Baby Puff™, LoHip Vest, men's styles, accessories.

### Verified from the saved Super Puff page (Oct 13, 2026)
- 32 in-scope products; full matrix in `src/data/variants.ts`.
- **Five fabrics, not seven.** Lite Shine is only on SuperStuff and Aura Shine only on SuperPOP, both out of scope.
- **Rainstop™ is the ₂O line.** "The Super Puff₂O™" / "SuperSnug Puff₂O™" are simply the Rainstop™ versions.
- **Vests exist at Shorty, Original, Mid and Long** (not only Mid), in cliMATTE™, Hi-Gloss or Liquid Shine depending on length.
- **SuperSnug has no Shorty or XtraShorty.** XtraShorty is cliMATTE™ only and currently on sale.
- Still to verify from individual product pages: full colour lists, descriptions, fill power, temperature ratings.

### Fabric copy (verbatim, "Weatherproof Fabrics" story on the Super Puff page)
| Fabric | Copy | Video id |
| --- | --- | --- |
| cliMATTE™ | Matte Japanese ripstop that’s water repellent and wind resistant. | fw26-super-puff-fabric-climatte-app |
| Rainstop™ | Waterproof, windproof Japanese ripstop with two-layer construction. | fw26-super-puff-fabric-rainstop-app |
| Hi-Gloss | water-repellent and wind-resistant French taffeta with a glossy finish and a soft feel. | fw26-super-puff-fabric-higloss-app |
| Orbit Stretch™ | water-repellent, soft-matte fabric with all-around stretch. | fw26-super-puff-fabric-orbit-stretch-app |
| Liquid Shine | water-resistant, windproof stretch fabric with a velvety look and a sleek feel. | fw26-super-puff-fabric-liquidshine-app |

Videos are served from `assets.aritzia.com/video/upload/…/<id>`; they weren't included in the saved page and still need downloading.

### Fabric popup
- A small square popup, like a toast, above the fabric control. **Fabric only.**
- Shows a looping muted video clip of the fabric plus Aritzia's fabric title and one-line description.
- Sourced from the "Weatherproof Fabrics" videos in the "All about Super" section of aritzia.com/en/clothing/coats-jackets/puffers/thesuperpuff. Downloaded, compressed (square, muted, around 1MB each) and served from the repo; never hotlinked.
- Appears when the value changes, stays while dragging or hovering, and fades out about 3 seconds after the last interaction.
- Reduced motion: a still frame instead of the video.

## 6. The jacket (signature interaction)

- **Built in code with Three.js.** No imported model. It looks clean and slightly stylized, not photoreal (accepted).
- Built from settings: length, fit, sleeves and hood are parameters, so changing a variant is a real change in shape. Fabric changes the material: matte ripstop vs high gloss vs stretch vs waterproof.
- **Floating:** hollow (no body), mid-air, slow idle bob and sway.
- **Lagging parts:** hem cords, hood toggles and the collar tab swing a beat after the jacket moves (spring physics).
- **Faces the cursor:** turns slightly toward the mouse, more for fast movement and less for slow.
- **Punch:** a click makes it react like a hanging pillow lightly punched. It rebounds away from the click, the baffles squash briefly, then it settles back.
- **Variant change:** a slight "pop" as it changes to the new shape.
- **No cloth simulation.** Performance comes before realism.
- **Reduced motion:** no mouse-follow, and only a very faint pop.

## 7. Tech

| Item | Decision |
| --- | --- |
| Stack | Vite, TypeScript, Three.js. No React. Custom shaders where needed. |
| Repo | `itlinde/super-puff-lab`; commit after each working slice. |
| Hosting | Unlisted Vercel or Netlify URL, `noindex`. |
| Browsers | Current desktop Chrome, Safari, Firefox. |
| Performance | Fast first load, steady 60fps on a laptop. Compress assets; load videos only when needed. |
| Accessibility | Controls work by keyboard with visible focus; reduced motion respected. |

## 8. Build slices (check in with Isabella after each; don't start the next until she approves)

1. **Data:** verified variant matrix from aritzia.com, plus a final decision on the fabric control.
2. **Jacket, static:** the code-built model, every length/fit/sleeve setting, fabric materials, background, grain, wordmark.
3. **Jacket, alive:** idle drift, lagging parts, mouse-follow, punch, variant pop, reduced motion.
4. **Interface:** controls, greyed-out logic, info panel, pills, CTA, fabric popup with videos.
5. **Finish:** loader, cursor, footer bar, desktop-only screen, SEO/noindex, performance and accessibility pass.

## 9. Definition of done (per slice)

- [ ] Matches this spec; screenshots checked at 1280, 1440 and 1920px wide
- [ ] Tokens only
- [ ] Keyboard navigable; reduced motion respected
- [ ] Real Aritzia content in place, or `[COPY]` flagged
- [ ] `tsc` and `vite build` pass
- [ ] Committed
