# Resume → livecv extraction schema

Use this schema when extracting structured data from a resume PDF. Every field
either gets a real value from the resume OR is **omitted** — never fabricate,
never use `null`.

**Optional fields use `undefined` (just omit the property).** livecv's runtime
types declare optional fields as `field?: T` (i.e. `T | undefined`), not
`T | null`. Writing `field: null` produces a TS2322 error at build time.

## Full schema

```ts
{
  identity: {
    name: string,
    role: string,
    focus?: string,                  // specialty (e.g. "Distributed Systems")
    location?: string,
    employer?: string,               // current org
    yearsExperience?: number,        // count from earliest professional role to now
    bio: string,                     // 2-3 sentences synthesized from summary + current role
    rightNow?: string,               // what they're working on, 1 sentence
    email: string,
    links: {                         // the object is required; every URL inside is optional
      github?: string,
      linkedin?: string,
      site?: string,
      blog?: string,
      twitter?: string
    },
    knowsAbout?: string[]            // skills list, max 15
  },
  career: [
    {
      start: string,                 // e.g. "Jun 2025"
      end: string,                   // "Present" or e.g. "Jun 2025"
      title: string,
      org: string,
      team?: string,
      detail: string,                // 1-2 sentences paraphrased from bullets
      tech: string[],
      status: "current" | "completed"// mark most recent ongoing role "current"
    }
  ],
  patent?: {
    number: string,                  // e.g. "US Patent 12,541,394"
    title: string,
    granted: string,                 // e.g. "Feb 2026"
    summary: string
  },
  education?: {
    degree: string,
    school: string,
    years: string,                   // e.g. "2019 — 2021"
    coursework?: string[]
  },
  projects?: [
    {
      id: string,                    // kebab-case from title
      title: string,
      tldr: string,                  // one line
      description: string,           // 1-2 sentences
      tech: string[],
      github?: string,
      cluster: string                // kebab-case category, best guess from project domain
    }
  ]
}
```

## Hard rules

- **Use exact dates from the resume.** "Jun 2025" — not "mid-2025" or "Summer 2025".
- **`status: "current"`** only for the role marked Present/Now/ongoing.
- **`bio`** synthesizes from the resume's summary section + current role title. 2-3 sentences max. Don't repeat the role verbatim.
- **`knowsAbout`** comes from the "Skills" / "Technologies" section. Deduplicate. Max 15.
- **`tech` in career** = the tech stack listed for that specific role. Don't carry tech between roles.
- **`projects.cluster`** is your best guess — kebab-case domain like `"ai-agents"`, `"developer-tools"`, `"infrastructure"`, `"data"`. Group similar projects under the same cluster.
- **Patents and education** — only include if explicitly on the resume. Otherwise omit the key entirely.
- **Never invent.** No GitHub URLs unless the resume lists them. No locations unless the resume has them. Omit, don't `null`.
- **`links` is a required object.** If no links exist, write `links: {}` — not `links: null` and not `links: { github: null, ... }`.

## Field-by-field examples (good extractions)

```ts
{
  identity: {
    name: "Sayantan Bhowmik",
    role: "Software Developer / Tech Lead",
    focus: "AI Agent Infrastructure",
    // location omitted — not on resume
    employer: "Amazon",
    yearsExperience: 9,              // 2016 → 2026
    bio: "Software Developer / Tech Lead at Amazon working on AI agent infrastructure. 9+ years across AI/agents, distributed systems, and cloud-native engineering. US patent holder; MS in CS from UMass Amherst.",
    rightNow: "Leading development of AI Teammate at Amazon StoreGen — an autonomous virtual teammate that integrates into the SDLC.",
    email: "sayantanbhow@gmail.com",
    links: {
      github: "https://github.com/sayantan94",
      linkedin: "https://linkedin.com/in/sayantanbhow",
      site: "https://sayantan.sh",
      // blog omitted — not on resume
    },
    knowsAbout: ["Multi-Agent Orchestration", "MCP", "A2A Protocol", "Python", "Go", "AWS", "Kubernetes"]
  }
}
```

And when nothing is known:

```ts
{
  identity: {
    name: "Jane Doe",
    role: "Software Engineer",
    bio: "...",
    email: "jane@example.com",
    links: {},                       // required object, can be empty
  }
}
```

For projects, only extract from explicit "Selected Projects" or "Open Source"
sections. Don't infer projects from job-bullet descriptions.
