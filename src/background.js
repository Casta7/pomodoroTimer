let inizio = 0;
let durata_rimanente = 0;
let attivo = false;

let fase_corrente = null;
let ultimaFS = 0;
let ultimaBR = 0;

function avvia(fs, br, fase) {
    chrome.alarms.create('timerPomodoro', { delayInMinutes: fase === 'focus' ? fs / 60000 : br / 60000 });

    durata_rimanente = fase === 'focus' ? fs : br;
    inizio = Date.now();
    attivo = true;
    fase_corrente = fase === 'focus' ? 'focus' : 'pausa';

    ultimaFS = fs;
    ultimaBR = br;

    chrome.storage.local.set({
        inizio: inizio,
        durata: durata_rimanente,
        attivo: attivo,
        fase: fase_corrente,
        ultimaFS: ultimaFS,
        ultimaBR: ultimaBR
    });
}

function stop() {
    chrome.alarms.clear('timerPomodoro');

    attivo = false;
    const elapsed = Date.now() - inizio;
    durata_rimanente = durata_rimanente - elapsed;
    inizio = 0;

    chrome.storage.local.set({
        inizio: 0,
        durata: durata_rimanente,
        attivo: false,
        fase: fase_corrente,
        ultimaFS: ultimaFS,
        ultimaBR: ultimaBR
    });
}

function resume() {
    if (!durata_rimanente || durata_rimanente <= 0) return;

    chrome.alarms.create('timerPomodoro', { delayInMinutes: durata_rimanente / 60000 });
    inizio = Date.now();
    attivo = true;

    chrome.storage.local.set({
        inizio: inizio,
        durata: durata_rimanente,
        attivo: true,
        fase: fase_corrente,
        ultimaFS: ultimaFS,
        ultimaBR: ultimaBR
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
            sendResponse({
                inizio: inizio,
                durata: durata_rimanente,
                attivo: attivo,
                fase: fase_corrente,
            });
            break;

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
