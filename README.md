# 🍛 Indian Diet Planner

A personalised Indian diet plan generator powered by AI. Enter your age, height, weight and goal to get a full 7-day meal plan using traditional Indian cuisine.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Groq API (llama-3.3-70b-versatile)** — Free & Fast

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get your FREE Groq API key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free (no credit card needed)
3. Click **API Keys** → **Create API Key**
4. Copy the key

### 3. Add your Groq API key

Create (or edit) `.env.local` in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
indian-diet-planner/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # Groq API route
│   ├── globals.css            # Tailwind + custom styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx              # Landing page + form + results
├── .env.local                 # Your API key (not committed)
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Features

- Enter age, height (cm), and weight (kg)
- Choose goal: Lose Weight / Gain Weight / Diabetic Friendly
- AI generates a full 7-day Indian meal plan
- Loading spinner while AI responds
- Results shown on the same page
- Mobile-friendly layout
- Error handling for API failures

## Deploying to Vercel (Free)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add `GROQ_API_KEY` in Vercel → Settings → Environment Variables
4. Deploy!

> Groq is free and works perfectly on Vercel — no credit card needed for either!
