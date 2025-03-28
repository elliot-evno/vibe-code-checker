"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useEvaluation } from '../context/EvaluationContext';
import { usePostHog } from '../components/PostHogProvider';

import Files from "./Files";

interface GitHubFile {
  path: string;
  name: string;
  type: "dir" | "file";
  size?: number;
  content?: string;
}

export function Repos() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [repoName, setRepoName] = useState("");
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { setEvaluationData } = useEvaluation();
  const { posthog } = usePostHog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Track repository search attempt
    posthog?.capture('repository_search', {
      username,
      repo_name: repoName,
      path: currentPath
    });

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

      // Track successful repository fetch
      posthog?.capture('repository_fetch_success', {
        username,
        repo_name: repoName,
        path: currentPath,
        files_count: contents.length
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch repository");
      setFiles([]);

      // Track repository fetch error
      posthog?.capture('repository_fetch_error', {
        username,
        repo_name: repoName,
        path: currentPath,
        error_message: err instanceof Error ? err.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    // Track navigation within repository
    posthog?.capture('repository_navigate', {
      from_path: currentPath,
      to_path: path,
      username,
      repo_name: repoName
    });

    if (path === "..") {
      const newPath = currentPath.split('/').slice(0, -1).join('/');
      setCurrentPath(newPath);
    } else {
      setCurrentPath(path);
    }
  };

  const handleEvaluateCodebase = async (files: GitHubFile[]) => {
    setIsAnalyzing(true);

    // Track codebase evaluation start
    posthog?.capture('codebase_evaluation_start', {
      username,
      repo_name: repoName,
      files_count: files.length,
      total_size: files.reduce((acc, file) => acc + (file.size || 0), 0)
    });

    try {
      // Filter out directories and files without content
      const codeFiles = files.filter(file => 
        file.type === 'file' && file.content
      );

      // Create a structured format for evaluation
      const codebaseContent = codeFiles.map(file => {
        // Since we filtered above, we can safely assert that content exists
        const content = file.content!.startsWith('base64:') 
          ? Buffer.from(file.content!.slice(7), 'base64').toString('utf-8')
          : file.content!;

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

        // Track successful evaluation
        posthog?.capture('codebase_evaluation_success', {
          username,
          repo_name: repoName,
          files_analyzed: files.length
        });
      } catch (err) {
        console.error('JSON parsing error:', err);
        setError(`Error parsing evaluation data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsAnalyzing(false);

        // Track evaluation error
        posthog?.capture('codebase_evaluation_error', {
          username,
          repo_name: repoName,
          error_message: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Failed to evaluate codebase'}`);
      
      // Track evaluation error
      posthog?.capture('codebase_evaluation_error', {
        username,
        repo_name: repoName,
        error_message: err instanceof Error ? err.message : 'Unknown error'
      });
      
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 relative z-10">
      <div className="mx-auto sm:mx-8 p-4 sm:p-8 rounded-lg">
        <h1 className="text-4xl sm:text-6xl font-bold mb-8 sm:mb-14 text-center 
          text-white">
          Vibe Code Checker
        </h1>
        <form onSubmit={handleSubmit} className="pb-4 sm:pb-8 mb-4 flex flex-col items-center">
          <div className="flex flex-col gap-6 sm:gap-8 mb-6 w-full max-w-[550px]">
            <div className="flex flex-col gap-7 relative text-white w-full">
              <input
                className="peer w-full h-[55px] border-none outline-none px-[12px] rounded-xl text-[16px] 
                bg-gradient-to-b from-white/90 to-white/70
                text-transparent bg-clip-text font-medium
                shadow-[0px_5px_15px_rgba(0,0,0,0.15),inset_2px_2px_4px_rgba(255,255,255,0.9)]
                focus:shadow-[0px_5px_20px_rgba(59,130,246,0.3),inset_2px_2px_4px_rgba(255,255,255,0.9)]
                valid:shadow-[0px_5px_20px_rgba(59,130,246,0.3),inset_2px_2px_4px_rgba(255,255,255,0.9)]
                transition-all duration-300 ease-in-out"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label className="text-[17px] pl-[12px] absolute top-[16px] transition-all duration-300 pointer-events-none
                peer-focus:-translate-y-[38px] peer-focus:pl-[2px] peer-focus:text-[#3168C5]
                peer-valid:-translate-y-[38px] peer-valid:pl-[2px] peer-valid:text-[#3168C5]">
                Username
              </label>
            </div>

            <div className="flex flex-col gap-7 relative text-white w-full">
              <input
                className="peer w-full h-[55px] border-none outline-none px-[12px] rounded-xl text-[16px] 
                bg-gradient-to-b from-white/90 to-white/70
                text-transparent bg-clip-text font-medium
                shadow-[0px_5px_15px_rgba(0,0,0,0.15),inset_2px_2px_4px_rgba(255,255,255,0.9)]
                focus:shadow-[0px_5px_20px_rgba(59,130,246,0.3),inset_2px_2px_4px_rgba(255,255,255,0.9)]
                valid:shadow-[0px_5px_20px_rgba(59,130,246,0.3),inset_2px_2px_4px_rgba(255,255,255,0.9)]
                transition-all duration-300 ease-in-out"
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                required
              />
              <label className="text-[17px] pl-[12px] absolute top-[16px] transition-all duration-300 pointer-events-none
                peer-focus:-translate-y-[38px] peer-focus:pl-[2px] peer-focus:text-[#3168C5]
                peer-valid:-translate-y-[38px] peer-valid:pl-[2px] peer-valid:text-[#3168C5]">
                Repo Name
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-center w-full">
            <button
              className="h-12 sm:h-16 px-6 sm:px-10 rounded-xl flex items-center justify-center 
              bg-gradient-to-b from-[#95C5F8] via-[#6AA9ED] to-[#3B82F6]
              shadow-[0px_10px_20px_rgba(0,0,0,0.15),inset_2px_2px_4px_rgba(255,255,255,0.5)] 
              transition-all hover:scale-105 
              active:shadow-[0px_5px_10px_rgba(0,0,0,0.1),inset_1px_1px_3px_rgba(0,0,0,0.2)] 
              disabled:opacity-50 disabled:hover:scale-100"
              type="submit"
              disabled={isLoading}
              style={{ cursor: 'pointer' }}
            >
              <span className="text-white text-base sm:text-lg font-semibold transition-all active:scale-95 tracking-wide">
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
    </div>
  );
}

export default Repos;
