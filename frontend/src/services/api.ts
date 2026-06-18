import axios, { AxiosError } from 'axios';
import type { CompleteDrugData, DisplayMode } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to extract error message from axios error
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    // Check for network/connection errors
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return 'Request timed out. Please check your connection and try again.';
      }
      if (axiosError.message?.includes('Network Error')) {
        return 'Cannot connect to the server. Please ensure the backend is running.';
      }
      return 'Network error occurred. Please check your connection.';
    }
    
    // Extract message from response
    const response = axiosError.response;
    const errorData = response.data;
    
    if (errorData && typeof errorData === 'object') {
      return errorData.message || errorData.error || response.statusText || 'An error occurred';
    }
    
    // Handle HTTP status codes
    switch (response.status) {
      case 404:
        return 'Drug not found in database. Please check the spelling and try again.';
      case 400:
        return 'Invalid request. Please check the drug name and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return `Error ${response.status}: ${response.statusText || 'An error occurred'}`;
    }
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
}

export const drugAPI = {
  /**
   * Get complete drug information including structure, predictions, and explanations
   */
  async getDrugInfo(name: string, mode: DisplayMode = 'patient'): Promise<CompleteDrugData> {
    try {
      const response = await api.get<CompleteDrugData>('/drug/info', {
        params: { name, mode },
      });
      return response.data;
    } catch (error) {
      // Re-throw with a more descriptive error message
      const errorMessage = getErrorMessage(error);
      const customError = new Error(errorMessage);
      (customError as any).isAxiosError = axios.isAxiosError(error);
      throw customError;
    }
  },

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.get(`${baseURL}/health`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default api;
