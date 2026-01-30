# Gemini API Setup Instructions

## Current Status
The food scanning feature is currently running in **Demo Mode** with simulated responses.

## To Enable Real AI Food Recognition:

### 1. Get a Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Update Environment Variable
1. Open the `.env.local` file in your project root
2. Replace `PLACEHOLDER_API_KEY` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. Restart Development Server
```bash
npm run dev
```

## Demo Mode Features
- Simulates realistic food recognition
- Shows random Indian dishes with nutritional info
- No API costs while testing
- Perfect for development and demos

## Real API Features
- Actual image analysis using Google's Gemini Vision AI
- Accurate food identification
- Real nutritional estimates
- Supports all food types globally