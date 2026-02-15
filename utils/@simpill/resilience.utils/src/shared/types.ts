export interface CircuitBreakerOptions {
  failureThreshold?: number;
  successThreshold?: number;
  openMs?: number;
  halfOpenMaxCalls?: number;
}

export interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

export interface BulkheadOptions {
  maxConcurrency: number;
}
