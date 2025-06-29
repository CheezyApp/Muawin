import { useState, useCallback, useMemo } from 'react';

export const useFileCache = () => {
  const [cache, setCache] = useState(new Map());

  // Generate cache key from zone and branch
  const getCacheKey = useCallback((zone, branch) => {
    return `${zone}-${branch}`;
  }, []);

  // Get files from cache
  const getCachedFiles = useCallback((zone, branch) => {
    const key = getCacheKey(zone, branch);
    return cache.get(key) || null;
  }, [cache, getCacheKey]);

  // Set files in cache
  const setCachedFiles = useCallback((zone, branch, files) => {
    const key = getCacheKey(zone, branch);
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.set(key, {
        files,
        timestamp: Date.now(),
      });
      return newCache;
    });
  }, [getCacheKey]);

  // Clear cache for specific zone/branch
  const clearCache = useCallback((zone, branch) => {
    const key = getCacheKey(zone, branch);
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.delete(key);
      return newCache;
    });
  }, [getCacheKey]);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    setCache(new Map());
  }, []);

  // Get cache statistics
  const cacheStats = useMemo(() => {
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
    };
  }, [cache]);

  return {
    getCachedFiles,
    setCachedFiles,
    clearCache,
    clearAllCache,
    cacheStats,
  };
}; 