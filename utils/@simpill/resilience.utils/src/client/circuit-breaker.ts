import type { Gate, RunOptions } from "@simpill/async.utils";
import type { CircuitBreakerOptions } from "../shared";
import {
  CIRCUIT_BREAKER_DEFAULT_FAILURE_THRESHOLD,
  CIRCUIT_BREAKER_DEFAULT_HALF_OPEN_MAX_CALLS,
  CIRCUIT_BREAKER_DEFAULT_OPEN_MS,
  CIRCUIT_BREAKER_DEFAULT_SUCCESS_THRESHOLD,
} from "../shared/constants";

export type CircuitState = "closed" | "open" | "half-open";

export class CircuitBreaker implements Gate {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private successCount = 0;
  private halfOpenCalls = 0;
  private openUntil = 0;
  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly openMs: number;
  private readonly halfOpenMaxCalls: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold =
      options.failureThreshold ?? CIRCUIT_BREAKER_DEFAULT_FAILURE_THRESHOLD;
    this.successThreshold =
      options.successThreshold ?? CIRCUIT_BREAKER_DEFAULT_SUCCESS_THRESHOLD;
    this.openMs = options.openMs ?? CIRCUIT_BREAKER_DEFAULT_OPEN_MS;
    this.halfOpenMaxCalls =
      options.halfOpenMaxCalls ?? CIRCUIT_BREAKER_DEFAULT_HALF_OPEN_MAX_CALLS;
  }

  getState(): CircuitState {
    if (this.state === "open" && Date.now() >= this.openUntil) {
      this.state = "half-open";
      this.halfOpenCalls = 0;
      this.successCount = 0;
    }
    return this.state;
  }

  async run<T>(fn: () => Promise<T>, options?: RunOptions): Promise<T> {
    if (options?.signal?.aborted) {
      const error = new Error("Operation aborted.");
      error.name = "AbortError";
      throw error;
    }
    const state = this.getState();
    if (state === "open") {
      throw new Error("Circuit breaker is open");
    }
    if (state === "half-open" && this.halfOpenCalls >= this.halfOpenMaxCalls) {
      throw new Error("Circuit breaker half-open max calls reached");
    }

    if (this.state === "half-open") this.halfOpenCalls++;

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  private recordSuccess(): void {
    if (this.state === "half-open") {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = "closed";
        this.failureCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }

  private recordFailure(): void {
    if (this.state === "half-open") {
      this.state = "open";
      this.openUntil = Date.now() + this.openMs;
      return;
    }
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = "open";
      this.openUntil = Date.now() + this.openMs;
    }
  }
}
