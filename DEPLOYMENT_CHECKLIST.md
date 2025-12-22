# 📋 Firebase App Hosting Deployment Checklist

Use this checklist to ensure a smooth deployment to Firebase App Hosting.

## Pre-Deployment

- [ ] **Firebase CLI Installed**
  ```bash
  npm install -g firebase-tools
  firebase --version
  ```

- [ ] **Logged into Firebase**
  ```bash
  firebase login
  ```

- [ ] **Correct Firebase Project Selected**
  ```bash
  firebase use
  # Should show: agrisence-1dc30
  ```

- [ ] **Environment Variables Set**
  - [ ] `GOOGLE_API_KEY` secret set
  - [ ] `GEMINI_API_KEY` secret set (or using same as GOOGLE_API_KEY)
  - [ ] `GOOGLE_MAPS_API_KEY` configured in apphosting.yaml
  ```bash
  firebase apphosting:secrets:set GOOGLE_API_KEY
  ```

- [ ] **Dependencies Installed Locally**
  ```bash
  npm install
  ```

- [ ] **Code Compiles Successfully**
  ```bash
  npm run typecheck
  npm run build
  ```

- [ ] **All AI Flows Working**
  - [ ] Test locally with `npm run dev`
  - [ ] Verify Genkit flows in Developer UI at http://localhost:4000

## Configuration Files

- [ ] **apphosting.yaml** - Properly configured
  - [ ] `runConfig` settings appropriate (cpu, memory, instances)
  - [ ] All required environment variables listed
  - [ ] Secrets properly declared

- [ ] **.firebaserc** - Contains correct project ID
  ```json
  {
    "projects": {
      "default": "agrisence-1dc30"
    }
  }
  ```

- [ ] **firebase.json** - Firestore rules and hosting config present

- [ ] **next.config.mjs** - Production ready
  - [ ] Image optimization configured
  - [ ] Environment variables properly referenced

## Code Quality

- [ ] **No TypeScript Errors** (or acceptable with `ignoreBuildErrors: true`)
  ```bash
  npm run typecheck
  ```

- [ ] **No Critical Linting Errors** (or acceptable with `ignoreDuringBuilds: true`)
  ```bash
  npm run lint
  ```

- [ ] **All Imports Resolved**
  - Check all `@/` imports work
  - Verify all dependencies in package.json

## API & Backend

- [ ] **API Routes Created**
  - [ ] `/api/genkit/route.ts` exists with all flows imported
  - [ ] `/api/health/route.ts` exists for health checks

- [ ] **All Genkit Flows Registered**
  Check `/src/app/api/genkit/route.ts` imports:
  - [ ] crop-disease-detection
  - [ ] farming-advice-chatbot
  - [ ] market-price-search
  - [ ] schemes-search
  - [ ] weather-search
  - [ ] medicinal-plant-identifier
  - [ ] generate-crop-calendar
  - [ ] soil-advisor-flow
  - [ ] soil-report-parser-flow
  - [ ] satellite-health-flow
  - [ ] price-prediction-flow
  - [ ] live-advisor-flow
  - [ ] loan-insurance-assistant-flow
  - [ ] market-matchmaking-flow
  - [ ] find-best-sellers-flow
  - [ ] translate-text-flow

## Deployment

### Option 1: GitHub Integration (Recommended)

- [ ] **Repository Pushed to GitHub**
  ```bash
  git add .
  git commit -m "Prepare for Firebase App Hosting deployment"
  git push origin main
  ```

- [ ] **Connected to Firebase Console**
  1. [ ] Go to [Firebase Console](https://console.firebase.google.com/)
  2. [ ] Select project: `agrisence-1dc30`
  3. [ ] Navigate to **App Hosting**
  4. [ ] Click **Get Started** or **Add Backend**
  5. [ ] Connect GitHub repository
  6. [ ] Select repository and branch
  7. [ ] Confirm build settings
  8. [ ] Start initial deployment

### Option 2: Manual CLI Deployment

- [ ] **Create Backend**
  ```bash
  firebase apphosting:backends:create
  ```
  
- [ ] **Follow CLI Prompts**
  - [ ] Select Firebase project
  - [ ] Choose GitHub repository
  - [ ] Select branch
  - [ ] Configure build settings

## Post-Deployment

- [ ] **Deployment Successful**
  - Check Firebase Console for deployment status
  - Look for green checkmark ✅

- [ ] **Backend URL Obtained**
  - Note down the backend URL from Firebase Console
  - Format: `https://<backend-id>.<region>.gateway.dev`

- [ ] **Health Check Passed**
  ```bash
  curl https://your-backend-url/api/health
  # Should return: {"status":"healthy","timestamp":"...","service":"AgriSence Backend"}
  ```

- [ ] **Test Genkit Endpoint**
  ```bash
  curl -X POST https://your-backend-url/api/genkit \
    -H "Content-Type: application/json" \
    -d '{"flow":"farmingAdviceChatbotFlow","data":{"question":"How to grow rice?"}}'
  ```

- [ ] **Monitor Logs**
  ```bash
  firebase apphosting:backends:logs <backend-id>
  ```

- [ ] **Test Key Features**
  - [ ] Disease detection works
  - [ ] Chatbot responds
  - [ ] Weather search functional
  - [ ] Market prices loading
  - [ ] Maps displaying correctly

## Domain & SSL (Optional)

- [ ] **Custom Domain Configured** (if needed)
  - [ ] Domain added in Firebase Console
  - [ ] DNS records updated
  - [ ] SSL certificate provisioned

## Monitoring & Maintenance

- [ ] **Enable Monitoring**
  - [ ] Check Firebase Console > App Hosting > Metrics
  - [ ] Set up alerts for errors/downtime

- [ ] **Review Scaling Settings**
  - [ ] Confirm min/max instances appropriate for traffic
  - [ ] Adjust CPU/memory if needed

- [ ] **Cost Monitoring**
  - [ ] Review Firebase billing dashboard
  - [ ] Set budget alerts if needed

## Rollback Plan

- [ ] **Know How to Rollback**
  - Previous versions visible in Firebase Console
  - Can rollback from Console if issues occur
  
- [ ] **Backup Important Data**
  - Firestore data backed up
  - Storage files backed up

## Documentation

- [ ] **Update Documentation**
  - [ ] README.md reflects production setup
  - [ ] DEPLOYMENT.md is up to date
  - [ ] Environment variables documented

- [ ] **Team Notified**
  - [ ] Deployment URL shared with team
  - [ ] Known issues documented
  - [ ] Access credentials shared securely

---

## Quick Commands Reference

```bash
# View backends
firebase apphosting:backends:list

# View logs
firebase apphosting:backends:logs <backend-id>

# Set secrets
firebase apphosting:secrets:set SECRET_NAME

# List secrets
firebase apphosting:secrets:list

# Delete a backend (careful!)
firebase apphosting:backends:delete <backend-id>
```

---

**Last Updated**: December 22, 2025  
**Project**: AgriSence  
**Firebase Project**: agrisence-1dc30
