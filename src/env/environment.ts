interface Environment {
  GEMINI_API_KEY: string;
  GITHUB_TOKEN: string;
}

const env: Environment = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || ''
};

export default env;
