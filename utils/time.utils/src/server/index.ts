export {
  createManagedInterval,
  createManagedTimeout,
  IntervalManager,
  intervalManager,
  createTimerFactory,
  type TimerFactory,
  type TimerFactoryOptions,
  type TimerOptions,
} from "./interval-manager";
export type { CancellableFunction, ThrottleOptions } from "../shared";
export { debounce, throttle } from "../shared";
