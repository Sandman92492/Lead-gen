import React, { useEffect, useRef, useState } from 'react';

type TimerProgressProps = {
  secondsRemaining: number | null | undefined;
  rotationSeconds?: number | null;
  className?: string;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const TimerProgress: React.FC<TimerProgressProps> = ({
  secondsRemaining,
  rotationSeconds = 30,
  className = '',
}) => {
  const totalSeconds = Math.max(1, Math.round(rotationSeconds ?? 30));
  const remainingSeconds = secondsRemaining == null ? null : Math.max(0, Math.round(secondsRemaining));

  const [barWidth, setBarWidth] = useState<string>('0%');
  const [transitionMs, setTransitionMs] = useState<number>(totalSeconds * 1000);
  const [disableTransition, setDisableTransition] = useState<boolean>(true);
  const previousSeconds = useRef<number | null>(null);

  useEffect(() => {
    if (remainingSeconds == null) {
      previousSeconds.current = null;
      setDisableTransition(true);
      setBarWidth('0%');
      return;
    }

    const prev = previousSeconds.current;
    previousSeconds.current = remainingSeconds;

    const isReset = prev == null || remainingSeconds > prev;
    const initialRatio = clamp01(remainingSeconds / totalSeconds);
    const initialWidth = `${Math.round(initialRatio * 100)}%`;
    const duration = Math.max(1, remainingSeconds * 1000);

    setDisableTransition(true);
    setTransitionMs(duration);
    setBarWidth(isReset ? '100%' : initialWidth);

    const raf = requestAnimationFrame(() => {
      setDisableTransition(false);
      setBarWidth('0%');
    });

    return () => cancelAnimationFrame(raf);
  }, [remainingSeconds, totalSeconds]);

  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-border-subtle/50 ${className}`}>
      <div
        className={`h-full rounded-full bg-brand-accent transition-[width] ease-linear ${disableTransition ? 'duration-0' : ''}`}
        style={{ width: barWidth, transitionDuration: `${transitionMs}ms` }}
        aria-hidden="true"
      />
    </div>
  );
};

export default TimerProgress;
