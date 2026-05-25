# livecv-example

The starter template for [livecv](https://npmjs.com/package/livecv). A complete
Next.js app showing a fictional persona — **Jordan Lee, Staff Software
Engineer** — rendered live from a typed config and a markdown KB.

Use this as a clone-and-replace template:

1. Clone the livecv repo (or download this folder)
2. Replace `data/*.ts` and `content/kb.md` with your own info
3. Update `livecv.config.ts`'s `blogUrlPattern` to point at your blog
4. Add your Anthropic key to `.env.local`
5. `npm run dev`

## Quick start

```bash
cd example
cp .env.local.example .env.local
# edit .env.local — paste your Anthropic key
npm install
npm run dev
```

Open http://localhost:3000 and ask "who are you", "what have you built",
"experience with distributed systems", etc.

## What's in here

```
example/
├── livecv.config.ts        ← glue: imports data, sets model + blog URL
├── content/
│   └── kb.md               ← prose KB (edit this to change voice)
├── data/
│   ├── identity.ts         ← name, role, bio, links, principles, education
│   ├── career.ts           ← career history (chronological)
│   ├── projects.ts         ← projects + cluster categories
│   └── blog.ts             ← blog post metadata
├── app/
│   ├── page.tsx            ← 5 lines: <PersonaSite config={config} />
│   ├── api/generate/route.ts ← 5 lines: createHandler({ config })
│   ├── layout.tsx          ← font setup + dark-mode bootstrap script
│   └── globals.css         ← 3 imports: tailwindcss, livecv/styles, livecv/theme
├── package.json
└── .env.local.example
```

## Replacing the persona

**1. data/identity.ts** — name, role, bio, links, optional patent/education.
   Uses the `defineIdentity`, `defineEducation`, `definePrinciples`
   constructors from livecv for full TypeScript IntelliSense.

**2. data/career.ts** — chronological career steps. Each has start/end,
   title, org, team, detail, tech, status (`"current"` or `"completed"`).

**3. data/projects.ts** — projects grouped into clusters. The `id` becomes a
   Zod enum so the LLM can't reference a project that doesn't exist. The
   `cluster` field is what makes `ProjectGrid(cluster="...")` work.

**4. data/blog.ts** — blog post metadata. Slugs become Zod enums for
   `BlogPostCard`.

**5. content/kb.md** — prose. Edit freely. Read at every request, no rebuild.

## Deploy to Vercel

1. Push this folder to a GitHub repo (or use the parent livecv repo)
2. Import to Vercel
3. Add `ANTHROPIC_API_KEY` in Vercel → Project → Settings → Environment Variables
4. Deploy

## Reference implementation

For a real-world site built with livecv, see
[ai.sayantan.sh](https://ai.sayantan.sh) — same code, real persona.
