import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "@/env/environment";
import { systemPrompt } from "./system-prompt";
import { PostHog } from 'posthog-node';

// Initialize PostHog
const posthog = new PostHog(env.POSTHOG_API_KEY as string, {
  host: env.POSTHOG_HOST
});

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: systemPrompt });

export async function POST(req: Request) {
  try {
    const { codebase } = await req.json();
    console.log(systemPrompt);
    
    const evaluationPrompt = `Evaluate the following codebase and return ONLY a JSON object with no additional text or markdown formatting:\n\n${codebase}\n\nYour response must be a valid JSON object matching the specified format with no additional text, comments, or markdown.`;
    
    
    // Start tracking the generation
    const startTime = Date.now();
    
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: evaluationPrompt }]
        }
      ]
    });

    const response = result.response.text();
    const endTime = Date.now();
    

    // Capture the generation event
    posthog.capture({
      distinctId: 'generation_endpoint',
      event: '$ai_generation',
      properties: {
        $ai_model: 'gemini-2.0-flash',
        $ai_provider: 'google',
        $ai_input: evaluationPrompt,
        $ai_output_choices: [response],
        $ai_latency: (endTime - startTime) / 1000,
        $ai_http_status: 200,
        $ai_base_url: 'https://generativelanguage.googleapis.com'
      }
    });

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