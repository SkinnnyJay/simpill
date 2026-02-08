import dotenvx from "@dotenvx/dotenvx";
import {
  DEFAULT_ENV_PATHS,
  DOTENVX_INTERNAL,
  ENCRYPTED_VALUE_PREFIX,
  ENV_ERROR_MESSAGE,
  ENV_KEY,
  ENV_PARSE_TYPE,
  LOG_PREFIX,
  NODE_ENV,
} from "../shared/constants";
import {
  EnvDecryptError,
  EnvParseError,
  EnvValidationError,
  MissingEnvError,
} from "../shared/errors";
import {
  parseBooleanEnvValue,
  parseBooleanEnvValueStrict,
  parseNumberEnvValue,
  parseNumberEnvValueStrict,
} from "../shared/parse-helpers";

interface DotenvxConfigOutput {
  parsed?: Record<string, string>;
  error?: Error;
}

interface DotenvxParseOutput {
  [key: string]: string;
}

/**
 * Logger adapter interface for structured logging.
 * Implement this interface to integrate with your logging system.
 */
export interface EnvLoggerAdapter {
  /** Log informational messages (e.g., "Loaded .env file") */
  info(message: string, meta?: Record<string, unknown>): void;
  /** Log warning messages (e.g., "File not found") */
  warn(message: string, meta?: Record<string, unknown>): void;
  /** Log error messages (e.g., "Failed to decrypt") */
  error(message: string, meta?: Record<string, unknown>): void;
}

export interface EnvManagerOptions {
  /** Single path to a .env file */
  readonly envPath?: string;
  /** Multiple paths to .env files (loaded in order) */
  readonly envPaths?: readonly string[];
  /** If true, later files override earlier ones (dotenvx overload mode) */
  readonly overload?: boolean;
  /** Manual key-value overrides (highest priority) */
  readonly overrides?: Readonly<Record<string, string>>;
  /** If true, extends process.env with helper methods (default: true) */
  readonly extendProcessEnv?: boolean;
  /**
   * Private key for decrypting encrypted .env values.
   * If not provided, will attempt to use DOTENV_PRIVATE_KEY from environment.
   */
  readonly privateKey?: string;
  /**
   * Path to .env.keys file containing private keys.
   * Defaults to ".env.keys" in the current directory.
   */
  readonly keysPath?: string;
  /**
   * If true, reads directly from process.env on each access instead of using cache.
   * Useful when environment variables may change at runtime.
   * Default: false (uses cache for better performance)
   *
   * Note: When dynamic mode is enabled:
   * - Performance is slightly reduced due to direct process.env access
   * - isEncrypted() and getRawValue() still use the raw cache from initial load
   * - Use refresh() to update the raw cache if needed
   */
  readonly dynamic?: boolean;
  /**
   * Optional logger adapter for structured logging.
   * If not provided, logs to stderr using console-style output.
   *
   * @example
   * ```typescript
   * EnvManager.bootstrap({
   *   logger: {
   *     info: (msg, meta) => myLogger.info(msg, meta),
   *     warn: (msg, meta) => myLogger.warn(msg, meta),
   *     error: (msg, meta) => myLogger.error(msg, meta),
   *   }
   * });
   * ```
   */
  readonly logger?: EnvLoggerAdapter;
}

export interface IEnvManager {
  // ============================================
  // Standard getters with defaults
  // ============================================
  getString(key: string, defaultValue?: string): string;
  getNumber(key: string, defaultValue?: number): number;
  getBoolean(key: string, defaultValue?: boolean): boolean;

  // ============================================
  // Required getters (throw if missing)
  // ============================================
  getRequired(key: string, errorMessage?: string): string;
  getRequiredString(key: string, errorMessage?: string): string;
  getRequiredNumber(key: string, errorMessage?: string): number;
  getRequiredBoolean(key: string, errorMessage?: string): boolean;

  // ============================================
  // Strict getters (throw if missing or invalid)
  // @deprecated Use getRequired* methods instead
  // ============================================
  /** @deprecated Use getRequired() instead */
  getStringStrict(key: string, errorMessage?: string): string;
  /** @deprecated Use getRequiredNumber() instead */
  getNumberStrict(key: string, errorMessage?: string): number;
  /** @deprecated Use getRequiredBoolean() instead */
  getBooleanStrict(key: string, errorMessage?: string): boolean;

  // ============================================
  // Array and JSON getters
  // ============================================
  /**
   * Get an array from a comma-separated environment variable.
   * @param key - The environment variable name
   * @param defaultValue - Default array if not set (default: [])
   * @param separator - Separator character (default: ",")
   */
  getArray(key: string, defaultValue?: string[], separator?: string): string[];

  /**
   * Get a parsed JSON value from an environment variable.
   * @param key - The environment variable name
   * @param defaultValue - Default value if not set or invalid JSON
   * @throws {EnvParseError} If value is set but not valid JSON (when no default provided)
   */
  getJson<T = unknown>(key: string, defaultValue?: T): T;

