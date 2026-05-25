import { defineBlog } from "livecv";

export const blogPosts = defineBlog([
  {
    slug: "double-entry-postgres",
    title: "Double-Entry Accounting in Postgres Without Going Insane",
    date: "2026-04-12",
    description:
      "Twelve patterns I've used to model ledgers in Postgres — composite primary keys, immutable events, deferred summaries, and the one I now regret.",
    tags: ["postgres", "ledgers", "payments"],
  },
  {
    slug: "kafka-replay-safe",
    title: "Replaying Kafka in Production (Without Causing an Incident)",
    date: "2026-03-08",
    description:
      "The reasons your replay tool needs a sidecar consumer, a rate limit, and a bookmark — and why running it against your prod cluster is usually fine after that.",
    tags: ["kafka", "operations", "observability"],
  },
  {
    slug: "boring-tech",
    title: "What 'Boring Tech' Actually Means",
    date: "2026-01-22",
    description:
      "Boring isn't 'old.' Boring is the tool whose failure modes you can predict and whose docs exist. Most novel tools fail this test for years before they become safe.",
    tags: ["philosophy", "career"],
  },
]);

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
