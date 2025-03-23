import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "../../../env/environment";
import { systemPrompt } from "./system-prompt";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: systemPrompt });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    return NextResponse.json({ response: result.response.text() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 