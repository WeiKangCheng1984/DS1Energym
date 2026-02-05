"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * 60 秒倒數計時。需手動呼叫 start() 才會開始（例如按下「開始遊戲」後）。
 * @param initialSeconds 初始秒數（預設 60）
 * @param onEnd 結束回調（時間到時呼叫）
 * @param active 是否允許計時（未開始遊戲時為 false，計時器不跑）
 */
export function useCountdown(
  initialSeconds: number = 60,
  onEnd?: () => void,
  active: boolean = true
) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  const start = useCallback(() => {
    setSecondsLeft(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  const reset = useCallback(() => {
    setSecondsLeft(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (!active || !isRunning) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIsRunning(false);
          onEndRef.current?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [active, isRunning]);

  return { secondsLeft, isRunning, start, reset, setSecondsLeft };
}