  /**
   * Get a required JSON value from an environment variable.
   * @param key - The environment variable name
   * @param errorMessage - Optional custom error message
   * @throws {MissingEnvError} If the variable is not set
   * @throws {EnvParseError} If the value is not valid JSON
   */
  getRequiredJson<T = unknown>(key: string, errorMessage?: string): T;

  // ============================================
  // Validated getters
  // ============================================
  /**
   * Get a string environment variable with custom validation.
   * @param key - The environment variable name
   * @param validator - Validation function that returns true if valid, or an error message string
   * @param defaultValue - Default value if not set
   * @throws {EnvValidationError} If validation fails
   */
  getValidatedString(
    key: string,
    validator: (value: string) => boolean | string,
    defaultValue?: string
  ): string;

  /**
   * Get a number environment variable with custom validation.
   * @param key - The environment variable name
   * @param validator - Validation function that returns true if valid, or an error message string
   * @param defaultValue - Default value if not set
   * @throws {EnvValidationError} If validation fails
   */
  getValidatedNumber(
    key: string,
    validator: (value: number) => boolean | string,
    defaultValue?: number
  ): number;

  // ============================================
  // Utility methods
  // ============================================
  has(key: string): boolean;
  getValue(key: string): string | undefined;
  getValueOrDefault(key: string, defaultValue: string): string;

  // ============================================
  // Environment detection
  // ============================================
  getEnvironment(): string;
  getNodeEnv(): string;
  isProduction(): boolean;
  isDevelopment(): boolean;
  isTest(): boolean;

  // ============================================
  // Encryption methods
  // ============================================
  isEncrypted(key: string): boolean;
  getDecrypted(key: string, privateKey?: string): string;
  parseEncrypted(encryptedValue: string, privateKey: string): string;
  getRawValue(key: string): string | undefined;
  getPrivateKey(): string | undefined;
  hasPrivateKey(): boolean;

  // ============================================
  // Cache management
  // ============================================
  isDynamic(): boolean;
  refresh(): void;
  getCacheSize(): number;
}

export class EnvManager implements IEnvManager {
  private static instance: EnvManager | null = null;
  private static bootstrapped = false;
  private static logger: EnvLoggerAdapter | null = null;

  private readonly envCache: Map<string, string>;
  private readonly rawCache: Map<string, string>;
  private readonly privateKey: string | undefined;
  private readonly dynamic: boolean;
  private readonly options: EnvManagerOptions | undefined;

  private constructor(options?: EnvManagerOptions) {
    this.envCache = new Map<string, string>();
    this.rawCache = new Map<string, string>();
    this.privateKey = options?.privateKey ?? process.env[ENV_KEY.DOTENV_PRIVATE_KEY];
    this.dynamic = options?.dynamic ?? false;
    this.options = options;
    this.loadEnvFiles(options);
    this.snapshotProcessEnv();
    this.applyOverrides(options?.overrides);
  }

  /**
   * Default logger that writes to stderr (backward compatible behavior)
   */
  private static defaultLog(_level: "info" | "warn" | "error", message: string): void {
    process.stderr.write(`${LOG_PREFIX.ENV_MANAGER} ${message}\n`);
  }

  /**
   * Log a message using the configured logger or default stderr output
   */
  private static log(
    level: "info" | "warn" | "error",
    message: string,
    meta?: Record<string, unknown>
  ): void {
    if (EnvManager.logger) {
      EnvManager.logger[level](message, meta);
    } else {
      EnvManager.defaultLog(level, message);
    }
  }

  /**
   * Set a custom logger adapter for structured logging.
   * Call this before bootstrap() to capture all log messages.
   */
  public static setLogger(logger: EnvLoggerAdapter | null): void {
    EnvManager.logger = logger;
  }

  /**
   * Get the current logger adapter (or null if using default)
   */
  public static getLogger(): EnvLoggerAdapter | null {
    return EnvManager.logger;
  }

  public static bootstrap(options?: EnvManagerOptions | readonly string[]): void {
    if (EnvManager.bootstrapped) {
      return;
    }

    // Support legacy array signature for backward compatibility
    const config: EnvManagerOptions = Array.isArray(options)
      ? { envPaths: options }
      : ((options as EnvManagerOptions | undefined) ?? {});

    // Set logger if provided in options
    if (config.logger) {
      EnvManager.logger = config.logger;
    }

    const paths = config.envPaths ?? (config.envPath ? [config.envPath] : DEFAULT_ENV_PATHS);
    const overload = config.overload ?? false;

    for (const envPath of paths) {
      const result: DotenvxConfigOutput = dotenvx.config({
        path: envPath,
        quiet: true,
        overload,
      });
      if (result.parsed && Object.keys(result.parsed).length > 0) {
        EnvManager.log("info", `Loaded: ${envPath}`, {
          path: envPath,
          count: Object.keys(result.parsed).length,
        });
      }
    }

    if (config.overrides) {
      for (const [key, value] of Object.entries(config.overrides)) {
        process.env[key] = value;
      }
    }

    if (config.extendProcessEnv !== false) {
      EnvManager.extendProcessEnvPrototype();
    }

    EnvManager.bootstrapped = true;
  }

