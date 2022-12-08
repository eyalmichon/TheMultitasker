const { version } = require('./package.json')
const { create, Client } = require('@open-wa/wa-automate');
const { msgHandler, restartHandler, autoRemoveHandler, forwardHandler, welcomeMsgHandler, setupBot } = require('./handler');
const mutexify = require('mutexify/promise')

/**
 * Get all unread messages and go over them.
 * 
 * @param {Client} client 
 */
async function handleUnread(client) {
    const unreadMessages = await client.getAllUnreadMessages();
    const promises = [];
    unreadMessages.forEach(message => {
        promises.push(msgHandler(client, message))
        promises.push(forwardHandler(client, message))
    });
    await Promise.all(promises)
        .catch(err => {
            console.error(err);
            setTimeout(() => {
                return client.kill()
            }, 4000);
        })
}



const start = async (client = new Client()) => {
    console.log(`The Multitasker [Version ${version}]`)

    // Mutex lock for handleUnread.
    const lock = mutexify()

    // refresh the client every 2 hours.
    setInterval(() => {
        client.kill();
    }, 3600000 * 2)

    // Set the host number globally.
    await setupBot(client);

    // Activate all commands that run in background if they were active before restart.
    restartHandler(client, ['redalerts'])

    // If diconnected, go over missed messages.
    client.onStateChanged(async (state) => {
        console.log('[Client State]', state)
        const release = await lock()
        if (state === 'CONNECTED') await handleUnread(client);
        release();
        // Force it to keep the current session
        if (state === 'CONFLICT' || state === 'DISCONNECTED') client.forceRefocus();
    }).catch(err => {
        console.error(err)
        setTimeout(() => {
            return client.kill()
        }, 4000);
    })

    await handleUnread(client);

    client.onMessage(message => {
        // Message handler.
        msgHandler(client, message);
        // Forwarding handler.
        forwardHandler(client, message);

    }).catch(err => {
        console.error(err);
        setTimeout(() => {
            return client.kill()
        }, 4000);
    })

    client.onAnyMessage(message => {
        // Auto remove users.
        autoRemoveHandler(client, message);
        // Welcome message.
        welcomeMsgHandler(client, message);
    }).catch(err => {
        console.error(err);
        setTimeout(() => {
            return client.kill()
        }, 4000);
    })

}

const options = {
    sessionId: 'TheMultitasker',
    multiDevice: true,
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
    // custom path windows
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