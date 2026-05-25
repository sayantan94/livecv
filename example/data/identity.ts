import {
  defineIdentity,
  defineEducation,
  definePatent,
  definePrinciples,
} from "livecv";

// ─────────────────────────────────────────────────────────────────────
// Replace everything in this file with your own info.
// This is fictional data for the starter template.
// ─────────────────────────────────────────────────────────────────────

export const education = defineEducation({
  degree: "BS in Computer Science",
  school: "University of Washington",
  years: "2014 — 2018",
});

export const principles = definePrinciples([
  {
    claim: "Boring tech wins.",
    detail:
      "Postgres before Cassandra, cron before Kafka, monorepo before microservices. Reach for novelty only when boring has actually failed — usually it hasn't.",
  },
  {
    claim: "Observability before optimization.",
    detail:
      "You can't speed up what you can't measure. Logs, metrics, traces are step one of any performance work, not the last 10%.",
  },
  {
    claim: "Write for the next engineer.",
    detail:
      "The person debugging this at 2am won't have my context. Comments explain the *why*; names explain the *what*; tests explain the *how*.",
  },
]);

export const identity = defineIdentity({
  name: "Jordan Lee",
  role: "Staff Software Engineer",
  focus: "Distributed Systems",
  location: "Brooklyn, NY",
  employer: "Acme Corp",
  yearsExperience: 8,
  bio: "Staff engineer working on distributed data infrastructure. 8 years building systems that move money, ingest events, and stay up. Boring tech, observable, tested.",
  rightNow:
    "Leading the rewrite of Acme's payment ledger — from a Postgres monolith to a sharded event-sourced system handling 30k TPS at p99 < 50ms.",
  email: "jordan@example.com",
  links: {
    site: "https://example.com",
    github: "https://github.com/jordanlee",
    linkedin: "https://linkedin.com/in/jordanlee",
    blog: "https://example.com/blog",
  },
  education,
  knowsAbout: [
    "Distributed Systems",
    "Event-Driven Architecture",
    "PostgreSQL",
    "Kafka",
    "Observability",
    "TypeScript",
    "Go",
    "Rust",
    "AWS",
    "Kubernetes",
  ],
  principles,
  lookingFor: [
    "Staff / Principal engineering roles on distributed data systems",
    "Consulting on payment infrastructure or event-sourced architectures",
    "Open-source collaborations on observability tooling",
  ],
});
