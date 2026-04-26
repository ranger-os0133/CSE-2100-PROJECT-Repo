// Base API client - mirrors backend app/main.py configuration
const API_BASE_URL = typeof window === 'undefined'
  ? 'http://localhost:8000'
  : window.location.protocol === 'file:'
    ? 'http://localhost:8000'
    : `${window.location.protocol}//${window.location.hostname}:8000`;

let onUnauthorized = null;

export function setUnauthorizedCallback(callback) {
  onUnauthorized = callback;
}

export class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  setRefreshToken(token) {
    this.refreshToken = token;
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  getHeaders(body) {
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  subscribeToTokenRefresh(callback) {
    this.refreshSubscribers.push(callback);
  }

  notifyTokenRefresh(success) {
    this.refreshSubscribers.forEach(callback => callback(success));
    this.refreshSubscribers = [];
  }

  async refreshAccessToken() {
    if (this.isRefreshing) {
      return new Promise(resolve => {
        this.subscribeToTokenRefresh(resolve);
      });
    }

    this.isRefreshing = true;
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshToken}`
        }
      });

      if (response.ok) {
        const data = await this.parseResponse(response);
        this.setToken(data.access_token);
        this.setRefreshToken(data.refresh_token);
        this.notifyTokenRefresh(true);
        return true;
      } else if (response.status === 401) {
        // Refresh token is invalid, logout
        this.setToken(null);
        this.setRefreshToken(null);
        localStorage.removeItem('currentUser');
        this.notifyTokenRefresh(false);
        if (onUnauthorized) {
          onUnauthorized();
        }
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.notifyTokenRefresh(false);
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  async parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : null;
  }

  async buildError(response) {
    const payload = await this.parseResponse(response).catch(() => null);
    const detail = payload?.detail || payload?.message || response.statusText || 'Request failed';
    return new Error(detail);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const body = options.body;
    let response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(body),
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && endpoint !== '/auth/refresh' && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...this.getHeaders(body),
            ...options.headers,
          },
        });
      } else {
        // Refresh failed, token state cleared by refreshAccessToken
        throw new Error('Session expired - please login again');
      }
    }

    // If still 401 or no refresh token, handle logout
    if (response.status === 401) {
      this.setToken(null);
      this.setRefreshToken(null);
      localStorage.removeItem('currentUser');
      if (onUnauthorized) {
        onUnauthorized();
      }
      throw new Error('Session expired - please login again');
    }

    if (!response.ok) {
      throw await this.buildError(response);
    }

    return this.parseResponse(response);
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data ?? {}),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data ?? {}),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data ?? {}),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
