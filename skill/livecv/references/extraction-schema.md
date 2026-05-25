# Resume → livecv extraction schema

Use this schema when extracting structured data from a resume PDF. Every field
either gets a real value from the resume OR `null` — never fabricate.

## Full schema

```ts
{
  identity: {
    name: string,
    role: string,                    // job title from current role
    focus: string | null,            // specialty (e.g. "Distributed Systems")
    location: string | null,
    employer: string | null,         // current org
    yearsExperience: number | null,  // count from earliest professional role to now
    bio: string,                     // 2-3 sentences synthesized from summary + current role
    rightNow: string | null,         // what they're working on, 1 sentence
    email: string,
    links: {
      github: string | null,
      linkedin: string | null,
      site: string | null,
      blog: string | null
    },
    knowsAbout: string[]             // skills list, max 15
  },
  career: [
    {
      start: string,                 // e.g. "Jun 2025"
      end: string,                   // "Present" or e.g. "Jun 2025"
      title: string,
      org: string,
      team: string | null,
      detail: string,                // 1-2 sentences paraphrased from bullets
      tech: string[],
      status: "current" | "completed"// mark most recent ongoing role "current"
    }
  ],
  patent: {
    number: string,                  // e.g. "US Patent 12,541,394"
    title: string,
    granted: string,                 // e.g. "Feb 2026"
    summary: string
  } | null,
  education: {
    degree: string,
    school: string,
    years: string,                   // e.g. "2019 — 2021"
    coursework: string[] | null
  } | null,
  projects: [
    {
      id: string,                    // kebab-case from title
      title: string,
      tldr: string,                  // one line
      description: string,           // 1-2 sentences
      tech: string[],
      github: string | null,
      cluster: string                // kebab-case category, best guess from project domain
    }
  ] | null
}
```

## Hard rules

- **Use exact dates from the resume.** "Jun 2025" — not "mid-2025" or "Summer 2025".
- **`status: "current"`** only for the role marked Present/Now/ongoing.
- **`bio`** synthesizes from the resume's summary section + current role title. 2-3 sentences max. Don't repeat the role verbatim.
- **`knowsAbout`** comes from the "Skills" / "Technologies" section. Deduplicate. Max 15.
- **`tech` in career** = the tech stack listed for that specific role. Don't carry tech between roles.
- **`projects.cluster`** is your best guess — kebab-case domain like `"ai-agents"`, `"developer-tools"`, `"infrastructure"`, `"data"`. Group similar projects under the same cluster.
- **Patents and education** — only include if explicitly on the resume. Otherwise `null`.
- **Never invent.** No GitHub URLs unless the resume lists them. No locations unless the resume has them. `null` is fine.

## Field-by-field examples (good extractions)

```ts
{
  identity: {
    name: "Sayantan Bhowmik",
    role: "Software Developer / Tech Lead",
    focus: "AI Agent Infrastructure",
    location: null,                  // not on resume
    employer: "Amazon",
    yearsExperience: 9,              // 2016 → 2026
    bio: "Software Developer / Tech Lead at Amazon working on AI agent infrastructure. 9+ years across AI/agents, distributed systems, and cloud-native engineering. US patent holder; MS in CS from UMass Amherst.",
    rightNow: "Leading development of AI Teammate at Amazon StoreGen — an autonomous virtual teammate that integrates into the SDLC.",
    email: "sayantanbhow@gmail.com",
    links: {
      github: "https://github.com/sayantan94",
      linkedin: "https://linkedin.com/in/sayantanbhow",
      site: "https://sayantan.sh",
      blog: null
    },
    knowsAbout: ["Multi-Agent Orchestration", "MCP", "A2A Protocol", "Python", "Go", "AWS", "Kubernetes", ...]
  }
}
```

For projects, only extract from explicit "Selected Projects" or "Open Source"
sections. Don't infer projects from job-bullet descriptions.
