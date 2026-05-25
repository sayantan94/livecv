import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "livecv";
import { identity } from "@/data/identity";
import { career } from "@/data/career";
import { projects, clusters } from "@/data/projects";
import { blogPosts } from "@/data/blog";

// ─────────────────────────────────────────────────────────────────────
// livecv-example — the glue file.
//
// Everything that defines this persona lives in data/*.ts (using livecv's
// constructors) and content/kb.md (prose). This file is just the glue.
// ─────────────────────────────────────────────────────────────────────

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
  blogUrlPattern: "https://example.com/blog/{slug}",
});
