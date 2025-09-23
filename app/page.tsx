"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Tier = {
  id: string;
  amount: number;
  seconds: number;
  label: string;
  description: string;
  gradient: string;
};

type HistoryItem = {
  seconds: number;
  label: string;
};

type FlashTone = "primary" | "cart" | "discard" | "undo" | "neutral" | "end";

type FlashMessage = {
  id: number;
  text: string;
  tone: FlashTone;
};

const TIERS: Tier[] = [
  {
    id: "t30",
    amount: 30,
    seconds: 100,
    label: "Sprint Glam",
    description: "Sfida veloce da 30€",
    gradient: "linear-gradient(135deg, #fb7185, #f472b6)",
  },
  {
    id: "t50",
    amount: 50,
    seconds: 180,
    label: "Glow Up",
    description: "Look completo da 50€",
    gradient: "linear-gradient(135deg, #60a5fa, #8b5cf6)",
  },
  {
    id: "t80",
    amount: 80,
    seconds: 250,
    label: "Star Look",
    description: "Sessione premium da 80€",
    gradient: "linear-gradient(135deg, #f97316, #fb7185)",
  },
  {
    id: "t100",
    amount: 100,
    seconds: 350,
    label: "Iconic Night",
    description: "Esperienza full glam",
    gradient: "linear-gradient(135deg, #34d399, #60a5fa)",
  },
];

const GHOST_HEARTS = [
  { left: "12%", delay: "0s", size: 18 },
  { left: "68%", delay: "-3s", size: 22 },
  { left: "36%", delay: "-6s", size: 16 },
];

function formatTime(value: number) {
  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function Home() {
  const [step, setStep] = useState<"choose" | "timer">("choose");
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  const initialSecondsRef = useRef(0);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFlash = useCallback((text: string, tone: FlashTone) => {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    const payload: FlashMessage = { id: Date.now(), text, tone };
    setFlash(payload);
    flashTimeoutRef.current = setTimeout(() => setFlash(null), 1100);
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          if (prev > 0) {
            showFlash("Tempo scaduto!", "end");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, showFlash]);

  const formattedTime = useMemo(() => formatTime(timeLeft), [timeLeft]);
  const progress = useMemo(() => {
    if (!selectedTier || selectedTier.seconds === 0) return 0;
    return Math.max(0, Math.min(1, timeLeft / selectedTier.seconds));
  }, [selectedTier, timeLeft]);

  const handleSelectTier = (tier: Tier) => {
    setSelectedTier(tier);
    initialSecondsRef.current = tier.seconds;
    setTimeLeft(tier.seconds);
    setHistory([]);
    setIsRunning(false);
    setStep("timer");
    showFlash(`Obiettivo ${tier.amount}€ pronto!`, "primary");
  };

  const handleStart = () => {
    if (!selectedTier) return;
    if (timeLeft <= 0) {
      showFlash("Seleziona un importo per ripartire", "neutral");
      return;
    }
    if (isRunning) {
      return;
    }
    setIsRunning(true);
    showFlash("Timer avviato!", "primary");
  };

  const applyAdjustment = (seconds: number, label: string, tone: FlashTone) => {
    if (!selectedTier) return;
    if (!isRunning) {
      showFlash("Avvia il timer prima di modificare", "neutral");
      return;
    }

    let applied = 0;
    let nextValue = 0;
    setTimeLeft((prev) => {
      if (prev <= 0) return prev;
      applied = Math.min(seconds, prev);
      nextValue = Math.max(prev - applied, 0);
      return nextValue;
    });

    if (applied <= 0) {
      showFlash("Tempo già terminato", "neutral");
      setIsRunning(false);
      return;
    }

    setHistory((hist) => [...hist, { seconds: applied, label }]);
    showFlash(`${label} -${applied}s`, tone);

    if (nextValue <= 0) {
      setIsRunning(false);
      window.setTimeout(() => showFlash("Tempo scaduto!", "end"), 600);
    }
  };

  const handleUndo = () => {
    setHistory((hist) => {
      if (hist.length === 0) {
        showFlash("Nessuna operazione da annullare", "neutral");
        return hist;
      }
      const nextHistory = hist.slice(0, -1);
      const last = hist[hist.length - 1];
      setTimeLeft((prev) => {
        const restored = Math.min(initialSecondsRef.current, prev + last.seconds);
        return restored;
      });
      showFlash(`Annullato +${last.seconds}s`, "undo");
      return nextHistory;
    });
  };

  const handleReset = () => {
    setStep("choose");
    setIsRunning(false);
    setHistory([]);
    setFlash(null);
    setSelectedTier(null);
    setTimeLeft(0);
    initialSecondsRef.current = 0;
  };

  return (
    <div className="app-shell">
      {step === "choose" && (
        <div className="selection-card">
          <div>
            <h1>ALL YOU CAN MAKEUP</h1>
            <p>
              Scegli il budget per la sfida in live e preparati a correre contro il tempo.
            </p>
          </div>
          <div className="tier-grid">
            {TIERS.map((tier) => (
              <button
                key={tier.id}
                className="tier-option"
                style={{ background: tier.gradient }}
                onClick={() => handleSelectTier(tier)}
              >
                <span className="tier-option__label">{tier.label}</span>
                <span className="tier-option__amount">{tier.amount}€</span>
                <span className="tier-option__seconds">{tier.seconds} secondi</span>
                <span className="tier-option__seconds">{tier.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "timer" && selectedTier && (
        <div className="timer-screen">
          <div className="ghost-hearts">
            {GHOST_HEARTS.map((heart, index) => (
              <span
                key={index}
                style={{ left: heart.left, animationDelay: heart.delay, fontSize: heart.size }}
              >
                ♥
              </span>
            ))}
          </div>
          <div className="flash-wrapper">
            {flash && <div className={`flash-message flash-message--${flash.tone}`}>{flash.text}</div>}
          </div>

          <div className="timer-inner">
            <div className="timer-header">
              <div className="timer-title">
                <h2>ALL YOU CAN MAKEUP</h2>
                <span>Obiettivo {selectedTier.amount}€</span>
              </div>
              <button className="timer-back" onClick={handleReset} type="button">
                Cambia importo
              </button>
            </div>

            <div className="timer-display">
              <div className="timer-badge">Tempo totale: {selectedTier.seconds}s</div>
              <div className="timer-digits">{formattedTime}</div>
              <div className="timer-legend">tempo rimanente</div>
            </div>

            <div className="timer-progress">
              <span style={{ width: `${progress * 100}%` }} />
            </div>

            <div className="controls">
              <button
                type="button"
                className="control-button control-button--primary"
                onClick={handleStart}
                disabled={isRunning || timeLeft <= 0}
              >
                Avvia
              </button>
              <button
                type="button"
                className="control-button control-button--cart"
                onClick={() => applyAdjustment(30, "Aggiungi al carrello", "cart")}
                disabled={!isRunning || timeLeft <= 0}
              >
                Aggiungi al carrello
              </button>
              <button
                type="button"
                className="control-button control-button--discard"
                onClick={() => applyAdjustment(10, "Scarta", "discard")}
                disabled={!isRunning || timeLeft <= 0}
              >
                Scarta
              </button>
              <button
                type="button"
                className="control-button control-button--undo"
                onClick={handleUndo}
                disabled={history.length === 0}
              >
                Annulla ultima azione
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
