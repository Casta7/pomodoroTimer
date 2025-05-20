const Controls = ({ isRunning, setIsRunning, onAvvioSuccess }) => {
    const toggle = () => {
        if(isRunning){
            chrome.runtime.sendMessage({ tipo: 'STOP' },(risposta) => {
                if (risposta.status === 'fermato') {
                  console.log('timer fermato con successo');
                  onAvvioSuccess();
                }
              }
            );
        }
        else{
            chrome.runtime.sendMessage({ tipo: 'RESUME' },(risposta) => {
                  console.log('timer ripartito con successo');
                  onAvvioSuccess();
              }
            );
        }
    }

    const reset = () => {
        chrome.runtime.sendMessage({ tipo: 'RESET' }, (risposta) => {
          if (risposta.status === 'resettato') {
            console.log('Timer resettato');
            setIsRunning(false);
            onAvvioSuccess(); // ricarica lo stato aggiornato
          }
        });
      };
      

    return (
        <div>
        <button onClick={toggle}>{isRunning ? 'Pausa' : 'Avvia'}</button>
        <button onClick={reset}>Reset</button>
        </div>
    )
}

export default Controls