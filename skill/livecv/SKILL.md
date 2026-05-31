---
name: livecv
description: Scaffolds a complete livecv generative-UI portfolio project from a resume PDF (or placeholder templates). Use when user says "create livecv portfolio", "scaffold livecv from resume", "make me a live persona site", "build a generative portfolio", "livecv from my CV", or attaches a `.pdf` resume and asks to bootstrap a personal site. Output is a Next.js 16 project the user can `cd` into and run `npm install && npm run dev`. Self-contained — every file template is inlined below; no GitHub fetching, no external dependencies beyond the livecv npm package the scaffolded project itself uses.
---

# livecv portfolio scaffolder

Scaffold a generative-UI portfolio project that consumes the [livecv](https://npmjs.com/package/livecv) npm package. Output is a Next.js 16 app where visitors type questions and an LLM renders bespoke UI components in response.

**Self-contained.** Every file template lives inline in this file (below). The scaffolded project pulls `livecv` from npm at install time, but this skill itself fetches nothing external.

## Inputs

| Input | If missing |
|---|---|
| **Target directory** (e.g. `./my-portfolio`) | Ask once: "Where should I create the project?" |
| **Resume PDF path** (optional) | Ask once: "Do you have a resume PDF to bootstrap from?" |

Don't ask follow-ups about styling, model, or theme — defaults (Claude Haiku 4.5, monochrome) are fine.

## Instructions

### Step 1 — Validate the target

```bash
[ -d "$TARGET" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null)" ] && echo EXISTS
```

If `EXISTS`, stop and ask the user for a fresh path. Never overwrite. Otherwise:

```bash
mkdir -p "$TARGET"/{app/api/generate,app/api/agent-card,app/api/a2a,content,data}
```

### Step 2 — Extract from the resume (if provided)

Read the PDF using the Read tool (Claude Code's Read tool handles PDFs natively). Map content to the schema in [references/extraction-schema.md](./references/extraction-schema.md) — load that file when you need the field-level rules.

If no resume was provided, skip this step. Use placeholder values in the templates below (`{{DISPLAY_NAME}}` → `"Your Name"`, `{{BIO}}` → `"TODO: 2-3 sentence intro"`, etc.).

### Step 3 — Write the 16 boilerplate files

Write each file below to the target directory, substituting `{{PLACEHOLDERS}}` with extracted data (or placeholder strings if no resume).

#### Placeholders used throughout

- `{{PROJECT_NAME}}` — kebab-case basename of the target directory (e.g. `my-portfolio`)
- `{{DISPLAY_NAME}}` — extracted `identity.name`, or `"Your Name"`
- `{{TITLE}}` — `"{{DISPLAY_NAME}} — live persona"`
- `{{DESCRIPTION}}` — extracted `identity.role + ". Ask anything."`, or `"Live persona portfolio. Ask anything."`
- `{{BIO}}` — extracted `identity.bio`, or `"TODO: 2-3 sentence intro in your voice."`
- `{{RIGHT_NOW}}` — extracted `identity.rightNow`, or `"TODO: What you're building right now."`

---

#### `package.json`

```json
{
  "name": "{{PROJECT_NAME}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^2.0.0",
    "@ai-sdk/react": "^3.0.84",
    "@json-render/core": "0.19.0",
    "@json-render/react": "0.19.0",
    "@json-render/shadcn": "0.19.0",
    "ai": "^6.0.33",
    "livecv": "^1.2.0",
    "lucide-react": "^0.563.0",
    "motion": "^12.40.0",
    "next": "16.1.6",
    "radix-ui": "^1.4.3",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "zod": "4.3.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.18",
    "@types/node": "^22.10.0",
    "@types/react": "19.2.3",
    "@types/react-dom": "19.2.3",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.7.2"
  }
}
```

#### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Publish this persona's A2A agent card at the well-known path so other
      // agents (and a mesh like Meshmind) can discover and register it by
      // reading the card.
      { source: "/.well-known/agent-card.json", destination: "/api/agent-card" },
    ];
  },
};

