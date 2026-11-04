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

No authentication, subscriptions, Spotify API, commercial catalog, or cross-device synchronization. Library data is local to this browser and can be lost when site data is cleared. Demo audio and vector covers were created for this project. Playback begins only after user interaction.

## Next steps

Add a dedicated Supabase backend for authentication, catalog metadata, storage policies, and account-owned playlists; then implement secure admin catalog uploads.
