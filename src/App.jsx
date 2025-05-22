import { useEffect, useState } from "react";
import TimerDisplay from "./components/TimerDisplay";
import TimerOptions from "./components/TimerOptions";
import Controls from "./components/Controls";

const App = () => {
  const [left, setLeft] = useState(0); 
  const [fase, setFase] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  //controllo finche il popup è aperto
  useEffect(() => {
    let intervalId;
  
    chrome.runtime.sendMessage({ tipo: 'STATO' }, (res) => {
      console.log("Stato ricevuto:", res);
  
      setIsRunning(res.attivo);
      setFase(res.fase);
  
      if (res.attivo && res.inizio && res.durata) {
        const FINE = res.inizio + res.durata;
  
        const updateTime = () => {
          const now = Date.now();
          const remaining = FINE - now;
  
          if (remaining <= 0) {
            clearInterval(intervalId);
            setLeft(0);
            setIsRunning(false);
            window.location.reload();
          } else {
            setLeft(remaining);
          }
        };
  
        updateTime(); 
        intervalId = setInterval(updateTime, 1000);
      } else if (!res.attivo && res.durata > 0) {
        // Pausa: mostra il tempo rimanente congelato
        setLeft(res.durata);
      } else {
        setLeft(null); // reset o niente
      }
    });
      
    return () => clearInterval(intervalId);
  }, []);
  



  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Pomodoro Timer</h1>


      {left == null && <TimerOptions onAvvioSuccess={ () => window.location.reload()}></TimerOptions>}
      {left !== null && <Controls onAvvioSuccess={ () => window.location.reload()} isRunning={isRunning} setIsRunning={setIsRunning}></Controls>}
      {left !== null && <TimerDisplay left={left} fase={fase} />}
    </div>
  );
};

export default App;
