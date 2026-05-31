// ─────────────────────────────────────────────────────────────────────
// livecv — public types
//
// A persona is defined by a typed config + a markdown KB. The config
// drives the catalog (Zod schemas, enums for project IDs / blog slugs),
// the system prompt, the rendered components, and the chat UI shell.
// ─────────────────────────────────────────────────────────────────────

export type ClusterId = string;

export interface Cluster {
  id: ClusterId;
  label: string;
}

export interface Project {
  id: string;
  title: string;
  tldr: string;
  description: string;
  tech: string[];
  github?: string;
  cluster: ClusterId;
  howItWorks: string[];
  keyInsight: string;
  blogPost?: string;
}

export interface CareerStep {
  start: string;
  end: string;
  title: string;
  org: string;
  team?: string;
  detail: string;
  tech: string[];
  status: "completed" | "current";
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  url?: string; // external URL — overrides the default blogUrlPattern
}

export interface IdentityLinks {
  site?: string;
  github?: string;
  linkedin?: string;
  blog?: string;
  twitter?: string;
}

export interface Patent {
  number: string;
  title: string;
  granted: string;
  summary: string;
}

export interface Education {
  degree: string;
  school: string;
  years: string;
  coursework?: string[];
}

export interface Principle {
  claim: string;
  detail: string;
}

export interface Identity {
  name: string;
  role: string;
  focus?: string;
  location?: string;
  employer?: string;
  yearsExperience?: number;
  bio: string;
  rightNow?: string;
  email: string;
  links: IdentityLinks;
  patent?: Patent;
  education?: Education;
  knowsAbout?: string[];
  principles?: Principle[];
  lookingFor?: string[];
  /** What you bring to a match — used by the mesh (meshedin) for mutual fit. */
  offering?: string[];
}

export interface SamplePrompt {
  prompt: string;
  component: string;          // label only — used as a small tag in the card
  previewKind: PreviewKind;   // visual hint of what will render
}

export type PreviewKind =
  | "profile"
  | "github"
  | "project-grid"
  | "project-deep-dive"
  | "tech-stack"
  | "blog-list"
  | "leadership-stories"
  | "leadership-experience"
  | "contact"
  | "career-timeline"
  | "how-it-works";

export interface PersonaConfig {
  identity: Identity;
  career: CareerStep[];
  projects: Project[];
  clusters: Cluster[];
  blog?: BlogPost[];

  /** Raw KB markdown content. Load this server-side via fs.readFileSync. */
  kbContent: string;

  /** AI SDK model id — e.g. "claude-haiku-4-5". */
  model?: string;

  /** Sample prompts shown in the empty state. If omitted, livecv supplies defaults. */
  samples?: SamplePrompt[];

  /** URL pattern for blog posts. `{slug}` is replaced. Default: links.blog/{slug}. */
  blogUrlPattern?: string;

  /** Override / extend system prompt routing. (v0.5+ — placeholder.) */
  routingNotes?: string;
}

// ─────────────────────────────────────────────────────────────────────
// Constructors — typed identity functions that give you autocomplete,
// validation at the point of definition, and a clear vocabulary.
// All of these are `<T>(x: T) => T` under the hood, but the named form
// is what makes livecv feel like a construct kit instead of a config blob.
// ─────────────────────────────────────────────────────────────────────

export function defineConfig(config: PersonaConfig): PersonaConfig {
  return config;
}

export function defineIdentity(identity: Identity): Identity {
  return identity;
}

export function defineCareer(career: CareerStep[]): CareerStep[] {
  return career;
}

export function defineProjects(projects: Project[]): Project[] {
  return projects;
}

export function defineClusters(clusters: Cluster[]): Cluster[] {
  return clusters;
}

export function defineBlog(blog: BlogPost[]): BlogPost[] {
  return blog;
}

export function definePrinciples(principles: Principle[]): Principle[] {
  return principles;
}

export function definePatent(patent: Patent): Patent {
  return patent;
}

export function defineEducation(education: Education): Education {
  return education;
}
