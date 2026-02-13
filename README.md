# Mirfa Secure TX

A monorepo for secure transactions using a Fastify API and a Next.js frontend.

## Project Structure

- `apps/api` – Fastify backend with AES-256-GCM encryption and DEK wrapping.
- `apps/web` – Next.js frontend for interacting with encrypted transactions.
- `packages/crypto` – Shared encryption utilities.

## Features

- Encrypt and store transaction payloads securely.
- Fetch and decrypt transactions by ID.
- Fully modular Fastify API with separate routes for encrypt, decrypt, and fetch.

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/April077/mirfa.git
cd mirfa-secure-tx
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in `apps/api`:

```env
MASTER_KEY=<64-hex-character-key>
DATABASE_URL=<your-database-url>
```

4. Start development:

```bash
pnpm dev
```

- API runs on `http://localhost:4000`
- Frontend runs on `http://localhost:3000` (or 3001 if 3000 is busy)

## Scripts

- `pnpm dev` – Start dev servers for API and frontend.
- `pnpm build` – Build all packages.
- `pnpm clean` – Clean cache and build artifacts.

## Deployment

- Backend is ready for Vercel serverless deployment.
- Frontend is a standard Next.js app, also deployable on Vercel.