  public static isBootstrapped(): boolean {
    return EnvManager.bootstrapped;
  }

  public static resetBootstrap(): void {
    EnvManager.bootstrapped = false;
  }

  public static getInstance(options?: EnvManagerOptions): EnvManager {
    if (EnvManager.instance) {
      return EnvManager.instance;
    }

    EnvManager.instance = new EnvManager(options);
    return EnvManager.instance;
  }

  public static resetInstance(): void {
    EnvManager.instance = null;
  }

  /**
   * Extend process.env with helper methods.
   *
   * @deprecated This method mutates the global process.env object, which can cause
   * issues with testing and module isolation. Use the `Env` class instead:
   *
   * ```typescript
   * // Instead of:
   * extendProcessEnvPrototype();
   * process.env.getString("KEY");
   *
   * // Use:
   * import { Env } from "@simpill/env.utils";
   * Env.getString("KEY");
   * ```
   */
  public static extendProcessEnvPrototype(): void {
    Object.assign(process.env, {
      // Standard getters with defaults
      getString: (key: string, defaultValue = ""): string => {
        return EnvManager.getInstance().getString(key, defaultValue);
      },
      getNumber: (key: string, defaultValue = 0): number => {
        return EnvManager.getInstance().getNumber(key, defaultValue);
      },
      getBoolean: (key: string, defaultValue = false): boolean => {
        return EnvManager.getInstance().getBoolean(key, defaultValue);
      },

      // Required getters (throw if missing)
      getRequired: (key: string, errorMessage?: string): string => {
        return EnvManager.getInstance().getRequired(key, errorMessage);
      },
      getRequiredString: (key: string, errorMessage?: string): string => {
        return EnvManager.getInstance().getRequiredString(key, errorMessage);
      },
      getRequiredNumber: (key: string, errorMessage?: string): number => {
        return EnvManager.getInstance().getRequiredNumber(key, errorMessage);
      },
      getRequiredBoolean: (key: string, errorMessage?: string): boolean => {
        return EnvManager.getInstance().getRequiredBoolean(key, errorMessage);
      },

      // Utility methods
      has: (key: string): boolean => {
        return EnvManager.getInstance().has(key);
      },
      isEncrypted: (key: string): boolean => {
        return EnvManager.getInstance().isEncrypted(key);
      },
      getDecrypted: (key: string, privateKey?: string): string => {
        return EnvManager.getInstance().getDecrypted(key, privateKey);
      },
    });
  }

  /**
   * Get the current NODE_ENV value.
   * In dynamic mode, reads from process.env directly.
   */
  public getEnvironment(): string {
    return this.getValue(ENV_KEY.NODE_ENV) ?? NODE_ENV.DEVELOPMENT;
  }

  public isProduction(): boolean {
    return this.getEnvironment() === NODE_ENV.PRODUCTION;
  }

  public isDevelopment(): boolean {
    return this.getEnvironment() === NODE_ENV.DEVELOPMENT;
  }

  public isTest(): boolean {
    return this.getEnvironment() === NODE_ENV.TEST;
  }

  public getNodeEnv(): string {
    return this.getEnvironment();
  }

  /**
   * Check if dynamic mode is enabled.
   * When true, values are read directly from process.env on each access.
   */
  public isDynamic(): boolean {
    return this.dynamic;
  }

  /**
   * Refresh the internal caches from process.env.
   * Useful when environment variables have changed at runtime and you want
   * to update the cache without recreating the instance.
   *
   * This method:
   * - Clears and repopulates envCache from process.env
   * - Clears and repopulates rawCache from process.env
   * - Reloads any configured .env files
   * - Reapplies any configured overrides
   */
  public refresh(): void {
    this.envCache.clear();
    this.rawCache.clear();
    this.loadEnvFiles(this.options);
    this.snapshotProcessEnv();
    this.applyOverrides(this.options?.overrides);
  }

  /**
   * Get the current cache size (for debugging/testing).
   * Returns the number of entries in the environment cache.
   */
  public getCacheSize(): number {
    return this.envCache.size;
  }

  /**
   * Check if an environment variable exists.
   * In dynamic mode, checks process.env directly.
   */
  public has(key: string): boolean {
    if (this.dynamic) {
      return process.env[key] !== undefined;
    }
    return this.envCache.has(key);
  }

