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
    <div className="relative w-[280px] h-[220px] rounded-lg p-[1px] bg-[radial-gradient(circle_180px_at_0%_0%,#ffffff,#0c0d0d)] overflow-hidden">
      {/* Main card */}
      <div className="relative w-full h-full rounded-lg border border-[#202222] 
        bg-[radial-gradient(circle_200px_at_0%_0%,#444444,#0c0d0d)]
        flex flex-col items-center justify-center">
        
        {/* Grid lines */}
        <div className="absolute top-[10%] w-full h-[1px] bg-gradient-to-r from-[#888888] via-[#888888] to-[#1d1f1f] z-[2]" />
        <div className="absolute bottom-[10%] w-full h-[1px] bg-[#2c2c2c] z-[2]" />
        <div className="absolute left-[10%] w-[1px] h-full bg-gradient-to-b from-[#747474] via-[#747474] to-[#222424] z-[2]" />
        <div className="absolute right-[10%] w-[1px] h-full bg-[#2c2c2c] z-[2]" />
        
        {/* Content */}
        <span className="relative z-[3] text-5xl font-bold bg-gradient-to-r from-[#ffffff80] via-white to-[#ffffff80] bg-clip-text text-transparent
          drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
          {value}
        </span>
        <span className="relative z-[3] text-white/80 mt-3 text-lg">{label}</span>
      </div>

      {/* Animated dot */}
      <div className="absolute w-[5px] h-[5px] bg-white rounded-full shadow-[0_0_10px_#ffffff] z-[4]
        animate-[moveDot_6s_linear_infinite]" />
    </div>
  );
};

const keyframes = `
  @keyframes moveDot {
    0%, 100% { top: 10%; right: 10%; }
    25% { top: 10%; right: 88%; }
    50% { top: 88%; right: 88%; }
    75% { top: 88%; right: 10%; }
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
          ✨ Codebase Vibe Check ✨
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
            👈 Back to Repo
          </span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
            <StatCard 
              value={`${(evaluation.scores.overallScore )}/10`} 
              label="✨ Overall Score ✨" 
            />
            <StatCard 
              value={`${(evaluation.scores.codeQuality )}/10`} 
              label="Code Quality 🎨" 
            />
            <StatCard 
              value={`${(evaluation.scores.security )}/10`} 
              label="Security 🛡️" 
            />
          </div>
        </div>

        {/* Score Overview */}
        <div className="relative p-6 rounded-2xl
          bg-[#14141B]
          bg-[radial-gradient(at_88%_40%,hsla(240,15%,9%,1)_0px,transparent_85%),radial-gradient(at_49%_30%,hsla(240,15%,9%,1)_0px,transparent_85%)]
          shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.25)_inset]">
          <h3 className="text-xl font-semibold mb-6 text-white">
            <span className="mr-2">📊</span> 
            Score Breakdown
            <span className="text-sm font-normal text-gray-400 ml-2">Hover over bars for details!</span>
          </h3>
          <BarChart
            xAxis={[{ 
              scaleType: 'band', 
              data: scoreData.map(item => item.name),
              tickLabelStyle: {
                fill: '#94a3b8',
                fontSize: 12,
                fontWeight: 500
              }
            }]}
            series={[{
              data: scoreData.map(item => item.value),
              color: '#8b5cf6',
              valueFormatter: (value: number | null) => 
                value !== null ? `${(value)}/10` : 'N/A'
            }]}
            height={300}
            margin={{ top: 20, bottom: 40, left: 40, right: 20 }}
            sx={{
              '& .MuiChartsAxis-line': { stroke: '#334155' },
              '& .MuiChartsAxis-tick': { stroke: '#334155' },
              '& .MuiBarElement-root': {
                fill: 'url(#gradient)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  filter: 'brightness(1.2)',
                  cursor: 'pointer',
                  transform: 'translateY(-2px)'
                }
              },
              '& .MuiChartsAxis-tickLabel': {
                transform: 'rotate(-45deg) translateX(-20px)',
              }
            }}
            slotProps={{
              legend: {
                hidden: true
              }
            }}
          >
            <defs>
              <linearGradient id="gradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#4338ca" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </BarChart>
        </div>

        {/* Code Quality Section */}
        <div className="relative p-6 rounded-2xl
          bg-[#14141B]
          bg-[radial-gradient(at_88%_40%,hsla(240,15%,9%,1)_0px,transparent_85%),radial-gradient(at_49%_30%,hsla(240,15%,9%,1)_0px,transparent_85%)]
          shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.25)_inset]">
          <h3 className="text-xl font-semibold mb-6 text-white">🎯 Code Quality Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">🔧 Maintainability</h4>
                <div className="text-3xl font-bold text-blue-600">
                  {evaluation.codeQualityMetrics.maintainabilityIndex}/100
                </div>
                <div className="text-sm text-gray-500 mt-1">Maintainability Index</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">⚖️ Technical Debt</h4>
                <div className="text-3xl font-bold text-orange-500">
                  {evaluation.codeQualityMetrics.technicalDebtRatio}%
                </div>
                <div className="text-sm text-gray-500 mt-1">Technical Debt Ratio</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">🦨 Code Smells</h4>
                <div className="text-3xl font-bold text-red-500">
                  {evaluation.codeQualityMetrics.codeSmells}
                </div>
                <div className="text-sm text-gray-500 mt-1">Total Code Smells</div>
              </div>
            </div>

            {/* Right column - Complexity Distribution */}
            <div>
              <h4 className="font-medium mb-4">🧩 Complexity Distribution</h4>
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
          <h3 className="text-xl font-semibold mb-6 text-white">🔒 Security Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Vulnerability Chart */}
            <div>
              <h4 className="font-medium mb-4">⚠️ Vulnerabilities by Severity</h4>
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
                <h4 className="font-medium mb-2">🎯 Security Hotspots</h4>
                <div className="text-3xl font-bold text-yellow-500">
                  {evaluation.securityMetrics.securityHotspots}
                </div>
                <div className="text-sm text-gray-500 mt-1">Areas Needing Review</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">🔑 Authentication Coverage</h4>
                <div className="text-3xl font-bold text-green-600">
                  {evaluation.securityMetrics.authenticationCoverage}%
                </div>
                <div className="text-sm text-gray-500 mt-1">Auth Coverage</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">🛡️ Secure Code Practices</h4>
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
          <h3 className="text-xl font-semibold mb-6 text-white">📁 Codebase Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{evaluation.metrics.totalFiles}</div>
              <div className="text-sm text-gray-500">📄 Total Files</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{evaluation.metrics.totalLines}</div>
              <div className="text-sm text-gray-500">📝 Lines of Code</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{evaluation.metrics.commentRatio}%</div>
              <div className="text-sm text-gray-500">💭 Comment Ratio</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{evaluation.metrics.duplication}%</div>
              <div className="text-sm text-gray-500">🔄 Code Duplication</div>
            </div>
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="relative p-6 rounded-2xl
          bg-[#14141B]
          bg-[radial-gradient(at_88%_40%,hsla(240,15%,9%,1)_0px,transparent_85%),radial-gradient(at_49%_30%,hsla(240,15%,9%,1)_0px,transparent_85%)]
          shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.25)_inset]">
          <h3 className="text-xl font-semibold mb-4 text-white">💡 Pro Tips</h3>
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