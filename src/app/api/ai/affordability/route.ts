import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const AFFORDABILITY_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      itemName,
      itemCost,
      spendableBalance,
      daysUntilPayday,
      nextPaydayDate,
      upcomingBillsTotal,
      currentDailyAllowance,
      newDailyAllowance,
      monthlySalary,
      clientApiKey,
    } = body;

    if (!itemName || itemCost === undefined) {
      return NextResponse.json(
        { error: "Item name and cost are required." },
        { status: 400 }
      );
    }

    const effectiveApiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!effectiveApiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is not configured. Please configure your key in Settings > Gemini AI.",
        },
        { status: 401 }
      );
    }

    const prompt = `You are a savvy, empathetic, and witty Philippine financial advisor.
A user is asking: "Can I afford to buy this right now?"

PURCHASE DETAILS:
- Item: "${itemName}"
- Cost: ₱${Number(itemCost).toLocaleString()}

CURRENT FINANCIAL STATE:
- Spendable Balance before next payday: ₱${Number(spendableBalance).toLocaleString()}
- Days until next cutoff (${nextPaydayDate || "Payday"}): ${daysUntilPayday} days
- Current daily allowance: ₱${Math.round(currentDailyAllowance)}/day
- New daily allowance if bought: ₱${Math.round(newDailyAllowance)}/day
- Upcoming bills due before payday: ₱${Number(upcomingBillsTotal).toLocaleString()}
- Monthly Net Salary: ₱${Number(monthlySalary).toLocaleString()}

INSTRUCTIONS:
1. Provide a decisive verdict: "YES, GO FOR IT!", "PROCEED WITH CAUTION", or "HOLD OFF FOR NOW".
2. Explain the exact impact in 2-3 short, punchy sentences with Pinoy context (e.g. mention pamasahe, food, or upcoming cutoff).
3. If not recommended or tight, provide 1 smart alternative (e.g. "Wait for the 30th cutoff", "Set aside ₱1,500 across 2 cutoffs in your Savings Goals", or "Check if you can get it during the 11.11 / payday sale").
4. Keep the tone friendly, practical, and conversational (warm English or light natural Taglish). Max 80 words.`;

    const genAI = new GoogleGenerativeAI(effectiveApiKey);
    let lastError: any = null;

    for (const modelCandidate of AFFORDABILITY_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelCandidate,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 250,
          },
        });

        const result = await model.generateContent(prompt);
        const adviceText = result.response.text();

        if (adviceText) {
          return NextResponse.json({
            success: true,
            advice: adviceText.trim(),
            model_used: modelCandidate,
          });
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Affordability model ${modelCandidate} failed:`, err?.message);
      }
    }

    return NextResponse.json(
      {
        error: lastError?.message || "Could not generate AI advice. Please try again.",
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Affordability API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process affordability check." },
      { status: 500 }
    );
  }
}
