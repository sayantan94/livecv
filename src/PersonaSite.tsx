"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  SPEC_DATA_PART,
  SPEC_DATA_PART_TYPE,
  type SpecDataPart,
} from "@json-render/core";
import { useJsonRenderMessage } from "@json-render/react";
import { ArrowUp, Loader2, ArrowUpRight, RotateCcw, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { PersonaConfig, SamplePrompt } from "./types";
import { BespokeRenderer } from "./BespokeRenderer";
import { renderPreview } from "./components/previews";
import { DEFAULT_SAMPLES } from "./samples";
import { ThemeToggle } from "./ThemeToggle";

type AppDataParts = { [SPEC_DATA_PART]: SpecDataPart };
type AppMessage = UIMessage<unknown, AppDataParts>;

interface PersonaSiteProps {
  config: PersonaConfig;
  /** Optional API endpoint override. Default: /api/generate */
  apiPath?: string;
  /** Optional custom header content (replaces the default site mark + links). */
  header?: React.ReactNode;
  /** Optional custom hero — receives the identity, returns JSX. */
  renderHero?: (config: PersonaConfig) => React.ReactNode;
}

export function PersonaSite({ config, apiPath = "/api/generate", header, renderHero }: PersonaSiteProps) {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const transport = useRef(new DefaultChatTransport({ api: apiPath })).current;
  useEffect(() => setMounted(true), []);

  const { messages, sendMessage, setMessages, status, error } =
    useChat<AppMessage>({ transport });
  const isStreaming = status === "streaming" || status === "submitted";
  const isEmpty = messages.length === 0;

  const userMessages = messages.filter((m) => m.role === "user");
  const latestUser = userMessages[userMessages.length - 1];
  const effectiveUserId =
    activeUserId && userMessages.some((m) => m.id === activeUserId)
      ? activeUserId
      : latestUser?.id ?? null;
  const activeUser = userMessages.find((m) => m.id === effectiveUserId);
  const activeUserText = activeUser
    ? activeUser.parts.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join("")
    : "";
  const activeUserIndex = activeUser ? messages.findIndex((m) => m.id === activeUser.id) : -1;
  const activeAssistant =
    activeUserIndex >= 0
      ? messages.slice(activeUserIndex + 1).find((m) => m.role === "assistant")
      : undefined;
  const isActivePairStreaming = isStreaming && activeUser?.id === latestUser?.id;

  const handleSubmit = useCallback(
    async (text?: string) => {
      const msg = (text ?? input).trim();
      if (!msg || isStreaming) return;
      setInput("");
      setActiveUserId(null);
      await sendMessage({ text: msg });
    },
    [input, isStreaming, sendMessage],
  );

  const handleClear = useCallback(() => {
    setMessages([]);
    setInput("");
    setActiveUserId(null);
  }, [setMessages]);

  const samples: SamplePrompt[] = config.samples ?? DEFAULT_SAMPLES;
  const firstName = config.identity.name.split(/\s+/)[0];

  if (!mounted) {
    return (
      <div className="h-screen flex flex-col bg-[var(--lc-background)] text-[var(--lc-foreground)]">
        <DefaultHeader config={config} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--lc-background)] text-[var(--lc-foreground)]">
      {header ?? <DefaultHeader config={config} onClear={!isEmpty ? handleClear : undefined} />}

      <AnimatePresence>
        {!isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="border-b border-[var(--lc-border)] bg-[var(--lc-background)]/90 backdrop-blur-md shrink-0"
          >
            <div className="max-w-3xl mx-auto px-6 py-3">
              <Composer
                value={input}
                onChange={setInput}
                onSubmit={() => handleSubmit()}
                disabled={isStreaming}
                placeholder="ask another question..."
                size="sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="popLayout">
              {isEmpty ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-full flex items-center justify-center px-6 py-12"
                >
                  <div className="max-w-3xl w-full space-y-12">
                    {renderHero ? (
                      renderHero(config)
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center space-y-4"
                      >
                        <h1 className="text-[clamp(40px,6.5vw,64px)] font-medium leading-[1.0] tracking-[-0.04em]">
                          Hi, I'm {firstName}.
                          <span className="lc-cursor" aria-hidden />
                        </h1>
                        <p className="text-[14px] text-[var(--lc-muted-foreground)] max-w-lg mx-auto leading-relaxed">
                          A live persona of me. Ask anything — the page renders the answer.
                        </p>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="max-w-2xl mx-auto"
                    >
                      <Composer
                        value={input}
                        onChange={setInput}
                        onSubmit={() => handleSubmit()}
                        disabled={isStreaming}
                        autoFocus
                        size="lg"
                        placeholder="ask anything..."
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[var(--lc-faint)] max-w-md mx-auto">
                        <span className="flex-1 h-px bg-[var(--lc-border)]" />
                        <span>or try</span>
                        <span className="flex-1 h-px bg-[var(--lc-border)]" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {samples.map((s, i) => (
                          <motion.button
                            key={s.prompt}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -3 }}
                            onClick={() => handleSubmit(s.prompt)}
                            disabled={isStreaming}
                            className="group text-left rounded-lg border border-[var(--lc-border)] bg-[var(--lc-card)] p-3 hover:border-[var(--lc-foreground)]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col gap-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[12px] font-mono text-[var(--lc-foreground)] leading-snug inline-flex items-baseline gap-1.5">
                                <ChevronRight className="h-3 w-3 text-[var(--lc-foreground)]/80 shrink-0 self-center drop-shadow-[0_0_4px_rgba(232,232,232,0.5)] group-hover:drop-shadow-[0_0_6px_rgba(232,232,232,0.7)] transition-all" />
                                <span>{s.prompt}</span>
                              </span>
                              <ArrowUpRight className="h-3 w-3 text-[var(--lc-faint)] group-hover:text-[var(--lc-foreground)] transition-colors shrink-0 mt-0.5" />
                            </div>
                            <div className="rounded border border-[var(--lc-border)]/60 bg-[var(--lc-background)]/60 p-2.5 min-h-[72px] flex items-center">
                              <div className="w-full">{renderPreview(s.previewKind, config)}</div>
                            </div>
                            <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--lc-faint)] inline-flex items-center gap-1.5">
                              <ChevronRight className="h-2.5 w-2.5 text-[var(--lc-foreground)]/70 drop-shadow-[0_0_3px_rgba(232,232,232,0.4)]" />
                              {s.component}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`scene-${effectiveUserId}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-8 py-10"
                >
                  <div className="max-w-3xl mx-auto">
                    <Scene
                      config={config}
                      message={activeAssistant}
                      isStreaming={isActivePairStreaming}
                      promptText={activeUserText}
                    />
                    {error && (
                      <div className="mt-6 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
                        {error.message}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function DefaultHeader({
  config,
  onClear,
}: {
  config: PersonaConfig;
  onClear?: () => void;
}) {
  const initials = config.identity.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 1).toLowerCase();
  const siteLabel = config.identity.links.site
    ? config.identity.links.site.replace(/^https?:\/\/(?:www\.)?/, "").replace(/\/$/, "")
    : config.identity.name;
  return (
    <header className="border-b border-[var(--lc-border)] px-6 py-3.5 flex items-center justify-between shrink-0 relative z-20">
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-6 rounded-md bg-[var(--lc-foreground)] text-[var(--lc-background)] font-mono text-[11px] font-semibold flex items-center justify-center">
          {initials}
        </div>
        <span className="text-[13px] text-[var(--lc-foreground)]">{siteLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--lc-faint)] flex items-center gap-1.5">
          <span className="lc-pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--lc-foreground)]" />
          live
        </span>
        {onClear && (
          <button
            onClick={onClear}
            className="text-[11px] uppercase tracking-wider text-[var(--lc-faint)] hover:text-[var(--lc-foreground)] transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-3 w-3" />
            new
          </button>
        )}
        {config.identity.links.site && (
          <a
            href={config.identity.links.site}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-wider text-[var(--lc-faint)] hover:text-[var(--lc-foreground)] transition-colors inline-flex items-center gap-1"
          >
            {siteLabel}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}

function Composer({
  value,
  onChange,
  onSubmit,
  disabled,
  autoFocus,
  placeholder,
  size = "md",
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  autoFocus?: boolean;
  placeholder: string;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  const pad = size === "lg" ? "py-4 px-5 pr-14 text-[15px]" : size === "sm" ? "py-2.5 px-3.5 pr-12 text-[13px]" : "py-3.5 px-4 pr-14 text-[14px]";
  const rows = size === "lg" ? 2 : size === "sm" ? 1 : 2;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="relative w-full rounded-xl border border-[var(--lc-input)] bg-[var(--lc-card)]/95 backdrop-blur-md shadow-2xl shadow-black/10 transition-all focus-within:border-[var(--lc-foreground)]/40"
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        rows={rows}
        className={`w-full resize-none bg-transparent placeholder:text-[var(--lc-faint)] focus:outline-none font-mono leading-snug ${pad}`}
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className={`absolute right-2.5 ${size === "sm" ? "bottom-1.5 h-7 w-7" : "bottom-2.5 h-8 w-8"} rounded-lg bg-[var(--lc-foreground)] text-[var(--lc-background)] flex items-center justify-center hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity`}
        aria-label="send"
      >
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
      </button>
    </form>
  );
}

function Scene({
  config,
  message,
  isStreaming,
  promptText,
}: {
  config: PersonaConfig;
  message: AppMessage | undefined;
  isStreaming: boolean;
  promptText: string;
}) {
  const { spec, hasSpec } = useJsonRenderMessage(message?.parts ?? []);
  return (
    <motion.div
      key={message?.id ?? "loading"}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {promptText && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="text-[13px] text-[var(--lc-faint)] italic"
        >
          {promptText}
        </motion.p>
      )}
      {hasSpec ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <BespokeRenderer config={config} spec={spec} loading={isStreaming} />
        </motion.div>
      ) : (
        <LoadingPanel />
      )}
      {hasSpec && isStreaming && <StreamingMore />}
    </motion.div>
  );
}

function LoadingPanel() {
  return (
    <div className="space-y-4 py-1">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--lc-faint)]">
        <span className="lc-pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--lc-foreground)] drop-shadow-[0_0_4px_rgba(232,232,232,0.6)]" />
        <span className="lc-shimmer">recalling · building the answer</span>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-2/3 rounded bg-[var(--lc-foreground)]/[0.06] animate-pulse" />
        <div className="h-28 w-full rounded-lg border border-[var(--lc-border)] bg-[var(--lc-foreground)]/[0.025] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="h-20 rounded-lg border border-[var(--lc-border)] bg-[var(--lc-foreground)]/[0.025] animate-pulse" />
          <div className="h-20 rounded-lg border border-[var(--lc-border)] bg-[var(--lc-foreground)]/[0.025] animate-pulse" />
        </div>
        <div className="h-3 w-1/2 rounded bg-[var(--lc-foreground)]/[0.06] animate-pulse" />
      </div>
    </div>
  );
}

function StreamingMore() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-3 pt-2"
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[var(--lc-faint)]">
        <span className="lc-pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--lc-foreground)] drop-shadow-[0_0_4px_rgba(232,232,232,0.6)]" />
        <span className="lc-shimmer">still recalling more</span>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-1/2 rounded bg-[var(--lc-foreground)]/[0.06] animate-pulse" />
        <div className="h-20 w-full rounded-lg border border-[var(--lc-border)] bg-[var(--lc-foreground)]/[0.025] animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-[var(--lc-foreground)]/[0.06] animate-pulse" />
      </div>
    </motion.div>
  );
}
