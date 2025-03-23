"use client";
import { useState } from "react";
import { 
  BarChart, 
  PieChart,
  LineChart,
  SparkLineChart 
} from '@mui/x-charts';

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
    // Prepare data for charts
    const scoreData = [
      { name: 'Code Quality', value: data.scores.codeQuality },
      { name: 'Type Usage', value: data.scores.typeUsage },
      { name: 'Error Handling', value: data.scores.errorHandling },
      { name: 'Code Structure', value: data.scores.codeStructure },
      { name: 'Documentation', value: data.scores.documentation },
      { name: 'Security', value: data.scores.security },
      { name: 'Performance', value: data.scores.performance },
    ];

    const vulnerabilityData = [
      data.securityMetrics.vulnerabilities.critical,
      data.securityMetrics.vulnerabilities.high,
      data.securityMetrics.vulnerabilities.medium,
      data.securityMetrics.vulnerabilities.low,
    ];

    return (
      <div className="space-y-8">
        {/* Overall Score Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
          <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
          <div className="text-4xl font-bold">
            {data.scores.overallScore?.toFixed(1) || 'N/A'}/100
          </div>
        </div>

        {/* Score Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Score Breakdown</h3>
          <BarChart
            xAxis={[{ 
              scaleType: 'band', 
              data: scoreData.map(item => item.name) 
            }]}
            series={[{
              data: scoreData.map(item => item.value),
              color: '#8884d8'
            }]}
            height={300}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
          />
        </div>

        {/* Code Quality Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Code Quality Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Maintainability</h4>
                <div className="text-3xl font-bold text-blue-600">
                  {data.codeQualityMetrics.maintainabilityIndex}/100
                </div>
                <div className="text-sm text-gray-500 mt-1">Maintainability Index</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Technical Debt</h4>
                <div className="text-3xl font-bold text-orange-500">
                  {data.codeQualityMetrics.technicalDebtRatio}%
                </div>
                <div className="text-sm text-gray-500 mt-1">Technical Debt Ratio</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Code Smells</h4>
                <div className="text-3xl font-bold text-red-500">
                  {data.codeQualityMetrics.codeSmells}
                </div>
                <div className="text-sm text-gray-500 mt-1">Total Code Smells</div>
              </div>
            </div>

            {/* Right column - Complexity Distribution */}
            <div>
              <h4 className="font-medium mb-4">Complexity Distribution</h4>
              <PieChart
                series={[{
                  data: [
                    { id: 0, value: data.codeQualityMetrics.complexityDistribution.low, label: 'Low' },
                    { id: 1, value: data.codeQualityMetrics.complexityDistribution.medium, label: 'Medium' },
                    { id: 2, value: data.codeQualityMetrics.complexityDistribution.high, label: 'High' },
                    { id: 3, value: data.codeQualityMetrics.complexityDistribution.veryHigh, label: 'Very High' },
                  ],
                  highlightScope: { faded: 'global', highlighted: 'item' },
                }]}
                height={200}
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Security Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Vulnerability Chart */}
            <div>
              <h4 className="font-medium mb-4">Vulnerabilities by Severity</h4>
              <BarChart
                xAxis={[{ 
                  scaleType: 'band', 
                  data: ['Critical', 'High', 'Medium', 'Low']
                }]}
                series={[{
                  data: vulnerabilityData,
                  color: ['#dc3545', '#ff4d4d', '#ffa500', '#4caf50'] as any
                }]}
                height={200}
              />
            </div>

            {/* Right column - Security Metrics */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Security Hotspots</h4>
                <div className="text-3xl font-bold text-yellow-500">
                  {data.securityMetrics.securityHotspots}
                </div>
                <div className="text-sm text-gray-500 mt-1">Areas Needing Review</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Authentication Coverage</h4>
                <div className="text-3xl font-bold text-green-600">
                  {data.securityMetrics.authenticationCoverage}%
                </div>
                <div className="text-sm text-gray-500 mt-1">Auth Coverage</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Secure Code Practices</h4>
                <SparkLineChart
                  data={[data.securityMetrics.secureCodePractices]}
                  height={60}
                  showTooltip
                  showHighlight
                />
                <div className="text-sm text-gray-500 mt-1">Score: {data.securityMetrics.secureCodePractices}/100</div>
              </div>
            </div>
          </div>
        </div>

        {/* Codebase Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Codebase Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{data.metrics.totalFiles}</div>
              <div className="text-sm text-gray-500">Total Files</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{data.metrics.totalLines}</div>
              <div className="text-sm text-gray-500">Lines of Code</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{data.metrics.commentRatio}%</div>
              <div className="text-sm text-gray-500">Comment Ratio</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{data.metrics.duplication}%</div>
              <div className="text-sm text-gray-500">Code Duplication</div>
            </div>
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Improvement Tips</h3>
          <ul className="space-y-2">
            {data.improvementTips.map((tip: string, index: number) => (
              <li key={index} className="flex items-start p-2 bg-blue-50 rounded">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
                  {index + 1}
                </span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
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
