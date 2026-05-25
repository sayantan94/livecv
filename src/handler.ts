import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { pipeJsonRender } from "@json-render/core";
import type { PersonaConfig } from "./types";
import { buildSystemPrompt } from "./prompt";

interface HandlerOptions {
  config: PersonaConfig;
  temperature?: number;
  maxDuration?: number;
}

/**
 * Create a Next.js App Router POST handler for the live persona.
 *
 * Usage in `app/api/generate/route.ts`:
 *
 *   import { createHandler } from "livecv/handler";
 *   import config from "@/livecv.config";
 *   export const POST = createHandler({ config });
 *   export const maxDuration = 60;
 */
export function createHandler({ config, temperature = 0.85 }: HandlerOptions) {
  const systemPrompt = buildSystemPrompt(config);
  const model = anthropic(config.model ?? "claude-haiku-4-5");

  return async function POST(req: Request): Promise<Response> {
    const body = await req.json();
    const uiMessages: UIMessage[] = body.messages;

    if (!uiMessages || !Array.isArray(uiMessages) || uiMessages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const modelMessages = await convertToModelMessages(uiMessages);

    const result = streamText({
      model,
      system: systemPrompt,
      messages: modelMessages,
      temperature,
    });

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        writer.merge(pipeJsonRender(result.toUIMessageStream()));
      },
    });

    return createUIMessageStreamResponse({ stream });
  };
}
