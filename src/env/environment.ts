interface Environment {
  GEMINI_API_KEY: string;
  GITHUB_TOKEN: string;
  GEMINI_PROMPT: string;
}

const env: Environment = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  GEMINI_PROMPT: process.env.GEMINI_PROMPT || ''
};

export default env;
