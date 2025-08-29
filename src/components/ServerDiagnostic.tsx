// src/components/ServerDiagnostic.tsx

'use client';

import { useState } from 'react';
import { ApplicantAPI } from '@/features/applicants/api/applicants.api';

interface ServerDiagnosticProps {
  onClose: () => void;
}

interface DiagnosticResult {
  name: string;
  success: boolean;
  data?: unknown;
  error?: string | undefined;
}

export function ServerDiagnostic({ onClose }: ServerDiagnosticProps) {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    setTesting(true);
    setResults([]);

    const diagnostics = [
      {
        name: 'Server Health Check',
        test: async () => {
          try {
            const health = await ApplicantAPI.checkServerHealth();
            return { success: true, data: health, error: undefined };
          } catch (error) {
            return { success: false, data: undefined, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        }
      },
      {
        name: 'API Base URL Check',
        test: async () => {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'NOT_SET';
          return { 
            success: apiBase !== 'NOT_SET', 
            data: { apiBase },
            error: apiBase === 'NOT_SET' ? 'NEXT_PUBLIC_API_URL is not set' : undefined
          };
        }
      },
      {
        name: 'Network Connectivity',
        test: async () => {
          try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const response = await fetch(apiBase, { 
              method: 'GET', 
              cache: 'no-store'
            });
            return { 
              success: true, 
              data: { 
                status: response.status,
                statusText: response.statusText,
                message: 'Server is responding'
              },
              error: undefined
            };
          } catch (error) {
            return { 
              success: false, 
              data: undefined,
              error: error instanceof Error ? error.message : 'Network error' 
            };
          }
        }
      },
      {
        name: 'Authentication Test',
        test: async () => {
          try {
            // Get stored credentials
            const storedCredentials = sessionStorage.getItem('adminCredentials');
            if (!storedCredentials) {
              return { success: false, data: undefined, error: 'No credentials stored' };
            }
            
            const { email, password } = JSON.parse(storedCredentials);
            
            // Try to make a simple authenticated request
            const stats = await ApplicantAPI.getStatistics(email, password);
            return { success: true, data: { message: 'Authentication successful', stats }, error: undefined };
          } catch (error) {
            return { 
              success: false, 
              data: undefined,
              error: error instanceof Error ? error.message : 'Auth error' 
            };
          }
        }
      }
    ];

    for (const diagnostic of diagnostics) {
      try {
        const result = await diagnostic.test();
        setResults(prev => [...prev, { name: diagnostic.name, ...result }]);
      } catch (error) {
        setResults(prev => [...prev, { 
          name: diagnostic.name, 
          success: false, 
          data: undefined,
          error: error instanceof Error ? error.message : 'Test failed' 
        }]);
      }
    }

    setTesting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Server Diagnostic</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={runDiagnostics}
            disabled={testing}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Running Diagnostics...' : 'Run Diagnostics'}
          </button>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="border rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`} />
                <h3 className="font-semibold">{result.name}</h3>
              </div>
              
              {result.success ? (
                <div className="text-green-700">
                  ✅ Success
                  {result.data && (
                    <pre className="mt-2 text-sm bg-green-50 p-2 rounded overflow-x-auto">
                      {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="text-red-700">
                  ❌ Failed: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Common Solutions:</h3>
          <ul className="text-sm space-y-1">
            <li>• Check if the Spring Boot server is running (usually on port 8080)</li>
            <li>• Verify NEXT_PUBLIC_API_URL environment variable is set correctly</li>
            <li>• Ensure CORS is configured properly in the backend</li>
            <li>• Check server logs for detailed error information</li>
            <li>• Verify database connection in the backend</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
