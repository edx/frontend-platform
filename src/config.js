/**
 * #### Import members from **@edx/frontend-platform**
 *
 * The configuration module provides utilities for working with an application's configuration
 * document (ConfigDocument).  This module uses `process.env` to import configuration variables
 * from the command-line build process.  It can be dynamically extended at run-time using a
 * `config` initialization handler.  Please see the Initialization documentation for more
 * information on handlers and initialization phases.
 *
 * ```
 * import { getConfig } from '@edx/frontend-platform';
 *
 * const {
 *   BASE_URL,
 *   LMS_BASE_URL,
 *   LOGIN_URL,
 *   LOGIN_URL,
 *   REFRESH_ACCESS_TOKEN_ENDPOINT,
 *   ACCESS_TOKEN_COOKIE_NAME,
 *   CSRF_TOKEN_API_PATH,
 * } = getConfig();
 * ```
 *
 * @module Config
 */

import { APP_CONFIG_INITIALIZED, CONFIG_CHANGED } from './constants';

import { publish, subscribe } from './pubSub';
import { ensureDefinedConfig } from './utils';

function extractRegex(envVar) {
  // Convert the environment variable string to a regex, while guarding
  // against a non-string and an empty/whitespace-only string.
  if (typeof envVar === 'string' && envVar.trim() !== '') {
    return new RegExp(envVar);
  }
  return undefined;
}

const ENVIRONMENT = process.env.NODE_ENV;
let config = {
  ACCESS_TOKEN_COOKIE_NAME: process.env.ACCESS_TOKEN_COOKIE_NAME,
  BASE_URL: process.env.BASE_URL,
  PUBLIC_PATH: process.env.PUBLIC_PATH || '/',
  CREDENTIALS_BASE_URL: process.env.CREDENTIALS_BASE_URL,
  CSRF_TOKEN_API_PATH: process.env.CSRF_TOKEN_API_PATH,
  DISCOVERY_API_BASE_URL: process.env.DISCOVERY_API_BASE_URL,
  PUBLISHER_BASE_URL: process.env.PUBLISHER_BASE_URL,
  ECOMMERCE_BASE_URL: process.env.ECOMMERCE_BASE_URL,
  ENVIRONMENT,
  IGNORED_ERROR_REGEX: extractRegex(process.env.IGNORED_ERROR_REGEX),
  LANGUAGE_PREFERENCE_COOKIE_NAME: process.env.LANGUAGE_PREFERENCE_COOKIE_NAME,
  LMS_BASE_URL: process.env.LMS_BASE_URL,
  LOGIN_URL: process.env.LOGIN_URL,
  LOGOUT_URL: process.env.LOGOUT_URL,
  STUDIO_BASE_URL: process.env.STUDIO_BASE_URL,
  MARKETING_SITE_BASE_URL: process.env.MARKETING_SITE_BASE_URL,
  ORDER_HISTORY_URL: process.env.ORDER_HISTORY_URL,
  REFRESH_ACCESS_TOKEN_ENDPOINT: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
  SECURE_COOKIES: ENVIRONMENT !== 'development',
  SEGMENT_KEY: process.env.SEGMENT_KEY,
  SITE_NAME: process.env.SITE_NAME,
  USER_INFO_COOKIE_NAME: process.env.USER_INFO_COOKIE_NAME,
  LOGO_URL: process.env.LOGO_URL,
  LOGO_TRADEMARK_URL: process.env.LOGO_TRADEMARK_URL,
  LOGO_WHITE_URL: process.env.LOGO_WHITE_URL,
  FAVICON_URL: process.env.FAVICON_URL,
  SHOULD_RETRY: process.env.SHOULD_RETRY,
};

/**
 * Getter for the application configuration document.  This is synchronous and merely returns a
 * reference to an existing object, and is thus safe to call as often as desired.  The document
 * should have the following keys at a minimum:
 *
 * @returns {ConfigDocument}
  */
export function getConfig() {
  return config;
}

/**
 * Replaces the existing ConfigDocument.  This is not commonly used, but can be helpful for tests.
 *
 * The supplied config document will be tested with `ensureDefinedConfig` to ensure it does not
 * have any `undefined` keys.
 *
 * @param {ConfigDocument} newConfig
 */
