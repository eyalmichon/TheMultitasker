const wa = require('@open-wa/wa-automate');
const msgHandler = require('./handler');

// Get all unread messages and go over them.
async function handleUnread(client) {
    const unreadMessages = await client.getAllUnreadMessages();
    unreadMessages.forEach(message => {
        msgHandler(client, message).catch(err => {
            console.error(err);
        })
    });
}

wa.create({
    sessionId: 'TheMultitasker',
    headless: true,
    cacheEnabled: false,
    // try to auto detect chrome location.
    // useChrome: true
    // run instead of chromium
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    // for heroku
    // executablePath: '/app/.apt/usr/bin/google-chrome',
}).then(client => start(client));

async function start(client) {
    console.log('The Multitasker', '[Version 1.2]')

    // refresh the client every 24 hours.
    setInterval(() => {
        client.refresh();
    }, 86400000)

    // Force it to keep the current session
    client.onStateChanged((state) => {
        console.log('[Client State]', state)
        if (state === 'CONNECTED') handleUnread(client);
        if (state === 'CONFLICT' || state === 'DISCONNECTED') client.forceRefocus();
    })

    await handleUnread(client);

    client.onAnyMessage(message => {
        // Message Handler
        msgHandler(client, message);
    }).catch(err => {
        console.error(err);
    })
}
