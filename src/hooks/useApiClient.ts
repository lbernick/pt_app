import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ApiClient, ApiClientOptions, UnauthorizedError } from '../services/apiClient';

export function useApiClient() {
  const { getIdToken, signOut } = useAuth();

  const fetchJson = useCallback(async <T>(
    url: string,
    options: Omit<ApiClientOptions, 'token'> = {}
  ): Promise<T> => {
    try {
      const token = await getIdToken();
      return await ApiClient.fetchJson<T>(url, { ...options, token: token || undefined });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        await signOut();
      }
      throw error;
    }
  }, [getIdToken, signOut]);

  return { fetchJson };
}
