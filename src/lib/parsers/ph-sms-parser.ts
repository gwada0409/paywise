/**
 * Philippine Payment SMS Parser
 * 
 * Supports parsing payment SMS notifications from:
 * - GCash (Send Money, Pay QR, Pay Merchant, Received)
 * - Maya (Pay Merchant, Send Money, Card charge)
 * - Major Philippine Banks (BPI, BDO, UnionBank, SeaBank, GoTyme)
 * - ShopeePay
 */

export interface ParsedPaymentSMS {
  amount: number;
  merchantOrRecipient: string;
  source: "GCash" | "Maya" | "BPI" | "BDO" | "UnionBank" | "SeaBank" | "GoTyme" | "ShopeePay" | "Other";
  type: "expense" | "income";
  category: string;
  referenceNo?: string;
  date?: string;
  rawText: string;
  suggestedAccountName: string;
}

// Common Philippine merchant to category mapping
const MERCHANT_CATEGORIES: Record<string, string> = {
  // Food & Dining
  "jollibee": "Food & Dining",
  "mcdonald": "Food & Dining",
  "mcdo": "Food & Dining",
  "kfc": "Food & Dining",
  "chowking": "Food & Dining",
  "mang inasal": "Food & Dining",
  "greenwich": "Food & Dining",
  "starbucks": "Food & Dining",
  "grabfood": "Food & Dining",
  "foodpanda": "Food & Dining",
  "pickup coffee": "Food & Dining",
  "tim hortons": "Food & Dining",
  "dunkin": "Food & Dining",
  "bonchon": "Food & Dining",
  "tokyo tokyo": "Food & Dining",
  "shakeys": "Food & Dining",
  "pizza hut": "Food & Dining",
  "subway": "Food & Dining",
  "karinderya": "Food & Dining",

  // Groceries & Essentials
  "puregold": "Groceries",
  "sm supermarket": "Groceries",
  "sm hypermarket": "Groceries",
  "savemore": "Groceries",
  "robinsons supermarket": "Groceries",
  "waltermart": "Groceries",
  "dalies": "Groceries",
  "dailysan": "Groceries",
  "landmark": "Groceries",
  "s&r": "Groceries",
  "landers": "Groceries",
  "allhome": "Groceries",
  "all day": "Groceries",
  "watsons": "Health & Medical",
  "mercury drug": "Health & Medical",
  "southstar drug": "Health & Medical",
  "generics pharmacy": "Health & Medical",

  // Transportation & Fuel
  "grab": "Transportation",
  "angkas": "Transportation",
  "joyride": "Transportation",
  "moveit": "Transportation",
  "shell": "Transportation",
  "petron": "Transportation",
  "caltex": "Transportation",
  "seaoil": "Transportation",
  "unioil": "Transportation",
  "mrt": "Transportation",
  "lrt": "Transportation",
  "beep": "Transportation",
  "easytrip": "Transportation",
  "autosweep": "Transportation",

  // Shopping & Tech
  "shopee": "Shopping",
  "lazada": "Shopping",
  "tiktok": "Shopping",
  "zalora": "Shopping",
  "shein": "Shopping",
  "uniqlo": "Shopping",
  "h&m": "Shopping",
  "zara": "Shopping",
  "apple": "Shopping",
  "steam": "Entertainment",
  "google": "Subscriptions",
  "netflix": "Subscriptions",
  "spotify": "Subscriptions",
  "youtube": "Subscriptions",

  // Utilities
  "meralco": "Utilities",
  "maynilad": "Utilities",
  "manila water": "Utilities",
  "pldt": "Utilities",
  "globe": "Utilities",
  "smart": "Utilities",
  "dito": "Utilities",
  "converge": "Utilities",
};

/**
 * Infer category from merchant name or SMS text
 */
export function inferCategoryFromMerchant(merchantName: string, rawText = ""): string {
  const text = (merchantName + " " + rawText).toLowerCase();

  for (const [keyword, category] of Object.entries(MERCHANT_CATEGORIES)) {
    if (text.includes(keyword)) {
      return category;
    }
  }

  if (text.includes("bill") || text.includes("utility") || text.includes("electric") || text.includes("water")) {
    return "Utilities";
  }
  if (text.includes("cafe") || text.includes("coffee") || text.includes("resto") || text.includes("restaurant") || text.includes("bakery") || text.includes("eats")) {
    return "Food & Dining";
  }
  if (text.includes("mart") || text.includes("grocery") || text.includes("supermarket")) {
    return "Groceries";
  }
  if (text.includes("taxi") || text.includes("transit") || text.includes("toll") || text.includes("fuel") || text.includes("gasoline")) {
    return "Transportation";
  }
  if (text.includes("pharmacy") || text.includes("clinic") || text.includes("hospital") || text.includes("dental")) {
    return "Health & Medical";
  }

  return "General & Others";
}

