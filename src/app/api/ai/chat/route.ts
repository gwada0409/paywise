import { NextRequest, NextResponse } from "next/server";
import { streamGeminiChat } from "@/lib/ai/gemini";
import { FinancialContextSummary } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context, model, clientApiKey } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }

    // Input length protection
    const lastMessage = messages[messages.length - 1];
    if (typeof lastMessage.content !== "string" || lastMessage.content.length > 3000) {
      return NextResponse.json(
        { error: "Message too long. Please limit your prompt to 3,000 characters." },
        { status: 400 }
      );
    }

    // Determine API key: client key from safe in-memory session or server environment key
    const effectiveApiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!effectiveApiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is not configured. Please configure your key in Settings > Gemini AI or add GEMINI_API_KEY to your .env file.",
        },
        { status: 401 }
      );
    }

    const geminiStream = await streamGeminiChat({
      apiKey: effectiveApiKey,
      modelName: model,
      messages,
      context: context as FinancialContextSummary | null,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of geminiStream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (streamError: any) {
          controller.error(streamError);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error: any) {
    console.error("AI Chat API Error:", error);
    const friendlyMessage =
      error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("API key not valid")
        ? "Invalid Gemini API Key. Please verify your API key in Settings > Gemini AI."
        : error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.includes("quota")
        ? "Google Gemini API rate limit or quota exceeded. Please wait a moment or check your API quota."
        : error?.message || "Failed to generate AI response. Please try again.";

    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}
