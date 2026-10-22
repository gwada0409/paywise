import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatSystemPromptWithContext } from "./system-prompt";
import { FinancialContextSummary } from "@/types";

export const SUPPORTED_GEMINI_MODELS = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Recommended - Fast & Cost-Efficient)" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Deep Financial Reasoning)" },
  { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash (Experimental Preview)" },
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
  // Auto-resolve sunset model IDs to stable standard
  const resolvedModel = modelName === "gemini-2.0-flash" ? DEFAULT_GEMINI_MODEL : modelName;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: resolvedModel });
    const result = await model.generateContent("Reply with 'Connection successful' in 2 words.");
    const responseText = result.response.text();
    return {
      success: true,
      message: responseText.trim(),
    };
  } catch (error: any) {
    // If the chosen model failed (e.g. 404 or sunset), attempt fallback to DEFAULT_GEMINI_MODEL
    if (resolvedModel !== DEFAULT_GEMINI_MODEL) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const fallbackModel = genAI.getGenerativeModel({ model: DEFAULT_GEMINI_MODEL });
        const result = await fallbackModel.generateContent("Reply with 'Connection successful' in 2 words.");
        return {
          success: true,
          message: `${result.response.text().trim()} (Connected using ${DEFAULT_GEMINI_MODEL})`,
        };
      } catch {
        // Fall through to display error
      }
    }

    let friendlyMessage = error?.message || "Failed to connect to Google Gemini API";
    if (friendlyMessage.includes("is no longer available") || friendlyMessage.includes("404")) {
      friendlyMessage = "This model is no longer available on Google's API. Please use 'Gemini 1.5 Flash'.";
    }

    return {
      success: false,
      message: friendlyMessage,
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

  const resolvedModel = modelName === "gemini-2.0-flash" ? DEFAULT_GEMINI_MODEL : modelName;
  const systemInstruction = formatSystemPromptWithContext(context);
  const genAI = new GoogleGenerativeAI(activeKey);

  try {
    const model = genAI.getGenerativeModel({
      model: resolvedModel,
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
  } catch (error: any) {
    // If custom model failed, try falling back to DEFAULT_GEMINI_MODEL
    if (resolvedModel !== DEFAULT_GEMINI_MODEL) {
      const fallbackModel = genAI.getGenerativeModel({
        model: DEFAULT_GEMINI_MODEL,
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
      const chat = fallbackModel.startChat({ history });

      const streamResult = await chat.sendMessageStream(lastMessage.content);
      return streamResult.stream;
    }

    throw error;
  }
}
