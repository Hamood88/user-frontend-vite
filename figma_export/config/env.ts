// Environment configuration

export const config = {
  // API Base URL - will use VITE_API_URL from .env or default to /api
  apiUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api',
  
  // Other environment variables can be added here
  isDevelopment: (typeof import.meta !== 'undefined' && import.meta.env?.MODE) === 'development',
  isProduction: (typeof import.meta !== 'undefined' && import.meta.env?.MODE) === 'production',
};
