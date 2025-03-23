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
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <span 
          className="hover:text-blue-500 cursor-pointer"
          onClick={() => onNavigate('')}
        >
          root
        </span>
        {parts.map((part, index) => (
          <div key={index} className="flex items-center">
            <span className="mx-2">/</span>
            <span 
              className="hover:text-blue-500 cursor-pointer"
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
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 animate-fadeIn" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl rounded-2xl px-8 pt-6 pb-8 mb-4 animate-slideIn">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Files
              </h2>
              {currentPath && (
                <div className="h-6 w-px bg-gradient-to-b from-blue-200 to-purple-200"></div>
              )}
              {renderBreadcrumbs()}
            </div>
            <div className="space-x-3">
              {currentPath && (
                <button
                  className="inline-flex items-center px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded-xl
                            hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 
                            transition-all duration-200 ease-in-out transform hover:scale-102 shadow-sm"
                  onClick={() => onNavigate("..")}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              )}
              <button
                className={`inline-flex items-center px-5 py-2 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-102
                          ${isAnalyzing 
                            ? 'bg-purple-500 hover:bg-purple-600' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                          } text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/20`}
                onClick={() => onEvaluateCodebase(files)}
                disabled={isAnalyzing}
                style={{ cursor: 'pointer' }}
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Analyze Codebase
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <ul className="space-y-1.5">
              {files.map((file) => (
                <li
                  key={file.path}
                  className={`group rounded-xl p-3 transition-all duration-200 ease-in-out
                            ${file.type === "dir" 
                              ? 'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 hover:shadow-md border border-transparent hover:border-blue-100/50' 
                              : 'hover:bg-gray-50/50 hover:shadow-sm border border-transparent hover:border-gray-100/50'
                            } cursor-pointer backdrop-blur-sm`}
                  onClick={() => file.type === "dir" && onNavigate(file.path)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {file.type === "dir" ? (
                          <div className="p-1.5 rounded-lg bg-blue-50 group-hover:bg-blue-100/70 transition-colors duration-200">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-purple-50 group-hover:bg-purple-100/70 transition-colors duration-200">
                            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className={`ml-3 truncate ${
                        file.type === "dir" 
                          ? 'font-medium text-blue-700 group-hover:text-blue-800' 
                          : 'text-gray-600 group-hover:text-gray-800'
                      }`}>
                        {file.name}
                      </span>
                    </div>
                    {file.type === "file" && (
                      <span className="text-sm text-purple-500 opacity-75 group-hover:opacity-100 ml-3 flex-shrink-0">
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