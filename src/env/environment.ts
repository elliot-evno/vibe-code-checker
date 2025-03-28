interface Environment {
  GEMINI_API_KEY: string;
  GITHUB_TOKEN: string;
  GEMINI_PROMPT: string;
  POSTHOG_API_KEY: string;
  POSTHOG_HOST: string;
}

const env: Environment = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  GEMINI_PROMPT: process.env.GEMINI_PROMPT || '',
  POSTHOG_API_KEY: process.env.POSTHOG_API_KEY || '',
  POSTHOG_HOST: process.env.POSTHOG_HOST || ''
};

export default env;
