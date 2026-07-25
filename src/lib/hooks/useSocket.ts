"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/api/client";
import type { ScoreUpdatePayload, MatchFinishedPayload } from "@/lib/types";

interface UseSocketOptions {
  enabled?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { enabled = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const socket = io(`${API_BASE_URL}/realtime`, {
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("ugmcup_token"),
      },
    });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  const joinRoom = (room: string) => {
    socketRef.current?.emit("join", room);
  };

  const leaveRoom = (room: string) => {
    socketRef.current?.emit("leave", room);
  };

  const onScoreUpdate = (cb: (payload: ScoreUpdatePayload) => void) => {
    socketRef.current?.on("score_update", cb);
    return () => { socketRef.current?.off("score_update", cb); };
  };

  const onMatchFinished = (cb: (payload: MatchFinishedPayload) => void) => {
    socketRef.current?.on("match_finished", cb);
    return () => { socketRef.current?.off("match_finished", cb); };
  };

  return { isConnected, joinRoom, leaveRoom, onScoreUpdate, onMatchFinished };
}

/** Hook khusus untuk subscribe ke satu match */
export function useMatchRoom(matchId: string | null) {
  const { isConnected, joinRoom, leaveRoom, onScoreUpdate, onMatchFinished } = useSocket({
    enabled: !!matchId,
  });

  const [lastScore, setLastScore] = useState<ScoreUpdatePayload | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isConnected || !matchId) return;

    const room = `match:${matchId}`;
    joinRoom(room);

    const offScore = onScoreUpdate((payload) => {
      if (payload.matchId === matchId) {
        setLastScore(payload);
      }
    });

    const offFinish = onMatchFinished((payload) => {
      if (payload.matchId === matchId) {
        setIsFinished(true);
      }
    });

    return () => {
      leaveRoom(room);
      offScore();
      offFinish();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, matchId]);

  return { isConnected, lastScore, isFinished };
}
