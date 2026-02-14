import type { z } from "zod";
import { HTTP_METHOD, type HttpMethod } from "@simpill/protocols.utils";
import { VALUE_0 } from "../shared/internal-constants";
import type { ApiHandler, ApiRequestContext, ApiSchema } from "../shared/types";
import { fetchWithRetry, fetchWithTimeout } from "./fetch-helpers";

/** Optional logging hook for request start (client or handler). */
export type OnRequestLog = (info: {
  method: string;
  url: string;
  routeKey?: string;
}) => void;

/** Optional logging hook for request end (client: status/duration; handler: duration). */
export type OnResponseLog = (info: {
  method: string;
  url: string;
  routeKey?: string;
  status?: number;
  durationMs: number;
}) => void;

/** Optional logging hook for request errors. */
export type OnErrorLog = (info: {
  method: string;
  url: string;
  routeKey?: string;
  error: unknown;
}) => void;

export interface CreateApiFactoryOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  /** Optional request/response logging for DX and debugging. */
  logging?: {
    onRequest?: OnRequestLog;
    onResponse?: OnResponseLog;
    onError?: OnErrorLog;
  };
  middleware?: {
    before?: (ctx: ApiRequestContext) => ApiRequestContext | Promise<ApiRequestContext>;
    after?: (ctx: ApiRequestContext, result: unknown) => unknown | Promise<unknown>;
    onError?: (err: unknown) => void | Promise<void>;
  };
}

interface RouteMiddleware {
  before?: (ctx: ApiRequestContext) => ApiRequestContext | Promise<ApiRequestContext>;
  after?: (ctx: ApiRequestContext, result: unknown) => unknown | Promise<unknown>;
  onError?: (err: unknown) => void | Promise<void>;
}

interface RouteEntry {
  key: string;
  method: HttpMethod;
  path: string;
  schema: ApiSchema;
  transform?: (data: unknown) => unknown;
  handler?: ApiHandler;
  middleware?: RouteMiddleware;
}

interface RouteBuilder {
  withMiddleware: (m: RouteMiddleware) => RouteBuilder;
  get: (schema: ApiSchema, handler?: ApiHandler) => ApiFactory;
  post: (schema: ApiSchema, handler?: ApiHandler) => ApiFactory;
  put: (schema: ApiSchema, handler?: ApiHandler) => ApiFactory;
  patch: (schema: ApiSchema, handler?: ApiHandler) => ApiFactory;
  delete: (schema: ApiSchema, handler?: ApiHandler) => ApiFactory;
}

export interface ApiFactory {
  route: (path: string, name?: string) => RouteBuilder;
  /**
   * Build a fetch client: keys are route names, values are (options?) => Promise<unknown>.
   * Type the return at call site from your route schema (e.g. z.infer<typeof mySchema.response>).
   */
  client: (opts?: {
    baseUrl?: string;
    headers?: Record<string, string>;
    fetcher?: typeof fetch;
    retry?: { maxRetries?: number; delayMs?: number };
    timeoutMs?: number;
  }) => Record<string, (options?: Record<string, unknown>) => Promise<unknown>>;
  /**
   * Request handlers keyed by route; req has url, method, headers?, body?.
   * Return type is Promise<unknown>; type from your route schema at use site.
   */
  handlers: () => Record<
    string,
    (req: {
      url: string;
      method: string;
      headers?: Record<string, string>;
      body?: unknown;
    }) => Promise<unknown>
  >;
}

function pathKey(method: HttpMethod, path: string): string {
  return `${method}:${path}`;
}

interface ClientCallOptions {
  params: Record<string, string>;
  query: Record<string, string | number | boolean>;
  headers: Record<string, string>;
  body: unknown;
}

function getClientCallOptions(options: Record<string, unknown>): ClientCallOptions {
  return {
    params: (options.params as Record<string, string> | undefined) ?? {},
    query: (options.query as Record<string, string | number | boolean> | undefined) ?? {},
    headers: (options.headers as Record<string, string> | undefined) ?? {},
    body: options.body,
  };
}

function substitutePath(pathPattern: string, params: Record<string, string>): string {
  return pathPattern.replace(/:([^/]+)/g, (_, key) => params[key] ?? `:${key}`);
}

function buildQuery(query: Record<string, string | number | boolean>): string {
  const entries = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return entries.length === VALUE_0 ? "" : `?${entries.join("&")}`;
}

function parsePathParams(pathPattern: string, path: string): Record<string, string> {
  const patternParts = pathPattern.split("/").filter(Boolean);
  const pathParts = path.replace(/^\//, "").split("/").filter(Boolean);
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i];
    if (part?.startsWith(":") && pathParts[i] !== undefined) {
      params[part.slice(1)] = pathParts[i];
    }
  }
  return params;
}

/** Build request context from route and request; schema casts for Zod .parse() live here. */
function buildHandlerContext(
  r: RouteEntry,
  req: { url: string; method: string; headers?: Record<string, string>; body?: unknown },
): ApiRequestContext {
  const url = new URL(req.url, "http://_");
  const pathname = url.pathname;
  const rawParams = parsePathParams(r.path, pathname);
  const rawQuery = Object.fromEntries(url.searchParams.entries()) as Record<string, unknown>;
  const params = r.schema.params
    ? (r.schema.params as z.ZodType<Record<string, string>>).parse(rawParams)
    : rawParams;
  const query = r.schema.query
    ? (r.schema.query as z.ZodType<Record<string, unknown>>).parse(rawQuery)
    : rawQuery;
  const body = r.schema.body
    ? (r.schema.body as z.ZodType<unknown>).parse(req.body ?? {})
    : (req.body ?? {});
  return {
    params,
    query,
    body,
    headers: req.headers ?? {},
    method: r.method,
    url: req.url,
  };
}

