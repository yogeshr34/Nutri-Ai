import { NextResponse } from "next/server";

// Enforced JSON schema — this is the "structured output" upgrade.
// Gemini is constrained to return exactly this shape, so the frontend
// never has to parse or guess at free-form text.
const NUTRITION_SCHEMA = {
  type: "OBJECT",
  properties: {
    food_name: { type: "STRING" },
    portion_estimate: { type: "STRING" },
    calories: { type: "NUMBER" },
    protein_g: { type: "NUMBER" },
    carbs_g: { type: "NUMBER" },
    fat_g: { type: "NUMBER" },
    fiber_g: { type: "NUMBER" },
    health_score: { type: "NUMBER", description: "1-10 healthiness score" },
    recommendations: { type: "STRING" },
    warning_flags: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "e.g. high sugar, high sodium, allergen risk",
    },
  },
  required: [
    "food_name",
    "calories",
    "protein_g",
    "carbs_g",
    "fat_g",
    "health_score",
    "recommendations",
  ],
};

const SYSTEM_PROMPT = `You are a certified nutrition analyst. Given a food image and/or
description, identify the food and estimate its nutrition profile as accurately as
possible. If a portion size isn't obvious, assume a standard single serving and say so
in portion_estimate. Always populate every field in the schema.`;

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfigured: missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { imageBase64, mimeType, textDescription, goals } = body;

    if (!imageBase64 && !textDescription) {
      return NextResponse.json(
        { error: "Provide an image or a text description." },
        { status: 400 }
      );
    }

    const parts = [{ text: SYSTEM_PROMPT }];

    if (goals) {
      parts.push({
        text: `User's daily targets for context in recommendations: ${goals}`,
      });
    }

    if (textDescription) {
      parts.push({ text: `Meal description: ${textDescription}` });
    }

    if (imageBase64) {
      parts.push({
        inline_data: {
          mime_type: mimeType || "image/jpeg",
          data: imageBase64,
        },
      });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: NUTRITION_SCHEMA,
            temperature: 0.4,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json(
        { error: "Gemini API error", detail: errText },
        { status: geminiRes.status }
      );
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(
        { error: "No analysis returned from model." },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(rawText); // safe: schema-enforced, no markdown fences to strip
    return NextResponse.json({ result: parsed });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected server error", detail: String(err) },
      { status: 500 }
    );
  }
}