  /**
   * Get the value of an environment variable.
   * In dynamic mode, reads from process.env directly.
   */
  public getValue(key: string): string | undefined {
    if (this.dynamic) {
      return process.env[key];
    }
    return this.envCache.get(key);
  }

  /**
   * Get the value of an environment variable or a default value.
   * In dynamic mode, reads from process.env directly.
   */
  public getValueOrDefault(key: string, defaultValue: string): string {
    const rawValue: string | undefined = this.getValue(key);
    return rawValue ?? defaultValue;
  }

  public getString(key: string, defaultValue = ""): string {
    return this.getValueOrDefault(key, defaultValue);
  }

  /**
   * Get a required string environment variable.
   * @param key - The environment variable name
   * @param errorMessage - Optional custom error message (default: "Required environment variable "${key}" is not set")
   * @throws {MissingEnvError} If the variable is not set
   */
  public getRequired(key: string, errorMessage?: string): string {
    const value = this.getValue(key);
    if (value === undefined) {
      throw new MissingEnvError(key, errorMessage);
    }
    return value;
  }

  /**
   * Get a required string environment variable.
   * Alias for getRequired().
   * @param key - The environment variable name
   * @param errorMessage - Optional custom error message
   * @throws {MissingEnvError} If the variable is not set
   */
  public getRequiredString(key: string, errorMessage?: string): string {
    return this.getRequired(key, errorMessage);
  }

  /**
   * Get a required string environment variable.
   * @deprecated Use getRequired() instead
   * @param key - The environment variable name
   * @param errorMessage - Optional custom error message
   * @throws {MissingEnvError} If the variable is not set
   */
  public getStringStrict(key: string, errorMessage?: string): string {
    return this.getRequired(key, errorMessage);
  }

  public getNumber(key: string, defaultValue = 0): number {
    const rawValue: string | undefined = this.getValue(key);
    if (rawValue === undefined) {
      return defaultValue;
    }

    return parseNumberEnvValue(rawValue, defaultValue);
  }

  /**
   * Get a number environment variable, throwing if missing or invalid.
   * @deprecated Use getRequiredNumber() instead
   * @param key - The environment variable name
   * @param errorMessage - Optional custom error message for missing variable
   * @throws {MissingEnvError} If the variable is not set
   * @throws {EnvParseError} If the value cannot be parsed as a number
   */
  public getNumberStrict(key: string, errorMessage?: string): number {
    const rawValue: string | undefined = this.getValue(key);
    if (rawValue === undefined) {
      throw new MissingEnvError(key, errorMessage);
    }

    return parseNumberEnvValueStrict(key, rawValue);
  }

  /**
   * Get a required number environment variable.
   * Alias for getNumberStrict().
   * @param key - The environment variable name
   * @param errorMessage - Optional custom error message for missing variable
   * @throws {MissingEnvError} If the variable is not set
   * @throws {EnvParseError} If the value cannot be parsed as a number
   */
  public getRequiredNumber(key: string, errorMessage?: string): number {
    return this.getNumberStrict(key, errorMessage);
  }

  public getBoolean(key: string, defaultValue = false): boolean {
    const rawValue: string | undefined = this.getValue(key);
    if (rawValue === undefined) {
      return defaultValue;
    }

    return parseBooleanEnvValue(rawValue, defaultValue);
  }

  /**
   * Get a boolean environment variable, throwing if missing or invalid.
   * @deprecated Use getRequiredBoolean() instead
   * @param key - The environment variable name
   * @param errorMessage - Optional custom error message for missing variable
   * @throws {MissingEnvError} If the variable is not set
   * @throws {EnvParseError} If the value cannot be parsed as a boolean
   */
  public getBooleanStrict(key: string, errorMessage?: string): boolean {
    const rawValue: string | undefined = this.getValue(key);
    if (rawValue === undefined) {
      throw new MissingEnvError(key, errorMessage);
    }

    return parseBooleanEnvValueStrict(key, rawValue);
  }

  /**
   * Get a required boolean environment variable.
   * @param key - The environment variable name
   * @param errorMessage - Optional custom error message for missing variable
   * @throws {MissingEnvError} If the variable is not set
   * @throws {EnvParseError} If the value cannot be parsed as a boolean
   */
  public getRequiredBoolean(key: string, errorMessage?: string): boolean {
    return this.getBooleanStrict(key, errorMessage);
  }

  // ============================================
  // Array and JSON getters
  // ============================================

  /**
   * Default separator for array parsing
   */
  private static readonly defaultArraySeparator = ",";

