# FP Buffer staging

Public HTTPS hosts for Buffer MCP `create_post` image assets.

- **Use for:** LinkedIn (and other Buffer channels) when the API needs a public `image.url`.
- **Do not use for:** Instagram organic via Meta Graph — that stays on the Page unpublished-photo CDN SOP (`clients/fp/ad-ops/ORGANIC-PUBLISH.md`).
- **Source of truth:** framed exports under `FP/working-folder/fp-social/`; this folder is a disposable public mirror.
- **Retention:** delete after the Buffer post is sent (or keep only if still queued).

Public URL pattern:

`https://florianphil.github.io/live/staging/fp-buffer/<file>`
