import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { age, height, weight, goal } = await req.json();

    // Basic validation
    if (!age || !height || !weight || !goal) {
      return NextResponse.json(
        { error: "Please fill in all fields." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key is not configured. Please add GROQ_API_KEY to .env.local." },
        { status: 500 }
      );
    }

    const goalLabel =
      goal === "lose_weight"
        ? "lose weight"
        : goal === "gain_weight"
        ? "gain weight and build muscle"
        : "manage blood sugar (diabetic-friendly eating)";

    const prompt = `You are a certified Indian nutritionist and dietitian. Create a detailed, personalised Indian diet plan for the following person:

- Age: ${age} years
- Height: ${height} cm
- Weight: ${weight} kg
- Goal: ${goalLabel}

Please provide:

## BMI & Overview
Calculate their BMI and briefly explain what it means for their goal.

## Daily Calorie Target
Recommend a daily calorie range based on their stats and goal.

## 7-Day Indian Meal Plan
For each day, suggest:
- **Breakfast** (with portion sizes)
- **Mid-Morning Snack**
- **Lunch** (with portion sizes)
- **Evening Snack**
- **Dinner** (with portion sizes)

Use traditional Indian foods: roti, dal, sabzi, rice, idli, dosa, poha, upma, khichdi, paneer, curd, sprouts, fruits, etc.

## Key Nutritional Tips
Provide 4-5 practical tips specific to their goal using Indian food wisdom.

## Foods to Favour
List 6-8 Indian foods they should eat more of.

## Foods to Limit
List 4-5 Indian foods or habits to reduce.

## Hydration & Lifestyle
Brief advice on water intake, meal timing, and one lifestyle tip.

Keep the language simple, warm, and encouraging. All meals should be realistic, affordable, and made from ingredients available across India.`;

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable and friendly Indian nutritionist. You provide practical, culturally appropriate dietary advice using traditional Indian foods. Your tone is warm, encouraging, and professional.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
        max_tokens: 2000,
        temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content;

    if (!result) {
      return NextResponse.json(
        { error: "No response received from AI. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Groq API error:", error);

    if (error instanceof Groq.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: "Invalid Groq API key. Please check your .env.local file." },
          { status: 401 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Rate limit reached. Please wait a moment and try again." },
          { status: 429 }
        );
      }
      if (error.status === 503) {
        return NextResponse.json(
          { error: "Groq service is temporarily unavailable. Please try again later." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
