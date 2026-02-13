import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";

import { encryptRoute } from "./routes/encrypt";
import { decryptRoute } from "./routes/decrypt";
import { fetchRoute } from "./routes/fetch"; // make sure you have this

const app = Fastify({ logger: true });
app.register(cors, {
  origin: "https://mirfa-web-five.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

/* Validate MASTER KEY once */
if (!process.env.MASTER_KEY) {
  throw new Error("MASTER_KEY not set");
}

if (Buffer.from(process.env.MASTER_KEY, "hex").length !== 32) {
  throw new Error("MASTER_KEY must be 32 bytes");
}

/* Register routes */
app.register(encryptRoute);
app.register(decryptRoute);
app.register(fetchRoute);

/* ---------------- Vercel Serverless Export ---------------- */

export default async function handler(req: any, res: any) {
  await app.ready();
  app.server.emit("request", req, res);
}
