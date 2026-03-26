/**
 * Proactive Thinking Block Validator Hook
 *
 * Prevents "Expected thinking/redacted_thinking but found tool_use" errors
 * by validating and fixing message structure BEFORE sending to the API.
 *
 * Detection: content-based (NOT model-name based).
 * Scans history for genuine API-signed thinking blocks.
 * If any exist, every assistant message must lead with one.
 */

import type { Message, Part } from "@opencode-ai/sdk";

interface MessageWithParts {
  info: Message;
  parts: Part[];
}

type MessagesTransformHook = {
  "experimental.chat.messages.transform"?: (
    input: Record<string, never>,
    output: { messages: MessageWithParts[] },
  ) => Promise<void>;
};

// Requires: type thinking|redacted_thinking, non-empty signature, NOT synthetic.
// Unsigned blocks sent to Anthropic API cause rejection — signature check is mandatory.
function isSignedThinkingPart(part: Part): boolean {
  const type = part.type as string;
  if (type !== "thinking" && type !== "redacted_thinking") return false;
  const p = part as Record<string, unknown>;
  return (
    typeof p.signature === "string" &&
    (p.signature as string).length > 0 &&
    p.synthetic !== true
  );
}

function hasSignedThinkingBlocksInHistory(
  messages: MessageWithParts[],
): boolean {
  for (const msg of messages) {
    if (msg.info.role !== "assistant") continue;
    if (!msg.parts) continue;
    for (const part of msg.parts) {
      if (isSignedThinkingPart(part)) return true;
    }
  }
  return false;
}

function hasContentParts(parts: Part[]): boolean {
  if (!parts || parts.length === 0) return false;
  return parts.some((part: Part) => {
    const type = part.type as string;
    return type === "tool" || type === "tool_use" || type === "text";
  });
}

function startsWithThinkingBlock(parts: Part[]): boolean {
  if (!parts || parts.length === 0) return false;
  const type = parts[0].type as string;
  return (
    type === "thinking" || type === "redacted_thinking" || type === "reasoning"
  );
}

function findPreviousSignedThinkingPart(
  messages: MessageWithParts[],
  currentIndex: number,
): Part | undefined {
  for (let i = currentIndex - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.info.role !== "assistant") continue;
    if (!msg.parts) continue;
    for (const part of msg.parts) {
      if (isSignedThinkingPart(part)) return part;
    }
  }
  return undefined;
}

function prependThinkingBlock(message: MessageWithParts, source: Part): void {
  if (!message.parts) {
    message.parts = [];
  }

  const thinkingPart = {
    ...source,
    id: `prt_0000000000_synthetic_thinking`,
    sessionID: (message.info as any).sessionID || "",
    messageID: message.info.id,
    synthetic: true,
  };

  message.parts.unshift(thinkingPart as unknown as Part);
}

export function createThinkingBlockValidatorHook(): MessagesTransformHook {
  return {
    "experimental.chat.messages.transform": async (_input, output) => {
      const { messages } = output;

      if (!messages || messages.length === 0) return;

      if (!hasSignedThinkingBlocksInHistory(messages)) return;

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (msg.info.role !== "assistant") continue;

        if (hasContentParts(msg.parts) && !startsWithThinkingBlock(msg.parts)) {
          const previous = findPreviousSignedThinkingPart(messages, i);
          if (previous) {
            prependThinkingBlock(msg, previous);
          }
        }
      }
    },
  };
}
