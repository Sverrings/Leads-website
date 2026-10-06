# Leads website

Home page, FAQ, Privacy Policy and Terms of Service for the [Leads](https://github.com/Sverrings/Leads)
app. Next.js, no UI kit: hand-written CSS in the same palette and type as the app.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Before you publish

Fill in `src/site.config.ts`. The legal pages read it:

| Field | What to put |
| --- | --- |
| `operator` | Your name or company: whoever is responsible for the app |
| `contactEmail` | An inbox you read. Privacy requests and support go here |
| `dataRegion` | Where your Supabase project stores data (Project settings → General) |
| `url` | The site's final address, once you have one |

While `contactEmail` is still the placeholder, the legal pages show a reminder in development.

## Put it online (Vercel)

1. vercel.com → **Add New → Project** → import `Sverrings/Leads-website` → **Deploy**. Vercel detects
   Next.js; no settings needed.
2. To use your own domain later: **Project → Settings → Domains**.
3. In the app repo, set `EXPO_PUBLIC_WEBSITE_URL` in `.env.local` to the site's address so the
   app's Terms, Privacy and FAQ links point here. It is sent to EAS the next time you ship a build
   or an update from `leads.bat`.

## Pages

| Route | File |
| --- | --- |
| `/` | `src/app/page.tsx` (hero with the animated Today screen, how it works, FAQ teaser) |
| `/faq` | `src/app/faq/page.tsx`, answers in `src/content/faq.ts` |
| `/privacy` | `src/app/privacy/page.tsx` |
| `/terms` | `src/app/terms/page.tsx` |

Change the "Last updated" date in `site.config.ts` whenever you change the legal pages, and bump
`TERMS_VERSION` in the app (`src/features/auth/consent.ts`) when people need to agree again.
