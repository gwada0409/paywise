import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatSystemPromptWithContext } from "./system-prompt";
import { FinancialContextSummary } from "@/types";

export const SUPPORTED_GEMINI_MODELS = [
  { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite (Recommended - 500 Daily Quota)" },
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash (Latest Flagship Fast)" },
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite (500 Daily Quota)" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Legacy Stable)" },
];

export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";

export interface ChatMessageParam {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamChatOptions {
  apiKey?: string;
  modelName?: string;
  messages: ChatMessageParam[];
  context?: FinancialContextSummary | null;
  temperature?: number;
}

/**
 * Validates Gemini API Key with automatic multi-model fallback across active tiers
 */
export async function testGeminiConnection(apiKey: string, modelName: string = DEFAULT_GEMINI_MODEL) {
  const modelsToTry = [
    modelName,
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-1.5-flash",
  ].filter((v, i, a) => v && a.indexOf(v) === i && v !== "gemini-2.0-flash");

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastErrorMessage = "";

  for (const candidate of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: candidate });
      const result = await model.generateContent("Reply with 'Connection successful' in 2 words.");
      const responseText = result.response.text();
      return {
        success: true,
        message: `${responseText.trim()} (Connected via ${candidate})`,
      };
    } catch (err: any) {
      lastErrorMessage = err?.message || "Failed to connect to Google Gemini API";
    }
  }

  return {
    success: false,
    message: lastErrorMessage,
  };
}

/**
 * Generates streaming response from Gemini AI using server-side credentials with multi-model fallback
 */
export async function streamGeminiChat({
  apiKey,
  modelName = DEFAULT_GEMINI_MODEL,
  messages,
  context,
  temperature = 0.7,
}: StreamChatOptions) {
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  if (!activeKey) {
    throw new Error(
      "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables or configure it in Settings > AI Assistant."
    );
  }

  const systemInstruction = formatSystemPromptWithContext(context);
  const genAI = new GoogleGenerativeAI(activeKey);

  const candidateModels = [
    modelName,
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-1.5-flash",
  ].filter((v, i, a) => v && a.indexOf(v) === i && v !== "gemini-2.0-flash");

  let lastError: any = null;

  for (const candidate of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: candidate,
        systemInstruction,
        generationConfig: {
          temperature,
          maxOutputTokens: 2048,
        },
      });

      const history = messages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const lastMessage = messages[messages.length - 1];
      const chat = model.startChat({ history });

      const streamResult = await chat.sendMessageStream(lastMessage.content);
      return streamResult.stream;
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to stream chat response from Gemini API.");
}
