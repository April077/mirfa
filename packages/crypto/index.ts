import crypto from "crypto";

const ALGO = "aes-256-gcm";
const NONCE_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function assertHex(value: string, name: string) {
  if (!/^[0-9a-fA-F]+$/.test(value)) {
    throw new Error(`Invalid hex in ${name}`);
  }
}

function assertKey(key: Buffer) {
  if (key.length !== KEY_LENGTH) {
    throw new Error("Key must be 32 bytes for AES-256-GCM");
  }
}

export function encryptAES(key: Buffer, plaintext: string) {
  assertKey(key);

  const nonce = crypto.randomBytes(NONCE_LENGTH);

  if (nonce.length !== NONCE_LENGTH) {
    throw new Error("Nonce must be 12 bytes for AES-GCM");
  }

  const cipher = crypto.createCipheriv(ALGO, key, nonce);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    nonce: nonce.toString("hex"),
    ciphertext: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
}

export function decryptAES(
  key: Buffer,
  nonceHex: string,
  ctHex: string,
  tagHex: string,
) {
  assertKey(key);
  assertHex(nonceHex, "nonce");
  assertHex(ctHex, "ciphertext");
  assertHex(tagHex, "tag");

  const nonce = Buffer.from(nonceHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  if (nonce.length !== NONCE_LENGTH) {
    throw new Error("Invalid nonce length");
  }

  if (tag.length !== TAG_LENGTH) {
    throw new Error("Invalid tag length");
  }

  const decipher = crypto.createDecipheriv(ALGO, key, nonce);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ctHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
