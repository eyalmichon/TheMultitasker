const { create, Client } = require('@open-wa/wa-automate');
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



const start = async (client = new Client()) => {
    console.log('The Multitasker', '[Version 1.3.1]')

    // // refresh the client every hour.
    // setInterval(() => {
    //     client.refresh();
    // }, 3600000)

    try {

        // Force it to keep the current session
        client.onStateChanged(state => {
            console.log('[Client State]', state)
            if (state === 'CONNECTED') handleUnread(client);
            if (state === 'CONFLICT' || state === 'DISCONNECTED') client.forceRefocus();
        })

        handleUnread(client);

        client.onAnyMessage(message => {
            // Message Handler
            msgHandler(client, message);
        }).catch(err => {
            console.error(err);
        })

    } catch (err) {
        console.error(err);
        setTimeout(() => {
            return client.kill()
        }, 5000);
    }
}

const options = {
    sessionId: 'TheMultitasker',
    qrTimeout: 0,
    authTimeout: 0,
    headless: true,
    cacheEnabled: false,
    restartOnCrash: start,
    killProcessOnBrowserClose: true,
    // log browser errors
    logConsoleErrors: true,
    // try to auto detect chrome location.
    // useChrome: true
    // run instead of chromium
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    // for linux
    // executablePath: '/usr/bin/google-chrome-stable',
    // for heroku
    // executablePath: '/app/.apt/usr/bin/google-chrome',
    throwErrorOnTosBlock: false,
    chromiumArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--aggressive-cache-discard',
        '--disable-cache',
        '--disable-gl-drawing-for-tests',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disk-cache-size=0'
    ]
};

create(options)
    .then(client => start(client))
    .catch((err) => console.error(err));