export function setConfig(newConfig) {
  ensureDefinedConfig(config, 'config');
  config = newConfig;
  publish(CONFIG_CHANGED);
}

/**
 * Merges additional configuration values into the ConfigDocument returned by `getConfig`.  Will
 * override any values that exist with the same keys.
 *
 * ```
 * mergeConfig({
 *   NEW_KEY: 'new value',
 *   OTHER_NEW_KEY: 'other new value',
 * });
 *
 * If any of the key values are `undefined`, an error will be logged to 'warn'.
 *
 * @param {Object} newConfig
 */
export function mergeConfig(newConfig) {
  ensureDefinedConfig(newConfig, 'ProcessEnvConfigService');
  config = Object.assign(config, newConfig);
  publish(CONFIG_CHANGED);
}

/**
 * A method allowing application code to indicate that particular ConfigDocument keys are required
 * for them to function.  This is useful for diagnosing development/deployment issues, primarily,
 * by surfacing misconfigurations early.  For instance, if the build process fails to supply an
 * environment variable on the command-line, it's possible that one of the `process.env` variables
 * will be undefined.  Should be used in conjunction with `mergeConfig` for custom `ConfigDocument`
 * properties.  Requester is for informational/error reporting purposes only.
 *
 * ```
 * ensureConfig(['LMS_BASE_URL', 'LOGIN_URL'], 'MySpecialComponent');
 *
 * // Will log a warning with:
 * // "App configuration error: LOGIN_URL is required by MySpecialComponent."
 * // if LOGIN_URL is undefined, for example.
 * ```
 *
 * *NOTE*: `ensureConfig` waits until `APP_CONFIG_INITIALIZED` is published to verify the existence
 * of the specified properties.  This means that this function is compatible with custom `config`
 * phase handlers responsible for loading additional configuration data in the initialization
 * sequence.
 *
 * @param {Array} keys
 * @param {string} [requester='unspecified application code']
 */
export function ensureConfig(keys, requester = 'unspecified application code') {
  subscribe(APP_CONFIG_INITIALIZED, () => {
    keys.forEach((key) => {
      if (config[key] === undefined) {
        // eslint-disable-next-line no-console
        console.warn(`App configuration error: ${key} is required by ${requester}.`);
      }
    });
  });
}

/**
 * An object describing the current application configuration.
 *
 * The implementation loads this document via `process.env` variables.
 *
 * ```
 * {
 *   BASE_URL: process.env.BASE_URL,
 *   // ... other vars
 * }
 * ```
 *
 * When using Webpack (i.e., normal usage), the build process is responsible for supplying these
 * variables via command-line environment variables.  That means they must be supplied at build
 * time.
 *
 * @name ConfigDocument
 * @memberof module:Config
 * @property {string} ACCESS_TOKEN_COOKIE_NAME
 * @property {string} BASE_URL The URL of the current application.
 * @property {string} CREDENTIALS_BASE_URL
 * @property {string} CSRF_TOKEN_API_PATH
 * @property {string} DISCOVERY_API_BASE_URL
 * @property {string} PUBLISHER_BASE_URL
 * @property {string} ECOMMERCE_BASE_URL
 * @property {string} ENVIRONMENT This is one of: development, production, or test.
 * @property {string} IGNORED_ERROR_REGEX
 * @property {string} LANGUAGE_PREFERENCE_COOKIE_NAME
 * @property {string} LMS_BASE_URL
 * @property {string} LOGIN_URL
 * @property {string} LOGOUT_URL
 * @property {string} STUDIO_BASE_URL
 * @property {string} MARKETING_SITE_BASE_URL
 * @property {string} ORDER_HISTORY_URL
 * @property {string} REFRESH_ACCESS_TOKEN_ENDPOINT
 * @property {boolean} SECURE_COOKIES
 * @property {string} SEGMENT_KEY
 * @property {string} SITE_NAME
 * @property {string} USER_INFO_COOKIE_NAME
 * @property {string} LOGO_URL
 * @property {string} LOGO_TRADEMARK_URL
 * @property {string} LOGO_WHITE_URL
 * @property {string} FAVICON_URL
 */