  /**
   * Get an array from a comma-separated environment variable.
   * Empty strings are filtered out, and values are trimmed.
   *
   * @param key - The environment variable name
   * @param defaultValue - Default array if not set (default: [])
   * @param separator - Separator character (default: ",")
   *
   * @example
   * ```typescript
   * // ALLOWED_HOSTS=localhost,example.com,api.example.com
   * env.getArray("ALLOWED_HOSTS") // ["localhost", "example.com", "api.example.com"]
   *
   * // PORTS=8080:8081:8082
   * env.getArray("PORTS", [], ":") // ["8080", "8081", "8082"]
   * ```
   */
  public getArray(
    key: string,
    defaultValue: string[] = [],
    separator: string = EnvManager.defaultArraySeparator
  ): string[] {
    const rawValue = this.getValue(key);
    if (rawValue === undefined || rawValue === "") {
      return defaultValue;
    }

    return rawValue
      .split(separator)
      .map((item) => item.trim())
      .filter((item) => item !== "");
  }

  /**
   * Get a parsed JSON value from an environment variable.
   *
   * @param key - The environment variable name
   * @param defaultValue - Default value if not set or invalid JSON
   * @returns The parsed JSON value, or defaultValue if not set/invalid
   *
   * @example
   * ```typescript
   * // CONFIG={"host":"localhost","port":3000}
   * env.getJson<{host: string; port: number}>("CONFIG")
   * // { host: "localhost", port: 3000 }
   * ```
   */
  public getJson<T = unknown>(key: string, defaultValue?: T): T {
    const rawValue = this.getValue(key);
    if (rawValue === undefined || rawValue === "") {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      // Return undefined cast to T when no default - caller expects T | undefined pattern
      return undefined as T;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new EnvParseError(key, rawValue, ENV_PARSE_TYPE.JSON);
    }
  }

  /**
   * Get a required JSON value from an environment variable.
   *
   * @param key - The environment variable name
   * @param errorMessage - Optional custom error message
   * @throws {MissingEnvError} If the variable is not set
   * @throws {EnvParseError} If the value is not valid JSON
   *
   * @example
   * ```typescript
   * // DATABASE_CONFIG={"host":"db.example.com","port":5432}
   * const config = env.getRequiredJson<DatabaseConfig>("DATABASE_CONFIG");
   * ```
   */
  public getRequiredJson<T = unknown>(key: string, errorMessage?: string): T {
    const rawValue = this.getValue(key);
    if (rawValue === undefined || rawValue === "") {
      throw new MissingEnvError(key, errorMessage);
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      throw new EnvParseError(key, rawValue, ENV_PARSE_TYPE.JSON);
    }
  }

  // ============================================
  // Validated getters
  // ============================================

  /**
   * Get a string environment variable with custom validation.
   *
   * @param key - The environment variable name
   * @param validator - Function that returns true if valid, or an error message string if invalid
   * @param defaultValue - Default value if not set (default: "")
   * @throws {EnvValidationError} If the value fails validation
   *
   * @example
   * ```typescript
   * // Validate URL format
   * const apiUrl = env.getValidatedString(
   *   "API_URL",
   *   (v) => v.startsWith("https://") || "API_URL must use HTTPS",
   *   "https://api.example.com"
   * );
   *
   * // Validate allowed values
   * const logLevel = env.getValidatedString(
   *   "LOG_LEVEL",
   *   (v) => ["debug", "info", "warn", "error"].includes(v) || "Invalid log level"
   * );
   * ```
   */
  public getValidatedString(
    key: string,
    validator: (value: string) => boolean | string,
    defaultValue = ""
  ): string {
    const value = this.getString(key, defaultValue);
    const result = validator(value);

    if (result === true) {
      return value;
    }

    const reason = typeof result === "string" ? result : ENV_ERROR_MESSAGE.VALIDATION_FAILED;
    throw new EnvValidationError(key, value, reason);
  }

  /**
   * Get a number environment variable with custom validation.
   *
   * @param key - The environment variable name
   * @param validator - Function that returns true if valid, or an error message string if invalid
   * @param defaultValue - Default value if not set (default: 0)
   * @throws {EnvValidationError} If the value fails validation
   *
   * @example
   * ```typescript
   * // Validate port range
   * const port = env.getValidatedNumber(
   *   "PORT",
   *   (v) => (v >= 1 && v <= 65535) || "PORT must be between 1 and 65535",
   *   3000
   * );
   *
   * // Validate positive number
   * const timeout = env.getValidatedNumber(
   *   "TIMEOUT_MS",
   *   (v) => v > 0 || "TIMEOUT_MS must be positive"
   * );
   * ```
   */
  public getValidatedNumber(
    key: string,
    validator: (value: number) => boolean | string,
    defaultValue = 0
  ): number {
    const value = this.getNumber(key, defaultValue);
    const result = validator(value);

    if (result === true) {
      return value;
    }

    const reason = typeof result === "string" ? result : ENV_ERROR_MESSAGE.VALIDATION_FAILED;
    throw new EnvValidationError(key, value, reason);
  }

