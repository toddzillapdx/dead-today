// Dead Today — /api/chat
// Source: Data Architecture v0.1 §2.3, §7. Proxies the Claude API. The API key
// NEVER reaches the client. Responds with a text/event-stream (SSE).
//
// OPTION B (Phase 0): when ANTHROPIC_API_KEY is absent, runs in STUB mode —
// streams canned, show-aware text so the entire chat UI is testable without a
// key. Set ANTHROPIC_API_KEY (e.g. in .env.local) to flip to live Claude.

import { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/prompt";
import type { ChatMessage, Show } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

interface ChatBody {
  messages: ChatMessage[];
  showContext?: Show | null;
}

function sse(data: string): Uint8Array {
  return new TextEncoder().encode(`data: ${data}\n\n`);
}

export async function POST(req: NextRequest) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = body.messages ?? [];
  const systemPrompt = buildSystemPrompt(body.showContext ?? null);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // ---- STUB MODE (no key) ----
  if (!apiKey) {
    return stubStream(body.showContext ?? null, messages);
  }

  // ---- LIVE MODE (Claude) ----
  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: systemPrompt,
        stream: true,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const status = upstream.status === 429 ? 429 : 500;
      return new Response(JSON.stringify({ error: "Claude API error" }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Re-emit Claude's SSE as plain text deltas the client can append.
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const evt = JSON.parse(payload);
                if (
                  evt.type === "content_block_delta" &&
                  evt.delta?.type === "text_delta"
                ) {
                  controller.enqueue(sse(JSON.stringify({ text: evt.delta.text })));
                }
              } catch {
                // ignore non-JSON keepalive lines
              }
            }
          }
          controller.enqueue(sse("[DONE]"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: sseHeaders() });
  } catch {
    return new Response(JSON.stringify({ error: "Claude API error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function sseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}

// Canned, show-aware streamed response for keyless development.
function stubStream(show: Show | null, messages: ChatMessage[]): Response {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const ctx = show
    ? `the ${show.date} show at ${show.venue} (${show.city})`
    : "Grateful Dead history";
  const reply =
    `[stub mode — no ANTHROPIC_API_KEY set] Great question about ${ctx}. ` +
    `Once a live key is wired in, Claude answers here as a knowledgeable Deadhead, ` +
    `grounded in the selected show's setlist and source. ` +
    (lastUser ? `You asked: "${lastUser.content}". ` : "") +
    `For now this confirms the streaming chat pipeline works end to end.`;

  const words = reply.split(" ");
  const stream = new ReadableStream({
    async start(controller) {
      for (const w of words) {
        controller.enqueue(sse(JSON.stringify({ text: w + " " })));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.enqueue(sse("[DONE]"));
      controller.close();
    },
  });
  return new Response(stream, { headers: sseHeaders() });
}
