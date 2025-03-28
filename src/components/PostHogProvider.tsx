'use client';

import { PostHog } from 'posthog-js';
import posthog from 'posthog-js';
import { createContext, useContext, useEffect, useState } from 'react';

interface PostHogContextType {
  posthog: PostHog | null;
}

const PostHogContext = createContext<PostHogContextType>({ posthog: null });

export const usePostHog = () => useContext(PostHogContext);

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [posthogInstance, setPosthogInstance] = useState<PostHog | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !posthogInstance) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug();
        },
        capture_pageview: false, // We'll handle this manually
      });
      setPosthogInstance(posthog);
    }
  }, [posthogInstance]);

  useEffect(() => {
    // Capture page views
    if (posthogInstance) {
      posthogInstance.capture('$pageview');
    }
  }, [posthogInstance]);

  return (
    <PostHogContext.Provider value={{ posthog: posthogInstance }}>
      {children}
    </PostHogContext.Provider>
  );
} 