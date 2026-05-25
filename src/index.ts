// livecv — public exports.
//
// Server entrypoints (catalog/prompt/handler) and client entrypoints
// (PersonaSite, BespokeRenderer, components) are intentionally
// co-exported. Next.js will tree-shake client-only chunks out of the
// server bundle and vice versa via the "use client" directive on the
// React modules.

export {
  defineConfig,
  defineIdentity,
  defineCareer,
  defineProjects,
  defineClusters,
  defineBlog,
  definePrinciples,
  definePatent,
  defineEducation,
} from "./types";
export type {
  PersonaConfig,
  Identity,
  Project,
  CareerStep,
  BlogPost,
  Cluster,
  ClusterId,
  Patent,
  Education,
  Principle,
  SamplePrompt,
  PreviewKind,
  IdentityLinks,
} from "./types";

export { buildCatalog } from "./catalog";
export { buildSystemPrompt } from "./prompt";
export { buildKnowledgeBase } from "./kb";
export { DEFAULT_SAMPLES } from "./samples";

export { PersonaSite } from "./PersonaSite";
export { createHandler } from "./handler";
export { buildRegistry, Fallback } from "./registry";
export { BespokeRenderer } from "./BespokeRenderer";
