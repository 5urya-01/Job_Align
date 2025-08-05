const BASE_URL = 'https://jobalign-backend.onrender.com/api';

// Enhanced error handling with more specific error types
class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

// Improved response handler with better error detection
const handleResponse = async (response) => {
  let data;
  
  try {
    data = await response.json();
  } catch (error) {
    throw new APIError('Invalid response format', response.status, 'INVALID_JSON');
  }
  
  if (!response.ok) {
    const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
    throw new APIError(errorMessage, response.status, data.code || 'HTTP_ERROR');
  }
  
  // Normalize response format
  return {
    success: true,
    data: data.data || data,
    message: data.message || 'Operation completed successfully',
    ...data
  };
};

// Enhanced fetch with timeout and retry logic
const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', 408, 'TIMEOUT');
    }
    throw new APIError('Network error', 0, 'NETWORK_ERROR');
  }
};

// Retry logic for failed requests
const retryRequest = async (requestFn, maxRetries = 2, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry for client errors (4xx) or specific server errors
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
  
  throw lastError;
};

export const authAPI = {
  // Create user with enhanced error handling
  createUser: async (userData) => {
    try {
      return await retryRequest(async () => {
        const response = await fetchWithTimeout(`${BASE_URL}/createUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        return await handleResponse(response);
      });
    } catch (error) {
      if (error instanceof APIError) {
        return { 
          success: false, 
          error: error.message,
          code: error.code,
          status: error.status
        };
      }
      return { 
        success: false, 
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      };
    }
  },

  // Login user with enhanced validation
  loginUser: async (credentials) => {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: 'Email and password are required',
          code: 'VALIDATION_ERROR'
        };
      }

      return await retryRequest(async () => {
        const response = await fetchWithTimeout(`${BASE_URL}/loginUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
        return await handleResponse(response);
      });
    } catch (error) {
      if (error instanceof APIError) {
        return { 
          success: false, 
          error: error.message,
          code: error.code,
          status: error.status
        };
      }
      return { 
        success: false, 
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      };
    }
  },

  // Send OTP with proper parameter handling
  sendOtp: async (emailData) => {
    try {
      // Handle both string and object input
      const email = typeof emailData === 'string' ? emailData : emailData.email;
      
      if (!email) {
        return {
          success: false,
          error: 'Email is required',
          code: 'VALIDATION_ERROR'
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: 'Please enter a valid email address',
          code: 'INVALID_EMAIL'
        };
      }

      return await retryRequest(async () => {
        const response = await fetchWithTimeout(`${BASE_URL}/sendOtp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        return await handleResponse(response);
      });
    } catch (error) {
      if (error instanceof APIError) {
        return { 
          success: false, 
          error: error.message,
          code: error.code,
          status: error.status
        };
      }
      return { 
        success: false, 
        error: 'Failed to send OTP. Please try again.',
        code: 'UNKNOWN_ERROR'
      };
    }
  },

  // Verify OTP with proper parameter handling
  verifyOtp: async (verificationData) => {
    try {
      // Handle both object and separate parameters
      let email, otp;
      
      if (typeof verificationData === 'object' && verificationData.email) {
        email = verificationData.email;
        otp = verificationData.otp;
      } else {
        // Legacy support for separate parameters
        email = arguments[0];
        otp = arguments[1];
      }

      if (!email || !otp) {
        return {
          success: false,
          error: 'Email and OTP are required',
          code: 'VALIDATION_ERROR'
        };
      }

      // Validate OTP format (should be 6 digits)
      if (!/^\d{6}$/.test(otp)) {
        return {
          success: false,
          error: 'OTP must be 6 digits',
          code: 'INVALID_OTP_FORMAT'
        };
      }

      return await retryRequest(async () => {
        const response = await fetchWithTimeout(`${BASE_URL}/verifyOtp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, otp }),
        });
        return await handleResponse(response);
      });
    } catch (error) {
      if (error instanceof APIError) {
        return { 
          success: false, 
          error: error.message,
          code: error.code,
          status: error.status
        };
      }
      return { 
        success: false, 
        error: 'Failed to verify OTP. Please try again.',
        code: 'UNKNOWN_ERROR'
      };
    }
  },

  // Forgot password with enhanced validation
  forgotPassword: async (resetData) => {
    try {
      // Handle both object and separate parameters
      let email, password;
      
      if (typeof resetData === 'object' && resetData.email) {
        email = resetData.email;
        password = resetData.password;
      } else {
        // Legacy support for separate parameters
        email = arguments[0];
        password = arguments[1];
      }

      if (!email || !password) {
        return {
          success: false,
          error: 'Email and new password are required',
          code: 'VALIDATION_ERROR'
        };
      }

      // Validate password strength
      if (password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long',
          code: 'WEAK_PASSWORD'
        };
      }

      return await retryRequest(async () => {
        const response = await fetchWithTimeout(`${BASE_URL}/forgotPassword`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        return await handleResponse(response);
      });
    } catch (error) {
      if (error instanceof APIError) {
        return { 
          success: false, 
          error: error.message,
          code: error.code,
          status: error.status
        };
      }
      return { 
        success: false, 
        error: 'Failed to reset password. Please try again.',
        code: 'UNKNOWN_ERROR'
      };
    }
  },

  // Health check endpoint to test API connectivity
  healthCheck: async () => {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 5000); // Shorter timeout for health check
      
      return await handleResponse(response);
    } catch (error) {
      return { 
        success: false, 
        error: 'API is not reachable',
        code: 'API_UNREACHABLE'
      };
    }
  }
};

// Export error class for use in components
export { APIError };

