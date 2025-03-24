"use client";
import { useRouter } from "next/navigation";
import { useEvaluation } from '../context/EvaluationContext';
import { 
  BarChart, 
  PieChart,
  LineChart,
  SparkLineChart 
} from '@mui/x-charts';

const StatCard = ({ value, label }: { value: string | number, label: string }) => {
  return (
    <div className="relative w-[200px] h-[180px] rounded-lg p-[1px] bg-[radial-gradient(circle_180px_at_0%_0%,#ffffff,#0c0d0d)]">
      {/* Animated dot */}
      <div className="absolute w-[5px] h-[5px] bg-white rounded-full shadow-[0_0_10px_#ffffff] z-20 
        animate-[moveDot_6s_linear_infinite]" />
      
      {/* Main card */}
      <div className="relative z-10 w-full h-full rounded-lg border border-[#202222] 
        bg-[radial-gradient(circle_200px_at_0%_0%,#444444,#0c0d0d)]
        flex flex-col items-center justify-center">
        
        {/* Light ray effect */}
        <div className="absolute w-[160px] h-[35px] rounded-full bg-[#c7c7c7] opacity-40 
          shadow-[0_0_50px_#fff] blur-[10px] origin-[10%] top-0 left-0 rotate-[40deg]" />
        
        {/* Grid lines */}
        <div className="absolute top-[10%] w-full h-[1px] bg-gradient-to-r from-[#888888] via-[#888888] to-[#1d1f1f]" />
        <div className="absolute bottom-[10%] w-full h-[1px] bg-[#2c2c2c]" />
        <div className="absolute left-[10%] w-[1px] h-full bg-gradient-to-b from-[#747474] via-[#747474] to-[#222424]" />
        <div className="absolute right-[10%] w-[1px] h-full bg-[#2c2c2c]" />
        
        {/* Content */}
        <span className="text-4xl font-bold bg-gradient-to-r from-[#ffffff80] via-white to-[#ffffff80] bg-clip-text text-transparent
          drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
          {value}
        </span>
        <span className="text-white/80 mt-2 text-sm">{label}</span>
      </div>
    </div>
  );
};

const keyframes = `
  @keyframes moveDot {
    0%, 100% { top: 10%; right: 10%; }
    25% { top: 10%; right: calc(100% - 35px); }
    50% { top: calc(100% - 30px); right: calc(100% - 35px); }
    75% { top: calc(100% - 30px); right: 10%; }
  }
`;

export default function Analysis() {
  const router = useRouter();
  const { evaluationData: evaluation } = useEvaluation();

  const handleBack = () => {
    router.back();
  };

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
      <style>{keyframes}</style>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-green-300 via-green-200 to-green-300 
          bg-clip-text text-transparent drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]
          animate-gradient bg-300% transition-all duration-300">
          Codebase Analysis Report
        </h1>
        <button 
          onClick={handleBack}
          className="h-10 px-6 rounded-lg flex items-center justify-center 
            bg-gradient-to-r from-blue-600 to-purple-600
            shadow-[4px_4px_6px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.3)] 
            transition-all hover:scale-105 hover:from-blue-500 hover:to-purple-500
            active:shadow-[0px_0px_0px_rgba(0,0,0,0.2),inset_0.5px_0.5px_2px_#000000]"
        >
          <span className="text-white text-sm font-medium transition-all active:scale-95">
            Back to Repository
          </span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 place-items-center">
            <StatCard 
              value={evaluation.scores.overallScore || 'N/A'} 
              label="Overall Score" 
            />
            <StatCard 
              value={`${evaluation.codeQualityMetrics.codeSmells}`} 
              label="Code Smells" 
            />
            <StatCard 
              value={`${evaluation.securityMetrics.securityHotspots}`} 
              label="Security Issues" 
            />
            <StatCard 
              value={`${evaluation.codeQualityMetrics.technicalDebtRatio}%`} 
              label="Bad Code" 
            />
          </div>
        </div>

        {/* Score Overview */}
        <div className="relative p-6 rounded-2xl
          bg-[#14141B]
          bg-[radial-gradient(at_88%_40%,hsla(240,15%,9%,1)_0px,transparent_85%),radial-gradient(at_49%_30%,hsla(240,15%,9%,1)_0px,transparent_85%)]
          shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.25)_inset]">
          <h3 className="text-xl font-semibold mb-6 text-white">Score Breakdown</h3>
          <BarChart
            xAxis={[{ 
              scaleType: 'band', 
              data: scoreData.map(item => item.name),
              tickLabelStyle: { fill: 'white' }
            }]}
            series={[{
              data: scoreData.map(item => item.value),
              color: '#9333EA'
            }]}
            height={300}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
            sx={{
              '& .MuiChartsAxis-line': { stroke: '#ffffff50' },
              '& .MuiChartsAxis-tick': { stroke: '#ffffff50' },
            }}
          />
        </div>

        {/* Code Quality Section */}
        <div className="relative p-6 rounded-2xl
          bg-[#14141B]
          bg-[radial-gradient(at_88%_40%,hsla(240,15%,9%,1)_0px,transparent_85%),radial-gradient(at_49%_30%,hsla(240,15%,9%,1)_0px,transparent_85%)]
          shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.25)_inset]">
          <h3 className="text-xl font-semibold mb-6 text-white">Code Quality Metrics</h3>
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
        <div className="relative p-6 rounded-2xl
          bg-[#14141B]
          bg-[radial-gradient(at_88%_40%,hsla(240,15%,9%,1)_0px,transparent_85%),radial-gradient(at_49%_30%,hsla(240,15%,9%,1)_0px,transparent_85%)]
          shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.25)_inset]">
          <h3 className="text-xl font-semibold mb-6 text-white">Security Analysis</h3>
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
        <div className="relative p-6 rounded-2xl
          bg-[#14141B]
          bg-[radial-gradient(at_88%_40%,hsla(240,15%,9%,1)_0px,transparent_85%),radial-gradient(at_49%_30%,hsla(240,15%,9%,1)_0px,transparent_85%)]
          shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.25)_inset]">
          <h3 className="text-xl font-semibold mb-6 text-white">Codebase Metrics</h3>
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
        <div className="relative p-6 rounded-2xl
          bg-[#14141B]
          bg-[radial-gradient(at_88%_40%,hsla(240,15%,9%,1)_0px,transparent_85%),radial-gradient(at_49%_30%,hsla(240,15%,9%,1)_0px,transparent_85%)]
          shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.25)_inset]">
          <h3 className="text-xl font-semibold mb-4 text-white">Improvement Tips</h3>
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