import type {
  HeartbeatOptions,
  MessageHelpersOptions,
  MessageQueueOptions,
  ReconnectingWebSocketHooks,
  ReconnectingWebSocketState,
  ReconnectingWebSocketStatus,
  ReconnectOptions,
  RetryPolicyOptions,
  SocketLimitsOptions,
} from "../shared";

const WS_CONNECTING = 0;
const WS_OPEN = 1;
const WS_CLOSING = 2;
const WS_CLOSED = 3;

const DEFAULT_MAX_ATTEMPTS = 10;
const DEFAULT_INITIAL_DELAY_MS = 1000;
const DEFAULT_MAX_DELAY_MS = 30_000;
const DEFAULT_BACKOFF_MULTIPLIER = 1.5;
const DEFAULT_JITTER_RATIO = 0.5;
const DEFAULT_MAX_MISSES = 3;
const DEFAULT_PONG_TIMEOUT_MS = 5000;

function applyJitter(delayMs: number, mode: "none" | "full" | "equal", ratio: number): number {
  if (mode === "none") return delayMs;
  const r = Math.random();
  if (mode === "full") return Math.floor(r * delayMs);
  const low = delayMs * (1 - ratio);
  const high = delayMs * (1 + ratio);
  return Math.floor(low + r * (high - low));
}

function defaultIsPong(data: unknown): boolean {
  if (typeof data === "string") return data === "pong";
  if (data && typeof data === "object" && "type" in data)
    return (data as { type: string }).type === "pong";
  return false;
}

interface QueuedMessage {
  data: string;
  ts: number;
}

export interface CreateReconnectingWebSocketOptions {
  reconnect?: ReconnectOptions;
  heartbeat?: HeartbeatOptions;
  WebSocketCtor?: typeof WebSocket;
  signal?: AbortSignal;
  /** If false, must call open() to connect. Default true */
  autoConnect?: boolean;
  hooks?: ReconnectingWebSocketHooks;
  limits?: SocketLimitsOptions;
  queue?: MessageQueueOptions;
  retryPolicy?: RetryPolicyOptions;
  message?: MessageHelpersOptions;
}

export interface ReconnectingWebSocketResult {
  /** Undefined until open() is called when autoConnect is false. */
  ws: WebSocket | undefined;
  reconnect: () => void;
  close: () => void;
  /** Call only when autoConnect is false to start first connection. */
  open: () => void;
  getState: () => Readonly<ReconnectingWebSocketState>;
  /** Send data (queued if not open when queue enabled). */
  send: (data: string | unknown) => void;
}

