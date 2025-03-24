"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useEvaluation } from '../context/EvaluationContext';

import Files from "./Files";

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
    <div className="container max-w-2xl mx-auto p-4 relative z-10">
      <h1 className="text-2xl font-bold mb-4 text-center text-white">GitHub Repository Browser</h1>
      <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 mb-4">
        <div className="flex flex-col gap-8 mb-6">
          <div className="flex flex-col gap-7 relative text-white">
            <input
              className="peer w-[500px] h-[45px] border-none outline-none px-[7px] rounded-md text-white text-[15px] 
              bg-black/30 backdrop-blur-sm
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
              className="peer w-[500px] h-[45px] border-none outline-none px-[7px] rounded-md text-white text-[15px] 
              bg-black/30 backdrop-blur-sm
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
            className="h-10 px-6 rounded-lg flex items-center justify-center bg-[#c7c3c0]
            shadow-[4px_4px_6px_rgba(0,0,0,0.2),inset_1px_1px_1px_#ffffff,inset_-2px_-2px_4px_#c7c3c0] 
            transition-all hover:scale-105 
            active:shadow-[0px_0px_0px_rgba(0,0,0,0.2),inset_0.5px_0.5px_2px_#000000,inset_-2px_-2px_4px_#c7c3c0] 
            disabled:opacity-50 disabled:hover:scale-100"
            type="submit"
            disabled={isLoading}
          style={{ cursor: 'pointer' }}
          >
            <span className="text-[#5f5f5f] text-sm font-medium transition-all active:scale-95">
              {isLoading ? 'Loading...' : 'Browse Repository'}
            </span>
          </button>
        </div>
      </form>
      <Files 
        files={files}
        error={error}
        currentPath={currentPath}
        isAnalyzing={isAnalyzing}
        onNavigate={handleNavigate}
        onEvaluateCodebase={handleEvaluateCodebase}
      />
    </div>
  );
}

export default Repos;
