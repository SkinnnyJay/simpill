import { BOOLEAN_FALSY, BOOLEAN_TRUTHY, ENV_PARSE_TYPE } from "./constants";
import { EnvParseError } from "./errors";

export function parseNumberEnvValue(rawValue: string, defaultValue: number): number {
  if (rawValue === "") {
    return defaultValue;
  }
  const parsedValue: number = Number(rawValue);
  return Number.isNaN(parsedValue) ? defaultValue : parsedValue;
}

export function parseBooleanEnvValue(rawValue: string, defaultValue: boolean): boolean {
  if (rawValue === "") {
    return defaultValue;
  }
  const normalizedValue: string = rawValue.toLowerCase();
  if (normalizedValue === BOOLEAN_TRUTHY.TRUE || normalizedValue === BOOLEAN_TRUTHY.ONE) {
    return true;
  }
  if (normalizedValue === BOOLEAN_FALSY.FALSE || normalizedValue === BOOLEAN_FALSY.ZERO) {
    return false;
  }
  return defaultValue;
}

/** @throws {EnvParseError} If the value cannot be parsed as a number */
export function parseNumberEnvValueStrict(key: string, rawValue: string): number {
  if (rawValue === "") {
    throw new EnvParseError(key, rawValue, ENV_PARSE_TYPE.NUMBER);
  }
  const parsedValue: number = Number(rawValue);
  if (Number.isNaN(parsedValue)) {
    throw new EnvParseError(key, rawValue, ENV_PARSE_TYPE.NUMBER);
  }
  return parsedValue;
}

/** @throws {EnvParseError} If the value cannot be parsed as a boolean */
export function parseBooleanEnvValueStrict(key: string, rawValue: string): boolean {
  if (rawValue === "") {
    throw new EnvParseError(key, rawValue, ENV_PARSE_TYPE.BOOLEAN);
  }
  const normalizedValue: string = rawValue.toLowerCase();
  if (normalizedValue === BOOLEAN_TRUTHY.TRUE || normalizedValue === BOOLEAN_TRUTHY.ONE) {
    return true;
  }
  if (normalizedValue === BOOLEAN_FALSY.FALSE || normalizedValue === BOOLEAN_FALSY.ZERO) {
    return false;
  }
  throw new EnvParseError(key, rawValue, ENV_PARSE_TYPE.BOOLEAN);
}
