<div align="center">
  <img src="./logo.png" alt="AgriSence Logo" width="180" />
  
  <br />
  <br />

  # 🌾 AgriSence
  ### **AI-Powered Smart Farming Ecosystem**

  <p align="center">
    Empowering modern farmers with Gemini AI Vision, real-time analytics, satellite field mapping, and multilingual voice interfaces—all built on a production-grade React Native & Next.js monorepo.
  </p>

  <p align="center">
    <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
    <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" /></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Google Gemini" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  </p>
</div>

---

## 📖 Table of Contents
1. [Introduction & Vision](#-introduction--vision)
2. [The Ecosystem Architecture](#-the-ecosystem-architecture)
3. [Mobile Application: Field Intelligence](#-mobile-application-field-intelligence)
   - [Gemini Vision Crop Scanning](#gemini-vision-crop-scanning)
   - [Multilingual Voice UI](#multilingual-voice-ui)
   - [Offline-First Architecture](#offline-first-architecture)
   - [Real-Time Weather & Mandi Prices](#real-time-weather--mandi-prices)
4. [Web Platform: Farm Management Dashboard](#-web-platform-farm-management-dashboard)
   - [Financial & Harvest Records](#financial--harvest-records)
   - [Government Scheme Matching](#government-scheme-matching)
   - [Satellite NDVI Field Mapping](#satellite-ndvi-field-mapping)
5. [Core AI & Technology Stack](#-core-ai--technology-stack)
6. [Design System & UI Guidelines](#-design-system--ui-guidelines)
7. [Installation & Setup Guide](#-installation--setup-guide)
   - [Prerequisites](#prerequisites)
   - [Monorepo Setup](#monorepo-setup)
   - [Running the Mobile App](#running-the-mobile-app)
   - [Running the Web Platform](#running-the-web-platform)
8. [Environment Variables](#-environment-variables)
9. [Contributing Guidelines](#-contributing-guidelines)
10. [Security & Data Privacy](#-security--data-privacy)
11. [Roadmap](#-roadmap)
12. [License & Contact](#-license--contact)

---

## 🌍 Introduction & Vision

Agriculture is the backbone of the global economy, yet farmers often lack access to the real-time data, predictive intelligence, and technological tools needed to maximize yields and minimize losses. **AgriSence** was built to bridge this gap. 

By combining the latest advancements in Multimodal Artificial Intelligence (Google Gemini), high-performance cross-platform mobile development (React Native / Expo), and enterprise-grade web dashboards (Next.js), AgriSence delivers a unified, end-to-end precision farming ecosystem. 

Whether you are in the middle of a remote field checking for crop diseases without internet access, or in an office analyzing seasonal profitability through satellite imagery, AgriSence provides the exact tools required to grow smarter and farm wiser.

---

## 🏗 The Ecosystem Architecture

AgriSence is built as a highly scalable **Turborepo Monorepo**, ensuring maximum code reuse between the mobile application and the web platform. 

```text
agrisence/
├── apps/
│   ├── mobile/         # React Native (Expo) app for the field
│   ├── web/            # Next.js 16 Web Dashboard for farm management
│   └── landing/        # Next.js 16 Marketing & Download site
├── packages/
│   ├── ui/             # Shared Tailwind CSS components & Design System
│   ├── config/         # Shared ESLint, Prettier, and TypeScript configs
│   └── core/           # Shared AI Logic, Genkit orchestration, and DB schemas
└── package.json        # pnpm workspaces configuration
```

By centralizing our core logic, database schemas, and AI prompts in the `packages/core` directory, both the mobile and web platforms remain perfectly synchronized while maintaining their unique, platform-specific user experiences.

---

## 📱 Mobile Application: Field Intelligence

The AgriSence mobile application is the farmer's ultimate companion in the field. Built with React Native and Expo, it is optimized for low-end devices, poor network conditions, and extreme ease of use.

### Gemini Vision Crop Scanning
Traditional crop disease identification requires agronomists or complex laboratory tests. AgriSence integrates directly with **Google Gemini 1.5 Pro Vision**. 
- **Point & Shoot:** Simply open the in-app camera, snap a picture of a diseased leaf, and the AI will analyze the visual data against millions of agricultural parameters.
- **Actionable Insights:** The app doesn't just name the disease; it provides immediate, actionable remediation steps, including organic treatment alternatives and recommended chemical applications.
- **Confidence Scoring:** The AI provides a confidence percentage, ensuring farmers can make informed decisions.

### Multilingual Voice UI
Farming communities often face literacy or technological adoption barriers. To solve this, AgriSence features a **Voice-First AI Interface**.
- **Speak Naturally:** Farmers can tap the microphone and ask questions like, "What is the price of tomatoes in Bangalore today?" or "How much urea should I use for a 2-acre corn field?"
- **Local Languages:** Fully supports English, Hindi, and Kannada. The AI detects the language automatically and responds in the same language natively.
- **Context-Aware:** The AI remembers the context of the conversation and the farmer's specific crop profile.

### Offline-First Architecture
Fields are notorious for having zero cellular coverage. 
- **Local Caching:** We utilize advanced local storage mechanisms (WatermelonDB / Async Storage) to cache the farmer's data, recent market prices, and critical AI inference logic.
- **Background Sync:** The moment the device reconnects to a network (3G/4G/WiFi), the app silently synchronizes all local changes (expense logs, offline crop scans) with Firebase Cloud Firestore.

### Real-Time Weather & Mandi Prices
- **Hyper-Local Weather:** Integrates with leading weather APIs to provide field-specific rain probabilities, soil moisture estimates, and severe weather alerts.
- **Live Market Data:** Pulls real-time agricultural commodity prices (Mandi prices) across India, allowing farmers to decide exactly when and where to sell their harvest for maximum profit.

---

## 💻 Web Platform: Farm Management Dashboard

While the mobile app is for the field, the AgriSence Web Platform (built on Next.js 16 App Router) is designed for the desk. It provides a massive, high-density interface for managing the business side of farming.

### Financial & Harvest Records
Farming is a business, and profitability requires meticulous tracking.
- **Expense Tracking:** Log every rupee spent on seeds, fertilizers, machinery, and labor. The dashboard categorizes these expenses dynamically.
- **Yield Analytics:** Match expenses against final harvest yields. The platform calculates true season profitability and generates beautiful, exportable charts (PDF/CSV).
- **Predictive ROI:** Using historical data and current market prices, the AI predicts the potential Return on Investment for upcoming planting seasons.

### Government Scheme Matching
Millions of dollars in agricultural subsidies go unclaimed every year because farmers don't know they exist.
- **Profile Matching:** The platform analyzes the user's farm size, location, crop types, and demographic data.
- **Automated Discovery:** It continuously queries a database of State and Central Government agricultural schemes and pushes notifications for highly relevant subsidies (e.g., PM-KISAN, drip irrigation subsidies).

### Satellite NDVI Field Mapping
Take the guesswork out of field health.
- **Interactive Mapping:** Draw your farm boundaries directly on an interactive Google Map interface.
- **NDVI Processing:** The platform fetches historical and current satellite imagery, processing it into Normalized Difference Vegetation Index (NDVI) maps.
- **Zonal Analysis:** Visually identify exact zones in your field that are underperforming (e.g., nitrogen deficiency, waterlogging) before the damage becomes visible to the naked eye.

---

## 🧠 Core AI & Technology Stack

AgriSence represents the absolute cutting edge of web and mobile technologies.

### AI Infrastructure
- **Google Gemini 1.5 Pro & Flash:** Powers all complex reasoning, natural language processing, and advanced visual disease detection.
- **Firebase Genkit:** We use Genkit to orchestrate complex AI workflows, chaining multiple models and tools together for highly accurate agricultural advice.
- **Retrieval-Augmented Generation (RAG):** The AI has access to a massive vector database of verified agricultural research, ensuring it provides scientifically backed advice rather than hallucinated responses.

### Frontend Technologies
- **Next.js 16 (App Router):** The foundation of the web platform and marketing site. Utilizes Server Components for maximum performance and SEO.
- **React Native & Expo 52:** Powers the mobile app, providing a near-native experience on both iOS and Android with a single codebase.
- **Tailwind CSS v4:** For rapid, utility-first styling across both web and mobile platforms.
- **Framer Motion & Reanimated 3:** Delivers the cinematic, 60fps animations, liquid-glass effects, and seamless page transitions.

### Backend & Cloud Infrastructure
- **Firebase Cloud Firestore:** A highly scalable NoSQL database providing real-time data synchronization between the web and mobile apps.
- **Firebase Authentication:** Secure, passwordless, and phone-number-based authentication.
- **Google Cloud Storage:** Securely stores high-resolution crop imagery and user documents.
- **Firebase Cloud Messaging (FCM):** Delivers critical weather and market alerts directly to user devices.

---

## 🎨 Design System & UI Guidelines

AgriSence uses a proprietary design system engineered to look incredibly premium, trustworthy, and modern.

### Typography
- **Headings (Instrument Serif):** All major headings utilize `Instrument Serif` (italicized), providing an editorial, cinematic, and authoritative feel.
- **Body Text (Barlow):** `Barlow` is used for all UI text and paragraphs, offering maximum legibility and a clean, technical aesthetic.

### Color Palette
- **Ultra-Dark Canvas:** The primary background is `#000000` or `#050505` to reduce eye strain and make the interface feel immersive.
- **Agri-Green Accents:** `emerald-400` (`#34d399`) and `green-500` (`#22c55e`) are used sparingly for critical actions, highlights, and success states, symbolizing healthy growth.

### Liquid Glass Morphism
Instead of flat, boring cards, AgriSence utilizes complex CSS masks and backdrop-filters to create "Liquid Glass". This effect involves near-invisible backgrounds with extreme background-blurs and custom gradient-stroke borders, ensuring the UI feels futuristic yet unobtrusive.

---

## ⚙️ Installation & Setup Guide

Ready to run AgriSence locally? Follow these steps to get the entire monorepo up and running.

### Prerequisites
Ensure you have the following installed on your machine:
- **Node.js:** v20.x or higher
- **pnpm:** v9.x or higher (`npm install -g pnpm`)
- **Java Development Kit (JDK):** v17 (Required for Android build)
- **Android Studio:** For running the mobile emulator
- **Git:** For version control

### Monorepo Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/agrisence.git
   cd agrisence
   ```

2. **Install Dependencies**
   We use `pnpm` workspaces for efficient dependency management.
   ```bash
   pnpm install
   ```

3. **Set Up Environment Variables**
   Copy the example environment files in both the web and mobile directories.
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/mobile/.env.example apps/mobile/.env
   cp apps/landing/.env.example apps/landing/.env.local
   ```
   *Note: You will need to obtain Firebase configuration keys and a Google Gemini API key from the Google Cloud Console and populate these files.*

### Running the Web Platform (Dashboard & Landing)

To start the Next.js development servers:

```bash
# Start the Web Dashboard (Port 3001)
pnpm --filter web dev

# Start the Landing Page (Port 3000)
pnpm --filter landing dev
```
Open `http://localhost:3000` in your browser to view the cinematic landing page.

### Running the Mobile App (React Native)

To start the Expo development server and run the app on an Android emulator:

```bash
# Ensure your Android emulator is running, then execute:
pnpm --filter mobile start
```
Press `a` in the terminal to open the app on your Android emulator.

---

## 🔐 Environment Variables

The project requires several crucial environment variables to function correctly. Ensure these are never committed to version control.

**Firebase Configuration:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key-here"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

**AI & Maps Configuration:**
```env
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

---

## 🤝 Contributing Guidelines

We welcome contributions from the community to help make AgriSence the standard in open agricultural technology.

1. **Fork the Repository:** Create your own fork on GitHub.
2. **Create a Feature Branch:** `git checkout -b feature/amazing-new-tool`
3. **Commit your Changes:** We follow conventional commits. 
   ```bash
   git commit -m "feat(mobile): add offline crop disease caching"
   ```
4. **Push to the Branch:** `git push origin feature/amazing-new-tool`
5. **Open a Pull Request:** Describe your changes in detail and link to any relevant issues.

### Code Style
- We use **ESLint** and **Prettier** for code formatting. Run `pnpm run lint` before committing.
- Ensure all new components are strictly typed with TypeScript. Avoid the use of `any`.
- Write unit tests for critical business logic using **Vitest**.

---

## 🛡 Security & Data Privacy

Agricultural data is highly sensitive. AgriSence implements strict security protocols:
- **End-to-End Encryption:** All data transmitted between the mobile app, web dashboard, and Firebase backend is encrypted over HTTPS/TLS.
- **Strict Firestore Rules:** Database access is governed by rigorous Firebase Security Rules, ensuring users can only read and write their own farm data.
- **No AI Training on User Data:** We strictly opt-out of allowing Google or any third party to use AgriSence user data (including crop photos and financial records) for training base AI models.

---

## 🚀 Roadmap

We are continuously evolving AgriSence. Here is a look at what is coming in the next 12 months:

- **Q3 2026:** Launch of the IoT Hardware Integration Kit (connect your own soil moisture sensors directly to the app via Bluetooth).
- **Q4 2026:** Implementation of Drone-based orthomosaic field mapping in the Web Platform.
- **Q1 2027:** Peer-to-peer equipment sharing marketplace within the mobile app.
- **Q2 2027:** Full iOS App Store release and expansion of local language support to Tamil, Telugu, and Marathi.

---

## 📄 License & Contact

AgriSence is released under the **MIT License**. See the `LICENSE` file for more details.

**Contact the Team:**
- **Email:** engineering@agrisence.com
- **Twitter / X:** [@AgriSenceApp](https://twitter.com)
- **Support:** support.agrisence.com

<br />

<p align="center">
  <i>Built with precision, designed for the future of farming.</i>
</p>