export default nextConfig;
```

#### `postcss.config.mjs`

```js
const config = {
  plugins: { "@tailwindcss/postcss": {} },
};

export default config;
```

#### `.env.local.example`

```
# Get one at https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-...
```

#### `.gitignore`

```
node_modules
.next
.env
.env.local
.env*.local
*.tsbuildinfo
next-env.d.ts
.DS_Store
```

#### `app/page.tsx`

```tsx
import { PersonaSite } from "livecv";
import config from "@/livecv.config";

export default function Page() {
  return <PersonaSite config={config} />;
}
```

#### `app/api/generate/route.ts`

```ts
import { createHandler } from "livecv";
import config from "@/livecv.config";

export const maxDuration = 60;
export const POST = createHandler({ config });
```

#### `app/api/agent-card/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { identity } from "@/data/identity";

export const runtime = "nodejs";

// LEAN A2A agent card — published at /.well-known/agent-card.json (see next.config.ts).
// A2A cards are lightweight discovery descriptors (reach + high-level), NOT data
// profiles. `url` points at the A2A message endpoint (/api/a2a); specifics are
// answered LIVE there from the KB, not frozen on the card. tags carry coarse
// discovery signal so a registry can keyword-match this persona.
function toTag(s: string): string {
  return s.toLowerCase().replace(/[()]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const a2a = `${origin}/api/a2a`;
  const firstName = identity.name.split(/\s+/)[0];
  const description =
    `${identity.role}${identity.focus ? `, focused on ${identity.focus}` : ""}. ` +
    `Ask about background, projects, writing, or what I'm looking for.`;
  const tags = Array.from(
    new Set(["persona", "q-and-a", "career", "hiring", ...(identity.knowsAbout ?? []).map(toTag)]),
  );

  return NextResponse.json(
    {
      protocolVersion: "0.3.0",
      name: identity.name,
      description,
      url: a2a,
      preferredTransport: "JSONRPC",
      additionalInterfaces: [{ url: a2a, transport: "JSONRPC" }],
      version: "1.0.0",
      provider: { organization: identity.name, url: identity.links.site ?? origin },
      // streaming:false — the A2A endpoint is non-streaming message/send. The
      // browser generative-UI stream lives at /api/generate and is NOT A2A.
      capabilities: { streaming: false, pushNotifications: false },
      defaultInputModes: ["text/plain"],
      defaultOutputModes: ["text/plain"],
      skills: [
        {
          id: "ask_persona",
          name: `Ask about ${firstName}`,
          description:
            "Ask anything about background, projects, writing, or what they're looking for — answered live from the persona's knowledge base.",
          tags,
          examples: ["Are you open to new roles?", "What are you building right now?"],
        },
      ],
    },
    { headers: { "cache-control": "public, max-age=300", "access-control-allow-origin": "*" } },
  );
}
```

#### `app/api/a2a/route.ts`

```ts
import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { buildKnowledgeBase } from "livecv";
import config from "@/livecv.config";

export const runtime = "nodejs";
export const maxDuration = 60;

// A2A JSON-RPC message/send endpoint. Another agent asks; this answers LIVE from
// the persona's KB. Reuses buildKnowledgeBase(config) (single-sourced with
// /api/generate) but NOT buildSystemPrompt (it commands JSON-render UI output).
const MAX_QUESTION_CHARS = 4000;
const kb = buildKnowledgeBase(config);
const firstName = config.identity.name.split(/\s+/)[0];
const model = anthropic(config.model ?? "claude-haiku-4-5");
const SYSTEM = `You are ${config.identity.name}'s persona agent, answering another AI agent over A2A.
Answer in concise PLAIN TEXT (no markdown UI specs, no JSON). Speak as ${firstName} in the first person.
Ground every claim ONLY in the knowledge base below. NEVER fabricate. If the KB lacks the answer, say so.

# Knowledge Base (the ONLY source of truth)
${kb}`;

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};
const rpcError = (id: unknown, code: number, message: string) =>
  NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { headers: CORS });

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  let body: {
    id?: unknown;
    method?: string;
    params?: { message?: { parts?: Array<{ kind?: string; text?: string }>; contextId?: string } };
  };
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }
  const { id, method, params } = body ?? {};
  if (method !== "message/send") return rpcError(id, -32601, "Method not found");
  const parts = params?.message?.parts;
  const question = Array.isArray(parts)
    ? parts.filter((p) => p?.kind === "text").map((p) => p.text ?? "").join("\n").trim()
    : "";
  if (!question) return rpcError(id, -32602, "Invalid params: message.parts must contain text");
  if (question.length > MAX_QUESTION_CHARS)
    return rpcError(id, -32602, "Invalid params: question too long");

  const { text } = await generateText({ model, system: SYSTEM, prompt: question, temperature: 0.4 });

  // v1 SINGLE-TURN: contextId echoed/minted for protocol shape; prior turns NOT loaded.
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id: id ?? null,
      result: {
        kind: "message",
        role: "agent",
        messageId: crypto.randomUUID(),
        contextId: params?.message?.contextId ?? crypto.randomUUID(),
        parts: [{ kind: "text", text }],
      },
    },
    { headers: CORS },
  );
}
```

#### `app/globals.css`

```css
@import "tailwindcss";
@import "livecv/styles.css";
@import "livecv/theme.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--lc-background);
  --color-foreground: var(--lc-foreground);
  --color-card: var(--lc-card);
  --color-muted: var(--lc-muted);
  --color-muted-foreground: var(--lc-muted-foreground);
  --color-border: var(--lc-border);
  --color-input: var(--lc-input);
  --color-faint: var(--lc-faint);
  --font-sans: var(--font-dm-sans);
  --font-mono: var(--font-ibm-plex-mono);
}

