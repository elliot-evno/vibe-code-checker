"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export function Repos() {
  const [username, setUsername] = useState("");
  const [repoName, setRepoName] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [evaluation, setEvaluation] = useState("");

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
        // Clean up the response string by removing markdown code block markers
        let cleanResponse = result.response;
        if (typeof cleanResponse === 'string') {
          // Remove markdown code block markers and any language identifier
          cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const evaluationData = JSON.parse(cleanResponse);
          
          console.log('Parsed evaluation data:', evaluationData);

          if (!evaluationData.scores || !evaluationData.metrics) {
            throw new Error('Invalid evaluation data format');
          }

          setEvaluation(evaluationData);
        } else {
          setEvaluation(result.response);
        }
      } catch (err) {
        console.error('JSON parsing error:', err);
        setEvaluation(`Error parsing evaluation data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      setEvaluation(`Error: ${err instanceof Error ? err.message : 'Failed to evaluate codebase'}`);
    }
  };

  const renderEvaluation = (data: any) => {
    console.log('Rendering evaluation with data:', data); // Debug log

    // Ensure we have the required data
    if (!data.scores || !data.metrics) {
      return <div>Invalid evaluation data format</div>;
    }

    const scoreData = Object.entries(data.scores)
      .filter(([key]) => key !== 'overallScore')
      .map(([key, value]) => ({
        name: key.replace(/([A-Z])/g, ' $1').trim(),
        value: Number(value)  // Ensure the value is a number
      }));

    console.log('Score data for radar chart:', scoreData); // Debug log

    const metricData = [
      { name: 'Files', value: Number(data.metrics.totalFiles) },
      { name: 'Lines', value: Number(data.metrics.totalLines) },
      { name: 'Comment Ratio', value: Number(data.metrics.commentRatio) },
      { name: 'Complexity', value: Number(data.metrics.complexity) },
      { name: 'Duplication', value: Number(data.metrics.duplication) }
    ];

    console.log('Metric data for bar chart:', metricData); // Debug log

    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white mb-6">
          <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
          <div className="text-4xl font-bold">
            {data.scores.overallScore?.toFixed(1) || 'N/A'}/100
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Code Quality Scores</h3>
          <div className="flex justify-center" style={{ minHeight: '300px' }}>
            <RadarChart width={500} height={300} data={scoreData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar 
                name="Score" 
                dataKey="value" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.6} 
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Codebase Metrics</h3>
          <div className="flex justify-center" style={{ minHeight: '300px' }}>
            <BarChart width={500} height={300} data={metricData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Raw Data (Debug)</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">GitHub Repository Browser</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            GitHub Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="GitHub Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="repoName">
            Repository Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Repository Name"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            required
          />
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
              >
                Evaluate Codebase
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

      {evaluation && (
        <div className="text-black bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-4">
          {typeof evaluation === 'string' ? (
            <div className="text-black">
              <pre>{evaluation}</pre>
            </div>
          ) : (
            renderEvaluation(evaluation)
          )}
        </div>
      )}
    </div>
  );
}

export default Repos;
