import { defineCareer } from "livecv";

export const career = defineCareer([
  {
    start: "Mar 2023",
    end: "Present",
    title: "Staff Software Engineer",
    org: "Acme Corp",
    team: "Payments Infra",
    detail:
      "Leading the rewrite of the payment ledger from a Postgres monolith to a sharded event-sourced system. Owning the migration path, the dual-write phase, and the observability rollout. 30k TPS sustained, p99 < 50ms.",
    tech: ["Go", "PostgreSQL", "Kafka", "Kubernetes", "OpenTelemetry"],
    status: "current",
  },
  {
    start: "Jul 2020",
    end: "Mar 2023",
    title: "Senior Software Engineer",
    org: "Globex",
    team: "Data Platform",
    detail:
      "Built the real-time event ingestion pipeline (Kafka + Flink) handling 200k events/sec. Designed the schema registry that unblocked downstream teams from blocking on each other's data model changes.",
    tech: ["Java", "Kafka", "Flink", "Avro", "AWS"],
    status: "completed",
  },
  {
    start: "Jul 2018",
    end: "Jul 2020",
    title: "Software Engineer",
    org: "Initech",
    team: "Backend",
    detail:
      "Backend engineer on the billing API. Cut p99 latency 4× by replacing a chatty ORM with hand-written SQL. Wrote the first Terraform modules the team adopted as a standard.",
    tech: ["Python", "PostgreSQL", "Terraform", "AWS"],
    status: "completed",
  },
]);
