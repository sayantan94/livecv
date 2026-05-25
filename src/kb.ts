import type { PersonaConfig } from "./types";

/**
 * Compose the runtime knowledge base — the user's prose KB markdown
 * concatenated with auto-formatted structured data (career, projects,
 * blog). This is what gets injected into the system prompt.
 */
export function buildKnowledgeBase(config: PersonaConfig): string {
  return `${config.kbContent}

---

# Structured data (auto-generated from config — do not duplicate above)

## Career
${formatCareer(config)}

## Projects (use EXACT id values — these are Zod enums)
Available project ids: ${config.projects.map((p) => p.id).join(", ")}.

${formatProjects(config)}

${config.blog && config.blog.length > 0 ? `## Writing (use EXACT slug values — these are Zod enums)
Available blog slugs: ${config.blog.map((b) => b.slug).join(", ")}.

${formatBlog(config)}` : ""}
`.trim();
}

function formatCareer(config: PersonaConfig): string {
  return config.career
    .map(
      (c) =>
        `- **${c.start} – ${c.end}** — ${c.title} at ${c.org}${c.team ? ` (${c.team})` : ""}. ${c.detail} Tech: ${c.tech.join(", ")}.`,
    )
    .join("\n");
}

function formatProjects(config: PersonaConfig): string {
  return config.clusters
    .map((cluster) => {
      const items = config.projects
        .filter((p) => p.cluster === cluster.id)
        .map((p) => {
          const lines = [
            `  - ${p.id} — ${p.title}: ${p.description}`,
            `    Tech: ${p.tech.join(", ")}`,
            `    How: ${p.howItWorks.join("; ")}`,
            `    Insight: ${p.keyInsight}`,
          ];
          if (p.github) lines.push(`    GitHub: ${p.github}`);
          return lines.join("\n");
        })
        .join("\n");
      return items ? `### ${cluster.label}\n${items}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function formatBlog(config: PersonaConfig): string {
  return (config.blog ?? [])
    .map(
      (p) =>
        `- ${p.slug} (${p.date}) [${p.tags.join(", ")}]: ${p.title} — ${p.description}`,
    )
    .join("\n");
}
