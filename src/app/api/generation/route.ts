import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "@/env/environment";
import { systemPrompt } from "./system-prompt";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: systemPrompt });

export async function POST(req: Request) {
  try {
    const { codebase } = await req.json();
    
    console.log('Received codebase for evaluation:', codebase.slice(0, 100) + '...');
    
    const evaluationPrompt = `Evaluate the following codebase and return ONLY a JSON object with no additional text or markdown formatting:\n\n${codebase}\n\nYour response must be a valid JSON object matching the specified format with no additional text, comments, or markdown.`;
    
    console.log('Attempting to generate content with Gemini...');
    
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: evaluationPrompt }]
        }
      ]
    });

    const response = result.response.text();
    console.log('Raw response:', response);

    // Try to extract JSON from the response
    let cleanResponse = response;
    
    // Remove any markdown code blocks if present
    cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find JSON object in the response
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON object found in response');
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    // Validate that it's parseable JSON
    try {
      const parsedJson = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed JSON response');
      return NextResponse.json({ response: parsedJson });
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Generation failed with error:', error);
    
    // More detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    };
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json(
      { error: errorDetails },
      { status: 500 }
    );
  }
} 