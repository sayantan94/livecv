"use client";

import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import {
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Info,
  ArrowUpRight,
  Mail,
  Github,
  Linkedin,
  Globe,
  FileText,
  Award,
  GraduationCap,
} from "lucide-react";
import type { PersonaConfig } from "./types";
import { buildCatalog } from "./catalog";

/**
 * Build a typed component registry for a PersonaConfig.
 *
 * The data-baked components (ProfileBlock, CareerTimeline, etc.) close
 * over the config so they render from real data. The LLM-driven
 * components (PersonalNote, Callout, ProofPoints, LeadershipStories,
 * etc.) take props only and render whatever the model emits.
 */
export function buildRegistry(config: PersonaConfig) {
  const { identity, projects, career, blog, blogUrlPattern } = config;
  const blogUrl = (slug: string, override?: string) =>
    override ??
    (blogUrlPattern
      ? blogUrlPattern.replace("{slug}", slug)
      : `${identity.links.blog ?? identity.links.site ?? ""}/${slug}`);

  const catalog = buildCatalog(config);

  return defineRegistry(catalog, {
    components: {
      // ── shadcn primitives ────────────────────────────────────────
      Stack: shadcnComponents.Stack,
      Card: shadcnComponents.Card,
      Grid: shadcnComponents.Grid,
      Heading: shadcnComponents.Heading,
      Separator: shadcnComponents.Separator,
      Accordion: shadcnComponents.Accordion,
      Badge: shadcnComponents.Badge,
      Alert: shadcnComponents.Alert,

      // ── prose primitives ─────────────────────────────────────────
      Text: ({ props }) => (
        <p
          className={
            props.muted
              ? "text-sm text-[var(--lc-muted-foreground)] leading-relaxed"
              : "text-sm leading-relaxed"
          }
        >
          {props.content}
        </p>
      ),

      Link: ({ props }) => (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[var(--lc-foreground)] underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          {props.text}
          <ArrowUpRight className="h-3 w-3" />
        </a>
      ),

      Callout: ({ props }) => {
        const variant = props.type ?? "info";
        const config = {
          info: { Icon: Info, accent: "border-l-blue-500/60 bg-blue-500/[0.04]" },
          insight: { Icon: Lightbulb, accent: "border-l-[var(--lc-foreground)]/40 bg-[var(--lc-foreground)]/[0.03]" },
          warning: { Icon: AlertTriangle, accent: "border-l-rose-500/60 bg-rose-500/[0.04]" },
        }[variant];
        const Icon = config.Icon;
        return (
          <div className={`border-l-2 ${config.accent} pl-4 py-3 pr-4 rounded-r`}>
            <div className="flex items-start gap-2.5">
              <Icon className="h-4 w-4 mt-0.5 shrink-0 text-[var(--lc-muted-foreground)]" />
              <div className="flex-1 min-w-0">
                {props.title && (
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--lc-foreground)]/80">
                    {props.title}
                  </p>
                )}
                <p className="text-sm leading-relaxed text-[var(--lc-foreground)]/90">{props.content}</p>
              </div>
            </div>
          </div>
        );
      },

      PersonalNote: ({ props }) => (
        <div className="relative pl-5 py-1">
          <span className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-[var(--lc-foreground)]/60 to-[var(--lc-foreground)]/0" />
          <p className="text-[15px] leading-relaxed text-[var(--lc-foreground)]/95">{props.content}</p>
        </div>
      ),

      // ── identity ─────────────────────────────────────────────────
      ProfileBlock: () => (
        <div className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-card)] p-6 space-y-5">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight">{identity.name}</h2>
              <p className="text-sm text-[var(--lc-muted-foreground)] font-mono">
                {identity.role}
                {identity.focus ? ` / ${identity.focus.toLowerCase()}` : ""}
              </p>
              {(identity.location || identity.employer || identity.yearsExperience) && (
                <p className="text-xs text-[var(--lc-muted-foreground)]">
                  {[identity.location, identity.employer, identity.yearsExperience ? `${identity.yearsExperience}+ yrs` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-[var(--lc-muted)] to-[var(--lc-background)] border border-[var(--lc-border)] flex items-center justify-center font-mono text-2xl font-semibold shrink-0">
              {initialsOf(identity.name)}
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[var(--lc-foreground)]/85">{identity.bio}</p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {identity.links.site && <ProfileLink href={identity.links.site} icon={Globe} label={cleanUrl(identity.links.site)} />}
            {identity.links.github && <ProfileLink href={identity.links.github} icon={Github} label="GitHub" />}
            {identity.links.blog && <ProfileLink href={identity.links.blog} icon={FileText} label="Blog" />}
            {identity.email && <ProfileLink href={`mailto:${identity.email}`} icon={Mail} label="Email" />}
          </div>
        </div>
      ),

      // ── career ───────────────────────────────────────────────────
      CareerTimeline: ({ props }) => {
        const focus = props.focus ?? null;
        const highlightTech = new Set((props.highlightTech ?? []).map((t) => t.toLowerCase()));
        const isHighlightedStep = (step: typeof career[number]) =>
          highlightTech.size > 0 && step.tech.some((t) => highlightTech.has(t.toLowerCase()));
        return (
          <div className="space-y-5">
            {focus && (
              <div className="rounded-lg border border-[var(--lc-border)] bg-[var(--lc-card)] p-4 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--lc-faint)]">Focused on</div>
                <p className="text-[15px] font-semibold leading-snug">{focus}</p>
                {props.focusReason && (
                  <p className="text-[12px] text-[var(--lc-muted-foreground)] leading-relaxed">{props.focusReason}</p>
                )}
              </div>
            )}
            <div className="relative pl-7">
              <div className="absolute left-[5.5px] top-3 bottom-3 w-px bg-[var(--lc-border)]" />
              <div className="flex flex-col gap-6">
                {career.map((step, i) => {
                  const dot = step.status === "current" ? "bg-[var(--lc-foreground)]" : "bg-[var(--lc-foreground)]/70";
                  const isRelevant = isHighlightedStep(step);
                  return (
                    <div key={i} className={`relative ${focus && !isRelevant ? "opacity-50" : ""}`}>
                      <div className={`absolute -left-7 top-1.5 h-3 w-3 rounded-full ${dot} ring-4 ring-[var(--lc-background)]`} />
                      <div className="space-y-1.5">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--lc-muted-foreground)] bg-[var(--lc-muted)] px-1.5 py-0.5 rounded">
                            {step.start} — {step.end}
                          </span>
                          {step.status === "current" && (
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--lc-foreground)]">now</span>
                          )}
                          {isRelevant && (
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--lc-foreground)]/80">match</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-snug">
                            {step.title} <span className="text-[var(--lc-muted-foreground)] font-normal">at {step.org}</span>
                          </p>
                          {step.team && (
                            <p className="text-[11px] text-[var(--lc-muted-foreground)] font-mono mt-0.5">{step.team}</p>
                          )}
                        </div>
                        <p className="text-[13px] text-[var(--lc-muted-foreground)] leading-relaxed">{step.detail}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {step.tech.slice(0, 6).map((t) => {
                            const isMatch = highlightTech.has(t.toLowerCase());
                            return (
                              <span
                                key={t}
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                  isMatch
                                    ? "border-[var(--lc-foreground)]/40 bg-[var(--lc-foreground)]/10 text-[var(--lc-foreground)]"
                                    : "border-transparent bg-[var(--lc-muted)] text-[var(--lc-muted-foreground)]"
                                }`}
                              >
                                {t}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {(identity.patent || identity.education) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--lc-border)]">
                {identity.patent && (
                  <div className="rounded-lg border border-[var(--lc-border)] bg-[var(--lc-card)] p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--lc-muted-foreground)]">
                      <Award className="h-3 w-3" />
                      Patent
                    </div>
                    <p className="text-[13px] font-semibold leading-snug">{identity.patent.number}</p>
                    <p className="text-[11px] text-[var(--lc-muted-foreground)] leading-relaxed">{identity.patent.title}</p>
                    <p className="text-[10px] font-mono text-[var(--lc-faint)]">Granted {identity.patent.granted}</p>
                  </div>
                )}
                {identity.education && (
                  <div className="rounded-lg border border-[var(--lc-border)] bg-[var(--lc-card)] p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--lc-muted-foreground)]">
                      <GraduationCap className="h-3 w-3" />
                      Education
                    </div>
                    <p className="text-[13px] font-semibold leading-snug">{identity.education.degree}</p>
                    <p className="text-[11px] text-[var(--lc-muted-foreground)]">{identity.education.school}</p>
                    <p className="text-[10px] font-mono text-[var(--lc-faint)]">{identity.education.years}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },

      Timeline: ({ props }) => (
        <div className="relative pl-7">
          <div className="absolute left-[5.5px] top-3 bottom-3 w-px bg-[var(--lc-border)]" />
          <div className="flex flex-col gap-5">
            {(props.items ?? []).map((item, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-7 top-1 h-3 w-3 rounded-full bg-[var(--lc-foreground)] ring-2 ring-[var(--lc-background)]" />
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className="font-medium text-sm">{item.title}</p>
                  {item.date && (
                    <span className="text-[10px] font-mono text-[var(--lc-muted-foreground)] bg-[var(--lc-muted)] px-1.5 py-0.5 rounded">
                      {item.date}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-[var(--lc-muted-foreground)] mt-1 leading-relaxed">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ),

      // ── projects ─────────────────────────────────────────────────
      ProjectGrid: ({ props }) => {
        const list = props.cluster ? projects.filter((p) => p.cluster === props.cluster) : projects;
        return (
          <div className="space-y-3">
            {props.title && (
              <div className="flex items-baseline justify-between border-b border-[var(--lc-border)] pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--lc-muted-foreground)]">{props.title}</h3>
                <span className="text-xs text-[var(--lc-muted-foreground)]">
                  {list.length} highlighted{identity.links.github ? " · more on GitHub" : ""}
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {list.map((p) => (
                <a
                  key={p.id}
                  href={p.github ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border border-[var(--lc-border)] bg-[var(--lc-card)] p-4 hover:border-[var(--lc-muted-foreground)]/30 transition-colors flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold font-mono">{p.title}</h4>
                    {p.github && <Github className="h-3.5 w-3.5 text-[var(--lc-muted-foreground)]/40 group-hover:text-[var(--lc-foreground)] transition-colors" />}
                  </div>
                  <p className="text-xs text-[var(--lc-muted-foreground)] leading-relaxed flex-1">{p.tldr}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.tech.slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--lc-muted)] text-[var(--lc-muted-foreground)]">
                        {t}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
            {identity.links.github && (
              <a
                href={identity.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-[11px] font-mono text-[var(--lc-muted-foreground)] hover:text-[var(--lc-foreground)] transition-colors pt-1"
              >
                <Github className="h-3 w-3" />
                <span>see more on {cleanUrl(identity.links.github)}</span>
                <ArrowUpRight className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </div>
        );
      },

      ProjectDeepDive: ({ props }) => {
        const p = projects.find((pr) => pr.id === props.id);
        if (!p) return <p className="text-sm text-[var(--lc-muted-foreground)]">Project not found: {props.id}</p>;
        return (
          <div className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-card)] overflow-hidden">
            <div className="border-b border-[var(--lc-border)] p-5 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold font-mono">{p.title}</h3>
                  <p className="text-sm text-[var(--lc-muted-foreground)] mt-1">{p.tldr}</p>
                </div>
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-[var(--lc-border)] hover:bg-[var(--lc-muted)] transition-colors shrink-0"
                  >
                    <Github className="h-3 w-3" /> GitHub
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {p.tech.map((t) => (
                  <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--lc-muted)] text-[var(--lc-muted-foreground)]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lc-muted-foreground)] mb-2">
                  How it works
                </h4>
                <ol className="space-y-1.5">
                  {p.howItWorks.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed">
                      <span className="text-[var(--lc-muted-foreground)] font-mono text-xs mt-0.5 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="border-l-2 border-[var(--lc-foreground)]/40 bg-[var(--lc-foreground)]/[0.03] pl-4 py-2 pr-4 rounded-r">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-[var(--lc-muted-foreground)]" />
                  <p className="text-sm leading-relaxed">{p.keyInsight}</p>
                </div>
              </div>
            </div>
          </div>
        );
      },

      TechStack: ({ props }) => {
        const counts: Record<string, number> = {};
        projects.forEach((p) => p.tech.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
        const sorted = Object.keys(counts).sort((a, b) => counts[b]! - counts[a]!);
        return (
          <div className="space-y-3">
            {props.title && (
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--lc-muted-foreground)] border-b border-[var(--lc-border)] pb-2">
                {props.title}
              </h3>
            )}
            <div className="flex flex-wrap gap-2">
              {sorted.map((t) => {
                const c = counts[t]!;
                const size = c >= 3 ? "text-sm px-3 py-1.5" : c === 2 ? "text-xs px-2.5 py-1" : "text-xs px-2 py-0.5";
                return (
                  <span key={t} className={`${size} font-mono rounded-md border border-[var(--lc-border)] bg-[var(--lc-card)]`}>
                    {t}
                    {c > 1 && <span className="text-[var(--lc-muted-foreground)] ml-1.5">×{c}</span>}
                  </span>
                );
              })}
            </div>
          </div>
        );
      },

      // ── writing ──────────────────────────────────────────────────
      BlogList: ({ props }) => {
        const limit = props.limit ?? (blog?.length ?? 0);
        const tagFilter = props.tag;
        const list = (blog ?? [])
          .filter((p) => !tagFilter || p.tags.includes(tagFilter))
          .slice(0, limit);
        return (
          <div className="space-y-1">
            <div className="border-b border-[var(--lc-border)] pb-2 mb-3 flex items-baseline justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--lc-muted-foreground)]">
                {tagFilter ? `Writing · #${tagFilter}` : "Writing"}
              </h3>
              <span className="text-xs text-[var(--lc-muted-foreground)]">{list.length} post{list.length === 1 ? "" : "s"}</span>
            </div>
            {list.map((p) => (
              <a
                key={p.slug}
                href={blogUrl(p.slug, p.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="group block py-3 border-b border-[var(--lc-border)] last:border-0 hover:bg-[var(--lc-muted)]/30 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex items-baseline justify-between gap-4 mb-1">
                  <span className="text-sm font-medium group-hover:text-[var(--lc-foreground)] transition-colors">{p.title}</span>
                  <span className="shrink-0 text-[11px] font-mono text-[var(--lc-muted-foreground)]">
                    {new Date(p.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-xs text-[var(--lc-muted-foreground)] leading-relaxed">{p.description}</p>
              </a>
            ))}
          </div>
        );
      },

      BlogPostCard: ({ props }) => {
        const p = (blog ?? []).find((b) => b.slug === props.slug);
        if (!p) return <p className="text-sm text-[var(--lc-muted-foreground)]">Post not found: {props.slug}</p>;
        return (
          <a
            href={blogUrl(p.slug, p.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border border-[var(--lc-border)] bg-[var(--lc-card)] p-5 hover:border-[var(--lc-muted-foreground)]/30 transition-colors"
          >
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <span className="text-[10px] font-mono text-[var(--lc-muted-foreground)] uppercase tracking-wider">
                {new Date(p.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--lc-muted-foreground)]/50 group-hover:text-[var(--lc-foreground)] transition-colors" />
            </div>
            <h3 className="text-base font-semibold mb-2 group-hover:text-[var(--lc-foreground)] transition-colors">{p.title}</h3>
            <p className="text-sm text-[var(--lc-muted-foreground)] leading-relaxed mb-3">{p.description}</p>
            <div className="flex flex-wrap gap-1">
              {p.tags.map((t) => (
                <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--lc-muted)] text-[var(--lc-muted-foreground)]">
                  #{t}
                </span>
              ))}
            </div>
          </a>
        );
      },

      // ── voice ────────────────────────────────────────────────────
      PrincipleList: ({ props }) => (
        <div className="space-y-0">
          {props.title && (
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--lc-muted-foreground)] border-b border-[var(--lc-border)] pb-2 mb-3">
              {props.title}
            </h3>
          )}
          {(identity.principles ?? []).map((p, i) => (
            <div key={i} className="grid grid-cols-[2.5rem_1fr] gap-4 py-4 border-b border-[var(--lc-border)] last:border-0">
              <div className="font-mono text-xs text-[var(--lc-muted-foreground)] pt-0.5">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-snug">{p.claim}</p>
                <p className="text-sm text-[var(--lc-muted-foreground)] leading-relaxed">{p.detail}</p>
              </div>
            </div>
          ))}
        </div>
      ),

      // ── proof ────────────────────────────────────────────────────
      ProofPoints: ({ props }) => (
        <div className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-card)] overflow-hidden">
          {props.title && (
            <div className="px-5 py-3 border-b border-[var(--lc-border)] bg-[var(--lc-muted)]/30">
              <h3 className="text-sm font-semibold">{props.title}</h3>
            </div>
          )}
          <div className="divide-y divide-[var(--lc-border)]">
            {props.points.map((p, i) => (
              <div key={i} className="px-5 py-4 grid grid-cols-[5rem_1fr] gap-4 items-start">
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--lc-foreground)]/80 mt-1 inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--lc-foreground)] drop-shadow-[0_0_4px_rgba(232,232,232,0.6)]" />
                  {p.tag}
                </span>
                <div className="space-y-1">
                  <p className="text-[14px] font-semibold leading-snug">{p.claim}</p>
                  <p className="text-[12px] text-[var(--lc-muted-foreground)] leading-relaxed">{p.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),

      LeadershipStories: ({ props }) => (
        <div className="space-y-4">
          {(props.title || props.roleFit) && (
            <div className="space-y-1.5 pb-3 border-b border-[var(--lc-border)]">
              {props.title && <h3 className="text-base font-semibold">{props.title}</h3>}
              {props.roleFit && (
                <p className="text-[12px] font-mono uppercase tracking-[0.16em] text-[var(--lc-foreground)]/80 inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--lc-foreground)] drop-shadow-[0_0_4px_rgba(232,232,232,0.6)]" />
                  {props.roleFit}
                </p>
              )}
            </div>
          )}
          <div className="space-y-3">
            {props.stories.map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-card)] overflow-hidden hover:border-[var(--lc-foreground)]/20 transition-colors"
              >
                <div className="px-4 py-3 border-b border-[var(--lc-border)] bg-[var(--lc-muted)]/30 flex items-baseline justify-between gap-3 flex-wrap">
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--lc-foreground)]/80 inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--lc-foreground)] drop-shadow-[0_0_4px_rgba(232,232,232,0.6)]" />
                    {s.principle}
                  </span>
                  {s.proofTag && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--lc-faint)]">{s.proofTag}</span>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-[14px] font-semibold leading-snug">{s.claim}</p>
                  <div className="grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-1.5 text-[12px] leading-relaxed">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--lc-faint)] pt-0.5">Context</span>
                    <span className="text-[var(--lc-muted-foreground)]">{s.situation}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--lc-faint)] pt-0.5">Action</span>
                    <span className="text-[var(--lc-muted-foreground)]">{s.action}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--lc-foreground)]/70 pt-0.5">Result</span>
                    <span className="text-[var(--lc-foreground)] font-medium">{s.result}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),

      // ── contact ──────────────────────────────────────────────────
      ContactCTA: ({ props }) => (
        <div className="rounded-xl border border-[var(--lc-border)] bg-[var(--lc-card)] p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-[var(--lc-foreground)] mt-0.5 shrink-0" />
            <div>
              <h3 className="text-base font-semibold mb-1">
                {props.message ?? "Let's build something together."}
              </h3>
              <p className="text-sm text-[var(--lc-muted-foreground)]">
                Partnerships, integrations, or just want to talk shop — I'm down.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`mailto:${identity.email}`}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-[var(--lc-foreground)] text-[var(--lc-background)] hover:opacity-90 transition-opacity"
            >
              <Mail className="h-3.5 w-3.5" />
              {identity.email}
            </a>
            {identity.links.linkedin && (
              <a
                href={identity.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-[var(--lc-border)] hover:bg-[var(--lc-muted)] transition-colors"
              >
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
              </a>
            )}
          </div>
        </div>
      ),
    },
  });
}

// ─── helpers ────────────────────────────────────────────────────────

function ProfileLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-[var(--lc-border)] hover:bg-[var(--lc-muted)] transition-colors"
    >
      <Icon className="h-3.5 w-3.5 text-[var(--lc-muted-foreground)]" />
      <span className="flex-1">{label}</span>
      <ArrowUpRight className="h-3 w-3 text-[var(--lc-muted-foreground)]/50 group-hover:text-[var(--lc-foreground)] transition-colors" />
    </a>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toLowerCase();
  return parts[0]!.slice(0, 2).toLowerCase();
}

function cleanUrl(url: string): string {
  return url.replace(/^https?:\/\/(?:www\.)?/, "").replace(/\/$/, "");
}

export function Fallback({ type }: { type: string }) {
  return (
    <div className="p-4 border border-dashed border-[var(--lc-border)] rounded-lg text-[var(--lc-muted-foreground)] text-xs font-mono">
      Unknown component: {type}
    </div>
  );
}
