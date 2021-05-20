const wa = require('@open-wa/wa-automate');
const msgHandler = require('./handler/index');

wa.create({
    sessionId: "HELPER",
    authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'EN-GB',
    logConsole: false,
    popup: true,
    qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then(client => start(client));

async function start(client) {
    msgHandler(client);
}
