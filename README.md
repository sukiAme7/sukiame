# SukiAme


SukiAme is a soft glassmorphism Hexo theme with a bento-style homepage, animated page transitions, a unified blog/archive view, a friends page, a photo wall, and a sticky-note guestbook.

This repository is the theme itself, not a full Hexo blog backup. It does, however, ship with real default content and links so a fresh install already looks complete. The current defaults intentionally keep the author's GitHub, email, Nankai VPN, and Coze links as part of the theme's sample data.
![SukiAme preview](assets/image.png)

## Features

- Bento-style homepage with profile, navigation, latest posts, GitHub activity, photo preview, clock, calendar, visitor card, and like button
- Unified archive layout for archives, categories, and tags
- Dedicated layouts for posts, friends, guestbook, and photo wall
- Animated page transitions with prefetching for key internal routes
- Floating article table of contents on post pages
- Enhanced code blocks with copy, collapse, word-wrap, and optional full-view behavior
- KaTeX math rendering for inline and block formulas
- Built-in Atom feed generator at `/atom.xml`
- Optional GitHub contribution sync via `GITHUB_TOKEN`
- Optional Busuanzi visitor counter
- Optional remote APIs for homepage likes and guestbook notes

## Requirements

- Node.js and npm
- Hexo `^8.0.0`
- `hexo-renderer-ejs` enabled in your Hexo site

## Installation

### 1. Install Hexo and create a site

```bash
npm install -g hexo-cli
hexo init my-blog
cd my-blog
npm install
```

### 2. Add this theme

Copy or clone this repository into your Hexo site's `themes/sukiame` directory.

Example:

```bash
git clone <your-theme-repo-url> themes/sukiame
```

### 3. Install the theme dependency

This theme depends on `katex`, so install the theme's own `package.json` dependencies:

```bash
npm install --prefix themes/sukiame
```

You can also enter `themes/sukiame` manually and run `npm install`.

### 4. Install common Hexo packages if your site does not already have them

```bash
npm install hexo-generator-archive hexo-generator-category hexo-generator-index hexo-generator-tag hexo-renderer-ejs hexo-renderer-marked
```

### 5. Enable the theme

In your site's root `_config.yml`:

```yaml
theme: sukiame
```

### 6. Configure the theme

The theme defaults live in `themes/sukiame/_config.yml`.

You can either:

- edit `themes/sukiame/_config.yml` directly
- create a site-level `_config.sukiame.yml` to override the defaults without modifying the theme files

### 7. Check the favicon path before deployment

The sample config currently points `favicon` to `/images/favicon.ico`. Add that file to your site or change the config to an existing image path before deploying.

## Included Routes

This theme already includes default page entries inside its own `source/` directory, so a fresh install can generate these routes directly:

- `/`
- `/archives/`
- `/categories/`
- `/tags/`
- `/friends/`
- `/guestbook/`
- `/photo-wall/`
- `/atom.xml`

You do not need to manually run `hexo new page friends`, `guestbook`, or `photo-wall` just to get the default pages working.

## Theme Config

The main actively used sections in `_config.yml` are:

- `avatar`
- `favicon`
- `menu`
- `social`
- `github`
- `activity`
- `visitor_counter`
- `home_like`
- `photo_wall`
- `guestbook`
- `friends`
- `code_blocks`

The shipped defaults include:

- the author's GitHub and email links under `social`
- sample GitHub activity settings
- sample friend cards, guestbook notes, and photo-wall data
- sample homepage like settings

## Optional Dynamic Features

### GitHub Activity

To fetch live GitHub contribution data during `hexo generate`, set a token in the environment and configure the username in the theme config.

PowerShell:

```powershell
$env:GITHUB_TOKEN="your_github_token"
hexo generate
```

Bash:

```bash
GITHUB_TOKEN=your_github_token hexo generate
```

Theme config:

```yaml
github:
  username: your-github-name
  days: 20
```

If the token is missing or the request fails, the theme falls back to `activity.cells`.

### Homepage Like API

The homepage like button uses the `home_like.endpoint` value. The current default is:

```yaml
home_like:
  endpoint: /api/like/home-hero
```

Expected behavior:

- `GET /api/like/home-hero` returns JSON like `{ "count": 123 }`
- `POST /api/like/home-hero` returns JSON like `{ "count": 124 }`

If this endpoint is unavailable, the homepage still renders with the configured base count, but live count syncing and remote like submission will not work.

### Guestbook Notes API

The guestbook page loads and submits notes through:

- `GET /api/guestbook/notes`
- `POST /api/guestbook/notes`

Expected note shape:

```json
{
  "id": 1,
  "author": "SukiAme",
  "date": "2026.03.24",
  "message": "Hello",
  "tone": "blue"
}
```

If the API is unavailable, the page still shows the notes defined in `guestbook.items`, but remote note publishing will fail.

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

## Notes

- Tailwind CSS, Font Awesome, and Google Fonts are loaded from CDN in the main layout
- KaTeX CSS and fonts are copied into `public/vendor/katex` during generation
- If you deploy in a restricted network environment, consider self-hosting the CDN assets

## License

MIT
