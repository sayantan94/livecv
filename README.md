<div align="center">

<img src="./logo.svg" width="120" alt="livecv" />

# livecv

**Your portfolio answers questions.**

Define a KB. Render a live persona.

[![npm version](https://img.shields.io/npm/v/livecv.svg?style=flat-square&color=171717)](https://npmjs.com/package/livecv)
[![license](https://img.shields.io/npm/l/livecv.svg?style=flat-square&color=171717)](./LICENSE)

[Demo](https://ai.sayantan.sh) · [Example](./example) · [npm](https://npmjs.com/package/livecv) · [Issues](https://github.com/sayantan94/livecv/issues)

</div>

---

## What is it

Static portfolios show every visitor the same page. **livecv** turns a typed config + markdown KB into a generative-UI portfolio: a visitor types a question, an LLM picks components from a Zod-typed catalog, and the page assembles itself live as the answer.

Same site, different shape per visitor. A recruiter sees the patent and the metrics. A friend sees the writing. A founding-team CEO sees the agent-infrastructure thinking.

Built on top of [`@json-render`](https://github.com/vercel-labs/json-render) (the streaming renderer + Zod catalog runtime) and Anthropic's Claude.

## Install

```bash
npm install livecv \
  @ai-sdk/anthropic @ai-sdk/react ai \
  @json-render/core @json-render/react @json-render/shadcn \
  motion lucide-react zod
```

## Four files. That's the whole user surface.

```
my-portfolio/
├── livecv.config.ts          — typed config (identity, career, projects, blog)
├── content/kb.md             — prose KB (voice, principles, what you're focused on)
├── app/page.tsx              — <PersonaSite config={config} />
└── app/api/generate/route.ts — export const POST = createHandler({ config })
```

## Quick start

**1. Config — assemble your persona with the typed constructors:**

```ts
// livecv.config.ts
import fs from "node:fs";
import path from "node:path";
import {
  defineConfig,
  defineIdentity,
  defineCareer,
  defineProjects,
  defineClusters,
  defineBlog,
} from "livecv";

const identity = defineIdentity({
  name: "Jane Doe",
  role: "Software Engineer",
  bio: "...",
  email: "jane@example.com",
  links: { github: "https://github.com/janedoe" },
});

const career = defineCareer([
  { start: "2024", end: "Present", title: "Senior Engineer", org: "Foo",
    detail: "...", tech: ["TypeScript"], status: "current" },
]);

const projects = defineProjects([
  { id: "thing", title: "thing", tldr: "...", description: "...",
    tech: ["TypeScript"], cluster: "tools",
    howItWorks: ["..."], keyInsight: "..." },
]);

const clusters = defineClusters([{ id: "tools", label: "Tools" }]);
const blog = defineBlog([]);

export default defineConfig({
  identity, career, projects, clusters, blog,
  kbContent: fs.readFileSync(path.join(process.cwd(), "content/kb.md"), "utf-8"),
  model: "claude-haiku-4-5",
});
```

**2. Page — five lines:**

```tsx
// app/page.tsx
import { PersonaSite } from "livecv";
import config from "@/livecv.config";

export default function Page() {
  return <PersonaSite config={config} />;
}
```

**3. API route — five lines:**

```ts
// app/api/generate/route.ts
import { createHandler } from "livecv";
import config from "@/livecv.config";

export const POST = createHandler({ config });
export const maxDuration = 60;
```

**4. Styles — three imports:**

```css
/* app/globals.css */
@import "tailwindcss";
@import "livecv/styles.css";
@import "livecv/theme.css";
```

**5. Env — one variable:**

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

`npm run dev`. You have a live persona portfolio.

## What renders

The LLM picks from this catalog per question:

| Component | When it renders |
|---|---|
| `ProfileBlock` | "who are you", "about" |
| `CareerTimeline` | "career", "background" — supports `focus` + `highlightTech` for topical lensing |
| `ProjectGrid` | "show me your X work" — filtered by `cluster` |
| `ProjectDeepDive` | specific project by id |
| `TechStack` | tag cloud sized by frequency |
| `BlogList` / `BlogPostCard` | your writing |
| `PrincipleList` | philosophy questions only |
| `LeadershipStories` | STAR-format experience stories — fresh per question |
| `ProofPoints` | tag + claim + evidence rows |
| `PersonalNote` | one-sentence first-person opener |
| `Callout` / `Text` / `Link` | prose primitives |

Project IDs, blog slugs, and cluster IDs become Zod enums automatically — the LLM **cannot** reference an artifact that doesn't exist. Bad specs fail validation and the renderer falls back gracefully.

## Example

A complete starter template lives in [`example/`](./example) — a fictional "Jordan Lee, Staff Engineer" persona with 3 career steps, 4 projects across 3 clusters, 3 blog posts, and a prose KB. Clone, replace data, deploy.

```bash
cd example
cp .env.local.example .env.local   # paste your Anthropic key
npm install
npm run dev
```

## Theme

Override any CSS variable from `livecv/theme.css` in your own stylesheet:

```css
:root {
  --lc-foreground: #000;
  --lc-background: #fff;
  /* ... */
}
```

Dark mode = `.dark` class on `<html>` (or any ancestor).

## Reference implementation

[ai.sayantan.sh](https://ai.sayantan.sh) is the real-world site this was extracted from. Same code, real persona. The [companion blog post](https://www.sayantan.sh/blog/the-page-is-the-answer) walks through the architecture decisions.

## Bootstrap from a resume (Claude Code skill)

livecv has a companion **Claude Code skill** that scaffolds a complete project from a resume PDF. The skill is distributed separately from the npm runtime — it lives in this repo's [`skill/livecv/`](./skill/livecv) folder and is not bundled in the npm tarball.

**Install the skill** (clone the repo, then `cp` the skill folder):

```bash
git clone --depth=1 https://github.com/sayantan94/livecv.git
cp -r livecv/skill/livecv ~/.claude/skills/livecv
```

That's it — no `npm install`, no Node tooling, just two commands.

**Use it from anywhere:**

```bash
claude -p "use the livecv skill to scaffold ./my-portfolio from ./resume.pdf"
```

Claude Code reads the PDF natively, extracts identity + career + projects + patent + education, writes 17 files (the same structure as [`example/`](./example)), and prints next steps. After that: `cd my-portfolio && cp .env.local.example .env.local && npm install && npm run dev`.

Identity, career, and projects files are generated dynamically from extracted data using livecv's `defineXxx` constructors. Their shape depends on what's actually on the resume, so they can't be templated.


## License

[MIT](./LICENSE) © Sayantan Bhowmik