@layer base {
  html { scroll-behavior: smooth; }
  body {
    background: var(--lc-background);
    color: var(--lc-foreground);
    font-family: var(--font-ibm-plex-mono), ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  button { cursor: pointer; }
  ::selection {
    background: var(--lc-foreground);
    color: var(--lc-background);
  }
}
```

#### `app/layout.tsx`

```tsx
import type { Metadata, Viewport } from "next";
import { DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "{{TITLE}}",
  description: "{{DESCRIPTION}}",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f1012" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

const themeScript = `
(function(){
  try {
    var saved = localStorage.getItem('theme');
    var theme = saved === 'light' || saved === 'dark'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (_) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-mono antialiased">{children}</body>
    </html>
  );
}
```

#### `livecv.config.ts`

```ts
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "livecv";
import { identity } from "@/data/identity";
import { career } from "@/data/career";
import { projects, clusters } from "@/data/projects";
import { blogPosts } from "@/data/blog";

const kbContent = fs.readFileSync(
  path.join(process.cwd(), "content", "kb.md"),
  "utf-8",
);

export default defineConfig({
  identity,
  career,
  projects,
  clusters,
  blog: blogPosts,
  kbContent,
  model: "claude-haiku-4-5",
  // blogUrlPattern: "https://your-site.com/blog/{slug}",
});
```

#### `README.md`

````markdown
# {{DISPLAY_NAME}}'s live persona

Built with [livecv](https://npmjs.com/package/livecv).

## Develop

```bash
cp .env.local.example .env.local   # paste your Anthropic key
npm install
npm run dev
```

Open http://localhost:3000.

## Edit the persona

- `content/kb.md` — prose KB
- `data/identity.ts` — name, role, bio, links, principles, education, patent
- `data/career.ts` — career history
- `data/projects.ts` — projects (add `howItWorks` + `keyInsight` to feature them)
- `data/blog.ts` — blog post metadata
- `livecv.config.ts` — model choice, blog URL pattern

## Deploy

Push to GitHub → import to Vercel → add `ANTHROPIC_API_KEY` → deploy.
````

#### `content/kb.md`

```markdown
# Knowledge Base for {{DISPLAY_NAME}}'s live persona

Edit this file to update what the LLM knows. Read at every request — no rebuild.
Structured data (project ids, blog slugs, career years) is auto-injected from
`data/*.ts`. Don't duplicate that here.

This file is **the pitch** — voice, narrative, and context the LLM uses.

---

## Who I Am

{{BIO}}

## What I'm Focused On

{{RIGHT_NOW}}

## What Sets Me Apart

> TODO: 3-5 bullets. Specifics over abstractions — patent numbers, real metrics,
> named projects, real years. This is the recruiter-signal section.

- **TODO:** Concrete claim with a metric or named artifact.
- **TODO:** Another concrete claim.

## How I Work

> TODO: 3-5 principles tied to real projects. Avoid aphorisms.

## What I'm Looking For

> TODO: Roles, consulting, collaborations you're open to.

## Voice rules for LLM-rendered text

- Confident, conversational, technically precise. Senior engineer to peer.
- Real numbers over abstractions.
- Forbidden clichés: "passionate about", "leverage", "synergy", "cutting-edge",
  "Let me show you", "Here's what I built".
- Never narrate the rendering. The component IS the answer.
```

#### `data/blog.ts`

```ts
import { defineBlog } from "livecv";

// TODO: Add your blog posts (resumes don't list these).
// If you don't blog, leave this empty — BlogList just won't render.
export const blogPosts = defineBlog([
  // {
  //   slug: "hello-world",
  //   title: "Your First Post",
  //   date: "2026-01-01",
  //   description: "What this post is about, in one sentence.",
  //   tags: ["meta"],
  // },
]);

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
```

### Step 4 — Generate the three data files from extracted data

These can't be templated because their shape depends on what's on the resume. Write them by hand using livecv's `defineXxx` constructors.

**Critical: optional fields use `undefined` (omit the key). Never write `field: null`** — livecv's runtime types declare optional fields as `T | undefined` (`field?: T`), so `null` produces a TS2322 error at `next build` time. If a value isn't on the resume, leave the key out entirely.

#### `data/identity.ts`

Imports — only include the constructors whose data was extracted:

```ts
import {
  defineIdentity,
  defineEducation,    // only if education extracted
  definePatent,       // only if patent extracted
  definePrinciples,
} from "livecv";
```

Body shape:

```ts
// If education was extracted:
export const education = defineEducation({ /* extracted */ });

// If patent was extracted:
export const patent = definePatent({ /* extracted */ });

// Always — TODO stub since resumes don't have principles:
export const principles = definePrinciples([
  {
    claim: "Replace with your own principle.",
    detail: "Two sentences tied to a real project — resumes don't have these, write your own.",
  },
]);

export const identity = defineIdentity({
  name: "...",
  role: "...",
  // Optional fields: include if extracted, OMIT the key entirely if not.
  // Do NOT write `focus: null` — TS2322 at build time.
  focus: "...",            // omit if missing
  location: "...",         // omit if missing
  employer: "...",         // omit if missing
  yearsExperience: 9,      // omit if missing
  bio: "...",
  rightNow: "...",         // omit if missing
  email: "...",
  // `links` is a required object. Inside, every URL is optional —
  // include only what the resume actually exposes. Empty object is fine.
  links: { github: "...", linkedin: "...", site: "..." },
  education,    // only if extracted
  patent,       // only if extracted
  knowsAbout: [/* extracted skills */],
  principles,
  lookingFor: [
    // TODO: What you're open to.
  ],
});
```

#### `data/career.ts`

```ts
import { defineCareer } from "livecv";

export const career = defineCareer([
  /* every extracted career step inline, newest first.
     status: "current" only for the most recent ongoing role. */
]);
```

#### `data/projects.ts`

```ts
import { defineClusters, defineProjects } from "livecv";

export type ClusterId = /* union of extracted cluster ids */;

export const clusters = defineClusters([
  /* unique clusters in extracted projects; label = titleCased id */
]);

export const projects = defineProjects([
  /* each extracted project with howItWorks: [] and keyInsight: "TODO: ..." */
]);

export function getProject(id: string) {
  return projects.find((p) => p.id === id);
}

export function projectsByCluster(cluster: ClusterId) {
  return projects.filter((p) => p.cluster === cluster);
}
```

If no projects were extracted, use a single placeholder cluster `{ id: "tools", label: "Tools" }` and an empty `projects` array with a `// TODO` comment.

### Step 5 — Print the next-steps panel

```
✓ Scaffold complete — 19 files in {TARGET}
  · Publishes an A2A agent card at /.well-known/agent-card.json (joinable by a mesh)

What got extracted:
  · {N} career steps
  · {patent ? "Patent: " + patent.number : "No patent"}
  · {education ? education.degree + ", " + education.school : "No education"}
  · {N} projects across {M} clusters
  · {N} skills

Next steps:
  cd {TARGET}
  cp .env.local.example .env.local   # paste your Anthropic key
  npm install
  npm run dev

Still to write yourself (not on resumes):
  · howItWorks + keyInsight for projects in data/projects.ts
  · Engineering principles in data/identity.ts
  · TODO sections in content/kb.md
```

Replace `{...}` with actual extracted values.

## Examples

### Example 1 — Resume bootstrap

User says: *"Use the livecv skill to scaffold ./my-site from ./resume.pdf"*

1. Confirm `./my-site` is empty or missing.
2. `mkdir -p ./my-site/{app/api/generate,app/api/agent-card,app/api/a2a,content,data}`
3. Read `./resume.pdf` and extract per [references/extraction-schema.md](./references/extraction-schema.md).
4. Write the 16 boilerplate files with `{{...}}` substituted.
5. Generate `data/{identity,career,projects}.ts` from extracted data.
6. Print next-steps panel.

Result: 19 files in `./my-site/`. `cd my-site && npm install && npm run dev` produces a working site that also publishes its A2A agent card.

### Example 2 — Empty templates (no resume)

User says: *"Create a livecv portfolio at ./my-site"*

1. Validate target.
2. Skip extraction.
3. Write all 19 files with placeholder substitutions (`"Your Name"`, `"TODO: ..."`).
4. Print next-steps panel.

## Troubleshooting

### Error: Target directory exists and is not empty

**Cause:** Risk of overwriting the user's work.
**Solution:** Stop and ask for a fresh path. Never `--force`.

### Error: PDF can't be read or extraction returns malformed data

**Cause:** Scanned-image PDF with no text layer.
**Solution:** Fall back to placeholder templates and tell the user they can hand-edit `data/*.ts`.

### User asks to update an existing livecv project

**Cause:** Wrong skill — this one only scaffolds.
**Solution:** Don't invoke this skill. Edit `data/*.ts` or `content/kb.md` using the Edit tool directly.

## Hard rules

- **All output paths under the target directory.** Never write outside it.
- **Exact dates from the resume.** "Jun 2025", not "mid-2025".
- **Never fabricate facts.** Missing fields → omit the key (or `TODO:` comment in prose files). Never `null`.
- **All 19 files required.** The project won't compile if any are missing.
- **Don't fetch from the web or GitHub.** Every template is in this file.

## When NOT to use this skill

- **Editing an existing project** — edit data files directly.
- **Extending the livecv catalog** — that's a livecv package change.
- **Generic Next.js scaffolding** — use `npx create-next-app`.

## Cost

Zero external API calls during scaffolding. The PDF read and file writes happen inside the current Claude Code session. The scaffolded site uses the Anthropic API at runtime via the user's own `ANTHROPIC_API_KEY` — that's the user's site at work, not this skill.
