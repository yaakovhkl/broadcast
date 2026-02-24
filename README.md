# NetFree YouTube Status Manager (Client-Only)

A fully client-side Next.js application for scanning a search term and analyzing simulated NetFree status predictions without a backend or database.

## Features

- Term-based fresh scan (`Scan & Analyze`) on each run.
- Video metadata + NetFree status tracking.
- Global search, filter by status/channel, and sort by:
  - approval probability
  - channel approval rate
- Actions:
  - Check Status
  - Send Open Request
  - Recalculate Probability
- Video details page.
- Admin analytics page with:
  - Approval rate by channel
  - Approval rate by category
  - Trends/efficiency snapshot
- Toast notifications, loading states, and confirmation modal.

> This system does **not** bypass or interfere with NetFree filtering. It only supports tracking and decision planning.

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Architecture

- `app/page.tsx`: main client dashboard and scan trigger.
- `components/VideoTable.tsx`: filters, sorting, actions, table UI.
- `services/mockScanner.ts`: term scanning and metadata generation.
- `services/approvalEngine.ts`: rule-based probability scoring.
- `app/admin/page.tsx`: client-side analytics panel.
- `app/videos/[id]/page.tsx`: client-side video detail page.

## Notes

- Persistence is browser `localStorage` only (latest scan session).
- No API routes, auth server, Prisma, or PostgreSQL are required.

## Using a Different GitHub Repository

If you want to open a PR from this codebase in another GitHub repository:

1. Add the other repository as a git remote.
2. Push your branch to that remote.
3. Open the PR from that remote branch into the target repository.