  /**
   * Check if an environment variable value is encrypted.
   * Returns true if the raw value starts with "encrypted:" prefix.
   */
  public isEncrypted(key: string): boolean {
    const rawValue = this.rawCache.get(key);
    if (rawValue === undefined) {
      return false;
    }
    return rawValue.startsWith(ENCRYPTED_VALUE_PREFIX);
  }

  /**
   * Get the raw (potentially encrypted) value of an environment variable.
   * Useful for debugging or when you need to see the original encrypted value.
   */
  public getRawValue(key: string): string | undefined {
    return this.rawCache.get(key);
  }

  /**
   * Get a decrypted environment variable value.
   * If the value is not encrypted, returns the plain value.
   * @param key - The environment variable key
   * @param privateKey - Optional private key to use for decryption (overrides instance key)
   * @throws {MissingEnvError} If the variable is not set
   * @throws {EnvDecryptError} If decryption fails
   */
  public getDecrypted(key: string, privateKey?: string): string {
    const rawValue = this.rawCache.get(key);
    if (rawValue === undefined) {
      throw new MissingEnvError(key);
    }

    // If not encrypted, return the cached (already decrypted or plain) value
    if (!rawValue.startsWith(ENCRYPTED_VALUE_PREFIX)) {
      return this.envCache.get(key) ?? rawValue;
    }

    // Use provided key, instance key, or env key
    const keyToUse = privateKey ?? this.privateKey;
    if (!keyToUse) {
      throw new EnvDecryptError(key, ENV_ERROR_MESSAGE.NO_PRIVATE_KEY);
    }

    return this.parseEncrypted(rawValue, keyToUse);
  }

  /**
   * Parse and decrypt an encrypted value string.
   * @param encryptedValue - The encrypted value (must start with "encrypted:")
   * @param privateKey - The private key to use for decryption
   * @throws {EnvDecryptError} If decryption fails or value is not encrypted
   */
  public parseEncrypted(encryptedValue: string, privateKey: string): string {
    if (!encryptedValue.startsWith(ENCRYPTED_VALUE_PREFIX)) {
      throw new EnvDecryptError(DOTENVX_INTERNAL.INLINE_KEY, ENV_ERROR_MESSAGE.NOT_ENCRYPTED);
    }

    try {
      // Use dotenvx.parse with privateKey option to decrypt
      // We create a temporary env string with a known key
      const envString = `${DOTENVX_INTERNAL.TEMP_DECRYPT_KEY}=${encryptedValue}`;
      const result: DotenvxParseOutput = dotenvx.parse(envString, { privateKey });

      const decryptedValue = result[DOTENVX_INTERNAL.TEMP_DECRYPT_KEY];

      // If the value still starts with "encrypted:", decryption failed
      if (decryptedValue?.startsWith(ENCRYPTED_VALUE_PREFIX)) {
        throw new EnvDecryptError(DOTENVX_INTERNAL.INLINE_KEY, ENV_ERROR_MESSAGE.DECRYPTION_FAILED);
      }

      return decryptedValue ?? "";
    } catch (error) {
      if (error instanceof EnvDecryptError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new EnvDecryptError(DOTENVX_INTERNAL.INLINE_KEY, message);
    }
  }

  /**
   * Get the configured private key for this instance.
   * Returns undefined if no private key is configured.
   */
  public getPrivateKey(): string | undefined {
    return this.privateKey;
  }

  /**
   * Check if a private key is available for decryption.
   */
  public hasPrivateKey(): boolean {
    return this.privateKey !== undefined && this.privateKey.length > 0;
  }

  private loadEnvFiles(options?: EnvManagerOptions): void {
    const envPaths: readonly string[] = this.determineEnvPaths(options);
    const overload = options?.overload ?? false;

    for (const envPath of envPaths) {
      const result: DotenvxConfigOutput = dotenvx.config({
        path: envPath,
        quiet: true,
        overload,
      });
      if (!result.parsed || Object.keys(result.parsed).length === 0) {
        continue;
      }
      for (const [key, value] of Object.entries(result.parsed)) {
        // Store the raw value before dotenvx decryption for isEncrypted checks
        this.rawCache.set(key, value);
        // dotenvx.config() automatically decrypts if DOTENV_PRIVATE_KEY is available
        this.envCache.set(key, value);
      }
    }
  }

  private applyOverrides(overrides?: Readonly<Record<string, string>>): void {
    if (!overrides) {
      return;
    }
    for (const [key, value] of Object.entries(overrides)) {
      this.envCache.set(key, value);
    }
  }

  private snapshotProcessEnv(): void {
    for (const [key, value] of Object.entries(process.env)) {
      if (value === undefined) {
        continue;
      }
      // Store raw value if not already stored from file loading
      if (!this.rawCache.has(key)) {
        this.rawCache.set(key, value);
      }
      this.envCache.set(key, value);
    }
  }

  private determineEnvPaths(options?: EnvManagerOptions): readonly string[] {
    if (options?.envPaths && options.envPaths.length > 0) {
      return options.envPaths;
    }

    if (options?.envPath) {
      return [options.envPath];
    }

    return DEFAULT_ENV_PATHS;
  }
}

/**
 * Shorthand utility class for accessing environment variables
 *
 * Provides static methods that use the singleton EnvManager instance,
 * eliminating the need to call `EnvManager.getInstance()` every time.
 *
 * @example
 * ```typescript
 * // Static shorthand - clean and concise
 * const port = Env.getNumber("PORT", 3000);
 * const debug = Env.getBoolean("DEBUG", false);
 * const apiKey = Env.getRequired("API_KEY");
 *
 * // Check environment
 * if (Env.isProduction()) {
 *   // Production-specific logic
 * }
 *
 * // Equivalent to the longer form:
 * const env = EnvManager.getInstance();
 * const port = env.getNumber("PORT", 3000);
 * ```
 */
export class Env {
  // ============================================
  // Standard getters with defaults
  // ============================================

