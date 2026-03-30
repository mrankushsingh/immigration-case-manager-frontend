/**
 * Performance Monitoring Utilities
 * Tracks and logs performance metrics for optimization
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = process.env.NODE_ENV === 'development' || 
                              (typeof window !== 'undefined' && (window as any).__PERF_MONITOR__ === true);

  /**
   * Start tracking a performance metric
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;
    
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  /**
   * End tracking a performance metric
   */
  end(name: string): number | null {
    if (!this.enabled) return null;
    
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ [Performance] ${name}: ${duration.toFixed(2)}ms`, metric.metadata || '');
    }

    return duration;
  }

  /**
   * Measure a function's execution time
   */
  async measure<T>(name: string, fn: () => T | Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get a specific metric
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    total: number;
    average: number;
    min: number;
    max: number;
    metrics: PerformanceMetric[];
  } {
    const completed = Array.from(this.metrics.values())
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!);

    if (completed.length === 0) {
      return {
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        metrics: [],
      };
    }

    return {
      total: completed.reduce((a, b) => a + b, 0),
      average: completed.reduce((a, b) => a + b, 0) / completed.length,
      min: Math.min(...completed),
      max: Math.max(...completed),
      metrics: Array.from(this.metrics.values()),
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render time
 * Note: Import useEffect from 'react' when using this hook
 * 
 * Example usage:
 * ```typescript
 * import { useEffect } from 'react';
 * 
 * useEffect(() => {
 *   const startTime = performance.now();
 *   return () => {
 *     const duration = performance.now() - startTime;
 *     if (process.env.NODE_ENV === 'development') {
 *       console.log(`⏱️ [Render] ComponentName: ${duration.toFixed(2)}ms`);
 *     }
 *   };
 * });
 * ```
 */
export function usePerformanceMeasure(_componentName: string) {
  // This is a utility function - useEffect should be imported in the component
  // The parameter is kept for API consistency but not used directly
}

/**
 * Measure API call performance
 */
export async function measureApiCall<T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> {
  return performanceMonitor.measure(`API:${apiName}`, apiCall);
}

/**
 * Measure database query performance (backend)
 */
export function measureDbQuery<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  return performanceMonitor.measure(`DB:${queryName}`, query);
}

