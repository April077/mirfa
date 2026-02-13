// tests/api.test.ts
import Fastify from "fastify";
import supertest from "supertest";
import { encryptRoute } from "../routes/encrypt";
import { decryptRoute } from "../routes/decrypt";
import { fetchRoute } from "../routes/fetch";
import crypto from "crypto";

// Mock env
process.env.MASTER_KEY = crypto.randomBytes(32).toString("hex");

// Setup Fastify server for testing
const buildServer = () => {
  const app = Fastify();
  app.register(encryptRoute);
  app.register(decryptRoute);
  app.register(fetchRoute);
  return app;
};

// Mock AES encryption/decryption
jest.mock("@repo/crypto", () => {
  return {
    encryptAES: jest.fn((key, plaintext) => ({
      nonce: "nonce",
      ciphertext: Buffer.from(plaintext).toString("hex"),
      tag: "tag",
    })),
    decryptAES: jest.fn((key, nonce, ct, tag) =>
      Buffer.from(ct, "hex").toString("utf8")
    ),
  };
});

// Mock Prisma
jest.mock("../lib/prisma", () => ({
  prisma: {
    txSecureRecord: {
      create: jest.fn().mockResolvedValue({ id: "1" }),
      findUnique: jest.fn().mockResolvedValue({
        id: "1",
        dek_wrapped: "dummy",
        dek_wrap_nonce: "nonce",
        dek_wrap_tag: "tag",
        payload_ct: Buffer.from(
          JSON.stringify({ partyId: "party1", payload: { amount: 100 } })
        ).toString("hex"),
        payload_nonce: "nonce",
        payload_tag: "tag",
      }),
    },
  },
}));

describe("API Tests", () => {
  let app: ReturnType<typeof buildServer>;
  let recordId: string;

  beforeAll(async () => {
    app = buildServer();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("1. Encrypt route should store a record", async () => {
    const res = await supertest(app.server)
      .post("/tx/encrypt")
      .send({ partyId: "party1", payload: { amount: 100 } })
      .expect(201);

    expect(res.body).toHaveProperty("id");
    recordId = res.body.id;
  });

  test("2. Decrypt route should return original payload", async () => {
    const res = await supertest(app.server)
      .post(`/tx/${recordId}/decrypt`)
      .expect(200);

    expect(res.body).toEqual({ partyId: "party1", payload: { amount: 100 } });
  });

  test("3. Encrypt fails without partyId", async () => {
    const res = await supertest(app.server)
      .post("/tx/encrypt")
      .send({ payload: { amount: 50 } })
      .expect(400);

    expect(res.body.error).toBe("Invalid partyId");
  });

  test("4. Decrypt fails for invalid ID", async () => {
    // Override mock for this test to return null
    const prisma = require("../lib/prisma").prisma;
    prisma.txSecureRecord.findUnique.mockResolvedValueOnce(null);

    const res = await supertest(app.server)
      .post("/tx/invalid-id/decrypt")
      .expect(404);

    expect(res.body.error).toBe("Record not found");
  });

  test("5. AES encryption/decryption works correctly", () => {
    const { encryptAES, decryptAES } = require("@repo/crypto");
    const key = crypto.randomBytes(32);
    const plaintext = JSON.stringify({ message: "hello" });
    const encrypted = encryptAES(key, plaintext);
    const decrypted = decryptAES(key, encrypted.nonce, encrypted.ciphertext, encrypted.tag);

    expect(decrypted).toBe(plaintext);
  });
});
