// API configuration for NotT frontend
// Centralized API settings with type safety

import { environment } from './environment';

// API configuration
export const apiConfig = {
  // Base configuration
  BASE_URL: environment.API_BASE_URL,
  TIMEOUT: environment.API_TIMEOUT,

  // Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      VERIFY: '/api/auth/verify',
    },

    // User management
    USER: {
      PROFILE: '/api/user/profile',
      UPDATE: '/api/user/update',
      DELETE: '/api/user/delete',
      STATS: '/api/user/stats',
    },

    // Game management
    GAME: {
      CREATE: '/api/game/create',
      JOIN: '/api/game/join',
      LEAVE: '/api/game/leave',
      LIST: '/api/game/list',
      DETAILS: '/api/game/:id',
      UPDATE: '/api/game/:id/update',
      DELETE: '/api/game/:id/delete',
    },

    // Game state
    STATE: {
      GET: '/api/game/:id/state',
      UPDATE: '/api/game/:id/state',
      EVENTS: '/api/game/:id/events',
    },

    // Player management
    PLAYER: {
      JOIN: '/api/game/:id/players/join',
      LEAVE: '/api/game/:id/players/leave',
      UPDATE: '/api/game/:id/players/:playerId',
      READY: '/api/game/:id/players/:playerId/ready',
    },

    // Game mechanics
    MECHANICS: {
      DICE_ROLL: '/api/game/:id/dice/roll',
      TEST: '/api/game/:id/test',
      STRIKE: '/api/game/:id/strike',
      CARD_DRAW: '/api/game/:id/cards/draw',
      CARD_PLAY: '/api/game/:id/cards/play',
    },

    // Real-time
    REALTIME: {
      CHAT: '/api/game/:id/chat',
      VOICE: '/api/game/:id/voice',
      EVENTS: '/api/game/:id/events',
    },
  },

  // Headers
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    ACCEPT: 'application/json',
    AUTHORIZATION: 'Bearer',
  },

  // Status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
  },

  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error occurred',
    TIMEOUT_ERROR: 'Request timed out',
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    INTERNAL_ERROR: 'Internal server error',
    UNKNOWN_ERROR: 'An unknown error occurred',
  },
} as const;

// API utility functions
export function buildUrl(endpoint: string, params?: Record<string, string>): string {
  let url = `${apiConfig.BASE_URL}${endpoint}`;

  if (params) {
    // Replace path parameters
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    }
  }

  return url;
}

export function getAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': apiConfig.HEADERS.CONTENT_TYPE,
    Accept: apiConfig.HEADERS.ACCEPT,
  };

  if (token) {
    headers.Authorization = `${apiConfig.HEADERS.AUTHORIZATION} ${token}`;
  }

  return headers;
}

export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

export function isClientError(status: number): boolean {
  return status >= 400 && status < 500;
}

export function isServerError(status: number): boolean {
  return status >= 500 && status < 600;
}

export function getErrorMessage(status: number): string {
  switch (status) {
    case apiConfig.STATUS_CODES.UNAUTHORIZED:
      return apiConfig.ERROR_MESSAGES.UNAUTHORIZED;
    case apiConfig.STATUS_CODES.FORBIDDEN:
      return apiConfig.ERROR_MESSAGES.FORBIDDEN;
    case apiConfig.STATUS_CODES.NOT_FOUND:
      return apiConfig.ERROR_MESSAGES.NOT_FOUND;
    case apiConfig.STATUS_CODES.INTERNAL_SERVER_ERROR:
      return apiConfig.ERROR_MESSAGES.INTERNAL_ERROR;
    default:
      return apiConfig.ERROR_MESSAGES.UNKNOWN_ERROR;
  }
}

export default apiConfig;
