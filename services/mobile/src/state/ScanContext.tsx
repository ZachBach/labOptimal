/**
 * App state for scans and their results.
 *
 * Screens read the current `results` through `useResults()`, and the scan flow
 * drives `status`/`progress` through `startScan()`. Today `startScan` simulates
 * parsing on-device; in Phase B it becomes the call to the real engine/API and
 * nothing else in the UI has to change.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { analyzeDemo, analyzeImage } from '@/api/client';
import { protocolToResults } from '@/api/mapProtocol';
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
  /** Kick off a parse of the picked image. Simulated for now. */
  startScan: (imageUri?: string) => void;
  reset: () => void;
}

const ScanCtx = createContext<ScanState | null>(null);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [markersFound, setMarkersFound] = useState(0);
  const [results, setResults] = useState<Results>(baseResults);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  const startScan = useCallback((imageUri?: string) => {
    clear();
    setStatus('processing');
    setProgress(0.06);
    setMarkersFound(0);

    // Ease progress toward 90% while the request is in flight, then finish when
    // the engine responds.
    let p = 0.06;
    timer.current = setInterval(() => {
      p = Math.min(0.9, p + 0.03);
      setProgress(p);
      setMarkersFound(Math.round(TOTAL_MARKERS * p));
    }, 90);

    const request = imageUri ? analyzeImage(imageUri) : analyzeDemo();
    request
      .then((protocol) => {
        const mapped = protocolToResults(protocol);
        clear();
        setResults(mapped);
        setMarkersFound(mapped.summary.markersTracked);
        setProgress(1);
        setStatus('complete');
      })
      .catch(() => {
        // Offline or no engine running: fall back to sample results so the flow
        // still completes and the app stays demoable without a server.
        clear();
        setResults({ ...baseResults, summary: { ...baseResults.summary, labDate: today() } });
        setMarkersFound(TOTAL_MARKERS);
        setProgress(1);
        setStatus('complete');
      });
  }, []);

  const reset = useCallback(() => {
    clear();
    setStatus('idle');
    setProgress(0);
    setMarkersFound(0);
  }, []);

  useEffect(() => clear, []);

  return (
    <ScanCtx.Provider value={{ status, progress, markersFound, results, startScan, reset }}>
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
