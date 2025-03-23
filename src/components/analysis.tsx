"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  BarChart, 
  PieChart,
  LineChart,
  SparkLineChart 
} from '@mui/x-charts';

export default function Analysis() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the evaluation data from URL parameters
        const encodedData = searchParams.get("data");
        
        if (!encodedData) {
          setError("No analysis data found");
          setLoading(false);
          return;
        }
        
        // Decode and parse the data
        const decodedData = JSON.parse(decodeURIComponent(encodedData));
        setEvaluation(decodedData);
      } catch (err) {
        console.error("Error parsing evaluation data:", err);
        setError("Failed to load analysis data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={handleBack}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Repository
          </button>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">No Data Available</h2>
          <p>There is no analysis data to display.</p>
          <button 
            onClick={handleBack}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Repository
          </button>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const scoreData = [
    { name: 'Code Quality', value: evaluation.scores.codeQuality },
    { name: 'Type Usage', value: evaluation.scores.typeUsage },
    { name: 'Error Handling', value: evaluation.scores.errorHandling },
    { name: 'Code Structure', value: evaluation.scores.codeStructure },
    { name: 'Documentation', value: evaluation.scores.documentation },
    { name: 'Security', value: evaluation.scores.security },
    { name: 'Performance', value: evaluation.scores.performance },
  ];

  const vulnerabilityData = [
    evaluation.securityMetrics.vulnerabilities.critical,
    evaluation.securityMetrics.vulnerabilities.high,
    evaluation.securityMetrics.vulnerabilities.medium,
    evaluation.securityMetrics.vulnerabilities.low,
  ];

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Codebase Analysis Report</h1>
        <button 
          onClick={handleBack}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Repository
        </button>
      </div>

      <div className="space-y-8">
        {/* Overall Score Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
          <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
          <div className="text-4xl font-bold">
            {evaluation.scores.overallScore?.toFixed(1) || 'N/A'}/100
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
                  {evaluation.codeQualityMetrics.maintainabilityIndex}/100
                </div>
                <div className="text-sm text-gray-500 mt-1">Maintainability Index</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Technical Debt</h4>
                <div className="text-3xl font-bold text-orange-500">
                  {evaluation.codeQualityMetrics.technicalDebtRatio}%
                </div>
                <div className="text-sm text-gray-500 mt-1">Technical Debt Ratio</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Code Smells</h4>
                <div className="text-3xl font-bold text-red-500">
                  {evaluation.codeQualityMetrics.codeSmells}
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
                    { id: 0, value: evaluation.codeQualityMetrics.complexityDistribution.low, label: 'Low' },
                    { id: 1, value: evaluation.codeQualityMetrics.complexityDistribution.medium, label: 'Medium' },
                    { id: 2, value: evaluation.codeQualityMetrics.complexityDistribution.high, label: 'High' },
                    { id: 3, value: evaluation.codeQualityMetrics.complexityDistribution.veryHigh, label: 'Very High' },
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
                  {evaluation.securityMetrics.securityHotspots}
                </div>
                <div className="text-sm text-gray-500 mt-1">Areas Needing Review</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Authentication Coverage</h4>
                <div className="text-3xl font-bold text-green-600">
                  {evaluation.securityMetrics.authenticationCoverage}%
                </div>
                <div className="text-sm text-gray-500 mt-1">Auth Coverage</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Secure Code Practices</h4>
                <SparkLineChart
                  data={[evaluation.securityMetrics.secureCodePractices]}
                  height={60}
                  showTooltip
                  showHighlight
                />
                <div className="text-sm text-gray-500 mt-1">Score: {evaluation.securityMetrics.secureCodePractices}/100</div>
              </div>
            </div>
          </div>
        </div>

        {/* Codebase Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Codebase Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{evaluation.metrics.totalFiles}</div>
              <div className="text-sm text-gray-500">Total Files</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{evaluation.metrics.totalLines}</div>
              <div className="text-sm text-gray-500">Lines of Code</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{evaluation.metrics.commentRatio}%</div>
              <div className="text-sm text-gray-500">Comment Ratio</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{evaluation.metrics.duplication}%</div>
              <div className="text-sm text-gray-500">Code Duplication</div>
            </div>
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Improvement Tips</h3>
          <ul className="space-y-2">
            {evaluation.improvementTips.map((tip: string, index: number) => (
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
    </div>
  );
} 