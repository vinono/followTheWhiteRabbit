# Exhibition Template for Next.js

A minimal single-exhibition template for photographers and curators. It has a white-wall viewing mode, an About layer, a thumbnail dock, keyboard browsing, and no CMS or media-library dependency.

## Start locally

```bash
pnpm install
pnpm dev
```

Add local photos under `media/` (they are ignored by Git), then edit `content/artworks.ts`:

- `exhibition`: title, description, collection label, and About text.
- `source`: photo object keys and accurate accessibility descriptions.

## Keep photographs outside Git

The template serves local photos through `/api/artwork/<key>` in development. For production, upload web-ready derivatives to object storage and set `NEXT_PUBLIC_MEDIA_BASE_URL`; see [media storage](docs/media-storage.md).

Keep originals private. Only upload the derivatives you want visitors to see.

## Commands

```bash
pnpm lint
pnpm build
pnpm start
```

## Template boundaries

This starter deliberately does not include accounts, a CMS, analytics, rabbit animation, or a database. It keeps the exhibition content and visual shell small enough to shape around a single body of work.
