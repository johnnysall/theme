// Writes css/*.css and lit/index.js from src/tokens.mjs. No dependencies: `node src/build.mjs`.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { dark, light, shared, textStyles } from "./tokens.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const HEADER = "/* Generated from src/tokens.mjs by src/build.mjs. Don't edit by hand. */\n";

const vars = (obj, indent = "  ") =>
  Object.entries(obj)
    .map(([k, v]) => `${indent}--${k}: ${v};`)
    .join("\n");

const block = (selector, body) => `${selector} {\n${body}\n}\n`;

// tokens.css: plain custom properties, usable from any CSS. Light by default, dark when
// the system is dark; a "dark" or "light" class on <html> forces one.
const tokens =
  HEADER +
  block(":root", `${vars(shared)}\n${vars(light)}\n  color-scheme: light;`) +
  "\n@media (prefers-color-scheme: dark) {\n" +
  block("  :root:not(.light)", `${vars(dark, "    ")}\n    color-scheme: dark;`).replace(/\n}\n$/, "\n  }\n") +
  "}\n\n" +
  block(":root.dark", `${vars(dark)}\n  color-scheme: dark;`);

// tailwind.css: Tailwind v4 theme + base styles over the tokens
const colorKeys = Object.keys(light).filter((k) => !k.startsWith("glass"));
const typeScale = Object.entries(textStyles)
  .map(
    ([name, t]) => `@utility text-${name} {
  font-family: var(${t.display ? "--font-display" : "--font-system"});
  font-size: ${t.size}px;
  line-height: ${t.line}px;
  font-weight: ${t.weight};
  letter-spacing: ${t.tracking};${t.upper ? "\n  text-transform: uppercase;" : ""}
}
`,
  )
  .join("\n");
const tailwind =
  HEADER +
  `/* dark: follows the system, or a "dark" / "light" class on <html> */
@custom-variant dark {
  @media (prefers-color-scheme: dark) {
    &:where(:root:not(.light), :root:not(.light) *) {
      @slot;
    }
  }
  &:where(.dark, .dark *) {
    @slot;
  }
}

@theme inline {
  --font-sans: var(--font-system);
  --font-heading: var(--font-display);
  --font-mono: var(--font-code);
${colorKeys.map((k) => `  --color-${k}: var(--${k});`).join("\n")}
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

/* iOS text styles: class="text-large-title", "text-headline"… */
${typeScale}
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  html {
    @apply font-sans;
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
  }
  body {
    @apply bg-background text-foreground antialiased;
  }
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  select:not(:disabled) {
    cursor: pointer;
  }
}
`;

// glass.css: the frosted surface, opt-in. A Tailwind utility, so "glass" works as a class.
const glassRules = `background-color: var(--glass);
  -webkit-backdrop-filter: var(--glass-blur);
  backdrop-filter: var(--glass-blur);
  box-shadow:
    inset 0 0.5px 0 0 var(--glass-highlight),
    0 0 0 0.5px var(--glass-edge),
    var(--glass-shadow);`;
const glass =
  HEADER +
  `@utility glass {
  ${glassRules}
}

@utility glass-strong {
  ${glassRules.replace("var(--glass)", "var(--glass-strong)")}
}
`;

// lit/: the same tokens as strings for Lit components (wrap them in unsafeCSS). Rules on
// :root don't reach into nested shadow roots, so these target :host.
const lit = `${HEADER.replace("/*", "//").replace(" */", "")}
export const hostLight = ${JSON.stringify(block(":host", `${vars(shared)}\n${vars(light)}\n  color-scheme: light;`))};
export const hostDark = ${JSON.stringify(block(":host", `${vars(shared)}\n${vars(dark)}\n  color-scheme: dark;`))};
export const glass = ${JSON.stringify(`.glass {\n  ${glassRules}\n}\n.glass-strong {\n  ${glassRules.replace("var(--glass)", "var(--glass-strong)")}\n}\n`)};
`;
const litTypes = `export declare const hostLight: string;
export declare const hostDark: string;
export declare const glass: string;
`;

mkdirSync(root + "css", { recursive: true });
mkdirSync(root + "lit", { recursive: true });
writeFileSync(root + "css/tokens.css", tokens);
writeFileSync(root + "css/tailwind.css", tailwind);
writeFileSync(root + "css/glass.css", glass);
writeFileSync(root + "lit/index.js", lit);
writeFileSync(root + "lit/index.d.ts", litTypes);
console.log("Wrote css/tokens.css, css/tailwind.css, css/glass.css, lit/index.js");
