"use client";

import type { ReactNode } from "react";
import type { PersonaConfig, PreviewKind } from "../types";

/**
 * Low-fi mini-previews shown inside sample-prompt cards. Each one is a
 * static visual hint of what the actual prompt will render — not a real
 * component instance, just a sketch.
 */
export function renderPreview(kind: PreviewKind, config: PersonaConfig): ReactNode {
  switch (kind) {
    case "profile":
      return <ProfilePreview config={config} />;
    case "github":
      return <GithubPreview config={config} />;
    case "project-grid":
      return <ProjectGridPreview config={config} />;
    case "project-deep-dive":
      return <DeepDivePreview config={config} />;
    case "tech-stack":
      return <TechStackPreview config={config} />;
    case "blog-list":
      return <BlogListPreview config={config} />;
    case "leadership-stories":
      return <LeadershipStoriesPreview config={config} />;
    case "leadership-experience":
      return <LeadershipExperiencePreview config={config} />;
    case "contact":
      return <ContactPreview config={config} />;
    case "career-timeline":
      return <CareerTimelinePreview config={config} />;
    case "how-it-works":
      return <HowItWorksPreview />;
  }
}

function HowItWorksPreview() {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-[var(--lc-faint)]">
        <span>kb</span>
        <span>·</span>
        <span>catalog</span>
        <span>·</span>
        <span>llm</span>
        <span>·</span>
        <span className="text-[var(--lc-foreground)]/80">page</span>
      </div>
      <div className="grid grid-cols-4 gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 rounded ${i < 4 ? "bg-[var(--lc-muted)]" : "bg-[var(--lc-foreground)]/40"}`}
          />
        ))}
      </div>
      <div className="text-[9px] font-mono leading-snug pt-0.5">Same site, different shape per visitor.</div>
    </div>
  );
}

function ProfilePreview({ config }: { config: PersonaConfig }) {
  const { identity } = config;
  const initials = identity.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toLowerCase();
  const role = identity.role.toLowerCase();
  const location = identity.location?.toLowerCase() ?? "";
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-9 w-9 rounded-md bg-gradient-to-br from-[var(--lc-muted)] to-[var(--lc-background)] border border-[var(--lc-border)] flex items-center justify-center font-mono text-xs font-semibold shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="text-[11px] font-semibold truncate">{identity.name}</div>
        <div className="text-[9px] text-[var(--lc-muted-foreground)] truncate">
          {role}
          {location ? ` / ${location}` : ""}
        </div>
      </div>
    </div>
  );
}

