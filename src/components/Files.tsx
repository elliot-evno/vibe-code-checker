interface FileType {
  path: string;
  name: string;
  type: "dir" | "file";
  size?: number;
  content?: string;
}

interface FilesProps {
  files: FileType[];
  error: string;
  currentPath: string;
  isAnalyzing: boolean;
  onNavigate: (path: string) => void;
  onEvaluateCodebase: (files: FileType[]) => void;
}

const spinnerStyles = `
  @keyframes spinning82341 {
    to {
      transform: rotate(360deg);
    }
  }
`;

const cardStyles = `
  @keyframes rotate {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
`;

export default function Files({
  files,
  error,
  currentPath,
  isAnalyzing,
  onNavigate,
  onEvaluateCodebase
}: FilesProps) {
  const formatFileSize = (size?: number) => {
    if (!size) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let unitIndex = 0;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const renderBreadcrumbs = () => {
    if (!currentPath) return null;
    const parts = currentPath.split('/').filter(Boolean);
    
    return (
      <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-200 overflow-x-auto">
        <span 
          className="hover:text-blue-200 cursor-pointer whitespace-nowrap"
          onClick={() => onNavigate('')}
        >
          root
        </span>
        {parts.map((part, index) => (
          <div key={index} className="flex items-center">
            <span className="mx-1 sm:mx-2">/</span>
            <span 
              className="hover:text-blue-200 cursor-pointer whitespace-nowrap truncate max-w-[100px] sm:max-w-none"
              onClick={() => onNavigate(parts.slice(0, index + 1).join('/'))}
            >
              {part}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{spinnerStyles}</style>
      <style>{cardStyles}</style>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 animate-fadeIn" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="relative p-3 sm:p-4 mb-4 animate-slideIn rounded-2xl
          bg-gradient-to-b from-[#95C5F8] via-[#6AA9ED] to-[#3B82F6]
          shadow-[0px_-16px_24px_0px_rgba(255,255,255,0.4)_inset]"
        >
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-[calc(100%+2px)] h-[calc(100%+2px)] overflow-hidden rounded-2xl
            bg-gradient-to-b from-white/40 to-white/10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-[200%] h-40
              bg-gradient-to-b from-white/50 via-white/20 to-transparent
              animate-[rotate_8s_linear_infinite]">
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
            <div className="flex flex-wrap items-center mb-3 sm:mb-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white mr-3">
                Files
              </h2>
              {currentPath && (
                <div className="h-6 w-px bg-white/40 mr-3 hidden sm:block"></div>
              )}
              <div className="w-full sm:w-auto mt-2 sm:mt-0">
                {renderBreadcrumbs()}
              </div>
            </div>
            <div className="mt-2 sm:mt-0">
              <button
                className={`h-10 px-5 sm:px-6 rounded-lg flex items-center justify-center 
                  bg-gradient-to-r from-white/70 to-white/50
                  shadow-[4px_4px_6px_rgba(0,0,0,0.1),inset_1px_1px_1px_rgba(255,255,255,0.7)] 
                  transition-all hover:scale-105 hover:from-white/80 hover:to-white/60
                  active:shadow-[0px_0px_0px_rgba(0,0,0,0.1),inset_0.5px_0.5px_2px_rgba(0,0,0,0.3)]
                  disabled:opacity-50 disabled:hover:scale-100`}
                onClick={() => onEvaluateCodebase(files)}
                disabled={isAnalyzing}
                style={{ cursor: 'pointer' }}
              >
                <span className="text-[#3168C5] text-sm font-medium transition-all active:scale-95 flex items-center">
                  {isAnalyzing ? (
                    <div className="flex items-center">
                      <div className="relative w-5 h-5 mr-2">
                        <div className="absolute inset-0 
                          bg-gradient-to-b from-[#95C5F8] to-[#3B82F6]
                          rounded-full animate-[spinning82341_1.7s_linear_infinite]
                          blur-[1px]
                          shadow-[0px_-5px_20px_0px_#95C5F8,0px_5px_20px_0px_#3B82F6]"
                        >
                        </div>
                        <div className="absolute inset-0.5
                          bg-white
                          rounded-full
                          blur-sm"
                        >
                        </div>
                      </div>
                      Analyzing...
                    </div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analyze
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          <hr className="w-full h-[0.1rem] bg-white/40 border-none mb-4" />

          <div className="relative">
            <ul className="space-y-1.5">
              {files.map((file) => (
                <li
                  key={file.path}
                  className={`group rounded-xl p-2 sm:p-3 transition-all duration-200 ease-in-out
                            ${file.type === "dir" 
                              ? 'hover:bg-white/30' 
                              : 'hover:bg-white/30'
                            } cursor-pointer`}
                  onClick={() => file.type === "dir" && onNavigate(file.path)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 max-w-full">
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {file.type === "dir" ? (
                          <div className="p-1.5 rounded-lg bg-white/30 group-hover:bg-white/50 transition-colors duration-200">
                            <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-white/30 group-hover:bg-white/50 transition-colors duration-200">
                            <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className={`ml-3 truncate text-white group-hover:text-white text-sm sm:text-base`}>
                        {file.name}
                      </span>
                    </div>
                    {file.type === "file" && (
                      <span className="text-xs sm:text-sm text-white/85 group-hover:text-white ml-2 sm:ml-3 flex-shrink-0">
                        {formatFileSize(file.size)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}