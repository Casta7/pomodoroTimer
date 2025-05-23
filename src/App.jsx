import { useEffect, useState, useCallback } from "react";
import TimerDisplay from "./components/TimerDisplay";
import TimerOptions from "./components/TimerOptions";
import Controls from "./components/Controls";

const App = () => {
  const [left, setLeft] = useState(0);
  const [fase, setFase] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  // Funzione per aggiornare lo stato leggendo dallo storage
  const aggiornaStato = useCallback(() => {
    chrome.runtime.sendMessage({ tipo: 'STATO' }, (res) => {
      setIsRunning(res.attivo);
      setFase(res.fase);

      if (intervalId) clearInterval(intervalId);

      if (res.attivo && res.inizio && res.durata) {
        const FINE = res.inizio + res.durata;

        const updateTime = () => {
          const now = Date.now();
          const remaining = FINE - now;

          if (remaining <= 0) {
            clearInterval(id);
            setLeft(0);
            setIsRunning(false);
            aggiornaStato(); // Risincronizza dopo la fine del timer
          } else {
            setLeft(remaining);
          }
        };

        updateTime();
        const id = setInterval(updateTime, 1000);
        setIntervalId(id);
      } else if (!res.attivo && res.durata > 0) {
        setLeft(res.durata);
      } else {
        setLeft(null); // reset o niente
      }
    });
  }, [intervalId]);

  // All'apertura del popup, sincronizza lo stato
  useEffect(() => {
    aggiornaStato();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [aggiornaStato]);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Pomodoro Timer</h1>

      {left == null && (
        <TimerOptions onAvvioSuccess={aggiornaStato} />
      )}
      {left !== null && (
        <>
          <Controls
            onAvvioSuccess={aggiornaStato}
            isRunning={isRunning}
            setIsRunning={setIsRunning}
          />
          <TimerDisplay left={left} fase={fase} />
        </>
      )}
    </div>
  );
};

export default App;
