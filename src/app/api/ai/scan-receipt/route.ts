import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const VISION_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
];

const RECEIPT_OCR_PROMPT = `You are an expert financial receipt and mobile payment screenshot parser specialized in the Philippines financial ecosystem (GCash, Maya, ShopeePay, GrabPay, BPI, BDO, UnionBank, Seabank, GoTyme, 7-Eleven, SM Supermarket, Mercury Drug, restaurants, and paper receipts).

Analyze this image and extract the transaction details accurately.

Rules:
1. Identify the merchant or recipient name for "title" (e.g. "Jollibee", "Meralco", "ShopeePay", "GrabFood", "Shell", "7-Eleven", "Transfer to Juan D."). Keep it short and clean (max 35 chars).
2. Extract the exact total numeric amount in Philippine Pesos (PHP) without currency symbols or commas.
3. Classify transaction type into one of:
   - "need" (Groceries, Utilities, Rent, Public Transit, Medicine, Essential Healthcare)
   - "want" (Dining Out, Coffee/Milk Tea, Shopping, Entertainment, Gadgets, Hobbies, Gaming)
   - "bill_payment" (Meralco, Maynilad, Manila Water, Converge, PLDT, Globe, Smart)
   - "income" (Cash-in, Received money, Salary)
4. Choose the best matching category from this list:
   - Needs: "Groceries", "Transportation", "Electricity", "Water", "Internet", "Rent", "Healthcare", "Insurance", "Family Support", "Other Needs"
   - Wants: "Dining Out", "Online Shopping", "Entertainment", "Coffee & Milk Tea", "Subscriptions", "Travel", "Gadgets", "Gaming", "Other Wants"
   - Bills: "Bills & Utilities"
   - Income: "Salary", "Freelance", "Other Income"
5. Identify the payment method: "gcash", "maya", "bank", "credit_card", or "cash".
6. Extract the transaction date in format YYYY-MM-DD. If year is missing or ambiguous, use the current year (2026). If no date is readable, use today's date.
7. Extract the reference number or transaction ID if visible (e.g., GCash ref "1002 9384 7291").
8. Provide a brief 1-line note summarizing the transaction.

CRITICAL: Return ONLY a valid JSON object with no markdown formatting, no code fences, and no surrounding text:
{
  "title": string,
  "amount": number,
  "type": "need" | "want" | "bill_payment" | "income",
  "category": string,
  "payment_method": "gcash" | "maya" | "bank" | "credit_card" | "cash",
  "date": "YYYY-MM-DD",
  "reference_number": string | null,
  "raw_summary": string
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mimeType = "image/jpeg", clientApiKey } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image data provided for receipt scanning." },
        { status: 400 }
      );
    }

    const effectiveApiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!effectiveApiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is not configured. Please enter your API key in Settings > Gemini AI or add GEMINI_API_KEY to your environment.",
        },
        { status: 401 }
      );
    }

    // Clean base64 string if it contains data URI prefix
    let cleanBase64 = image;
    let actualMimeType = mimeType;

    if (image.startsWith("data:")) {
      const parts = image.split(";base64,");
      if (parts.length === 2) {
        actualMimeType = parts[0].replace("data:", "");
        cleanBase64 = parts[1];
      }
    }

    const genAI = new GoogleGenerativeAI(effectiveApiKey);
    let lastError: any = null;

    for (const modelCandidate of VISION_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelCandidate,
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        });

        const imagePart = {
          inlineData: {
            data: cleanBase64,
            mimeType: actualMimeType || "image/jpeg",
          },
        };

        const result = await model.generateContent([RECEIPT_OCR_PROMPT, imagePart]);
        const responseText = result.response.text();

        if (!responseText) {
          throw new Error("Empty response from vision model");
        }

        // Parse JSON safely
        let cleanedJson = responseText.trim();
        if (cleanedJson.startsWith("```json")) {
          cleanedJson = cleanedJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanedJson.startsWith("```")) {
          cleanedJson = cleanedJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        const parsed = JSON.parse(cleanedJson);

        return NextResponse.json({
          success: true,
          data: {
            title: parsed.title || "Scanned Receipt",
            amount: Number(parsed.amount) || 0,
            type: ["need", "want", "bill_payment", "income"].includes(parsed.type)
              ? parsed.type
              : "want",
            category: parsed.category || "Dining Out",
            payment_method: [
              "gcash",
              "maya",
              "bank",
              "credit_card",
              "cash",
            ].includes(parsed.payment_method)
              ? parsed.payment_method
              : "gcash",
            date: parsed.date || new Date().toISOString().split("T")[0],
            reference_number: parsed.reference_number || null,
            raw_summary: parsed.raw_summary || "",
            model_used: modelCandidate,
          },
        });
      } catch (candidateErr: any) {
        lastError = candidateErr;
        console.warn(`Vision model ${modelCandidate} failed:`, candidateErr?.message);
        // Continue to next candidate
      }
    }

    console.error("All Gemini vision models failed for receipt OCR:", lastError);
    return NextResponse.json(
      {
        error:
          lastError?.message ||
          "Could not analyze receipt screenshot. Please ensure the image is clear or try another model.",
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Receipt Scan API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process receipt image." },
      { status: 500 }
    );
  }
}
