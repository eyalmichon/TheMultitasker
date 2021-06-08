const wa = require('@open-wa/wa-automate');
const msgHandler = require('./handler');

wa.create({
    // run instead of chromium
    // executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    sessionId: 'TheMultitasker',
    // authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
    headless: true,
    autoRefresh: true,
    cacheEnabled: false,
    useChrome: true
    // qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then(client => start(client));

async function start(client) {
    console.log('The Multitasker', '[Version 1.1]')

    // Force it to keep the current session
    client.onStateChanged((state) => {
        console.log('[Client State]', state)
        if (state === 'CONFLICT' || state === 'DISCONNECTED') client.forceRefocus()
    })

    // Get all unread messages and go over them.
    const unreadMessages = await client.getAllUnreadMessages();
    unreadMessages.forEach(message => {
        msgHandler(client, message);
    });
    client.onAnyMessage(message => {
        // // Cut message Cache if cache more than 3K
        client.getAmountOfLoadedMessages().then((msg) => (msg >= 3000) && client.cutMsgCache())

        // Message Handler
        msgHandler(client, message);
    });
}
