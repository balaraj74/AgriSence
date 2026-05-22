# AgriSence — AI-Powered Smart Farming Platform

> A full-stack monorepo for the AgriSence ecosystem — combining a Next.js web app, React Native mobile app, admin dashboard, and backend API under a single Turborepo + pnpm workspace.

---

## 📁 Repo Structure

```
agrisence/
├── apps/
│   ├── web/         → Next.js 16 web app (Firebase App Hosting)
│   ├── mobile/      → React Native (Expo 52) Android app
│   ├── admin/       → Admin dashboard (Next.js) [placeholder]
│   └── backend/     → API server (Hono + Node.js) [placeholder]
│
├── packages/
│   ├── types/       → Shared TypeScript types
│   ├── config/      → Shared ESLint + TS configs
│   ├── constants/   → Shared app constants
│   ├── ui/          → Shared design tokens [stub]
│   ├── api-client/  → Shared API fetch helpers [stub]
│   ├── auth/        → Shared Firebase auth utilities [stub]
│   ├── analytics/   → Shared analytics hooks [stub]
│   └── ai/          → Shared AI prompt definitions [stub]
│
├── infrastructure/
│   ├── docker/      → Docker + Compose configs
│   ├── kubernetes/  → K8s deployment manifests
│   ├── terraform/   → GCP/Firebase infra as code
│   └── nginx/       → Reverse proxy configs
│
├── docs/            → Architecture documentation
├── scripts/         → Dev, build, deploy scripts
└── .github/         → GitHub Actions CI/CD
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 — `npm install -g pnpm`

### Install all dependencies

```bash
pnpm install
```

### Run all apps in development

```bash
pnpm dev
```

### Run a specific app

```bash
# Web app
cd apps/web && pnpm dev

# Mobile app
cd apps/mobile && npx expo start

# Admin dashboard
cd apps/admin && pnpm dev
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Web | Next.js 16 + React 19 + Tailwind CSS |
| Mobile | React Native (Expo 52) |
| AI | Google Gemini via Genkit |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Hosting | Firebase App Hosting |
| Monorepo | pnpm Workspaces + Turborepo |
| CI/CD | GitHub Actions |

---

## 📦 Packages

| Package | Description |
|---|---|
| `@agrisence/types` | Shared TypeScript interfaces (Crop, Expense, Harvest, etc.) |
| `@agrisence/config` | Shared ESLint + TypeScript base configs |
| `@agrisence/constants` | Shared constants (categories, statuses, routes) |
| `@agrisence/ui` | Shared design tokens and base components |
| `@agrisence/api-client` | Typed API fetch helpers |
| `@agrisence/auth` | Firebase auth utilities |
| `@agrisence/analytics` | Analytics hooks and event definitions |
| `@agrisence/ai` | AI prompt templates and Genkit flow definitions |

---

## 📄 License

Private — All rights reserved © AgriSence
