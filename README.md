# Leads website and web app

The public site (home, FAQ, privacy, terms, the pages email links open) and the
**web app** at `/app`: the same accounts, leads, follow-ups and settings as the
[iPhone app](https://github.com/Sverrings/Leads), on the same Supabase project,
plus charts. Next.js 16 (App Router), hand-written CSS, no UI kit. See
[DESIGN.md](DESIGN.md) for how it looks.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without `.env.local` the site talks to the hosted
Supabase project. To work against a local copy instead (recommended for the web
app), start the stack in the app repository (`npx supabase start` there) and put
its URL and publishable key in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key from supabase start>
```

The local seed has a demo account with a full workspace: `demo@leads.dev` /
`leads-demo-2026` (from `Leads/supabase/seed.sql`). Emails, including sign-up
codes, arrive in Mailpit at http://127.0.0.1:54324. Drafts need
`npx supabase functions serve --env-file supabase/functions/.env` in the app repo.

## Check it

```bash
npm run verify   # types, lint and tests
npm run build    # the same production build Vercel runs
```

## How the web app works

| Part | Where |
| --- | --- |
| Sign-in (email + 6-digit code, Google, reset with a code) | `src/app/(account)`, `src/features/auth` |
| Session in cookies, refreshed and checked before `/app` renders | `src/proxy.ts`, `src/lib/supabase/*`, `src/app/app/layout.tsx` |
| Google comes back to | `src/app/(site)/auth/callback/route.ts` |
| Panel frame, sidebar, notifications | `src/features/panel` |
| Today, Leads, a lead, Activity, Insights, Settings, setup | `src/features/*`, routes in `src/app/app` |

Security is the database's job, exactly as for the app: every query runs as the
signed-in person through row-level security, and the free plan's lead limit is
enforced by the database. The proxy and the server layout only decide what to
render.

Leads Pro is an App Store subscription. The web app shows the plan and follows
it, but you start, change and cancel it in the iPhone app.

## Shared with the iPhone app

These files are copies of the app's and must change together with it. Each one
starts with a comment naming its original in `Leads/src`:

- `src/lib/database.types.ts`, `models.ts`, `dates.ts`, `strings.ts`,
  `errors.ts`, `query-keys.ts`
- `src/features/leads/domain/*`, `leads/schemas.ts`, `timeline/describe-event.ts`,
  `sequences/delays.ts`, `follow-ups/schedule-presets.ts`, `onboarding/rhythms.ts`,
  `templates/variables.ts`, `templates/schemas.ts`, `billing/plans.ts`
- the `api.ts` and `hooks.ts` of each feature (with the web's Supabase client)

The domain tests from the app run here too (`npm test`).

## Pages

| Route | What |
| --- | --- |
| `/` | Front page |
| `/faq`, `/privacy`, `/terms` | Questions and the legal pages (they read `src/site.config.ts`) |
| `/login`, `/signup`, `/forgot-password` | Sign-in for the web app |
| `/auth/*` | Pages that email links open, and Google's way back |
| `/app/*` | The web app |

Change the "Last updated" date in `site.config.ts` whenever you change the legal
pages, and bump `TERMS_VERSION` in both the app (`src/features/auth/consent.ts`)
and here (`src/features/auth/api.ts`) when people need to agree again.

## Put it online

Vercel deploys every push to `main`. The project needs no settings: the hosted
Supabase URL and publishable key are the defaults in `site.config.ts`.
