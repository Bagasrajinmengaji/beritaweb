/**
 * API Service Utility — Portal Informasi Lomba Mahasiswa UMPKU
 * Dirancang untuk integrasi REST API, Upload FormData, serta ekstensi masa depan
 * (Smart Import AI, Universal URL Extraction, QR Reader).
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    null
  );
}

export interface FetchApiOptions extends RequestInit {
  token?: string | null;
}

export async function fetchApi<T>(
  endpoint: string,
  options: FetchApiOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  // Jangan pasang Content-Type jika FormData agar browser menyetel boundary multipart secara otomatis
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Tambahkan auth header jika tersedia
  const activeToken = options.token ?? getAuthToken();
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }

  // Gabungkan headers kustom pengguna
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || `API request failed with status ${response.status}`
    );
  }

  return response.json();
}
