# AgriSence Monorepo Architecture

This monorepo manages all applications, packages, and infrastructure for the AgriSence project using **pnpm workspaces** and **Turborepo**.

## 📁 Repository Structure

```tree
AgriSence/
│
├── apps/                    # Applications (Next.js, Expo, Hono)
│   ├── web/                 # Next.js web application
│   ├── mobile/              # Expo / React Native mobile app
│   ├── admin/               # Next.js admin dashboard
│   └── backend/             # Hono / Node.js API server
│
├── packages/                # Shared internal libraries
│   ├── ui/                  # Shared React components (Tailwind, Radix)
│   ├── types/               # TypeScript interfaces & types
│   ├── config/              # Shared tsconfig and ESLint configs
│   ├── constants/           # Business logic constants (categories, states, languages)
│   ├── api-client/          # Shared API fetching logic / tRPC / React Query
│   ├── auth/                # Shared Firebase Auth wrappers
│   ├── analytics/           # Shared PostHog / tracking wrappers
│   └── ai/                  # Shared Gemini AI prompt generation & logic
│
├── infrastructure/          # Deployment and CI/CD assets
│   ├── docker/              # Dockerfiles and docker-compose.yml
│   ├── kubernetes/          # K8s manifests
│   ├── terraform/           # IaC for provisioning
│   └── nginx/               # Reverse proxy configurations
│
├── scripts/                 # Utility scripts (setup, build, dev)
└── docs/                    # Architecture and documentation
```

## 🛠 Tech Stack

### Frameworks
- **Web**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Mobile**: Expo (React Native 0.76), React 18, NativeWind
- **Backend**: Node.js, Hono, Firebase Admin SDK
- **Admin**: Next.js 16 (App Router)

### Tooling
- **Package Manager**: pnpm (v9)
- **Monorepo Orchestration**: Turborepo
- **Type Checking**: TypeScript 5
- **Linting & Formatting**: ESLint + Prettier

### Infrastructure
- **Hosting (Web)**: Firebase App Hosting
- **Hosting (Backend)**: Google Cloud Run (via Docker)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI Integration**: Google Gemini API

## 🔄 Workflow commands

Run these from the repository root:

- `pnpm install` — Installs dependencies and links workspace packages.
- `pnpm dev` — Starts all applications in development mode.
- `pnpm build` — Builds all apps and packages using Turbo cache.
- `pnpm lint` — Runs ESLint across the workspace.
- `pnpm typecheck` — Runs TypeScript compiler across the workspace.

## 📦 Creating a New Package

To extract shared logic into a new package:
1. Create a folder in `packages/<name>`
2. Add a `package.json` extending `@agrisence/config`
3. Expose the package in the `exports` field
4. Import it in your apps using `"@agrisence/<name>": "workspace:*"`
