/**
 * BlockVault AES-256-GCM Client-Side Encryption Utilities
 * Zero-knowledge: encryption/decryption happens entirely in the browser.
 * The key is derived from the institution/student identity and never leaves the client.
 */

/** SHA-256 hashing using Web Crypto API — original functions kept */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Derive a CryptoKey from a string passphrase using PBKDF2 */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Generate a random 16-byte salt */
export function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

/** Generate a random 12-byte IV for AES-GCM */
export function generateIV(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Encrypt a file buffer with AES-256-GCM.
 * Returns: { ciphertext, iv, salt } all as base64 strings for storage.
 */
export async function encryptBuffer(
  buffer: ArrayBuffer,
  passphrase: string
): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(passphrase, salt);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    buffer
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
  };
}

/**
 * Decrypt a previously encrypted buffer.
 * Returns the original ArrayBuffer.
 */
export async function decryptBuffer(
  ciphertextBase64: string,
  ivBase64: string,
  saltBase64: string,
  passphrase: string
): Promise<ArrayBuffer> {
  const ciphertext = base64ToArrayBuffer(ciphertextBase64);
  const iv = base64ToArrayBuffer(ivBase64);
  const salt = new Uint8Array(base64ToArrayBuffer(saltBase64));
  const key = await deriveKey(passphrase, salt);

  return window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) as unknown as BufferSource },
    key,
    ciphertext
  );
}

/** Compute a SHA-256 hash (hex string) of any ArrayBuffer — used as the certificate fingerprint */
export async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── Helpers ────────────────────────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Generate a unique Passport ID — BV + current year + 8-char alphanumeric */
export function generatePassportId(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  const arr = window.crypto.getRandomValues(new Uint8Array(8));
  arr.forEach((b) => (rand += chars[b % chars.length]));
  return `BV-${year}-${rand}`;
}

/** Generate a unique Transaction ID for explorer */
export function generateTxId(): string {
  const bytes = window.crypto.getRandomValues(new Uint8Array(32));
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}
