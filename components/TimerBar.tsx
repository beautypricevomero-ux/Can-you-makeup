"use client";

type TimerBarProps = {
  total: number;
  left: number;
};

export default function TimerBar({ total, left }: TimerBarProps) {
  const safeTotal = Math.max(0, total);
  const safeLeft = Math.max(0, Math.min(left, safeTotal));
  const pct = safeTotal > 0 ? Math.max(0, (safeLeft / safeTotal) * 100) : 0;

  return (
    <div
      className="relative h-2 w-full overflow-hidden rounded bg-gray-200"
      role="timer"
      aria-label="Secondi rimanenti"
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={safeLeft}
    >
      <div className="h-full bg-gray-900 transition-[width] duration-500 ease-linear" style={{ width: `${pct}%` }} />
    </div>
  );
}
