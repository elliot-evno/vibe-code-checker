"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useEvaluation } from '../context/EvaluationContext';

export function Repos() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [repoName, setRepoName] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { setEvaluationData } = useEvaluation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: username,
          repo: repoName,
          path: currentPath
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repository contents');
      }

      const contents = await response.json();
      setFiles(contents);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch repository");
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    if (path === "..") {
      const newPath = currentPath.split('/').slice(0, -1).join('/');
      setCurrentPath(newPath);
    } else {
      setCurrentPath(path);
    }
  };

  const handleEvaluateCodebase = async (files: any[]) => {
    setIsAnalyzing(true);
    try {
      // Filter out directories and files without content
      const codeFiles = files.filter(file => 
        file.type === 'file' && file.content
      );

      // Create a structured format for evaluation
      const codebaseContent = codeFiles.map(file => {
        // Decode base64 content if needed
        const content = file.content.startsWith('base64:') 
          ? Buffer.from(file.content.slice(7), 'base64').toString('utf-8')
          : file.content;

        return `### File: ${file.path}\n` +
               `#### Metadata:\n` +
               `- Size: ${file.size} bytes\n` +
               `\n` +
               `#### Content:\n` +
               '```\n' +
               content +
               '\n```\n';
      }).join('\n\n');

      const response = await fetch('/api/generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codebase: codebaseContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate codebase');
      }

      const result = await response.json();
      console.log('Raw API response:', result);

      try {
        let cleanResponse = result.response;
        if (typeof cleanResponse === 'string') {
          cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const evaluationData = JSON.parse(cleanResponse);
          
          console.log('Parsed evaluation data:', evaluationData);

          if (!evaluationData.scores || !evaluationData.metrics) {
            throw new Error('Invalid evaluation data format');
          }

          // Instead of URL params, use context
          setEvaluationData(evaluationData);
          router.push('/analysis');
        } else {
          setEvaluationData(result.response);
          router.push('/analysis');
        }
      } catch (err) {
        console.error('JSON parsing error:', err);
        setError(`Error parsing evaluation data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Failed to evaluate codebase'}`);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">GitHub Repository Browser</h1>
      <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 mb-4">
        <div className="flex flex-col gap-8 mb-6">
          <div className="flex flex-col gap-7 relative text-white">
            <input
              className="peer w-[500px] h-[45px] border-none outline-none px-[7px] rounded-md text-white text-[15px] bg-transparent 
              shadow-[3px_3px_10px_rgba(0,0,0,1),-1px_-1px_6px_rgba(255,255,255,0.4)]
              focus:border-2 focus:border-transparent
              focus:shadow-[3px_3px_10px_rgba(0,0,0,1),-1px_-1px_6px_rgba(255,255,255,0.4),inset_3px_3px_10px_rgba(0,0,0,1),inset_-1px_-1px_6px_rgba(255,255,255,0.4)]
              valid:shadow-[3px_3px_10px_rgba(0,0,0,1),-1px_-1px_6px_rgba(255,255,255,0.4),inset_3px_3px_10px_rgba(0,0,0,1),inset_-1px_-1px_6px_rgba(255,255,255,0.4)]"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label className="text-[15px] pl-[10px] absolute top-[13px] transition-all duration-300 pointer-events-none
              peer-focus:-translate-y-[35px] peer-focus:pl-[2px]
              peer-valid:-translate-y-[35px] peer-valid:pl-[2px]">
              Username
            </label>
          </div>

          <div className="flex flex-col gap-7 relative text-white">
            <input
              className="peer w-[500px] h-[45px] border-none outline-none px-[7px] rounded-md text-white text-[15px] bg-transparent 
              shadow-[3px_3px_10px_rgba(0,0,0,1),-1px_-1px_6px_rgba(255,255,255,0.4)]
              focus:border-2 focus:border-transparent
              focus:shadow-[3px_3px_10px_rgba(0,0,0,1),-1px_-1px_6px_rgba(255,255,255,0.4),inset_3px_3px_10px_rgba(0,0,0,1),inset_-1px_-1px_6px_rgba(255,255,255,0.4)]
              valid:shadow-[3px_3px_10px_rgba(0,0,0,1),-1px_-1px_6px_rgba(255,255,255,0.4),inset_3px_3px_10px_rgba(0,0,0,1),inset_-1px_-1px_6px_rgba(255,255,255,0.4)]"
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              required
            />
            <label className="text-[15px] pl-[10px] absolute top-[13px] transition-all duration-300 pointer-events-none
              peer-focus:-translate-y-[35px] peer-focus:pl-[2px]
              peer-valid:-translate-y-[35px] peer-valid:pl-[2px]">
              Repo Name
            </label>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Browse Repository'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black">Files</h2>
            <div>
              {currentPath && (
                <button
                  className="text-blue-500 hover:text-blue-700 font-bold py-2 px-4 rounded mr-2"
                  onClick={() => handleNavigate("..")}
                >
                  Back
                </button>
              )}
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => handleEvaluateCodebase(files)}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Codebase'}
              </button>
            </div>
          </div>
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.path}
                className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => file.type === "dir" && handleNavigate(file.path)}
              >
                <span className="mr-2">
                  {file.type === "dir" ? "📁" : "📄"}
                </span>
                <span className={file.type === "dir" ? "font-bold text-black" : "text-black"}>
                  {file.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Repos;
