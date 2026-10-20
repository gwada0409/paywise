import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatSystemPromptWithContext } from "./system-prompt";
import { FinancialContextSummary } from "@/types";

export const SUPPORTED_GEMINI_MODELS = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Recommended - Fast & Cost-Efficient)" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Next-Gen Fast)" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Deep Financial Reasoning)" },
];

export const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";

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
 * Validates Gemini API Key by sending a minimal test prompt
 */
export async function testGeminiConnection(apiKey: string, modelName: string = DEFAULT_GEMINI_MODEL) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Reply with 'Connection successful' in 2 words.");
    const responseText = result.response.text();
    return {
      success: true,
      message: responseText.trim(),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to connect to Google Gemini API",
    };
  }
}

/**
 * Generates streaming response from Gemini AI using server-side credentials
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

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: {
      temperature,
      maxOutputTokens: 2048,
    },
  });

  // Prepare chat history (convert to Gemini history format: user and model)
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];
  const chat = model.startChat({ history });

  const streamResult = await chat.sendMessageStream(lastMessage.content);
  return streamResult.stream;
}
