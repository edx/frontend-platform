import axios from 'axios';
import PropTypes from 'prop-types';
import { logFrontendAuthError } from './utils';
import addAuthenticationToHttpClient from './addAuthenticationToHttpClient';
import getJwtToken from './getJwtToken';

// Singletons
let authenticatedHttpClient = null;
let config = null;

const configPropTypes = {
  appBaseUrl: PropTypes.string.isRequired,
  loginUrl: PropTypes.string.isRequired,
  logoutUrl: PropTypes.string.isRequired,
  refreshAccessTokenEndpoint: PropTypes.string.isRequired,
  accessTokenCookieName: PropTypes.string.isRequired,
  csrfTokenApiPath: PropTypes.string.isRequired,
  loggingService: PropTypes.shape({
    logError: PropTypes.func.isRequired,
    logInfo: PropTypes.func.isRequired,
  }).isRequired,
};

const validateConfig = (configObj) => {
  PropTypes.checkPropTypes(configPropTypes, configObj, 'config', 'Auth');

  Object.keys(configPropTypes)
    .filter(key => configObj[key] === undefined)
    .forEach((key) => {
      throw new Error(`Invalid configuration supplied to frontend auth. ${key} is required.`);
    });

  return configObj;
};

/**
 * Configures an httpClient to make authenticated http requests.
 *
 * @param {object} config
 * @param {string} [config.appBaseUrl]
 * @param {string} [config.loginUrl]
 * @param {string} [config.logoutUrl]
 * @param {object} [config.loggingService] requires logError and logInfo methods
 * @param {string} [config.refreshAccessTokenEndpoint]
 * @param {string} [config.accessTokenCookieName]
 * @param {string} [config.csrfTokenApiPath]
 */
const configure = (incomingConfig) => {
  config = validateConfig(incomingConfig);
  authenticatedHttpClient = addAuthenticationToHttpClient(axios.create(), config);
};

const getLoggingService = () => config.loggingService;

/**
 * Gets the apiClient singleton which is an axios instance.
 *
 * @returns {HttpClient} Singleton. A configured axios http client
 */
const getAuthenticatedHttpClient = () => authenticatedHttpClient;

/**
 * Gets the authenticated user's access token. Resolves to null if the user is
 * unauthenticated.
 *
 * @returns {Promise<UserData>|Promise<null>} Resolves to the user's access token if they are
 * logged in.
 */
const getAuthenticatedUser = async () => {
  const decodedAccessToken = await getJwtToken(
    config.accessTokenCookieName,
    config.refreshAccessTokenEndpoint,
  );

  if (decodedAccessToken !== null) {
    return {
      userId: decodedAccessToken.user_id,
      username: decodedAccessToken.preferred_username,
      roles: decodedAccessToken.roles || [],
      administrator: decodedAccessToken.administrator,
    };
  }

  return null;
};

/**
 * Redirect the user to login
 *
 * @param {string} redirectUrl the url to redirect to after login
 */
const redirectToLogin = (redirectUrl = config.appBaseUrl) => {
  global.location.assign(`${config.loginUrl}?next=${encodeURIComponent(redirectUrl)}`);
};

/**
 * Redirect the user to logout
 *
 * @param {string} redirectUrl the url to redirect to after logout
 */
const redirectToLogout = (redirectUrl = config.appBaseUrl) => {
  global.location.assign(`${config.logoutUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`);
};

/**
 * Ensures a user is authenticated. It will redirect to login when not
 * authenticated.
 *
 * @param {string} route to return user after login when not authenticated.
 * @returns {Promise<UserData>}
 */
const ensureAuthenticatedUser = async (route) => {
  const authenticatedUserData = await getAuthenticatedUser();

  if (authenticatedUserData === null) {
    const isRedirectFromLoginPage = global.document.referrer &&
      global.document.referrer.startsWith(config.loginUrl);

    if (isRedirectFromLoginPage) {
      const redirectLoopError = new Error('Redirect from login page. Rejecting to avoid infinite redirect loop.');
      logFrontendAuthError(redirectLoopError);
      throw redirectLoopError;
    }

    // The user is not authenticated, send them to the login page.
    redirectToLogin(config.appBaseUrl + route);
  }

  return authenticatedUserData;
};

export {
  configure,
  getLoggingService,
  getAuthenticatedHttpClient,
  ensureAuthenticatedUser,
  getAuthenticatedUser,
  redirectToLogin,
  redirectToLogout,
};

/**
 * A configured axios client. See axios docs for more
 * info https://github.com/axios/axios. All the functions
 * below accept isPublic and isCsrfExempt in the request
 * config options. Setting these to true will prevent this
 * client from attempting to refresh the jwt access token
 * or a csrf token respectively.
 *
 * ```
 *  // A public endpoint (no jwt token refresh)
 *  apiClient.get('/path/to/endpoint', { isPublic: true });
 * ```
 *
 * ```
 *  // A csrf exempt endpoint
 *  apiClient.post('/path/to/endpoint', { data }, { isCsrfExempt: true });
 * ```
 *
 * @typedef HttpClient
 * @property {function} get
 * @property {function} head
 * @property {function} options
 * @property {function} delete (csrf protected)
 * @property {function} post (csrf protected)
 * @property {function} put (csrf protected)
 * @property {function} patch (csrf protected)
  */

/**
 * @typedef UserData
 * @property {string} userId
 * @property {string} username
 * @property {array} roles
 * @property {bool} administrator
 */
