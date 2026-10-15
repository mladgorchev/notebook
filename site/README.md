# Дхарма Слово

The new dharmaslovo.org: a static site built with [Astro](https://astro.build), with search by [Pagefind](https://pagefind.app). It replaces the WordPress site.

## Adding a translation

Create a Markdown file in `src/content/translations/`. The file name becomes the address: `metta-sutta.md` is served at `/metta-sutta/`.

```markdown
---
title: Метта сутта
subtitle: Беседа за любящата доброта      # optional
date: 2026-09-20
teacher: buda-shakyamuni                  # a file name from src/content/teachers/, optional
translator: Име Фамилия
tradition: Тхеравада                      # Тхеравада, Махаяна, Ваджраяна, Дзен, ...
original_language: Пали                   # optional
source: https://suttacentral.net/snp1.8   # optional
tags: [сутри, медитация]
cover: /images/metta.jpg                  # optional, a file in public/images/
featured: true                            # show on the home page, optional
draft: true                               # hide until ready, optional
---

Текстът на превода…
```

Teachers live in `src/content/teachers/`, one file each, with a short biography.

The texts currently in the repo are demo content to show the design. They will be replaced by the imported WordPress posts.

## Running locally

```sh
npm install
npm run dev      # http://localhost:4321 (search only works after a build)
npm run build    # builds into dist/ and creates the search index
npm run preview
```

## Deploying on Vercel

1. In Vercel, choose **Add New → Project** and import this GitHub repository.
2. Set **Root Directory** to `site`. Vercel detects Astro and uses `npm run build`, output `dist`.
3. Every push then gets a preview link, and the main branch goes live.
4. When ready, add `dharmaslovo.org` under **Settings → Domains** and update the DNS records as Vercel shows. HTTPS certificates are issued and renewed automatically.
