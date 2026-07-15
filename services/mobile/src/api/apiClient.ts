/**
 * Client for the Node API (services/api). Wraps auth and the scan lifecycle,
 * injecting the bearer token and normalizing the error envelope
 * ({ error: { message } }) into thrown Errors.
 */

import type { Protocol } from '@/types/protocol';
import { API_BASE } from './config';

const TIMEOUT_MS = 15000;

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export type ScanStatusValue = 'processing' | 'complete' | 'failed';

export interface ScanRef {
  id: string;
  status: ScanStatusValue;
}

export interface ScanDetail extends ScanRef {
  protocol: Protocol | null;
}

export interface ScanSummary {
  id: string;
  status: ScanStatusValue;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: { method?: string; token?: string | null; json?: unknown; body?: BodyInit } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers: Record<string, string> = {};
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  let body = options.body;
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body,
      signal: controller.signal,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const message = data?.error?.message ?? `Request failed (${res.status})`;
      throw new ApiError(message, res.status);
    }
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function signup(email: string, password: string): Promise<AuthResult> {
  return request<AuthResult>('/auth/signup', { method: 'POST', json: { email, password } });
}

export function login(email: string, password: string): Promise<AuthResult> {
  return request<AuthResult>('/auth/login', { method: 'POST', json: { email, password } });
}

export async function me(token: string): Promise<AuthUser | null> {
  const res = await request<{ user: AuthUser | null }>('/auth/me', { token });
  return res.user;
}

/** POST /scans with the picked image. Returns the created scan (status processing). */
export async function createScan(token: string, imageUri: string): Promise<ScanRef> {
  const name = imageUri.split('/').pop() || 'scan.jpg';
  const ext = name.split('.').pop()?.toLowerCase();
  const type =
    ext === 'png' ? 'image/png' : ext === 'pdf' ? 'application/pdf' : ext === 'heic' ? 'image/heic' : 'image/jpeg';
  const form = new FormData();
  // React Native's FormData accepts this file-descriptor object.
  form.append('image', { uri: imageUri, name, type } as unknown as Blob);
  const res = await request<{ scan: ScanRef }>('/scans', { method: 'POST', token, body: form });
  return res.scan;
}

export async function getScan(token: string, id: string): Promise<ScanDetail> {
  const res = await request<{ scan: ScanDetail }>(`/scans/${id}`, { token });
  return res.scan;
}

export async function listScans(token: string): Promise<ScanSummary[]> {
  const res = await request<{ scans: ScanSummary[] }>('/scans', { token });
  return res.scans;
}

const POLL_INTERVAL_MS = 1200;
const POLL_TIMEOUT_MS = 60000;

/**
 * Poll GET /scans/:id until it leaves `processing`. Resolves with the completed
 * scan (protocol present) or rejects if it fails or times out.
 */
export async function pollScan(
  token: string,
  id: string,
  onTick?: (status: ScanStatusValue) => void,
): Promise<ScanDetail> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  for (;;) {
    const scan = await getScan(token, id);
    onTick?.(scan.status);
    if (scan.status === 'complete') return scan;
    if (scan.status === 'failed') throw new ApiError('Scan processing failed', 422);
    if (Date.now() > deadline) throw new ApiError('Scan timed out', 408);
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}
