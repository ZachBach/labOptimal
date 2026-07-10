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

import * as sample from '@/data/sample';
import type { MarkerVM, SupplementVM } from '@/data/sample';

export interface Results {
  summary: typeof sample.summary;
  needsAttention: MarkerVM[];
  priorityMarker: MarkerVM;
  rankedFindings: MarkerVM[];
  supplements: SupplementVM[];
  mealFocus: string[];
  planTags: string[];
}

const baseResults: Results = {
  summary: sample.summary,
  needsAttention: sample.needsAttention,
  priorityMarker: sample.priorityMarker,
  rankedFindings: sample.rankedFindings,
  supplements: sample.supplements,
  mealFocus: sample.mealFocus,
  planTags: sample.planTags,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function today(): string {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export type ScanStatus = 'idle' | 'processing' | 'complete';

const TOTAL_MARKERS = 24;
const SCAN_MS = 2400;

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

  const startScan = useCallback((_imageUri?: string) => {
    clear();
    setStatus('processing');
    setProgress(0);
    setMarkersFound(0);
    const steps = 40;
    let step = 0;
    timer.current = setInterval(() => {
      step += 1;
      const t = step / steps;
      setProgress(t);
      setMarkersFound(Math.min(TOTAL_MARKERS, Math.round(TOTAL_MARKERS * t * 1.15)));
      if (step >= steps) {
        clear();
        // A real parse would return fresh findings here; stamp today's date so
        // the result visibly reflects the new scan.
        setResults({ ...baseResults, summary: { ...baseResults.summary, labDate: today() } });
        setStatus('complete');
      }
    }, SCAN_MS / steps);
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
