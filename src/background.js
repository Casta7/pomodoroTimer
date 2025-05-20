let inizio = 0;
let durata_rimanente = 0;
let attivo = false;

let fase_corrente = null;
let ultimaFS = 0;
let ultimaBR = 0;

function avvia(fs, br, fase) {
    durata_rimanente = fase === 'focus' ? fs : br;
    inizio = Date.now();
    attivo = true;
    fase_corrente = fase === 'focus' ? 'focus' : 'pausa';

    ultimaFS = fs;
    ultimaBR = br;

    chrome.alarms.create('timerPomodoro', { delayInMinutes: durata_rimanente / 60000 });

    chrome.storage.local.set({
        inizio,
        durata: durata_rimanente,
        attivo,
        fase: fase_corrente,
        ultimaFS,
        ultimaBR
    });
}

function stop() {
    chrome.alarms.clear('timerPomodoro');

    // Prendi i dati aggiornati e calcola durata rimanente
    chrome.storage.local.get(['inizio', 'durata'], (data) => {
        let elapsed = 0;
        if (data.inizio && data.durata) {
            elapsed = Date.now() - data.inizio;
        }
        durata_rimanente = (data.durata || 0) - elapsed;
        if (durata_rimanente < 0) durata_rimanente = 0;

        attivo = false;
        inizio = 0;

        chrome.storage.local.set({
            inizio: 0,
            durata: durata_rimanente,
            attivo: false,
            fase: fase_corrente,
            ultimaFS,
            ultimaBR
        });
    });
}

function resume() {
    chrome.storage.local.get(['durata'], (data) => {
        if (!data.durata || data.durata <= 0) return;

        durata_rimanente = data.durata;
        inizio = Date.now();
        attivo = true;

        chrome.alarms.create('timerPomodoro', { delayInMinutes: durata_rimanente / 60000 });

        chrome.storage.local.set({
            inizio,
            durata: durata_rimanente,
            attivo: true,
            fase: fase_corrente,
            ultimaFS,
            ultimaBR
        });
    });
}

function del() {
    chrome.alarms.clear('timerPomodoro');
    inizio = 0;
    durata_rimanente = 0;
    attivo = false;
    fase_corrente = null;
    ultimaFS = 0;
    ultimaBR = 0;

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
            chrome.storage.local.get(['inizio', 'durata', 'attivo', 'fase'], (data) => {
                sendResponse({
                    inizio: data.inizio || 0,
                    durata: data.durata || 0,
                    attivo: data.attivo || false,
                    fase: data.fase || null
                });
            });
            return true; // risposte async

        case 'RESET':
            del();
            sendResponse({ status: 'resettato' });
            break;
    }
    return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'timerPomodoro') {
        if (fase_corrente === 'focus') {
            if (ultimaFS > 0 && ultimaBR > 0) {
                fase_corrente = 'pausa';
                avvia(ultimaFS, ultimaBR, 'pausa');
                inviaNotifica('Pausa iniziata!');
            } else {
                del();
            }
        } else {
            del();
            inviaNotifica('Pomodoro completato!');
        }
    }
});
