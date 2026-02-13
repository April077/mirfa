import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function fetchRoute(app: FastifyInstance) {
  app.get("/tx/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const record = await prisma.txSecureRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return reply.status(404).send({ error: "Record not found" });
    }

    return reply.send(record);
  });
}
