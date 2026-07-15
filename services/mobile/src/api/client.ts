/**
 * Client for the engine service (direct). Used by the guest/demo flow: uploads
 * a picked lab image (or requests the bundled demo panel) straight to the
 * engine's /analyze and returns the raw Protocol. The signed-in flow goes
 * through the Node API instead (see apiClient.ts). Callers map the Protocol to
 * view models via `protocolToResults`.
 */

import type { Protocol } from '@/types/protocol';
import { ENGINE_BASE } from './config';

const TIMEOUT_MS = 12000;

async function postAnalyze(form: FormData): Promise<Protocol> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${ENGINE_BASE}/analyze`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Engine responded ${res.status}`);
    }
    return (await res.json()) as Protocol;
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzeImage(uri: string): Promise<Protocol> {
  const name = uri.split('/').pop() || 'scan.jpg';
  const ext = name.split('.').pop()?.toLowerCase();
  const type = ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg';

  const form = new FormData();
  // React Native's FormData accepts this file descriptor object.
  form.append('image', { uri, name, type } as unknown as Blob);
  return postAnalyze(form);
}

export async function analyzeDemo(): Promise<Protocol> {
  const form = new FormData();
  form.append('demo', 'true');
  return postAnalyze(form);
}
