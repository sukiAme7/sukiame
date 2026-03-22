# SukiAme

A soft glassmorphism Hexo theme with a bento-style homepage, animated page transitions, archive views, a friends page, a photo wall, and a guestbook layout.

This repository is organized as a reusable theme, not as a personal blog backup. The default theme config is intentionally generic so you can clone it and replace the sample content with your own.

## Features

- Bento-style homepage with profile, navigation, latest posts, activity, calendar, and visitor card
- Animated transitions between home, archives, tags, categories, friends, and posts
- Dedicated layouts for archives, posts, friends, guestbook, and photo wall
- Optional GitHub contribution activity panel via `GITHUB_TOKEN`
- Built-in Atom feed generator
- Optional Busuanzi visitor counter integration

## Requirements

- Hexo `^8.0.0`
- EJS renderer enabled in your Hexo site

## Installation

1. Enter your Hexo site directory.
2. Copy or clone this repository into `themes/sukiame`.
3. Set `theme: sukiame` in your site `_config.yml`.
4. Copy the theme `_config.yml` and adjust the values you want to use.

Example:

```yaml
# site _config.yml
theme: sukiame
```

## Recommended Hexo Packages

Install the common generators/renderers if your site does not already have them:

```bash
npm install hexo-generator-archive hexo-generator-category hexo-generator-index hexo-generator-tag hexo-renderer-ejs hexo-renderer-marked
```

## Theme Config

The theme config lives in `_config.yml`.

Key sections:

- `menu`: top-level navigation items
- `social`: social links shown on the homepage
- `activity`: GitHub activity card fallback values
- `visitor_counter`: optional Busuanzi integration, disabled by default
- `photo_wall`: photo wall labels, preview images, and sample items
- `guestbook`: sticky-note board content and composer card
- `friends`: friends page cards and exchange notes

Hexo also supports a site-level override file named `_config.sukiame.yml`, which is a good place to keep your own values without editing the theme defaults directly.

## Optional Features

### GitHub Activity

To fetch real GitHub contribution data during `hexo generate`, set:

```bash
GITHUB_TOKEN=your_github_token
```

Then configure:

```yaml
github:
  username: your-github-name
  days: 20
```

If the token is missing or the request fails, the theme falls back to the configured `activity.cells`.

### Visitor Counter

Busuanzi is disabled by default.

To enable it:

```yaml
visitor_counter:
  enable: true
  provider: busuanzi
  metric: site_uv
  label: TOTAL VISITORS
  placeholder: --
```

Available metrics:

- `site_uv`
- `site_pv`

## Pages

Create the extra pages you want to use:

```bash
hexo new page friends
hexo new page guestbook
hexo new page photo-wall
```

Then set their front matter layouts:

```yaml
---
title: Friends
layout: friends
---
```

```yaml
---
title: Guestbook
layout: guestbook
---
```

```yaml
---
title: Photo Wall
layout: photo-wall
---
```

## Development Notes

- The theme currently uses CDN-hosted Tailwind, Font Awesome, and Google Fonts in the main layout.
- If you deploy in a restricted network environment, consider self-hosting those assets.
- The local `.example` workspace is ignored and can be used as a private playground without affecting the theme repository.

## License

MIT
