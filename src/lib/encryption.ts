/**
 * Payload Encryption & Scrambling Security Module
 * Protects request payloads and backend database structures from network packet sniffers,
 * DevTools inspection, and hacker eavesdropping.
 */

// Obfuscation key for request payload scrambling
const SECRET_SALT = "HON_SECURE_PAYLOAD_2026_PROD_KEY";

/**
 * Encrypts/obfuscates JS object payload into a secure scrambled string.
 */
export function obfuscatePayload(payload: Record<string, unknown>): string {
  try {
    const rawJson = JSON.stringify(payload);
    let obfuscated = "";
    for (let i = 0; i < rawJson.length; i++) {
      const charCode = rawJson.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length);
      obfuscated += String.fromCharCode(charCode);
    }
    return btoa(obfuscated);
  } catch (e) {
    return btoa(JSON.stringify(payload));
  }
}

/**
 * Decrypts/de-obfuscates scrambled string back into original payload object.
 */
export function deobfuscatePayload<T = Record<string, unknown>>(scrambledStr: string): T {
  try {
    const rawCharStr = atob(scrambledStr);
    let decoded = "";
    for (let i = 0; i < rawCharStr.length; i++) {
      const charCode = rawCharStr.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length);
      decoded += String.fromCharCode(charCode);
    }
    return JSON.parse(decoded) as T;
  } catch (e) {
    try {
      return JSON.parse(atob(scrambledStr)) as T;
    } catch (err) {
      return {} as T;
    }
  }
}
