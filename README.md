# Cadence — music-app

A Spotify-inspired music application with original branding and six original 32-second instrumental demo tracks.

## Features

- Responsive discovery page and curated genre collections
- Real HTML audio playback, seeking, volume, queue, shuffle, and repeat
- Search by track, artist, or album
- Liked songs and custom playlists, saved in localStorage on this browser
- Keyboard-accessible dialogs and navigation

## Development

Requires Node.js 22.13 or newer. Install dependencies with `npm install`, then run `npm run dev`. The lockfile for the managed preview is `pnpm-lock.yaml`; use pnpm for exact reproducibility. Run `npx tsc --noEmit` for type checking and `npm run build` for a production build.

This uses React, TypeScript, Next.js App Router conventions, and Vinext/Vite for the hosted Cloudflare runtime. It is not a stock Vercel deployment template. The Sites helper and `.openai/hosting.json` support the private hosted preview.

## Current scope

Email/password authentication and account-owned playlists/likes are connected to a dedicated Supabase project. Guests use browser-local storage. Signed-in users may explicitly import their guest collection. Cloud writes use revision checks to prevent silent overwrites across devices. No subscriptions, Spotify API, or commercial catalog. Guest library data can be lost when site data is cleared. Demo audio and vector covers were created for this project. Playback begins only after user interaction.

## Next steps

Add a dedicated Supabase backend for authentication, catalog metadata, storage policies, and account-owned playlists; then implement secure admin catalog uploads.


## Supabase

Project: `ovajmqidjbnbhrfcdsbu` (`music-app`, Mumbai). Client credentials in `lib/supabase-config.ts` are publishable, not privileged keys. All library access uses the signed-in user token and Postgres RLS. `supabase/schema.sql` records the applied schema; the remote migration is `create_private_music_libraries`.

Authentication uses the browser Supabase client; there are no server routes relying on browser sessions or trusting local user claims. RLS enforces authorization at the database.

Set Authentication → URL Configuration in the Supabase dashboard:
- Site URL: `https://hastha-music-app.hastha.chatgpt.site`
- Redirect URL: `https://hastha-music-app.hastha.chatgpt.site`

Email confirmations and password-reset links depend on these settings. The application passes that production origin in each request. Keep email confirmation enabled. Production mail delivery uses the Supabase project's configured email service and limits.

Verification: type check and production build; transaction-based database tests for owner writes, cross-user read/update/insert isolation, and stale revision rejection. Supabase security advisor returned no findings. Tests roll back all data.


## Cloudflare Pages

This repository also includes a static client build, which uses the same music app and Supabase integration without the Sites worker. In Cloudflare Pages, connect this repository and use:

- Project name: `cadence-music` (subject to availability)
- Production branch: `main`
- Framework preset: None
- Build command: `pnpm run build:pages`
- Build output directory: `pages-dist`
- Node.js: 22 or later

Run `pnpm install --frozen-lockfile` first for a local build. Cloudflare installs dependencies automatically. Once deployed, update Supabase Authentication URL Configuration to the exact deployed Pages origin and allow it as a redirect URL.

## YouTube playback and search

The visible YouTube player accepts standard video links without an API key. Search uses the Cloudflare Pages Function `functions/api/youtube.ts`; it requires a server-side `YOUTUBE_API_KEY` variable. Enable YouTube Data API v3 in Google Cloud, create an API key restricted to that API, then add it as an encrypted production variable in Cloudflare Pages and redeploy. Never put this key into browser code or commit it. Search requires an available quota and returns embeddable videos. Language selection influences the search query rather than guaranteeing the spoken language. Playback uses the unmodified visible YouTube player; restricted or unavailable videos can be opened on YouTube.

Cloudflare Pages builds its `functions` directory automatically. This endpoint is specific to Pages hosting; it is not available on the earlier ChatGPT-hosted preview. No videos or audio are downloaded or extracted. YouTube collections are not yet added to the demo-track playlist schema.
