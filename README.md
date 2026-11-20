# theme

iOS-style design tokens: system colours in light and dark, SF system fonts, iOS radii,
and a frosted-glass surface for the apps that want it. Works with Tailwind v4 (and
shadcn/ui's variable names) and with Lit web components.

Everything comes from `src/tokens.mjs`. After changing it, run `npm run build` and commit
the regenerated `css/` and `lit/` files, then tag a release (`git tag v1.1.0`). Apps pin a tag, so
they pick a change up when their tag is bumped.

## Files

| Import | What it is | Used by |
|---|---|---|
| `@johnnysall/theme/tokens.css` | the colours, fonts and radius as CSS variables, light and dark | any CSS |
| `@johnnysall/theme/tailwind.css` | Tailwind v4 theme (`bg-primary`, `text-positive`, `font-heading`…), iOS text styles (`text-large-title`, `text-headline`, `text-section`…), the `dark:` variant and base styles | Tailwind v4 apps |
| `@johnnysall/theme/glass.css` | the `glass` and `glass-strong` utilities | frosted bars and panels |
| `@johnnysall/theme/lit` | the tokens and glass as strings for Lit's `unsafeCSS`, scoped to `:host` | Lit components |

Dark mode follows the system. A `dark` or `light` class on `<html>` forces one.

## With Tailwind v4

```bash
pnpm add https://github.com/johnnysall/theme/archive/refs/tags/v1.1.0.tar.gz
```

The release tarball installs without git, so it also works in slim Docker build images.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@johnnysall/theme/tokens.css";
@import "@johnnysall/theme/tailwind.css";
@import "@johnnysall/theme/glass.css"; /* only if it uses glass */

/* then only what's particular to the app */
```

## With Lit

```ts
import { css, unsafeCSS } from "lit";
import { hostDark, glass } from "@johnnysall/theme/lit";

static styles = [unsafeCSS(hostDark), unsafeCSS(glass), css`…`];
```
