import { FastifyInstance } from "fastify";
import { decryptAES } from "@repo/crypto";
import { prisma } from "../lib/prisma";

export async function decryptRoute(app: FastifyInstance) {
  app.post("/tx/:id/decrypt", async (req, reply) => {
    const { id } = req.params as { id: string };

    const record = await prisma.txSecureRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return reply.status(404).send({ error: "Record not found" });
    }

    try {
      const MASTER_KEY = Buffer.from(process.env.MASTER_KEY!, "hex");

      const dekHex = decryptAES(
        MASTER_KEY,
        record.dek_wrap_nonce,
        record.dek_wrapped,
        record.dek_wrap_tag
      );

      const decrypted = decryptAES(
        Buffer.from(dekHex, "hex"),
        record.payload_nonce,
        record.payload_ct,
        record.payload_tag
      );

      return reply.send(JSON.parse(decrypted));
    } catch (error) {
      req.log.error(error);
      return reply.status(400).send({
        error: "Decryption failed (possible tampering)",
      });
    }
  });
}
