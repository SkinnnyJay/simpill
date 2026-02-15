/** Shared (runtime-agnostic) logger utilities. */

export {
  ANSI_COLORS,
  type AnsiColor,
  BOOLEAN_FALSY_VALUES,
  type BooleanFalsyValue,
  BOOLEAN_TRUTHY_VALUES,
  type BooleanTruthyValue,
  BUFFERED_ADAPTER_DEFAULTS,
  ENV_KEYS,
  type EnvKey,
  ERROR_KEYS,
  ERROR_MESSAGES,
  type ErrorKey,
  type ErrorMessage,
  FILE_TRANSPORT_DEFAULTS,
  type FileTransportDefault,
  LOG_FORMAT_VALUES,
  LOG_LEVEL,
  LOG_LEVEL_LOWER,
  LOG_PREFIX,
  LOGGER_CONTEXT,
  LOGGER_DEFAULTS,
  type LogFormatValue,
  type LoggableLevel,
  type LoggerContext,
  type LogLevel,
  type LogLevelLower,
  type LogPrefix,
  METADATA_KEYS,
  type MetadataKey,
  OUTPUT_CHARS,
  type OutputChar,
} from "./constants";

export {
  type ErrorInfo,
  extractErrorInfo,
  isErrorLike,
  LOG_LEVEL_PRIORITY,
  type Log,
  type LogEntry,
  type LogFormatter,
  type Logger,
  type LoggerOptions,
  type LogMetadata,
  type LogWriter,
  normalizeErrorsInMetadata,
  shouldLog,
} from "./types";

export {
  isLoggerAdapter,
  type LoggerAdapter,
  type LoggerAdapterConfig,
} from "./adapter";

export {
  createFormatterContext,
  type FormattedOutput,
  type FormatterAdapter,
  type FormatterContext,
  formatWithAdapter,
  isFormatterAdapter,
  outputToString,
} from "./formatters";

export {
  createSimpleFormatter,
  defaultFormatter,
  jsonFormatterAdapter,
  minimalFormatter,
  SimpleFormatterAdapter,
  type SimpleFormatterConfig,
  verboseFormatter,
} from "./formatters";

export {
  COLORS,
  ColoredFormatterAdapter,
  type ColoredFormatterConfig,
  coloredFormatter,
  createColoredFormatter,
} from "./formatters";

export {
  createFormatter,
  type FormatterOptions,
  jsonFormatter,
  serializeMetadata,
  simpleFormatter,
  timestampFormatter,
} from "./formatters";

export { createSimpleAdapter, SimpleLoggerAdapter } from "./simple-adapter";

export {
  type BufferedAdapterConfig,
  BufferedLoggerAdapter,
  createBufferedAdapter,
} from "./buffered-adapter";

export {
  createFormatterFromEnv,
  ENV_DEFAULTS,
  type EnvLoggerConfig,
  envConfigToAdapterConfig,
  hasEnvConfig,
  loadAdapterConfigFromEnv,
  loadEnvConfig,
} from "./env.config";

export {
  clearLogContextProvider,
  getLogContext,
  hasLogContextProvider,
  type LogContext,
  type LogContextProvider,
  setLogContextProvider,
  withLogContext,
} from "./context";

export {
  clearLoggerCache,
  configureLogger,
  configureLoggerFactory,
  disableLoggerMock,
  enableLoggerMock,
  flushLogs,
  getLogger,
  getLoggerCacheSize,
  getRootLogger,
  isLoggerMockEnabled,
  LoggerFactory,
  resetLoggerFactory,
  setLoggerAdapter,
} from "./factory";
