# Eventive

Marketing site for Eventive Zimbabwe — full-service events management, equipment
hire, and logistics for corporate summits, weddings, Roora celebrations, and
private events.

React + Vite + Tailwind v4 on the front end, Express serving the built site and
the quote-inquiry endpoint.

## Running it

```bash
npm install
npm run dev        # Express on :3000, serving ./dist when it exists
npm run build      # Vite build + bundle the server to dist/server.mjs
npm start          # run the bundled server
```

Useful checks: `npm run type-check`, `npm run lint`.

## Configuration

Copy `.env.example` to `.env`. Every value is optional — the site runs without
any of them.

To actually receive quote requests, set **one** of:

- `RESEND_API_KEY` + `INQUIRY_FROM_EMAIL` — emails the inquiry via Resend to
  `INQUIRY_TO_EMAIL` (default `events@eventive.co.zw`), with the sender's address
  as reply-to.
- `INQUIRY_WEBHOOK_URL` — POSTs the inquiry as JSON to any webhook.

With neither configured, `POST /api/inquiry` returns 503 and the form falls back
to opening the visitor's mail client, so an inquiry is never silently lost. The
server logs a warning at startup when this is the case.

`POST /api/inquiry` validates its input and is rate limited to 10 requests per IP
per 15 minutes.

## Before launch

Content that is deliberately unfinished, each marked with a `TODO` at the top of
its file:

- **`src/data/work.ts`** — the gallery uses stock photography. Replace `image`
  with your own as real builds are completed. The section is written as **build
  formats**, not a portfolio: each entry describes a configuration Eventive is
  equipped to deliver, with a capacity it is specified for. Nothing claims an
  event that has happened. If it later becomes a genuine portfolio, update the
  headings in `Work.tsx` to match — they are currently phrased as capability.
- **`src/data/faqs.ts`** — two entries (`booking-lead`, `deposit`) state
  commercial terms that are not established anywhere else on the site. They are
  flagged `needsReview`, shown with a "Todo" chip, and excluded from the FAQ
  structured data until you confirm them.
- **`index.html`** — add `telephone` and `priceRange` to the JSON-LD once
  confirmed; both surface in local search results.
- **`public/og-image.png`** — regenerate if the brand type changes. It was
  rendered in a headless browser without the webfonts available, so it uses a
  system serif rather than Cormorant Garamond.

## Positioning

Eventive is being set up, so the copy throughout is written as **capability, not
track record**. There are no testimonials, no completed-work claims, and no
superlatives about market position. Hero figures describe what the rig is
specified for ("peak rig capacity", "cities on our coverage map"), not what has
been delivered.

If you add past-performance claims later, make sure they are true — and keep
`public/og-image.png` in step, since the share card repeats those figures.

## Notes

- Venue and gallery photography is hotlinked from third-party hosts. Anything
  unreachable degrades to a branded gradient via `CoverImage` rather than
  blanking the card.
- The Content-Security-Policy in `server.ts` allows images over HTTPS and fonts
  from Google Fonts. `script-src` stays locked to this origin.