  /**
   * Get a string environment variable
   * @example Env.getString("API_URL", "http://localhost:3000")
   */
  public static getString(key: string, defaultValue = ""): string {
    return EnvManager.getInstance().getString(key, defaultValue);
  }

  /**
   * Get a number environment variable
   * @example Env.getNumber("PORT", 3000)
   */
  public static getNumber(key: string, defaultValue = 0): number {
    return EnvManager.getInstance().getNumber(key, defaultValue);
  }

  /**
   * Get a boolean environment variable
   * @example Env.getBoolean("DEBUG", false)
   */
  public static getBoolean(key: string, defaultValue = false): boolean {
    return EnvManager.getInstance().getBoolean(key, defaultValue);
  }

  // ============================================
  // Required getters (throw if missing)
  // ============================================

  /**
   * Get a required string environment variable (throws MissingEnvError if not set)
   * @example Env.getRequired("API_KEY")
   */
  public static getRequired(key: string, errorMessage?: string): string {
    return EnvManager.getInstance().getRequired(key, errorMessage);
  }

  /**
   * Get a required string environment variable (alias for getRequired)
   * @example Env.getRequiredString("API_KEY")
   */
  public static getRequiredString(key: string, errorMessage?: string): string {
    return EnvManager.getInstance().getRequiredString(key, errorMessage);
  }

  /**
   * Get a required number environment variable (throws if missing or invalid)
   * @example Env.getRequiredNumber("PORT")
   */
  public static getRequiredNumber(key: string, errorMessage?: string): number {
    return EnvManager.getInstance().getRequiredNumber(key, errorMessage);
  }

  /**
   * Get a required boolean environment variable (throws if missing or invalid)
   * @example Env.getRequiredBoolean("ENABLE_FEATURE")
   */
  public static getRequiredBoolean(key: string, errorMessage?: string): boolean {
    return EnvManager.getInstance().getRequiredBoolean(key, errorMessage);
  }

  // ============================================
  // Strict getters (deprecated - use getRequired* instead)
  // ============================================

  /**
   * @deprecated Use getRequired() instead
   */
  public static getStringStrict(key: string, errorMessage?: string): string {
    return EnvManager.getInstance().getStringStrict(key, errorMessage);
  }

  /**
   * @deprecated Use getRequiredNumber() instead
   */
  public static getNumberStrict(key: string, errorMessage?: string): number {
    return EnvManager.getInstance().getNumberStrict(key, errorMessage);
  }

  /**
   * @deprecated Use getRequiredBoolean() instead
   */
  public static getBooleanStrict(key: string, errorMessage?: string): boolean {
    return EnvManager.getInstance().getBooleanStrict(key, errorMessage);
  }

  // ============================================
  // Array and JSON getters
  // ============================================

  /**
   * Get an array from a comma-separated environment variable
   * @example Env.getArray("ALLOWED_HOSTS") // ["localhost", "example.com"]
   */
  public static getArray(key: string, defaultValue: string[] = [], separator = ","): string[] {
    return EnvManager.getInstance().getArray(key, defaultValue, separator);
  }

  /**
   * Get a parsed JSON value from an environment variable
   * @example Env.getJson<Config>("CONFIG")
   */
  public static getJson<T = unknown>(key: string, defaultValue?: T): T {
    return EnvManager.getInstance().getJson(key, defaultValue);
  }

  /**
   * Get a required JSON value (throws if missing or invalid)
   * @example Env.getRequiredJson<Config>("CONFIG")
   */
  public static getRequiredJson<T = unknown>(key: string, errorMessage?: string): T {
    return EnvManager.getInstance().getRequiredJson(key, errorMessage);
  }

  // ============================================
  // Validated getters
  // ============================================

