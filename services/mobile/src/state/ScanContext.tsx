/**
 * App state for scans and their results.
 *
 * Screens read the current `results` through `useResults()`, and the scan flow
 * drives `status`/`progress` through `startScan()`.
 *
 * Two backends, chosen by auth state:
 *  - Signed in: POST /scans to the Node API, then poll GET /scans/:id until the
 *    protocol is ready. Scans persist and appear in history.
 *  - Guest: call the engine's /analyze directly.
 * Either way, if the backend is unreachable the flow falls back to bundled
 * sample results so the app always completes and stays demoable.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import * as apiClient from '@/api/apiClient';
import { analyzeDemo, analyzeImage } from '@/api/client';
import { protocolToResults } from '@/api/mapProtocol';
import { useAuth } from '@/state/AuthContext';
import * as sample from '@/data/sample';
import type { MarkerVM, SupplementVM } from '@/data/sample';

export interface Results {
  summary: typeof sample.summary;
  needsAttention: MarkerVM[];
  priorityMarker: MarkerVM;
  rankedFindings: MarkerVM[];
  supplements: SupplementVM[];
  mealFocus: string[];
  mealNote: string;
  planTags: string[];
}

const baseResults: Results = {
  summary: sample.summary,
  needsAttention: sample.needsAttention,
  priorityMarker: sample.priorityMarker,
  rankedFindings: sample.rankedFindings,
  supplements: sample.supplements,
  mealFocus: sample.mealFocus,
  mealNote: sample.mealNote,
  planTags: sample.planTags,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function today(): string {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export type ScanStatus = 'idle' | 'processing' | 'complete';

const TOTAL_MARKERS = 24;

interface ScanState {
  status: ScanStatus;
  progress: number;
  markersFound: number;
  results: Results;
  history: apiClient.ScanSummary[];
  /** Kick off a scan of the picked image (or the demo panel when omitted). */
  startScan: (imageUri?: string) => void;
  /** Load a previously completed scan's protocol into `results`. */
  openScan: (id: string) => Promise<void>;
  /** Refresh the signed-in user's scan history (GET /scans). */
  refreshHistory: () => Promise<void>;
  reset: () => void;
}

const ScanCtx = createContext<ScanState | null>(null);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const { status: authStatus, token } = useAuth();
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [markersFound, setMarkersFound] = useState(0);
  const [results, setResults] = useState<Results>(baseResults);
  const [history, setHistory] = useState<apiClient.ScanSummary[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  const finishWithProtocol = useCallback((protocol: Parameters<typeof protocolToResults>[0]) => {
    const mapped = protocolToResults(protocol);
    clear();
    setResults(mapped);
    setMarkersFound(mapped.summary.markersTracked);
    setProgress(1);
    setStatus('complete');
  }, []);

  const finishWithSample = useCallback(() => {
    clear();
    setResults({ ...baseResults, summary: { ...baseResults.summary, labDate: today() } });
    setMarkersFound(TOTAL_MARKERS);
    setProgress(1);
    setStatus('complete');
  }, []);

  const refreshHistory = useCallback(async () => {
    if (!token) {
      setHistory([]);
      return;
    }
    try {
      setHistory(await apiClient.listScans(token));
    } catch {
      // leave the last known history in place on a transient error
    }
  }, [token]);

  const startScan = useCallback(
    (imageUri?: string) => {
      clear();
      setStatus('processing');
      setProgress(0.06);
      setMarkersFound(0);

      // Ease progress toward 90% while the request is in flight, then finish
      // when the backend responds.
      let p = 0.06;
      timer.current = setInterval(() => {
        p = Math.min(0.9, p + 0.03);
        setProgress(p);
        setMarkersFound(Math.round(TOTAL_MARKERS * p));
      }, 90);

      const run = async () => {
        if (token) {
          // Signed-in flow: persist via the Node API, then poll to completion.
          if (!imageUri) {
            // No image to upload (demo/portal tap): use the engine demo panel.
            finishWithProtocol(await analyzeDemo());
            return;
          }
          const scan = await apiClient.createScan(token, imageUri);
          const done = await apiClient.pollScan(token, scan.id);
          if (!done.protocol) throw new Error('No protocol on completed scan');
          finishWithProtocol(done.protocol);
          void refreshHistory();
          return;
        }
        // Guest flow: talk to the engine directly.
        finishWithProtocol(imageUri ? await analyzeImage(imageUri) : await analyzeDemo());
      };

      run().catch(finishWithSample);
    },
    [token, finishWithProtocol, finishWithSample, refreshHistory],
  );

  const openScan = useCallback(
    async (id: string) => {
      if (!token) return;
      const scan = await apiClient.getScan(token, id);
      if (scan.protocol) finishWithProtocol(scan.protocol);
    },
    [token, finishWithProtocol],
  );

  const reset = useCallback(() => {
    clear();
    setStatus('idle');
    setProgress(0);
    setMarkersFound(0);
  }, []);

  // Load history when a user signs in; clear it when they leave.
  useEffect(() => {
    if (authStatus === 'signedIn') {
      void refreshHistory();
    } else {
      setHistory([]);
    }
  }, [authStatus, refreshHistory]);

  useEffect(() => clear, []);

  return (
    <ScanCtx.Provider
      value={{
        status,
        progress,
        markersFound,
        results,
        history,
        startScan,
        openScan,
        refreshHistory,
        reset,
      }}
    >
      {children}
    </ScanCtx.Provider>
  );
}

export function useScan(): ScanState {
  const ctx = useContext(ScanCtx);
  if (!ctx) throw new Error('useScan must be used within a ScanProvider');
  return ctx;
}

export function useResults(): Results {
  return useScan().results;
}
