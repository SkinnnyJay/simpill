import { PollingManager } from "../../../src/shared/polling-manager";

const flushMicrotasks = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

describe("PollingManager", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("polls until stopCondition is met", async () => {
    const pollFn = jest
      .fn<Promise<string>, []>()
      .mockResolvedValueOnce("keep")
      .mockResolvedValueOnce("stop");
    const onSuccess = jest.fn();

    const manager = new PollingManager(pollFn, {
      initialIntervalMs: 10,
      maxIntervalMs: 20,
      backoffFactor: 1.5,
      stopCondition: (value) => value === "stop",
      onSuccess,
    });

    manager.start();

    jest.advanceTimersByTime(10);
    await flushMicrotasks();

    jest.advanceTimersByTime(20);
    await flushMicrotasks();

    expect(pollFn).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalledTimes(2);
    expect(manager.getIsPolling()).toBe(false);
  });

  it("records errors and continues polling", async () => {
    const error = new Error("boom");
    const pollFn = jest.fn<Promise<string>, []>().mockRejectedValueOnce(error);
    const onError = jest.fn();

    const manager = new PollingManager(pollFn, {
      initialIntervalMs: 5,
      maxIntervalMs: 5,
      backoffFactor: 1.5,
      onError,
      maxAttempts: 1,
    });

    manager.start();

    jest.advanceTimersByTime(5);
    await flushMicrotasks();

    expect(onError).toHaveBeenCalledWith(error);
    expect(manager.getState().lastError).toBe(error);
    expect(manager.getIsPolling()).toBe(false);
  });
});