export function createReconnectingWebSocket(
  url: string,
  options?: CreateReconnectingWebSocketOptions,
): ReconnectingWebSocketResult {
  const WebSocketCtor = options?.WebSocketCtor ?? globalThis.WebSocket;
  if (!WebSocketCtor) {
    throw new Error("WebSocket is not available; pass WebSocketCtor in options");
  }

  const reconnectOpts = options?.reconnect ?? {};
  const maxAttempts = reconnectOpts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const initialDelayMs = reconnectOpts.initialDelayMs ?? DEFAULT_INITIAL_DELAY_MS;
  const maxDelayMs = reconnectOpts.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
  const backoffMultiplier = reconnectOpts.backoffMultiplier ?? DEFAULT_BACKOFF_MULTIPLIER;
  const jitter = reconnectOpts.jitter ?? "none";
  const jitterRatio = reconnectOpts.jitterRatio ?? DEFAULT_JITTER_RATIO;
  const signal = options?.signal;
  const hooks = options?.hooks;
  const limits = options?.limits;
  const queueOpts = options?.queue;
  const retryPolicy = options?.retryPolicy;
  const messageHelpers = options?.message;
  const autoConnect = options?.autoConnect !== false;

  const state: ReconnectingWebSocketState = {
    status: "idle" as ReconnectingWebSocketStatus,
    lastError: null,
    lastOpenAt: null,
    lastCloseAt: null,
    attemptCount: 0,
    reconnectAttempt: 0,
  };

  let ws: WebSocket | undefined;
  let reconnectAttempt = 0;
  let firstConnectAt: number | null = null;
  let heartbeatId: ReturnType<typeof setInterval> | null = null;
  let pongTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let pongMisses = 0;
  let closed = false;
  let manualReconnect = false;
  let reconnectTimerId: ReturnType<typeof setTimeout> | null = null;
  let reconnectAbortListener: (() => void) | null = null;
  let idleTimerId: ReturnType<typeof setTimeout> | null = null;
  let maxUptimeTimerId: ReturnType<typeof setTimeout> | null = null;
  const outboundQueue: QueuedMessage[] = [];

  function setStatus(s: ReconnectingWebSocketStatus): void {
    state.status = s;
  }

  function clearReconnectTimer(): void {
    if (reconnectTimerId !== null) {
      clearTimeout(reconnectTimerId);
      reconnectTimerId = null;
    }
    if (reconnectAbortListener && signal) {
      signal.removeEventListener("abort", reconnectAbortListener);
      reconnectAbortListener = null;
    }
  }

  function clearIdleAndUptime(): void {
    if (idleTimerId !== null) {
      clearTimeout(idleTimerId);
      idleTimerId = null;
    }
    if (maxUptimeTimerId !== null) {
      clearTimeout(maxUptimeTimerId);
      maxUptimeTimerId = null;
    }
  }

  function scheduleReconnect(delayMs: number): void {
    clearReconnectTimer();
    if (signal?.aborted) return;
    const elapsed = firstConnectAt !== null ? Date.now() - firstConnectAt : 0;
    if (retryPolicy?.maxElapsedMs !== undefined && elapsed >= retryPolicy.maxElapsedMs) return;
    const jittered = Math.max(1, applyJitter(delayMs, jitter, jitterRatio));
    hooks?.onReconnect?.(reconnectAttempt, jittered);
    reconnectTimerId = setTimeout(() => {
      reconnectTimerId = null;
      if (reconnectAbortListener && signal) {
        signal.removeEventListener("abort", reconnectAbortListener);
        reconnectAbortListener = null;
      }
      connect();
    }, jittered);
    if (signal) {
      reconnectAbortListener = () => clearReconnectTimer();
      signal.addEventListener("abort", reconnectAbortListener, { once: true });
    }
  }

  function clearHeartbeat(): void {
    if (heartbeatId !== null) {
      clearInterval(heartbeatId);
      heartbeatId = null;
    }
    if (pongTimeoutId !== null) {
      clearTimeout(pongTimeoutId);
      pongTimeoutId = null;
    }
    pongMisses = 0;
  }

  function startIdleTimer(): void {
    if (!limits?.idleMs) return;
    if (idleTimerId) clearTimeout(idleTimerId);
    idleTimerId = setTimeout(() => {
      idleTimerId = null;
      ws?.close();
    }, limits.idleMs);
  }

  function startMaxUptimeTimer(): void {
    if (!limits?.maxUptimeMs) return;
    if (maxUptimeTimerId) clearTimeout(maxUptimeTimerId);
    maxUptimeTimerId = setTimeout(() => {
      maxUptimeTimerId = null;
      ws?.close();
    }, limits.maxUptimeMs);
  }

  function startHeartbeat(heartbeat: HeartbeatOptions): void {
    clearHeartbeat();
    const pongTimeoutMs = heartbeat.pongTimeoutMs ?? DEFAULT_PONG_TIMEOUT_MS;
    const maxMisses = heartbeat.maxMisses ?? DEFAULT_MAX_MISSES;
    const expectPong = heartbeat.expectPong === true;

    heartbeatId = setInterval(() => {
      if (ws?.readyState !== WS_OPEN) return;
      // Omitted message defaults to ""; empty string skips send (no ping sent)
      const msg =
        typeof heartbeat.message === "function" ? heartbeat.message() : (heartbeat.message ?? "");
      if (msg) ws.send(msg);
      if (expectPong) {
        if (pongTimeoutId) clearTimeout(pongTimeoutId);
        pongTimeoutId = setTimeout(() => {
          pongTimeoutId = null;
          pongMisses++;
          if (pongMisses >= maxMisses) ws?.close();
        }, pongTimeoutMs);
      }
    }, heartbeat.intervalMs);
  }

  function flushQueue(): void {
    if (ws?.readyState !== WS_OPEN || outboundQueue.length === 0) return;
    const now = Date.now();
    const ttlMs = queueOpts?.ttlMs;
    while (outboundQueue.length > 0) {
      const entry = outboundQueue.shift();
      if (!entry) break;
      if (ttlMs !== undefined && now - entry.ts > ttlMs) continue;
      try {
        ws.send(entry.data);
      } catch {
        // ignore
      }
    }
  }

  function connect(): void {
    if (closed) return;
    if (firstConnectAt === null) firstConnectAt = Date.now();
    setStatus("connecting");
    state.attemptCount++;
    const socket = new WebSocketCtor(url);
    ws = socket;

    socket.onopen = (ev) => {
      setStatus("open");
      state.lastOpenAt = Date.now();
      state.lastError = null;
      clearIdleAndUptime();
      startIdleTimer();
      startMaxUptimeTimer();
      const hb = options?.heartbeat;
      if (hb) startHeartbeat(hb);
      flushQueue();
      hooks?.onOpen?.(ev);
    };

    socket.onmessage = (ev) => {
      startIdleTimer();
      const hb = options?.heartbeat;
      if (hb?.expectPong && (hb.isPong ?? defaultIsPong)(ev.data)) {
        if (pongTimeoutId) {
          clearTimeout(pongTimeoutId);
          pongTimeoutId = null;
        }
        pongMisses = 0;
      }
      hooks?.onMessage?.(ev);
    };

    socket.onclose = (ev) => {
      setStatus("closed");
      state.lastCloseAt = Date.now();
      state.reconnectAttempt = reconnectAttempt;
      clearHeartbeat();
      clearReconnectTimer();
      clearIdleAndUptime();
      hooks?.onClose?.(ev);

      if (manualReconnect) {
        manualReconnect = false;
        connect();
        return;
      }

      const should =
        retryPolicy?.shouldReconnect?.({ attempt: reconnectAttempt, closeEvent: ev }) ?? true;
      if (!should || reconnectAttempt >= maxAttempts) return;

      setStatus("reconnecting");
      reconnectAttempt++;
      const delayMs = Math.min(
        initialDelayMs * backoffMultiplier ** (reconnectAttempt - 1),
        maxDelayMs,
      );
      scheduleReconnect(delayMs);
    };

    socket.onerror = (ev) => {
      state.lastError = new Error("WebSocket error");
      hooks?.onError?.(ev);
    };
  }

  function send(data: string | unknown): void {
    const serialized =
      typeof data === "string"
        ? data
        : messageHelpers?.serialize
          ? messageHelpers.serialize(data)
          : JSON.stringify(data);

    if (queueOpts?.enabled && ws?.readyState !== WS_OPEN) {
      const maxSize = queueOpts.maxSize;
      if (maxSize !== undefined && outboundQueue.length >= maxSize) {
        const drop = outboundQueue.length - maxSize + 1;
        for (let i = 0; i < drop; i++) outboundQueue.shift();
        queueOpts.onDrop?.(drop);
      }
      outboundQueue.push({ data: serialized, ts: Date.now() });
      return;
    }
    if (ws?.readyState === WS_OPEN) ws.send(serialized);
  }

  function open(): void {
    if (state.status !== "idle") return;
    connect();
  }

  if (autoConnect) connect();
  else setStatus("idle");

  return {
    get ws(): WebSocket | undefined {
      return ws;
    },
    reconnect() {
      closed = false;
      reconnectAttempt = 0;
      clearReconnectTimer();
      if (ws !== undefined && (ws.readyState === WS_OPEN || ws.readyState === WS_CONNECTING)) {
        manualReconnect = true;
        ws.close();
        return;
      }
      connect();
    },
    close() {
      closed = true;
      manualReconnect = false;
      clearReconnectTimer();
      clearHeartbeat();
      clearIdleAndUptime();
      if (ws !== undefined && ws.readyState !== WS_CLOSED && ws.readyState !== WS_CLOSING) {
        ws.close();
      }
    },
    open,
    getState: () => ({ ...state }),
    send,
  };
}
