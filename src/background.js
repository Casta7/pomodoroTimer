
//if the measure unit isn't specified it will be considered as [ms]
//every variables are all in local storage


//this function start a fase o the timer
function avvia(fs, br, fase) {
 
    const inizio = Date.now();

    chrome.alarms.create('timerPomodoro', { delayInMinutes: fase === 'focus' ? fs : br / 60000 }); //convertion in minute

    chrome.storage.local.set({
        inizio,
        durata: fase === 'focus' ? fs : br,
        attivo: true,
        fase,
        ultimaFS: fs,
        ultimaBR: br
    });
}


//it clears the timer and calc how many [ms] left 
function stop() {
    chrome.alarms.clear('timerPomodoro');

    chrome.storage.local.get(['inizio', 'durata', 'fase', 'ultimaFS', 'ultimaBR'], (data) => {
        if (!data.inizio || !data.durata) return;

        const elapsed = Date.now() - data.inizio;
        let durata_rimanente = data.durata - elapsed;
        if (durata_rimanente < 0) durata_rimanente = 0;

        chrome.storage.local.set({
            inizio: 0,
            durata: durata_rimanente,
            attivo: false,
            fase: data.fase,
            ultimaFS: data.ultimaFS,
            ultimaBR: data.ultimaBR
        });
    });
}


//create a new timer with [ms] left
function resume() {
    chrome.storage.local.get(['durata', 'fase', 'ultimaFS', 'ultimaBR'], (data) => {
        if (!data.durata || data.durata <= 0) return;

        const inizio = Date.now();

        chrome.alarms.create('timerPomodoro', { delayInMinutes: data.durata / 60000 }); //convertion in minute

        chrome.storage.local.set({
            inizio,
            durata: data.durata,
            attivo: true,
            fase: data.fase,
            ultimaFS: data.ultimaFS,
            ultimaBR: data.ultimaBR
        });
    });
}

//del timer and reset var
function del() {
    chrome.alarms.clear('timerPomodoro');
    chrome.storage.local.set({
        inizio: 0,
        durata: 0,
        attivo: false,
        fase: null,
        ultimaFS: 0,
        ultimaBR: 0
    });
}

function inviaNotifica(testo) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'public/logo-removebg-preview.png',
        title: 'Pomodoro',
        message: testo
    });
}


//handle messages from popup 
chrome.runtime.onMessage.addListener((messaggio, sender, sendResponse) => {
    switch (messaggio.tipo) {
        case 'AVVIA':
            avvia(messaggio.fs, messaggio.br, messaggio.fase);
            sendResponse({ status: 'avviato' });
            break;

        case 'STOP':
            stop();
            sendResponse({ status: 'fermato' });
            break;

        case 'RESUME':
            resume();
            sendResponse({ status: 'ripreso' });
            break;

        case 'STATO':
            //send to popup state of var
            chrome.storage.local.get(['inizio', 'durata', 'attivo', 'fase'], (data) => {
                sendResponse({
                    inizio: data.inizio,
                    durata: data.durata,
                    attivo: data.attivo,
                    fase: data.fase
                });
            });
            return true;

        case 'RESET':
            del();
            sendResponse({ status: 'resettato' });
            break;
    }
    return true;
});


//check and switch fase or end timer when finished
chrome.alarms.onAlarm.addListener(() => {
    chrome.storage.local.get(['fase', 'ultimaFS', 'ultimaBR'], (data) => {
        if (data.fase === 'focus') {
            //switch fase
            inviaNotifica('Pausa iniziata!');
            avvia(data.ultimaFS, data.ultimaBR, 'pausa');
        } else {
            //end timer
            inviaNotifica('Pomodoro completato!');
            del();
        }
    });
});
