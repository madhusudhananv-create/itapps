import { useMemo } from 'react';
import featureFlagsData from '../../featureFlags.json';

interface FeatureFlags {
  [key: string]: boolean;
}

interface FeatureFlagsData {
  [pageName: string]: FeatureFlags;
}

export const useFeatureFlags = (pageName: string): FeatureFlags => {
  const flags = useMemo(() => {
    try {
      const data = featureFlagsData as FeatureFlagsData;
      return data[pageName] || {};
    } catch (error) {
      console.error('Error loading feature flags:', error);
      return {};
    }
  }, [pageName]);

  return flags;
};
