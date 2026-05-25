import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import { z } from "zod";
import type { PersonaConfig } from "./types";

/**
 * Build a Zod-typed catalog from a PersonaConfig.
 *
 * Project IDs and blog slugs become Zod enums so the LLM cannot
 * hallucinate references that don't exist — the spec fails validation
 * and the renderer falls back gracefully.
 */
export function buildCatalog(config: PersonaConfig) {
  const projectIds = config.projects.map((p) => p.id) as [string, ...string[]];
  const blogSlugs = (config.blog ?? []).map((b) => b.slug) as [string, ...string[]];
  const clusterIds = config.clusters.map((c) => c.id) as [string, ...string[]];

  // Fallback enums for empty datasets — at least one literal required by Zod.
  const projectIdEnum =
    projectIds.length > 0 ? z.enum(projectIds) : z.enum(["__none__"]);
  const blogSlugEnum =
    blogSlugs.length > 0 ? z.enum(blogSlugs) : z.enum(["__none__"]);
  const clusterEnum =
    clusterIds.length > 0 ? z.enum(clusterIds) : z.enum(["__none__"]);

  return defineCatalog(schema, {
    components: {
      // ── shadcn primitives (used as-is) ──────────────────────────
      Stack: shadcnComponentDefinitions.Stack,
      Card: shadcnComponentDefinitions.Card,
      Grid: shadcnComponentDefinitions.Grid,
      Heading: shadcnComponentDefinitions.Heading,
      Separator: shadcnComponentDefinitions.Separator,
      Accordion: shadcnComponentDefinitions.Accordion,
      Badge: shadcnComponentDefinitions.Badge,
      Alert: shadcnComponentDefinitions.Alert,

      // ── livecv prose primitives ─────────────────────────────────
      Text: {
        props: z.object({
          content: z.string(),
          muted: z.boolean().nullable(),
        }),
        description: "Plain paragraph text. Use sparingly between bespoke components.",
        example: { content: "" },
      },

      PersonalNote: {
        props: z.object({ content: z.string().max(280) }),
        description:
          "ONE first-person sentence (max ~30 words) opening a personal answer. Use whenever the question is asked TO the persona. Voice: confident, specific, technical. NEVER 'Let me show you' or 'Here's what I built'. Each PersonalNote must be FRESHLY GENERATED — never copy from the system prompt examples.",
        example: { content: "" },
      },

      Callout: {
        props: z.object({
          type: z.enum(["info", "insight", "warning"]).nullable(),
          title: z.string().nullable(),
          content: z.string(),
        }),
        description:
          "Highlighted box for a key insight or one-line emphasis. Use sparingly.",
        example: { type: "insight", title: "", content: "" },
      },

      Link: {
        props: z.object({ text: z.string(), href: z.string() }),
        description: "External link.",
        example: { text: "", href: "" },
      },

      // ── identity ────────────────────────────────────────────────
      ProfileBlock: {
        props: z.object({}).nullable(),
        description:
          "Persona's identity card: name, role, location, links. Use for 'who are you', 'about', 'intro' questions.",
        example: {},
      },

      // ── career ──────────────────────────────────────────────────
      CareerTimeline: {
        props: z.object({
          focus: z.string().nullable(),
          focusReason: z.string().nullable(),
          highlightTech: z.array(z.string()).nullable(),
        }),
        description:
          "Chronological career rail with patent + education. Use for 'career', 'walk me through', 'background'. Pass focus + highlightTech to make it dynamic per question (e.g. focus='AI agent infrastructure', highlightTech=['MCP','A2A']).",
        example: { focus: null, focusReason: null, highlightTech: null },
      },

      Timeline: {
        props: z.object({
          items: z.array(
            z.object({
              title: z.string(),
              description: z.string().nullable(),
              date: z.string().nullable(),
              status: z.enum(["completed", "current", "upcoming"]).nullable(),
            }),
          ),
        }),
        description:
          "Generic vertical timeline for non-career sequences (e.g. project evolution). Do NOT use for career — use CareerTimeline.",
        example: { items: [] },
      },

      // ── projects ────────────────────────────────────────────────
      ProjectGrid: {
        props: z.object({
          cluster: clusterEnum.nullable(),
          title: z.string().nullable(),
        }),
        description:
          "Grid of project cards. Pass cluster to filter. Use for 'show me your X work' or 'all projects'.",
        example: { cluster: null, title: null },
      },

      ProjectDeepDive: {
        props: z.object({ id: projectIdEnum }),
        description:
          "Full breakdown of ONE project (tldr, how it works, key insight, tech, GitHub). Use when asked about a specific project by id.",
        example: { id: projectIds[0] ?? "__none__" },
      },

      TechStack: {
        props: z.object({ title: z.string().nullable() }),
        description:
          "Tag-cloud of all tech aggregated across projects, sized by frequency. Use for tech / stack / languages questions.",
        example: { title: null },
      },

      // ── writing ─────────────────────────────────────────────────
      BlogList: {
        props: z.object({
          limit: z.number().nullable(),
          tag: z.string().nullable(),
        }),
        description:
          "Recent blog posts. Use for 'writing', 'blog', 'what have you been writing'.",
        example: { limit: 5, tag: null },
      },

      BlogPostCard: {
        props: z.object({ slug: blogSlugEnum }),
        description: "Single blog post card. Use when asked about a specific post.",
        example: { slug: blogSlugs[0] ?? "__none__" },
      },

      // ── voice ───────────────────────────────────────────────────
      PrincipleList: {
        props: z.object({ title: z.string().nullable() }),
        description:
          "Numbered list of engineering principles. Use ONLY for explicit philosophy questions ('how do you build', 'principles', 'why you'). NEVER for experience questions.",
        example: { title: null },
      },

      // ── hire / proof ────────────────────────────────────────────
      ProofPoints: {
        props: z.object({
          title: z.string().nullable(),
          points: z.array(
            z.object({
              tag: z.string(),
              claim: z.string(),
              evidence: z.string(),
            }),
          ),
        }),
        description:
          "Tag + claim + evidence rows. Use for evidence-driven answers. Every point must reference a real metric or named artifact from the KB.",
        example: { title: null, points: [] },
      },

      LeadershipStories: {
        props: z.object({
          title: z.string().nullable(),
          roleFit: z.string().nullable(),
          stories: z.array(
            z.object({
              principle: z.string(),
              claim: z.string(),
              situation: z.string(),
              action: z.string(),
              result: z.string(),
              proofTag: z.string().nullable(),
            }),
          ),
        }),
        description:
          "STAR-format experience stories. Use for experience / role-fit / what-have-you-shipped questions. Generate fresh from the KB — never copy prompt examples.",
        example: { title: null, roleFit: null, stories: [] },
      },

      // ── contact ─────────────────────────────────────────────────
      ContactCTA: {
        props: z.object({ message: z.string().nullable() }),
        description: "Contact card with email + LinkedIn. Use for 'hire', 'contact', 'work together'.",
        example: { message: null },
      },
    },
    actions: {},
  });
}
