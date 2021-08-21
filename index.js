const { create, Client } = require('@open-wa/wa-automate');
const { msgHandler, restartHandler } = require('./handler');

// Get all unread messages and go over them.
async function handleUnread(client) {
    const unreadMessages = await client.getAllUnreadMessages();
    unreadMessages.forEach(message => {
        msgHandler(client, message)
            .catch(err => {
                console.error(err);
            })
    });
}



const start = async (client = new Client()) => {
    console.log('The Multitasker', '[Version 1.4]')

    // // refresh the client every hour.
    // setInterval(() => {
    //     client.refresh();
    // }, 3600000)

    try {
        // Activate all commands that run in background if they were active before restart.
        restartHandler(client, ['redalerts'])

        // Force it to keep the current session
        client.onStateChanged(state => {
            console.log('[Client State]', state)
            if (state === 'CONNECTED') handleUnread(client);
            if (state === 'CONFLICT' || state === 'DISCONNECTED') client.forceRefocus();
        })

        handleUnread(client);

        client.onMessage(message => {
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
    // run instead of chromium
    // useChrome: true
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    // for linux
    // executablePath: '/usr/bin/google-chrome-stable',
    // for heroku
    // executablePath: '/app/.apt/usr/bin/google-chrome',
    throwErrorOnTosBlock: false,
    disableSpins: true,
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