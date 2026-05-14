'use client';

import { useState, useEffect } from 'react';
import {
  fetchStatus,
  fetchTimeline,
  fetchLanes,
  fetchMessages,
  fetchContinuity,
  fetchTimeline as fetchTimelineRaw,
} from '@/lib/services/dataAdapter';
import type {
  StatusResponse,
  TimelineResponse,
  LanesResponse,
  MessagesResponse,
  ContinuityResponse,
} from '@/lib/contracts/types';

interface UseDataReturn {
  status: StatusResponse | null;
  timeline: TimelineResponse | null;
  lanes: LanesResponse | null;
  messages: MessagesResponse | null;
  continuity: ContinuityResponse | null;
  loading: boolean;
  refresh: () => void;
}

export function useData(
  opts?: {
    timelineHours?: number;
    timelineLane?: string;
    timelineType?: string;
  }
): UseDataReturn {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);
  const [lanes, setLanes] = useState<LanesResponse | null>(null);
  const [messages, setMessages] = useState<MessagesResponse | null>(null);
  const [continuity, setContinuity] = useState<ContinuityResponse | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    setStatus(fetchStatus());
    setLanes(fetchLanes());
    setMessages(fetchMessages());
    setContinuity(fetchContinuity());
    setTimeline(
      fetchTimelineRaw(
        opts?.timelineHours ?? 48,
        opts?.timelineLane as any,
        opts?.timelineType as any
      )
    );
  }, [tick, opts?.timelineHours, opts?.timelineLane, opts?.timelineType]);

  const loading = !status || !timeline || !lanes || !messages || !continuity;

  return { status, timeline, lanes, messages, continuity, loading, refresh };
}

// Named re-exports for pages that need specific services directly
export { fetchStatus, fetchTimeline, fetchLanes, fetchMessages, fetchContinuity } from '@/lib/services/dataAdapter';