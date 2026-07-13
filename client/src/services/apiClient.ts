import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token from memory if present
let accessTokenInMemory: string | null = null;

export const setAccessTokenInMemory = (token: string | null) => {
  accessTokenInMemory = token;
};

apiClient.interceptors.request.use(
  (config) => {
    if (accessTokenInMemory && config.headers) {
      config.headers.Authorization = `Bearer ${accessTokenInMemory}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token expiration (401) and refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If response is 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to call the refresh token endpoint
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { accessToken } = response.data;
        setAccessTokenInMemory(accessToken);
        
        // Update authorization header on the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Re-execute original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed/expired: clear memory token and propagate error
        setAccessTokenInMemory(null);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