/**
 * Parse Philippine Payment SMS
 */
export function parsePhilippinePaymentSMS(text: string): ParsedPaymentSMS | null {
  if (!text || typeof text !== "string") return null;
  const clean = text.trim();

  // 1. GCash Payment to Merchant (QR / Online)
  // e.g.: "You have paid PHP 245.00 of GCash to JOLLIBEE on 10/23/2026 12:30:15. Ref. No. 1234567890."
  // or: "You paid PHP 150.00 to Jollibee via GCash on 10/23/2026. Ref. 123456"
  const gcashPaidRegex = /You (?:have )?paid PHP\s*([0-9,]+(?:\.[0-9]{2})?)\s*(?:of GCash)?\s*(?:to\s+([^.]+?))?(?:\s+(?:via GCash|using GCash|on\s+([0-9/]+)))/i;
  let match = clean.match(gcashPaidRegex);
  if (match) {
    const rawAmt = match[1].replace(/,/g, "");
    const amount = parseFloat(rawAmt);
    const merchant = match[2]?.trim().replace(/^to\s+/i, "") || "GCash Merchant";
    return {
      amount,
      merchantOrRecipient: cleanMerchantName(merchant),
      source: "GCash",
      type: "expense",
      category: inferCategoryFromMerchant(merchant, clean),
      referenceNo: extractRefNo(clean),
      rawText: clean,
      suggestedAccountName: "GCash",
    };
  }

  // 1b. GCash Send Money (Express Send / Send to bank)
  // e.g.: "You have sent PHP 500.00 of GCash to MARIA SANTOS 09171234567 on 10/23/2026. Ref. No. 9876543210."
  const gcashSentRegex = /You (?:have )?sent PHP\s*([0-9,]+(?:\.[0-9]{2})?)\s*(?:of GCash)?\s*to\s+([^0-9\n\r]+?)(?:\s+[0-9]{10,12})?(?:\s+on\s+([0-9/]+)|\.)/i;
  match = clean.match(gcashSentRegex);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ""));
    const recipient = match[2]?.trim() || "Transfer Recipient";
    return {
      amount,
      merchantOrRecipient: cleanMerchantName(recipient),
      source: "GCash",
      type: "expense",
      category: "Transfers & Personal",
      referenceNo: extractRefNo(clean),
      rawText: clean,
      suggestedAccountName: "GCash",
    };
  }

  // 1c. GCash Received Money
  // e.g.: "You have received PHP 1,000.00 of GCash from JUAN DELA CRUZ on 10/23/2026. Ref. No. 11223344."
  const gcashReceivedRegex = /You (?:have )?received PHP\s*([0-9,]+(?:\.[0-9]{2})?)\s*(?:of GCash)?\s*from\s+([^0-9\n\r]+?)(?:\s+on|\.)/i;
  match = clean.match(gcashReceivedRegex);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ""));
    const sender = match[2]?.trim() || "GCash Sender";
    return {
      amount,
      merchantOrRecipient: `Received from ${cleanMerchantName(sender)}`,
      source: "GCash",
      type: "income",
      category: "Extra Income & Gifts",
      referenceNo: extractRefNo(clean),
      rawText: clean,
      suggestedAccountName: "GCash",
    };
  }

  // 2. Maya Payment
  // e.g.: "You paid PHP 350.00 to Grab Philippines via Maya on 10/23/2026. Ref: MAYA-991823."
  // or: "You paid PHP 299.00 to NETFLIX with Maya"
  const mayaPaidRegex = /You paid PHP\s*([0-9,]+(?:\.[0-9]{2})?)\s*to\s+([^.]+?)\s*(?:via Maya|with Maya|using Maya|on)/i;
  match = clean.match(mayaPaidRegex);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ""));
    const merchant = match[2]?.trim() || "Maya Merchant";
    return {
      amount,
      merchantOrRecipient: cleanMerchantName(merchant),
      source: "Maya",
      type: "expense",
      category: inferCategoryFromMerchant(merchant, clean),
      referenceNo: extractRefNo(clean),
      rawText: clean,
      suggestedAccountName: "Maya",
    };
  }

  // 2b. Maya Send Money
  // e.g.: "You sent PHP 1,000.00 to Juan Dela Cruz (09181234567) using Maya. Ref: 882199."
  const mayaSentRegex = /You sent PHP\s*([0-9,]+(?:\.[0-9]{2})?)\s*to\s+([^0-9(\n\r]+?)(?:\s*\(|\s+using Maya|\.)/i;
  match = clean.match(mayaSentRegex);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ""));
    const recipient = match[2]?.trim() || "Transfer Recipient";
    return {
      amount,
      merchantOrRecipient: cleanMerchantName(recipient),
      source: "Maya",
      type: "expense",
      category: "Transfers & Personal",
      referenceNo: extractRefNo(clean),
      rawText: clean,
      suggestedAccountName: "Maya",
    };
  }

  // 3. Bank Debit (BPI / BDO / UnionBank)
  // e.g.: "Your BPI account ...1234 was debited PHP 1,500.00 on 10/23/2026 for purchase at SM SUPERMARKET."
  const bpiRegex = /BPI account.*?debited PHP\s*([0-9,]+(?:\.[0-9]{2})?).*?(?:at|for purchase at)\s+([^.]+?)(?:\.|$)/i;
  match = clean.match(bpiRegex);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ""));
    const merchant = match[2]?.trim() || "BPI Merchant";
    return {
      amount,
      merchantOrRecipient: cleanMerchantName(merchant),
      source: "BPI",
      type: "expense",
      category: inferCategoryFromMerchant(merchant, clean),
      referenceNo: extractRefNo(clean),
      rawText: clean,
      suggestedAccountName: "BPI",
    };
  }

  // 3b. BDO Card/Account
  // e.g.: "Your BDO Debit card ending in 5678 was used for PHP 890.00 at MCDONALDS on 10/23/2026."
  const bdoRegex = /BDO.*?(?:used for|charged|debited)\s*PHP\s*([0-9,]+(?:\.[0-9]{2})?)\s*at\s+([^.]+?)(?:\s+on|\.|$)/i;
  match = clean.match(bdoRegex);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ""));
    const merchant = match[2]?.trim() || "BDO Merchant";
    return {
      amount,
      merchantOrRecipient: cleanMerchantName(merchant),
      source: "BDO",
      type: "expense",
      category: inferCategoryFromMerchant(merchant, clean),
      referenceNo: extractRefNo(clean),
      rawText: clean,
      suggestedAccountName: "BDO",
    };
  }

  // 4. ShopeePay
  // e.g.: "You paid PHP 450.00 via ShopeePay to Shopee Merchant"
  const shopeeRegex = /paid PHP\s*([0-9,]+(?:\.[0-9]{2})?)\s*via ShopeePay(?:\s*to\s+([^.]+?))?(?:\.|$)/i;
  match = clean.match(shopeeRegex);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ""));
    const merchant = match[2]?.trim() || "Shopee Order";
    return {
      amount,
      merchantOrRecipient: cleanMerchantName(merchant),
      source: "ShopeePay",
      type: "expense",
      category: "Shopping",
      referenceNo: extractRefNo(clean),
      rawText: clean,
      suggestedAccountName: "ShopeePay",
    };
  }

  // 5. Generic fallback for any message like "Paid PHP 250 to XYZ" or "PHP 500.00 paid to XYZ"
  const genericFallback = /(?:paid|debited|sent|charged)\s*(?:PHP|P)\s*([0-9,]+(?:\.[0-9]{2})?)\s*(?:to|at)\s+([^.]+?)(?:\s+on|\.|$)/i;
  match = clean.match(genericFallback);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ""));
    const merchant = match[2]?.trim() || "Merchant Payment";
    const src = clean.toLowerCase().includes("gcash")
      ? "GCash"
      : clean.toLowerCase().includes("maya")
      ? "Maya"
      : clean.toLowerCase().includes("bpi")
      ? "BPI"
      : clean.toLowerCase().includes("bdo")
      ? "BDO"
      : "Other";

    return {
      amount,
      merchantOrRecipient: cleanMerchantName(merchant),
      source: src as any,
      type: "expense",
      category: inferCategoryFromMerchant(merchant, clean),
      referenceNo: extractRefNo(clean),
      rawText: clean,
      suggestedAccountName: src !== "Other" ? src : "Cash on Hand",
    };
  }

  return null;
}

function cleanMerchantName(name: string): string {
  if (!name) return "Payment";
  return name
    .replace(/(?:via|using|through)\s+(?:gcash|maya|bpi|bdo)/gi, "")
    .replace(/(?:on|ref|ref\.|no\.)\s*.*$/gi, "")
    .replace(/corp\.?|inc\.?|ltd\.?/gi, "")
    .trim();
}

function extractRefNo(text: string): string | undefined {
  const refMatch = text.match(/(?:ref(?:\.|erence)?\s*(?:no\.?)?|trace\s*no\.?)\s*:?\s*([a-zA-Z0-9_-]+)/i);
  return refMatch ? refMatch[1] : undefined;
}
