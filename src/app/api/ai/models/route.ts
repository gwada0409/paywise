import { NextResponse } from "next/server";
import { SUPPORTED_GEMINI_MODELS, DEFAULT_GEMINI_MODEL } from "@/lib/ai/gemini";

export async function GET() {
  return NextResponse.json({
    models: SUPPORTED_GEMINI_MODELS,
    defaultModel: DEFAULT_GEMINI_MODEL,
  });
}
