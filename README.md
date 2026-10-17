# Nordveka

Interactive furniture product catalog and administration prototype built with React, TypeScript and TanStack Start.

## Features

- Product showcase, category browsing and product detail pages
- Product, category and reusable component management
- Component variants, technical specifications and document references
- Visual component hotspots on product images
- QR codes and product sharing

## Scope

This is a prototype. Catalog data is stored in browser localStorage and initialized from demo data. The administration UI does not implement production authentication or a persistent backend. Changes are local to the current browser.

## Development

Install Node.js compatible with the Vite version in package.json and Bun. Then run:

```sh
bun install
bun run dev
```

Other commands: `bun run build`, `bun run preview`, `bun run lint`.

## Stack

React, TypeScript, TanStack Start/Router, Tailwind CSS, shadcn/ui and QRCode.

## Build integration

The existing `@lovable.dev/vite-tanstack-config` build wrapper is retained. Removing it requires a separately validated migration of Vite, SSR and deployment configuration. This cleanup removes template branding and editor-specific error hooks; it does not claim to disconnect an external account integration.
