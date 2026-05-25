import type { SamplePrompt } from "./types";

/**
 * Default sample prompts shown in the empty state. Users override via
 * `config.samples` if they want a different starter grid.
 */
export const DEFAULT_SAMPLES: SamplePrompt[] = [
  { prompt: "show me your open-source work on GitHub", component: "ProjectGrid", previewKind: "github" },
  { prompt: "show me your AI agent projects", component: "ProjectGrid", previewKind: "project-grid" },
  { prompt: "experience in FDE / AI tooling at enterprise scale?", component: "LeadershipStories", previewKind: "leadership-stories" },
  { prompt: "what leadership experience do you have?", component: "ProofPoints", previewKind: "leadership-experience" },
  { prompt: "what tech do you use?", component: "TechStack", previewKind: "tech-stack" },
  { prompt: "what have you been writing?", component: "BlogList", previewKind: "blog-list" },
  { prompt: "how does this site work?", component: "ProofPoints", previewKind: "how-it-works" },
  { prompt: "who are you?", component: "ProfileBlock", previewKind: "profile" },
  { prompt: "let's work together", component: "ContactCTA", previewKind: "contact" },
];
