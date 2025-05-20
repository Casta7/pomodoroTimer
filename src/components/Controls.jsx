import React from "react";

const Controls = ({ isRunning, setIsRunning, onAvvioSuccess }) => {
  const handleStart = () => {
    chrome.runtime.sendMessage({ tipo: 'STATO' }, (res) => {
      if (!res.attivo && res.durata > 0) {
        // Timer in pausa → riprendi
        chrome.runtime.sendMessage({ tipo: 'RESUME' }, () => {
          setIsRunning(true);
          onAvvioSuccess();
        });
      }
    });
  };

  const handleStop = () => {
    chrome.runtime.sendMessage({ tipo: 'STOP' }, () => {
      setIsRunning(false);
      onAvvioSuccess();
    });
  };

  return (
    <div style={{ marginTop: 20 }}>
      {isRunning ? (
        <button onClick={handleStop}>Pausa</button>
      ) : (
        <button onClick={handleStart}>Riprendi</button>
      )}
    </div>
  );
};

export default Controls;
