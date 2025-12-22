# Firebase App Hosting Deployment Guide

## 🚀 Quick Start

This application is configured for **Firebase App Hosting**, which provides serverless hosting for your Next.js application with automatic scaling and global CDN.

## 📋 Prerequisites

1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Ensure you have access to the project**:
   - Project ID: `agrisence-1dc30`

## 🔧 Setup

### 1. Set Environment Variables/Secrets

Set up required secrets using Firebase CLI:

```bash
# Set Google API Key (for Gemini AI)
firebase apphosting:secrets:set GOOGLE_API_KEY

# You'll be prompted to enter the API key value
```

### 2. Configure Additional Environment Variables

If you need to add more environment variables, edit `apphosting.yaml`:

```yaml
env:
  - variable: YOUR_VARIABLE_NAME
    value: your_value
    availability:
      - BUILD
      - RUNTIME
```

## 🌐 Deploy to Firebase App Hosting

### Option 1: Connect GitHub Repository (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `agrisence-1dc30`
3. Navigate to **App Hosting** in the left sidebar
4. Click **Get Started** or **Add Backend**
5. Connect your GitHub repository
6. Select this repository and branch
7. Firebase will automatically:
   - Detect the Next.js framework
   - Use `apphosting.yaml` for configuration
   - Deploy on every push to the selected branch

### Option 2: Manual Deployment via CLI

```bash
# Create a new backend (first time only)
firebase apphosting:backends:create

# Follow the prompts to:
# - Select the Firebase project
# - Choose GitHub repository
# - Select branch
# - Configure build settings
```

## 📁 Project Structure

```
studio/
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   │   ├── genkit/       # Genkit AI flows endpoint
│   │   │   └── health/       # Health check endpoint
│   │   └── (app)/            # Application pages
│   └── ai/
│       ├── genkit.ts         # Genkit configuration
│       └── flows/            # AI flow definitions
├── apphosting.yaml           # Firebase App Hosting config
├── firebase.json             # Firebase configuration
└── .firebaserc               # Firebase project settings
```

## 🔑 Environment Variables

### Required Secrets (Set via Firebase CLI):
- `GOOGLE_API_KEY` / `GEMINI_API_KEY` - Google Gemini API key

### Optional Variables:
- `GOOGLE_MAPS_API_KEY` - For maps functionality
- `NODE_ENV` - Automatically set to `production`

## 🧪 Test the Backend

Once deployed, your backend will be available at:
```
https://<backend-id>.<region>.gateway.dev
```

### Test Endpoints:

1. **Health Check**:
   ```bash
   curl https://your-backend-url/api/health
   ```

2. **Genkit AI Flows**:
   ```bash
   curl -X POST https://your-backend-url/api/genkit \
     -H "Content-Type: application/json" \
     -d '{"flow": "farmingAdviceChatbotFlow", "data": {"question": "How to grow rice?"}}'
   ```

## 📊 Monitor & Manage

### View Logs:
```bash
firebase apphosting:backends:logs <backend-id>
```

### View Backend Status:
```bash
firebase apphosting:backends:list
```

### Update Configuration:
After modifying `apphosting.yaml`, commit and push to trigger a new deployment.

## 🏗️ Build Configuration

The app uses the following build settings (defined in `apphosting.yaml`):

- **Min Instances**: 1 (always warm)
- **Max Instances**: 10 (auto-scales up to 10)
- **CPU**: 1 vCPU
- **Memory**: 512 MiB
- **Concurrency**: 80 requests per instance

## 🔄 CI/CD Pipeline

Once connected to GitHub:
1. Push code to your repository
2. Firebase automatically detects changes
3. Builds and deploys the application
4. Updates the live backend

## 🐛 Troubleshooting

### Build Failures:
- Check build logs in Firebase Console
- Ensure all dependencies are in `package.json`
- Verify `next.config.mjs` is properly configured

### Runtime Errors:
- Check runtime logs: `firebase apphosting:backends:logs`
- Verify secrets are set correctly
- Ensure environment variables are available

### API Not Working:
- Verify the Genkit route is properly configured
- Check that all AI flows are imported in `/src/app/api/genkit/route.ts`
- Ensure GOOGLE_API_KEY secret is set

## 📚 Additional Resources

- [Firebase App Hosting Documentation](https://firebase.google.com/docs/app-hosting)
- [Next.js on Firebase](https://firebase.google.com/docs/app-hosting/frameworks/nextjs)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)

## 🎯 Next Steps

1. Set up your secrets using `firebase apphosting:secrets:set`
2. Connect your GitHub repository via Firebase Console
3. Monitor the first deployment
4. Test all endpoints
5. Set up custom domain (optional)

---

**Project**: AgriSence  
**Firebase Project ID**: agrisence-1dc30  
**Framework**: Next.js 15.3.3  
**AI Framework**: Genkit 1.13.0
