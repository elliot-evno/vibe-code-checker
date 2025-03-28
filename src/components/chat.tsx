import React, { type FormEvent, useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

// Enhanced helper function with debugging
const ensureString = (input: unknown): string => {
  console.log('Input received:', input);
  if (input === null || input === undefined) return '';
  if (typeof input === 'string') return input;
  if (typeof input === 'object') {
    try {
      return JSON.stringify(input, null, 2);
    } catch (e) {
      console.error('Error stringifying object:', e);
      return '';
    }
  }
  return String(input);
};



export function APITester() {
  const [markdown, setMarkdown] = useState<string>("");

  const testEndpoint = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const prompt = formData.get("prompt") as string;
      
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const processedMarkdown = ensureString(data?.response || data);
      console.log('Processed markdown:', processedMarkdown);
      setMarkdown(processedMarkdown);
    } catch (error) {
      const errorMessage = ensureString(`**Error:** ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
      console.error('Error occurred:', errorMessage);
      setMarkdown(errorMessage);
    }
  };

  return (
    <div className="mt-8 mx-auto w-full max-w-2xl text-left flex flex-col gap-4 min-h-[calc(100vh-200px)]">
      <div className="flex-1 overflow-y-auto pb-24">
        <MarkdownRenderer content={markdown} />
      </div>
      <form
        onSubmit={testEndpoint}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1a1a1a] p-3 rounded-xl font-mono border-2 border-[#fbf0df] transition-colors duration-300 focus-within:border-[#f3d5a3] w-full max-w-2xl shadow-lg"
      >
        <input
          type="text"
          name="prompt"
          defaultValue="Explain how AI works"
          className="w-full flex-1 bg-transparent border-0 text-[#fbf0df] font-mono text-base py-1.5 px-2 outline-none focus:text-white placeholder-[#fbf0df]/40"
          placeholder="Enter your prompt..."
        />
        <button
          type="submit"
          className="bg-[#fbf0df] text-[#1a1a1a] border-0 px-5 py-1.5 rounded-lg font-bold transition-all duration-100 hover:bg-[#f3d5a3] hover:-translate-y-px cursor-pointer whitespace-nowrap"
        >
          Send
        </button>
      </form>
    </div>
  );
}