function GithubPreview({ config }: { config: PersonaConfig }) {
  const handle = config.identity.links.github?.replace(/^https?:\/\/(www\.)?github\.com\//, "") ?? "github";
  const top3 = config.projects.slice(0, 3);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-[var(--lc-foreground)]/80 inline-flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.18c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.17a10.94 10.94 0 0 1 5.72 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.36.78 1.06.78 2.13v3.15c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>
          {handle}
        </span>
        <span className="text-[9px] font-mono text-[var(--lc-faint)]">{config.projects.length}+ repos</span>
      </div>
      <div className="space-y-0.5 pt-0.5">
        {top3.map((p) => (
          <div key={p.id} className="flex items-center justify-between text-[9px] font-mono">
            <span className="text-[var(--lc-foreground)]/80">{p.title}</span>
            <span className="text-[var(--lc-faint)]">{p.tech[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectGridPreview({ config }: { config: PersonaConfig }) {
  const items = config.projects.slice(0, 4);
  return (
    <div className="grid grid-cols-2 gap-1">
      {items.map((p) => (
        <div key={p.id} className="px-1.5 py-1 rounded border border-[var(--lc-border)] bg-[var(--lc-muted)]/40">
          <div className="text-[9px] font-semibold font-mono truncate">{p.title}</div>
          <div className="h-0.5 w-3/4 mt-1 rounded bg-[var(--lc-faint)]/30" />
        </div>
      ))}
    </div>
  );
}

function DeepDivePreview({ config }: { config: PersonaConfig }) {
  const p = config.projects[0];
  if (!p) return null;
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-mono font-semibold">{p.title}</div>
      <div className="text-[9px] text-[var(--lc-muted-foreground)] leading-relaxed line-clamp-2">{p.tldr}</div>
      <div className="flex gap-1">
        {p.tech.slice(0, 2).map((t) => (
          <span key={t} className="text-[8px] px-1 py-0.5 rounded bg-[var(--lc-muted)] text-[var(--lc-faint)]">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function TechStackPreview({ config }: { config: PersonaConfig }) {
  const counts: Record<string, number> = {};
  config.projects.forEach((p) => p.tech.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  const sorted = Object.keys(counts).sort((a, b) => counts[b]! - counts[a]!).slice(0, 6);
  return (
    <div className="flex flex-wrap gap-1">
      {sorted.map((t, i) => (
        <span
          key={t}
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border border-[var(--lc-border)] ${i < 2 ? "bg-[var(--lc-card)]" : "bg-[var(--lc-muted)]/40"}`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function BlogListPreview({ config }: { config: PersonaConfig }) {
  const posts = (config.blog ?? []).slice(0, 2);
  return (
    <div className="space-y-1.5">
      {posts.map((p) => (
        <div key={p.slug} className="flex items-baseline justify-between gap-2 border-b border-[var(--lc-border)] pb-1 last:border-0">
          <span className="text-[10px] truncate">{p.title}</span>
          <span className="text-[9px] font-mono text-[var(--lc-faint)] shrink-0">
            {new Date(p.date).toLocaleDateString("en-US", { month: "short" })}
          </span>
        </div>
      ))}
    </div>
  );
}

function LeadershipStoriesPreview({ config }: { config: PersonaConfig }) {
  const tag = config.career.find((c) => c.status === "current");
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[8px] font-mono uppercase tracking-wider text-[var(--lc-foreground)]/80 inline-flex items-center gap-0.5">
          <span className="h-1 w-1 rounded-full bg-[var(--lc-foreground)] drop-shadow-[0_0_3px_rgba(232,232,232,0.6)]" />
          {tag?.org ?? "Experience"}
        </span>
      </div>
      <div className="text-[9px] font-semibold leading-snug">{tag?.title ?? config.identity.role}</div>
      <div className="text-[8px] text-[var(--lc-faint)]">{tag ? `${tag.team ?? tag.org} · ${tag.start}` : config.identity.bio.slice(0, 40)}</div>
    </div>
  );
}

function LeadershipExperiencePreview({ config }: { config: PersonaConfig }) {
  const current = config.career.find((c) => c.status === "current");
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[8px] font-mono uppercase tracking-wider text-[var(--lc-foreground)]/80 inline-flex items-center gap-0.5">
          <span className="h-1 w-1 rounded-full bg-[var(--lc-foreground)] drop-shadow-[0_0_3px_rgba(232,232,232,0.6)]" />
          Tech Lead
        </span>
      </div>
      <div className="text-[9px] font-semibold leading-snug">{current ? `${current.title} at ${current.org}` : "Leadership"}</div>
      <div className="text-[8px] text-[var(--lc-faint)]">{current ? `${current.start} → ${current.end}` : ""}</div>
    </div>
  );
}

function ContactPreview({ config }: { config: PersonaConfig }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-medium leading-snug">Let's build something together.</div>
      <div className="flex gap-1">
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--lc-foreground)] text-[var(--lc-background)] font-mono">email</span>
        {config.identity.links.linkedin && (
          <span className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--lc-border)] font-mono">linkedin</span>
        )}
      </div>
    </div>
  );
}

function CareerTimelinePreview({ config }: { config: PersonaConfig }) {
  const top3 = config.career.slice(0, 3);
  return (
    <div className="space-y-0.5">
      {top3.map((c, i) => (
        <div key={i} className="flex items-baseline justify-between text-[9px] font-mono">
          <span className="text-[var(--lc-foreground)]/80">{c.org}</span>
          <span className="text-[var(--lc-faint)]">{c.start}</span>
        </div>
      ))}
    </div>
  );
}
