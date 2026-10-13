# How this site looks and sounds

The website and the web app look like the iPhone app: the same dark palette,
the same type, the same rounded controls, and the app icon's graphite. Generated
sites look alike because nobody decided anything; these are the decisions.

## Page

- **Graphite, from the icon.** The page is the app's near-black (`#08090A`).
  Large first views (the front page's top, sign-in, setup) use the icon's
  background: graphite at the top fading to black (`--graphite`). Nowhere else.
- **One accent, used for meaning.** The app's blue marks links, the current
  period in a chart, and the colon in the wordmark. The colon is drawn like the
  icon's: two rounded squares with a soft blue glow. That glow appears only
  there and on the "Got the job" dot.
- **Hairlines over boxes.** Sections are separated by space and thin rules.
  Cards are for things that are objects (an email, a phone, a lead, a chart).
- **Real phones.** Phones are 3D renders made in Remotion (Leads-Advertising,
  `src/SitePhone`) with the live screen laid onto the display. Each faces the
  viewer turned a degree or two, and no two phones on the site the same way.

## Type

- The system font: SF Pro on Apple devices, exactly like the app. Other systems
  get Inter (served from this site by `next/font`), the closest match.
- Headlines are bold with tight tracking, like the app's large titles.
- Sentence case everywhere. No all-caps labels, no eyebrow badges.

## The web app

- A left sidebar (workspace, New lead, Today / Leads / Activity / Insights,
  then Notifications and Settings), the page on the right. On a phone the
  sidebar becomes a drawer.
- Every page answers one question first, in its title and the line under it.
- Charts follow the dataviz rules: one series per chart, the current period in
  the accent and the rest in gray (`#5f636b`, checked for contrast against the
  surface), hover values, and "Show numbers" with a table for every chart.

## Motion

- Motion only shows the product: the phone demo loops through replying to a lead.
- Buttons respond to hover and press; dialogs and toasts appear quickly and calmly.
- `prefers-reduced-motion` stops all of it.

## Words

- Say what the app does, with names, days and times. "Leads reminds you on day
  1, 3 and 7" beats "Never miss an opportunity".
- Say what it does not do. Honest limits build more trust than adjectives.
- No slogans, no "not X but Y", no lists that always come in threes, no em dashes
  doing the work of a full stop. If a sentence would fit any other product's site,
  rewrite it.
