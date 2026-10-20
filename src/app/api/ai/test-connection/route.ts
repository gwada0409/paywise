import { NextRequest, NextResponse } from "next/server";
import { testGeminiConnection, DEFAULT_GEMINI_MODEL } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, model } = await req.json();
    const keyToTest = apiKey || process.env.GEMINI_API_KEY;

    if (!keyToTest) {
      return NextResponse.json(
        { success: false, message: "No Gemini API key provided to test." },
        { status: 400 }
      );
    }

    const result = await testGeminiConnection(keyToTest, model || DEFAULT_GEMINI_MODEL);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
