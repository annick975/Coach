import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ScanResponse {
  scan_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message: string;
}

export interface ScanResult {
  scan_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results: {
    vulnerabilities: Vulnerability[];
  } | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Vulnerability {
  tool: string;
  severity: string;
  file_path: string;
  line_number: number;
  description: string;
  code: string;
}

export interface AIFixSuggestion {
  vulnerability: Vulnerability;
  suggested_fix: string;
}

const api = {
  // Start a new scan
  scanRepository: async (repoUrl: string): Promise<ScanResponse> => {
    const response = await apiClient.post('/scan/', { repo_url: repoUrl });
    return response.data;
  },

  // Get scan results
  getScanResults: async (scanId: string): Promise<ScanResult> => {
    const response = await apiClient.get(`/results/${scanId}/`);
    return response.data;
  },

  // Request AI-powered fixes
  getAIFixes: async (vulnerabilities: Vulnerability[]): Promise<AIFixSuggestion[]> => {
    const response = await apiClient.post('/ai-fix/', { vulnerabilities });
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await apiClient.get('/health/');
    return response.data;
  }
};

export default api;
