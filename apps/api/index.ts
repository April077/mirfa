import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";

import { encryptRoute } from "./routes/encrypt";
import { decryptRoute } from "./routes/decrypt";
import { fetchRoute } from "./routes/fetch";

const app = Fastify({ logger: true });

app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || origin.endsWith(".vercel.app") || origin === "http://localhost:3000") {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

if (!process.env.MASTER_KEY) {
  throw new Error("MASTER_KEY not set");
}

if (Buffer.from(process.env.MASTER_KEY, "hex").length !== 32) {
  throw new Error("MASTER_KEY must be 32 bytes");
}

app.register(encryptRoute);
app.register(decryptRoute);
app.register(fetchRoute);

export default async function handler(req: any, res: any) {
  await app.ready();
  app.server.emit("request", req, res);
}