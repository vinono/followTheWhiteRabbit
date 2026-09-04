# Local photos

Place exhibition images here for local development. This directory is ignored by Git; only this instruction file is retained.

The keys in `content/artworks.ts` are relative to this directory. For example:

```text
media/201807/17886990100240451.jpg
```

For deployment, upload the same key structure to object storage and set `NEXT_PUBLIC_MEDIA_BASE_URL` as described in `docs/media-storage.md`.
