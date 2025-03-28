"use client";
import { useRouter } from "next/navigation";
import { useEvaluation } from '../context/EvaluationContext';
import { 
  BarChart, 
  PieChart,
  SparkLineChart 
} from '@mui/x-charts';

const StatCard = ({ value, label }: { value: string | number, label: string }) => {
  return (
    <div className="relative w-[280px] h-[220px] rounded-xl p-[1px] overflow-hidden
                    bg-transparent backdrop-blur-md border-2 border-white/30 shadow-lg">
      {/* Main card */}
      <div className="relative w-full h-full rounded-xl 
        bg-white/80 backdrop-blur-sm
        flex flex-col items-center justify-center">
        
        {/* Grid lines */}
        <div className="absolute top-[10%] w-full h-[1px] bg-white/30" />
        <div className="absolute bottom-[10%] w-full h-[1px] bg-white/30" />
        <div className="absolute left-[10%] w-[1px] h-full bg-white/30" />
        <div className="absolute right-[10%] w-[1px] h-full bg-white/30" />
        
        {/* Content */}
        <span className="relative z-[3] text-5xl font-bold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
          {value}
        </span>
        <span className="relative z-[3] text-black mt-3 text-lg font-medium drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
          {label}
        </span>
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
  
  @keyframes rotate {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
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
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" 
         style={{ 
           backgroundImage: "url('/images/ghibli-cloud.png')",
           backgroundColor: '#EEEFE9' 
         }}>
      <div className="container max-w-6xl mx-auto p-6">
        <style>{keyframes}</style>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center text-white">
            ✨ Codebase Vibe Check ✨
          </h1>
          <button 
            onClick={handleBack}
            className="h-10 px-6 rounded-lg flex items-center justify-center 
              bg-gradient-to-r from-white/70 to-white/50
              shadow-[4px_4px_6px_rgba(0,0,0,0.1),inset_1px_1px_1px_rgba(255,255,255,0.7)] 
              transition-all hover:scale-105 hover:from-white/80 hover:to-white/60
              active:shadow-[0px_0px_0px_rgba(0,0,0,0.1),inset_0.5px_0.5px_2px_rgba(0,0,0,0.3)]"
          >
            <span className="text-[#3168C5] text-sm font-medium transition-all active:scale-95">
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

          {/* Score Overview - Blue gradient style */}
          <div className="relative p-6 rounded-2xl
            bg-gradient-to-b from-[#95C5F8] via-[#6AA9ED] to-[#3B82F6]
            shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.4)_inset]">
            
            {/* Glass effect overlay */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              w-[calc(100%+2px)] h-[calc(100%+2px)] overflow-hidden rounded-2xl
              bg-gradient-to-b from-white/40 to-white/10 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-[200%] h-40
                bg-gradient-to-b from-white/50 via-white/20 to-transparent
                animate-[rotate_8s_linear_infinite]">
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-6 text-white">
              <span className="mr-2">📊</span> 
              Score Breakdown
              <span className="text-sm font-normal text-white/80 ml-2">Hover over bars for details!</span>
            </h3>
            <BarChart
              xAxis={[{ 
                scaleType: 'band', 
                data: scoreData.map(item => item.name),
                tickLabelStyle: {
                  fill: 'white',
                  fontSize: 12,
                  fontWeight: 500
                }
              }]}
              series={[{
                data: scoreData.map(item => item.value),
                color: 'white',
                valueFormatter: (value: number | null) => 
                  value !== null ? `${(value)}/10` : 'N/A'
              }]}
              height={300}
              margin={{ top: 20, bottom: 40, left: 40, right: 20 }}
              sx={{
                '& .MuiChartsAxis-line': { stroke: 'white' },
                '& .MuiChartsAxis-tick': { stroke: 'white' },
                '& .MuiBarElement-root': {
                  fill: 'url(#gradient-bar)',
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
                <linearGradient id="gradient-bar" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="white" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.7)" />
                </linearGradient>
              </defs>
            </BarChart>
          </div>

          {/* Code Quality Section - Pastel sunset style */}
          <div className="relative p-6 rounded-2xl
            bg-gradient-to-br from-[#f9c58d] via-[#f29e7c] to-[#e77c8d]
            shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.3)_inset]">
            
            <h3 className="text-xl font-semibold mb-6 text-white">🎯 Code Quality Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-4">
                <div className="p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/30">
                  <h4 className="font-medium mb-2 text-white">🔧 Maintainability</h4>
                  <div className="text-3xl font-bold text-white">
                    {evaluation.codeQualityMetrics.maintainabilityIndex}/100
                  </div>
                  <div className="text-sm text-white/80 mt-1">Maintainability Index</div>
                </div>

                <div className="p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/30">
                  <h4 className="font-medium mb-2 text-white">⚖️ Technical Debt</h4>
                  <div className="text-3xl font-bold text-white">
                    {evaluation.codeQualityMetrics.technicalDebtRatio}%
                  </div>
                  <div className="text-sm text-white/80 mt-1">Technical Debt Ratio</div>
                </div>

                <div className="p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/30">
                  <h4 className="font-medium mb-2 text-white">🦨 Code Smells</h4>
                  <div className="text-3xl font-bold text-white">
                    {evaluation.codeQualityMetrics.codeSmells}
                  </div>
                  <div className="text-sm text-white/80 mt-1">Total Code Smells</div>
                </div>
              </div>

              {/* Right column - Complexity Distribution */}
              <div>
                <h4 className="font-medium mb-4 text-white">🧩 Complexity Distribution</h4>
                <PieChart
                  series={[{
                    data: [
                      { id: 0, value: evaluation.codeQualityMetrics.complexityDistribution.low, label: 'Low', color: '#fdd692' },
                      { id: 1, value: evaluation.codeQualityMetrics.complexityDistribution.medium, label: 'Medium', color: '#f8a978' },
                      { id: 2, value: evaluation.codeQualityMetrics.complexityDistribution.high, label: 'High', color: '#f5817b' },
                      { id: 3, value: evaluation.codeQualityMetrics.complexityDistribution.veryHigh, label: 'Very High', color: '#e05c7f' },
                    ],
                    highlightScope: { faded: 'global', highlighted: 'item' },
                  }]}
                  height={200}
                  sx={{
                    '& .MuiChartsLegend-series': {
                      fill: 'white',
                    }
                  }}
                  slotProps={{
                    legend: {
                      labelStyle: {
                        fill: 'white',
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Security Section - Transparent with backdrop blur */}
          <div className="relative p-6 rounded-2xl
            bg-transparent backdrop-blur-md border-2 border-white/30">
            
            <h3 className="text-xl font-semibold mb-6 text-[#2a5674]">🔒 Security Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column - Vulnerability Chart */}
              <div>
                <h4 className="font-medium mb-4 text-[#2a5674]">⚠️ Vulnerabilities by Severity</h4>
                <BarChart
                  xAxis={[{ 
                    scaleType: 'band', 
                    data: ['Critical', 'High', 'Medium', 'Low'],
                    tickLabelStyle: {
                      fill: '#2a5674',
                      fontSize: 12,
                      fontWeight: 500
                    }
                  }]}
                  series={[{
                    data: vulnerabilityData,
                    //@ts-expect-error - MUI X-Charts typing issue with color array
                    color: ['#e05c7f', '#f5817b', '#f8a978', '#a8dba8']
                  }]}
                  height={200}
                  sx={{
                    '& .MuiChartsAxis-line': { stroke: '#2a5674' },
                    '& .MuiChartsAxis-tick': { stroke: '#2a5674' },
                  }}
                />
              </div>

              {/* Right column - Security Metrics */}
              <div className="space-y-4">
                <div className="p-4 bg-white/50 rounded-lg">
                  <h4 className="font-medium mb-2 text-[#2a5674]">🎯 Security Hotspots</h4>
                  <div className="text-3xl font-bold text-[#e05c7f]">
                    {evaluation.securityMetrics.securityHotspots}
                  </div>
                  <div className="text-sm text-[#2a5674]/80 mt-1">Areas Needing Review</div>
                </div>

                <div className="p-4 bg-white/50 rounded-lg">
                  <h4 className="font-medium mb-2 text-[#2a5674]">🔑 Authentication Coverage</h4>
                  <div className="text-3xl font-bold text-[#2a5674]">
                    {evaluation.securityMetrics.authenticationCoverage}%
                  </div>
                  <div className="text-sm text-[#2a5674]/80 mt-1">Auth Coverage</div>
                </div>

                <div className="p-4 bg-white/50 rounded-lg">
                  <h4 className="font-medium mb-2 text-[#2a5674]">🛡️ Secure Code Practices</h4>
                  <SparkLineChart
                    data={[evaluation.securityMetrics.secureCodePractices]}
                    height={60}
                    showTooltip
                    showHighlight
                    colors={['#3B82F6']}
                  />
                  <div className="text-sm text-[#2a5674]/80 mt-1">Score: {evaluation.securityMetrics.secureCodePractices}/100</div>
                </div>
              </div>
            </div>
          </div>

          {/* Codebase Overview - Gentle green gradient */}
          <div className="relative p-6 rounded-2xl
            bg-gradient-to-br from-[#a8dba8] via-[#79bd9a] to-[#3b8686]
            shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.3)_inset]">
            
            <h3 className="text-xl font-semibold mb-6 text-white">📁 Codebase Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/30">
                <div className="text-2xl font-bold text-white">{evaluation.metrics.totalFiles}</div>
                <div className="text-sm text-white/80">📄 Total Files</div>
              </div>
              <div className="p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/30">
                <div className="text-2xl font-bold text-white">{evaluation.metrics.totalLines}</div>
                <div className="text-sm text-white/80">📝 Lines of Code</div>
              </div>
              <div className="p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/30">
                <div className="text-2xl font-bold text-white">{evaluation.metrics.commentRatio}%</div>
                <div className="text-sm text-white/80">💭 Comment Ratio</div>
              </div>
              <div className="p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/30">
                <div className="text-2xl font-bold text-white">{evaluation.metrics.duplication}%</div>
                <div className="text-sm text-white/80">🔄 Code Duplication</div>
              </div>
            </div>
          </div>

          {/* Improvement Tips - Lavender style */}
          <div className="relative p-6 rounded-2xl
            bg-gradient-to-br from-[#b19cd9] to-[#6d5dac]
            shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.3)_inset]">
            
            <h3 className="text-xl font-semibold mb-4 text-white">💡 Pro Tips</h3>
            <ul className="space-y-2">
              {evaluation.improvementTips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start p-2 bg-white/30 backdrop-blur-sm rounded border border-white/30">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-white mr-3">
                    {index + 1}
                  </span>
                  <span className="text-white">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 