import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const DEFAULT_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"; // 32 bytes hex fallback for dev

function getEncryptionKey(): Buffer {
  const envKey = process.env.APP_ENCRYPTION_KEY || DEFAULT_KEY;
  if (envKey.length === 64) {
    return Buffer.from(envKey, "hex");
  }
  // If provided as raw string, hash it to derive 32 bytes
  return crypto.createHash("sha256").update(envKey).digest();
}

export interface EncryptedData {
  encryptedText: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts a sensitive string (like an API key) using AES-256-GCM
 */
export function encryptSecret(plainText: string): EncryptedData {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encryptedText: encrypted,
    iv: iv.toString("hex"),
    authTag,
  };
}

/**
 * Decrypts an AES-256-GCM encrypted secret
 */
export function decryptSecret(encryptedText: string, ivHex: string, authTagHex: string): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Masks an API key for safe display (e.g., "AIzaSy••••••••••••3aB8")
 */
export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  const start = key.slice(0, 6);
  const end = key.slice(-4);
  return `${start}••••••••••••${end}`;
}