  /**
   * Get a string with custom validation
   * @example Env.getValidatedString("URL", (v) => v.startsWith("https://") || "Must use HTTPS")
   */
  public static getValidatedString(
    key: string,
    validator: (value: string) => boolean | string,
    defaultValue = ""
  ): string {
    return EnvManager.getInstance().getValidatedString(key, validator, defaultValue);
  }

  /**
   * Get a number with custom validation
   * @example Env.getValidatedNumber("PORT", (v) => v >= 1 && v <= 65535 || "Invalid port")
   */
  public static getValidatedNumber(
    key: string,
    validator: (value: number) => boolean | string,
    defaultValue = 0
  ): number {
    return EnvManager.getInstance().getValidatedNumber(key, validator, defaultValue);
  }

  // ============================================
  // Utility methods
  // ============================================

  /**
   * Check if an environment variable exists
   * @example if (Env.has("API_KEY")) { ... }
   */
  public static has(key: string): boolean {
    return EnvManager.getInstance().has(key);
  }

  /**
   * Get raw value (undefined if not set)
   * @example const value = Env.getValue("API_KEY")
   */
  public static getValue(key: string): string | undefined {
    return EnvManager.getInstance().getValue(key);
  }

  /**
   * Get value with fallback default
   * @example const value = Env.getValueOrDefault("API_KEY", "default")
   */
  public static getValueOrDefault(key: string, defaultValue: string): string {
    return EnvManager.getInstance().getValueOrDefault(key, defaultValue);
  }

  // ============================================
  // Environment checks
  // ============================================

  /**
   * Check if running in production (NODE_ENV === "production")
   * @example if (Env.isProduction()) { ... }
   */
  public static isProduction(): boolean {
    return EnvManager.getInstance().isProduction();
  }

  /**
   * Check if running in development (NODE_ENV === "development")
   * @example if (Env.isDevelopment()) { ... }
   */
  public static isDevelopment(): boolean {
    return EnvManager.getInstance().isDevelopment();
  }

  /**
   * Check if running in test (NODE_ENV === "test")
   * @example if (Env.isTest()) { ... }
   */
  public static isTest(): boolean {
    return EnvManager.getInstance().isTest();
  }

  /**
   * Get the current NODE_ENV value
   * @example const nodeEnv = Env.getNodeEnv()
   */
  public static getNodeEnv(): string {
    return EnvManager.getInstance().getNodeEnv();
  }

  // ============================================
  // Encryption methods
  // ============================================

  /**
   * Check if a value is encrypted (starts with "encrypted:")
   * @example if (Env.isEncrypted("API_SECRET")) { ... }
   */
  public static isEncrypted(key: string): boolean {
    return EnvManager.getInstance().isEncrypted(key);
  }

  /**
   * Get and decrypt an encrypted environment variable
   * @example const secret = Env.getDecrypted("API_SECRET")
   */
  public static getDecrypted(key: string, privateKey?: string): string {
    return EnvManager.getInstance().getDecrypted(key, privateKey);
  }

  /**
   * Check if a private key is available for decryption
   * @example if (Env.hasPrivateKey()) { ... }
   */
  public static hasPrivateKey(): boolean {
    return EnvManager.getInstance().hasPrivateKey();
  }

  // ============================================
  // Cache management
  // ============================================

  /**
   * Check if dynamic mode is enabled
   * @example if (Env.isDynamic()) { ... }
   */
  public static isDynamic(): boolean {
    return EnvManager.getInstance().isDynamic();
  }

  /**
   * Refresh the environment cache from process.env
   * @example Env.refresh()
   */
  public static refresh(): void {
    EnvManager.getInstance().refresh();
  }

  /**
   * Get the current cache size
   * @example const size = Env.getCacheSize()
   */
  public static getCacheSize(): number {
    return EnvManager.getInstance().getCacheSize();
  }

  // ============================================
  // Bootstrap shorthand
  // ============================================

  /**
   * Bootstrap the EnvManager (shorthand for EnvManager.bootstrap)
   * @example Env.bootstrap({ envPaths: [".env", ".env.local"] })
   */
  public static bootstrap(options?: EnvManagerOptions | readonly string[]): void {
    EnvManager.bootstrap(options);
  }

  /**
   * Reset the EnvManager instance (useful for testing)
   * @example Env.reset()
   */
  public static reset(): void {
    EnvManager.resetInstance();
  }
}

export { EnvDecryptError, EnvParseError, MissingEnvError } from "../shared/errors";

/**
 * Extend process.env with helper methods.
 *
 * @deprecated This function mutates the global process.env object, which can cause
 * issues with testing and module isolation. Use the `Env` class instead:
 *
 * ```typescript
 * // Instead of:
 * extendProcessEnvPrototype();
 * process.env.getString("KEY");
 *
 * // Use:
 * import { Env } from "@simpill/env.utils";
 * Env.getString("KEY");
 * ```
 */
export function extendProcessEnvPrototype(): void {
  EnvManager.extendProcessEnvPrototype();
}
