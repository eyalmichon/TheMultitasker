const wa = require('@open-wa/wa-automate');
const msgHandler = require('./handler');

wa.create({
    sessionId: 'TheMultitasker',
    headless: true,
    autoRefresh: true,
    cacheEnabled: false,
    useChrome: true
    // run instead of chromium
    // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
}).then(client => start(client));

async function start(client) {
    console.log('The Multitasker', '[Version 1.1.2]')

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
        // Message Handler
        msgHandler(client, message);
    });
}
