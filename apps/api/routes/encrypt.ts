import { FastifyInstance } from "fastify";
import crypto from "crypto";
import { encryptAES } from "@repo/crypto";
import { prisma } from "../lib/prisma";

export async function encryptRoute(app: FastifyInstance) {
  app.post("/tx/encrypt", async (req, reply) => {
    const body = req.body as any;

    if (!body?.partyId || typeof body.partyId !== "string") {
      return reply.status(400).send({ error: "Invalid partyId" });
    }

    if (!body?.payload || typeof body.payload !== "object") {
      return reply.status(400).send({ error: "Invalid payload" });
    }

    try {
      const MASTER_KEY = Buffer.from(process.env.MASTER_KEY!, "hex");

      const dek = crypto.randomBytes(32);

      const encryptedPayload = encryptAES(
        dek,
        JSON.stringify({
          partyId: body.partyId,
          payload: body.payload,
        }),
      );

      const wrappedDek = encryptAES(MASTER_KEY, dek.toString("hex"));

      const record = await prisma.txSecureRecord.create({
        data: {
          partyId: body.partyId,
          payload_nonce: encryptedPayload.nonce,
          payload_ct: encryptedPayload.ciphertext,
          payload_tag: encryptedPayload.tag,
          dek_wrap_nonce: wrappedDek.nonce,
          dek_wrapped: wrappedDek.ciphertext,
          dek_wrap_tag: wrappedDek.tag,
          alg: "AES-256-GCM",
          mk_version: 1,
        },
      });

      return reply.status(201).send(record);
    } catch (error) {
      req.log.error({ err: error }, "error occurred");
      return reply.status(500).send({ error: "Encryption failed" });
    }
  });
}
