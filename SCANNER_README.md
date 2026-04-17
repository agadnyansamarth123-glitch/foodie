# Food Scanner Setup

## 🚨 IMPORTANT: API Key Required

The Food Scanner requires an OCR.space API key to work. Without it, you'll get a 403 error.

## OCR API Configuration

### Step 1: Get Your FREE API Key
1. Visit https://ocr.space/ocrapi
2. Click "Sign Up" (top right)
3. Create a free account
4. Go to your dashboard
5. Copy your API key

### Step 2: Add to Environment
1. Open the `.env` file in your project root
2. Replace this line:
   ```
   VITE_OCR_API_KEY=your_ocr_api_key_here
   ```
   With your actual API key:
   ```
   VITE_OCR_API_KEY=your_real_api_key_from_ocr_space
   ```

### Step 3: Restart Development Server
After updating the `.env` file, restart your dev server:
```bash
npm run dev
```

## Features

- Upload food label images
- Extract text using OCR
- Analyze ingredients for harmful substances
- Get health score and recommendations
- Clean, modern UI with image preview

## Harmful Ingredients Detected

The scanner checks for these potentially harmful ingredients:
- Artificial sweeteners (aspartame, sucralose, etc.)
- Preservatives (sodium benzoate, potassium sorbate, etc.)
- Artificial colors and flavors
- High fructose corn syrup
- Trans fats and hydrogenated oils
- MSG and other additives

## Troubleshooting

**403 Error**: API key not configured or invalid
**Network Error**: Check your internet connection
**No Text Extracted**: Try a clearer image or different angle