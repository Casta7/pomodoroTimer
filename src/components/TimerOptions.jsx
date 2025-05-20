
const TimerOptions = ({onAvvioSuccess}) => {

  

  // Funzione per avviare il timer tramite background.js
  const avviaTimer = (br, fs, fase) => {
    chrome.runtime.sendMessage({ tipo: 'AVVIA', fase: fase, br: br, fs: fs },(risposta) => {
        if (risposta.status === 'avviato') {
          console.log('Timer avviato con successo');

          onAvvioSuccess();
        }
      }
    );
  };

  const handleSelect = (focus, breakTime) => {
    // Avvia il timer focus con la durata scelta
    avviaTimer(breakTime * 1000, focus * 1000, 'focus');
  };

  return (
    <div>
      <button onClick={() => handleSelect(1500, 300)}>25/5 min</button>
      <button onClick={() => handleSelect(3000, 600)}>50/10 min</button>
    </div>
  );
};

export default TimerOptions;
