# How To Cool Down

Static Next.js site for `howtocooldown.com`. It has no server runtime, database, private API keys, or OpenAI hosting dependency.

## Local development

```bash
npm install
npm run dev
```

## Cloudflare Pages

- Framework preset: **Next.js (Static HTML Export)**
- Build command: `npm run build`
- Build output directory: `out`
- Node.js: `22`

Connect the GitHub repository in Cloudflare Pages and configure both `howtocooldown.com` and `www.howtocooldown.com` under Custom domains.

Weather data is requested directly by the visitor's browser from Open-Meteo. No weather API secret is stored in this repository.

