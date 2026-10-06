# How this site looks and sounds

Generated sites look alike because nobody decided anything, so the defaults
win: a dark page, a glowing badge above a huge centred headline, a blue-purple
glow, three feature cards in a row, every section fading in on scroll, and
copy like "Calm by design. Not X, but Y." This file lists the decisions that
replace those defaults. Change them on purpose, not by drift.

## Page

- **Paper, not a void.** A warm off-white page (`#F7F5F0`) with near-black ink.
  Dark mode follows the visitor's system and is a warm charcoal, never pure black.
- **One accent, used for meaning.** The app's blue marks links and the colon in
  the wordmark. No gradients, glows, or coloured shadows anywhere.
- **Hairlines over boxes.** Sections are separated by a thin rule and space.
  Cards are only used for things that really are objects (an email, a phone).

## Type

- Headlines: **Newsreader**, a serif made for reading on screens, at weight 500.
  It is served from this site (via `next/font`), so visitors never load anything
  from Google.
- Everything else: the system font (SF Pro on Apple devices), so the site reads
  like the iPhone app it describes.
- Sentence case everywhere. No all-caps labels, no small "eyebrow" badges above
  headings.

## Layout

- Left-aligned, built around a reading column of about 640px. Figures (the phone,
  the email) may be wider. Nothing is centred except the 404 page.
- Sections differ in shape: a dated log, a real email, a short list. Avoid
  repeating one "label, headline, grid" pattern down the page.

## Motion

- Motion only shows the product: the phone demo loops through replying to a lead.
- Links and buttons respond to hover and press. Nothing fades in on scroll.
- `prefers-reduced-motion` stops the demo.

## Words

- Say what the app does, with names, days and times. "Leads reminds you on day
  1, 3 and 7" beats "Never miss an opportunity".
- Say what it does not do. Honest limits build more trust than adjectives.
- No slogans, no "not X but Y", no lists that always come in threes, no em dashes
  doing the work of a full stop. If a sentence would fit on any other product's
  site, rewrite it.
- Read it aloud. If it sounds like an ad, cut it.