export function createApiFactory(options: CreateApiFactoryOptions = {}): ApiFactory {
  const routes: RouteEntry[] = [];
  const defaultHeaders = options.defaultHeaders ?? {};
  const defaultBaseUrl = options.baseUrl ?? "";
  const globalMiddleware: RouteMiddleware = options.middleware ?? {};
  const logging = options.logging ?? {};

  function addRoute(
    path: string,
    method: HttpMethod,
    schema: ApiSchema,
    name?: string,
    handler?: ApiHandler,
    middleware?: RouteEntry["middleware"]
  ): ApiFactory {
    const key = name ?? pathKey(method, path);
    routes.push({
      key,
      method,
      path,
      schema,
      handler,
      middleware,
    });
    return factory;
  }

  function createRouteBuilder(path: string, name?: string): RouteBuilder {
    let routeMiddleware: RouteEntry["middleware"];
    const add = (method: HttpMethod) => (schema: ApiSchema, handler?: ApiHandler) =>
      addRoute(path, method, schema, name, handler, routeMiddleware);
    const builder: RouteBuilder = {
      withMiddleware(m) {
        routeMiddleware = m;
        return builder;
      },
      get: add(HTTP_METHOD.GET),
      post: add(HTTP_METHOD.POST),
      put: add(HTTP_METHOD.PUT),
      patch: add(HTTP_METHOD.PATCH),
      delete: add(HTTP_METHOD.DELETE),
    };
    return builder;
  }

  const factory: ApiFactory = {
    route(path: string, name?: string) {
      return createRouteBuilder(path, name);
    },

    client(opts = {}) {
      const baseUrl = (opts.baseUrl ?? defaultBaseUrl).replace(/\/$/, "");
      const headers = { ...defaultHeaders, ...opts.headers };
      const baseFetcher = opts.fetcher ?? fetch;
      const doFetch = opts.timeoutMs
        ? (input: URL | string, init?: RequestInit) =>
            fetchWithTimeout(input, init, { timeoutMs: opts.timeoutMs, fetcher: baseFetcher })
        : baseFetcher;
      const fetcher =
        opts.retry && (opts.retry.maxRetries ?? VALUE_0) > VALUE_0
          ? (input: URL | string, init?: RequestInit) =>
              fetchWithRetry(input, init, {
                ...opts.retry,
                fetcher: doFetch as typeof fetch,
              })
          : doFetch;
      const clientMap: Record<string, (options?: Record<string, unknown>) => Promise<unknown>> = {};

      for (const r of routes) {
        clientMap[r.key] = async (options = {}) => {
          const { params, query, body, headers: extraHeaders } =
            getClientCallOptions(options);
          const url = `${baseUrl}${substitutePath(r.path, params)}${buildQuery(query)}`;
          const init: RequestInit = {
            method: r.method,
            headers: { ...headers, ...extraHeaders, "Content-Type": "application/json" },
          };
          if (body !== undefined && r.method !== HTTP_METHOD.GET) {
            init.body = JSON.stringify(body);
          }
          logging.onRequest?.({ method: r.method, url, routeKey: r.key });
          const start = Date.now();
          try {
            const res = await fetcher(url, init);
            const durationMs = Date.now() - start;
            logging.onResponse?.({ method: r.method, url, routeKey: r.key, status: res.status, durationMs });
            if (!res.ok) {
              const text = await res.text();
              throw new Error(`HTTP ${res.status}: ${text}`);
            }
            const raw = await res.json().catch(() => ({}));
            const responseSchema = r.schema.response as z.ZodType<unknown> | undefined;
            const parsed = responseSchema ? responseSchema.parse(raw) : raw;
            return r.transform ? r.transform(parsed) : parsed;
          } catch (err) {
            logging.onError?.({ method: r.method, url, routeKey: r.key, error: err });
            throw err;
          }
        };
      }
      return clientMap;
    },

    handlers() {
      const handlerMap: Record<
        string,
        (req: {
          url: string;
          method: string;
          headers?: Record<string, string>;
          body?: unknown;
        }) => Promise<unknown>
      > = {};

      for (const r of routes) {
        const handlerFn = r.handler;
        if (!handlerFn) continue;
        handlerMap[r.key] = async (req) => {
          logging.onRequest?.({ method: r.method, url: req.url, routeKey: r.key });
          const start = Date.now();
          let currentCtx = buildHandlerContext(r, req);
          try {
            if (globalMiddleware.before) {
              currentCtx = await globalMiddleware.before(currentCtx);
            }
            if (r.middleware?.before) {
              currentCtx = await r.middleware.before(currentCtx);
            }
            let result = await handlerFn(currentCtx);
            if (r.middleware?.after) {
              result = await r.middleware.after(currentCtx, result);
            }
            if (globalMiddleware.after) {
              result = await globalMiddleware.after(currentCtx, result);
            }
            const durationMs = Date.now() - start;
            logging.onResponse?.({ method: r.method, url: req.url, routeKey: r.key, durationMs });
            return result;
          } catch (err) {
            logging.onError?.({ method: r.method, url: req.url, routeKey: r.key, error: err });
            if (r.middleware?.onError) {
              await r.middleware.onError(err);
            }
            if (globalMiddleware.onError) {
              await globalMiddleware.onError(err);
            }
            throw err;
          }
        };
      }
      return handlerMap;
    },
  };

  return factory;
}
