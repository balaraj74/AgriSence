# 🌾 AgriSence - AI-Powered Farming Assistant

A comprehensive Next.js application designed for farmers, providing AI-powered tools for crop management, disease detection, market insights, and more.

## 🚀 Features

- **🌱 Crop Disease Detection** - AI-powered plant disease identification and treatment advice
- **💬 Farming Chatbot** - Get expert farming advice in multiple languages
- **🌤️ Weather Forecasting** - Real-time weather information for your location
- **📊 Market Prices** - Live market price tracking and predictions
- **🗺️ Field Mapping** - Map and manage your farm boundaries
- **🧪 Soil Advisor** - Get fertilizer recommendations based on soil data
- **🌿 Medicinal Plant Identifier** - Identify medicinal plants with your camera
- **💰 Loan & Insurance Assistant** - Check eligibility for loans and schemes
- **🤝 Market Matchmaking** - Find the best buyers for your crops
- **🛰️ Satellite Health Monitoring** - Monitor crop health from satellite imagery
- **📅 Crop Calendar** - AI-generated seasonal task schedules

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.3
- **AI/ML**: Google Genkit 1.13.0 with Gemini AI
- **Backend**: Firebase (Firestore, Storage, Auth, App Hosting)
- **UI**: React 18 with Tailwind CSS & Radix UI
- **Maps**: Google Maps API
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js 20+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud API Key (for Gemini AI)
- Google Maps API Key

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd studio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your API keys
nano .env.local
```

Required environment variables:
- `GOOGLE_API_KEY` or `GEMINI_API_KEY` - Your Google Gemini API key
- `GOOGLE_MAPS_API_KEY` - Your Google Maps API key

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Deployment to Firebase App Hosting

### Quick Setup

Run the automated setup script:

```bash
./setup-backend.sh
```

This will:
- Install Firebase CLI
- Login to Firebase
- Set up secrets
- Create local environment files

### Manual Deployment

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Set up secrets**:
   ```bash
   firebase apphosting:secrets:set GOOGLE_API_KEY
   ```

4. **Deploy via Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: `agrisence-1dc30`
   - Navigate to **App Hosting**
   - Connect your GitHub repository
   - Firebase will auto-deploy on each push

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📁 Project Structure

```
studio/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes (backend endpoints)
│   │   ├── (app)/        # Application pages
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── ai/               # AI/Genkit configuration
│   │   ├── genkit.ts     # Genkit setup
│   │   └── flows/        # AI flow definitions
│   ├── components/       # Reusable React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and Firebase config
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── apphosting.yaml       # Firebase App Hosting config
├── firebase.json         # Firebase configuration
└── .firebaserc           # Firebase project settings
```

## 🔌 API Endpoints

Once deployed, the following endpoints are available:

- `GET /api/health` - Health check endpoint
- `POST /api/genkit` - Genkit AI flows endpoint

## 🧪 Available Scripts

```bash
npm run dev              # Start development server with Genkit watch
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
npm run genkit:watch     # Start Genkit in watch mode
```

## 🌐 Environment Variables

### Development (.env.local)
```env
GOOGLE_API_KEY=your_gemini_api_key
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key
NODE_ENV=development
```

### Production (Firebase Secrets)
Set via Firebase CLI:
```bash
firebase apphosting:secrets:set GOOGLE_API_KEY
```

## 📱 Features in Detail

### AI-Powered Disease Detection
Upload images of crops to identify diseases and get treatment recommendations in your preferred language.

### Smart Farming Chatbot
Ask questions about farming practices, pest control, fertilizers, and more. Available in multiple Indian languages.

### Market Intelligence
- Real-time market prices from government APIs
- Price predictions using AI
- Market matchmaking to connect with buyers

### Soil & Fertilizer Advisor
Upload soil test reports or enter soil parameters to get personalized fertilizer recommendations.

### Weather Integration
Get accurate weather forecasts and farming advice based on upcoming weather conditions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- Balaraj R
- Bharath C D
- Mahesh Kumar B
- Basavaraj M

## 📞 Contact

For support or inquiries, contact: +91 8431206594

---

**Built with ❤️ for Indian Farmers**

