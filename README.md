# Midhun & Rithunanda - Engagement invitation

A single-page static invitation site. No build step required.

## Quick start

Open `index.html` in a browser, or serve locally:

```bash
npx serve .
```

Then visit `http://localhost:3000` (or the port shown).

## Customize

Edit **[config.js](config.js)**:

| Field            | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `rsvpEmail`      | Inbox for RSVP (mailto fallback)                 |
| `formSubmitId`   | FormSubmit hash for the AJAX endpoint (after activation) |
| `program`        | Timeline (muhurtham times, etc.)               |
| `siteUrl`        | Full public URL for Open Graph tags (optional) |

## RSVP form

Guests fill the form on the page; submissions are emailed to `rsvpEmail` via [FormSubmit](https://formsubmit.co) (no server needed).

1. Host the site over **HTTPS** (or test with `npx serve .` — not `file://`).
2. Submit a test RSVP once. FormSubmit emails an **Activate Form** link — click it, then put the hash they send in `formSubmitId` in config (instead of exposing your email in the form URL).

## Music

Add **assets/music.mp3** (royalty-free or licensed). The floating control appears only if the file is reachable. Music plays only after the guest taps the button.

## Link preview

Optional: add **assets/og-image.png** (recommended 1200×630) and set `siteUrl` in config when deployed.

## GitHub Pages

**Live site (after Pages is enabled):** https://midhunmohan-1.github.io/engagement/

Remote: `https://github.com/MidhunMohan-1/engagement.git`

1. Push the `main` branch to GitHub.
2. On the repo: **Settings → Pages → Build and deployment → Source:** Deploy from a branch.
3. **Branch:** `main`, folder **`/ (root)`**, Save.
4. Wait a minute, then open the live URL above.
5. Submit a test RSVP on the live URL and activate FormSubmit for that domain if prompted.
