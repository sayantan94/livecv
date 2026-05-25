import { defineClusters, defineProjects } from "livecv";

export type ClusterId = "infrastructure" | "developer-tools" | "writing-tools";

export const clusters = defineClusters([
  { id: "infrastructure", label: "Infrastructure" },
  { id: "developer-tools", label: "Developer Tools" },
  { id: "writing-tools", label: "Writing Tools" },
]);

export const projects = defineProjects([
  {
    id: "ledger-bench",
    title: "ledger-bench",
    tldr: "Benchmark suite for double-entry ledgers — Postgres, Spanner, FoundationDB, custom",
    description:
      "A reproducible benchmark suite for double-entry accounting ledgers across SQL, NewSQL, and key-value stores. Measures TPS, p99 latency, and consistency cost under contention.",
    tech: ["Go", "PostgreSQL", "FoundationDB", "Docker"],
    github: "https://github.com/jordanlee/ledger-bench",
    cluster: "infrastructure",
    howItWorks: [
      "Spins up each database in Docker with identical resources",
      "Runs a workload generator simulating 1k–30k concurrent payment transfers",
      "Records TPS, p50/p99 latency, and conflict rate over 10-minute windows",
      "Generates an HTML report comparing each store across workload shapes",
    ],
    keyInsight:
      "Most 'ledger DBs' look great at 1k TPS — the interesting data is what happens at 10k with hot partition keys.",
  },
  {
    id: "evt-replay",
    title: "evt-replay",
    tldr: "Replay Kafka topics against a new consumer, with offset bookmarks",
    description:
      "Operator tool for replaying historical Kafka events through a new consumer without affecting production. Tracks per-replay offset bookmarks so you can resume.",
    tech: ["Go", "Kafka", "BoltDB"],
    github: "https://github.com/jordanlee/evt-replay",
    cluster: "infrastructure",
    howItWorks: [
      "Reads a snapshot of consumer group offsets",
      "Spawns a sidecar consumer with its own group ID",
      "Streams historical events at a controlled rate",
      "Bookmarks progress to BoltDB so long replays survive restarts",
    ],
    keyInsight:
      "Replays are debugging tools, not data tools. The bookmark + rate-limit are what make them safe to run against prod brokers.",
  },
  {
    id: "schema-diff",
    title: "schema-diff",
    tldr: "Visual diff between two PostgreSQL schemas — for migration review",
    description:
      "CLI + web UI that compares two Postgres schemas (live DB or dumps) and produces a structural diff. Built to make migration reviews actually readable.",
    tech: ["TypeScript", "PostgreSQL", "Next.js"],
    github: "https://github.com/jordanlee/schema-diff",
    cluster: "developer-tools",
    howItWorks: [
      "Connects to two databases (or reads two pg_dump files)",
      "Builds a normalized schema graph for each",
      "Diffs by structural identity — column types, indexes, constraints",
      "Renders an annotated side-by-side view with risk flags",
    ],
    keyInsight:
      "Migration reviews fail because diffs look like noise. A structural diff with risk flags makes the actual scary changes visible.",
  },
  {
    id: "tomdraft",
    title: "tomdraft",
    tldr: "Local-first markdown drafting tool with timed sprints",
    description:
      "A minimalist markdown writer with built-in Pomodoro sprints. Runs entirely in the browser, persists to disk via the File System Access API.",
    tech: ["TypeScript", "Vite", "File System Access API"],
    github: "https://github.com/jordanlee/tomdraft",
    cluster: "writing-tools",
    howItWorks: [
      "Opens a local folder via FS Access API",
      "Live-saves keystrokes to the open .md file (no cloud)",
      "Per-document Pomodoro timer with word-count goal",
      "Export to PDF via paged-css print",
    ],
    keyInsight:
      "Local-first writing tools don't need an account, a sync server, or a markdown processor — just FS access and a 200-line editor.",
  },
]);

export function getProject(id: string) {
  return projects.find((p) => p.id === id);
}

export function projectsByCluster(cluster: ClusterId) {
  return projects.filter((p) => p.cluster === cluster);
}
