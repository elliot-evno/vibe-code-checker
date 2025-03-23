import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "../../env/environment";
import { systemPrompt } from "./system-prompt";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: systemPrompt });

export async function POST(req: Request) {
  try {
    const { codebase } = await req.json();
    
    const evaluationPrompt = `Evaluate the following codebase:\n\n${codebase}\n\nProvide your score and evaluation.`;
    
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: evaluationPrompt }]
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