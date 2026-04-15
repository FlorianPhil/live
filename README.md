# Live

Public mini-sites and one-pagers hosted on GitHub Pages. Each project lives in its own folder and gets its own public URL.

## Structure

```
live/
├── index.html                      # Root landing page, links to all projects
├── cannabis-chamber-toolkit/
│   └── index.html                  # Chapter Leader Toolkit
└── [future-project]/
    └── index.html
```

## URLs

Once GitHub Pages is enabled for this repo, each project is reachable at:

- Root: `https://<username>.github.io/live/`
- Per project: `https://<username>.github.io/live/<project-name>/`

## Adding a new project

1. Create a new folder at the repo root: `/<project-name>/`
2. Drop an `index.html` (and any assets) inside
3. Add a card to the root `index.html` linking to `./<project-name>/`
4. Commit and push. GitHub Pages will redeploy automatically.

## Rules

- **Public content only.** Everything committed here is served publicly.
- **No secrets.** No `.env`, API keys, tokens, or private drafts.
- **No website folder contamination.** `~/Projects/FP/website/` is reserved for florianp.com. This repo is for everything else.
- **Self-contained projects.** Each subfolder should work standalone. No cross-project dependencies.

## Deploy

GitHub Pages serves directly from the `main` branch. Every `git push` to `main` triggers a redeploy within a minute or two.
