// API Configuration for AWS Deployment
// Update this file with your API Gateway endpoint after deployment

// For local development with Supabase
const SUPABASE_PROJECT_ID = 'your-project-id';
const SUPABASE_ANON_KEY = 'your-anon-key';

// For production with AWS API Gateway
// Get this URL after running: ./scripts/setup-api-gateway.sh
const API_GATEWAY_ENDPOINT = 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod';

// Deployment mode: 'supabase' or 'aws'
const DEPLOYMENT_MODE = import.meta.env.VITE_DEPLOYMENT_MODE || 'supabase';

export const config = {
  mode: DEPLOYMENT_MODE,
  
  // Supabase configuration
  supabase: {
    projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID || SUPABASE_PROJECT_ID,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
    endpoint: `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID || SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-3699ee41`,
  },
  
  // AWS API Gateway configuration
  aws: {
    endpoint: import.meta.env.VITE_API_GATEWAY_ENDPOINT || API_GATEWAY_ENDPOINT,
  },
};

// Get the current API endpoint based on deployment mode
export function getApiEndpoint(): string {
  if (config.mode === 'aws') {
    return config.aws.endpoint;
  }
  return config.supabase.endpoint;
}

// Get authorization header based on deployment mode
export function getAuthHeader(): string {
  if (config.mode === 'aws') {
    return ''; // No auth header needed for API Gateway (or use API key if configured)
  }
  return `Bearer ${config.supabase.anonKey}`;
}

// Helper to make API calls
export async function apiCall(path: string, options: RequestInit = {}): Promise<Response> {
  const endpoint = getApiEndpoint();
  const url = `${endpoint}${path}`;
  
  const headers: HeadersInit = {
    ...options.headers,
  };
  
  // Add auth header for Supabase
  if (config.mode === 'supabase') {
    headers['Authorization'] = getAuthHeader();
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

export default config;
