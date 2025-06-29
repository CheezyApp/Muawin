import { useEffect, useRef, useCallback } from 'react';

export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  // Track render count
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    lastRenderTime.current = currentTime;

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCount.current} - Time since last render: ${timeSinceLastRender.toFixed(2)}ms`);
    }
  });

  // Measure function execution time
  const measureExecution = useCallback((fn, label) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] ${label}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }, [componentName]);

  // Measure async function execution time
  const measureAsyncExecution = useCallback(async (fn, label) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] ${label}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }, [componentName]);

  // Get render statistics
  const getRenderStats = useCallback(() => {
    return {
      renderCount: renderCount.current,
      componentName,
    };
  }, [componentName]);

  return {
    measureExecution,
    measureAsyncExecution,
    getRenderStats,
    renderCount: renderCount.current,
  };
}; 