const { Commands, prefix, errors } = require('./lib/commands');
const { BlackList } = require('./util/blacklist');
const { b, m, i } = require('./util/style');
const localizations = require('./util/localizations.json')
const { senders, spam, converter, redAlerts } = require('./lib');
const { Forwarder } = require('./util/forwarder');

const commands = new Commands();
const blackList = new BlackList();
const myForwarder = new Forwarder()


// Senders file object.
const mySenders = new senders.Senders();
// senders json object for all senders sorted by use case.
const getSenders = () => { return mySenders.getSenders(); }
// Get a specific group.
const getGroup = (group) => { return mySenders.getGroup(group); }
// phone number of the owner of the bot, THIS NEEDS TO BE SET MANUALLY.
const botMaster = getGroup('Me');
// a spam set to filter out the spammers.
const spamSet = new spam.Spam();
// a spam set to filter out the spammers for social fetching services.
const socialSpam = new spam.Spam();
// Global host number.
var hostNumber = 0;
// Clean tmp folder in case there are leftovers.
converter.cleanTmp();

// Set the host number globally.
async function setHostNumber(client) {
    hostNumber = await client.getHostNumber() + '@c.us';
}

/**
 * Delete a message after a certain time.
 * @param {*} object ogject of {client, waitMsg, from}
 * @param {*} time time in seconds.
 */
function delMsgAfter(object, time = 60) {
    setTimeout(() => object.client.deleteMessage(object.from, object.waitMsg, false), time * 1000);
}

/**
 * 
 * @param {import('@open-wa/wa-automate').Client} client 
 * @param {import('@open-wa/wa-automate').Message} message 
 */
const autoRemoveHandler = (client, message) => {
    if (!!message.subtype && ['add', 'invite'].includes(message.subtype)) {
        const prefixes = blackList.getPrefixes(message.from);
        if (!!prefixes && !!prefixes.length)
            message.recipients.forEach(recipient => {
                const isPrefix = prefixes.filter(prefix => recipient.startsWith(prefix))
                if (isPrefix.length > 0)
                    client.removeParticipant(message.from, recipient)
            })
    }
}

/**
 * 
 * @param {import('@open-wa/wa-automate').Client} client 
 * @param {import('@open-wa/wa-automate').Message} message 
 */
const welcomeMsgHandler = (client, message) => {
    if (!!message.subtype && ['add', 'invite'].includes(message.subtype) && getGroup('WelcomeMsg')[message.from]) {
        const lang = getGroup('WelcomeMsg')[message.from]
        message.recipients.forEach(recipient => {
            client.sendTextWithMentions(message.from, `${localizations.welcomeMsg[lang].before} @${recipient.replace('@c.us', '')}, ${localizations.welcomeMsg[lang].after} ${message.chat.name}`)
        })
    }
}

/**
 * Restart all commands after an application crash/restart.
 * @param {import('@open-wa/wa-automate').Client} client the wa-automate client.
 * @param {*} cmds array of commands that you wish to try and start after a restart.
 */
const restartHandler = async (client, cmds) => {
    cmds.forEach(cmd => {
        switch (cmd) {
            case 'redalerts':
                if (redAlerts.getState())
                    commands.execute(cmd, client, getGroup, 'on')
                break;
            default:
                break;
        }
    })
}

/**
 * Forward messages to a group from specified groups.
 * @param {import('@open-wa/wa-automate').Client} client 
 * @param {import('@open-wa/wa-automate').Message} message 
 * @returns 
 */
const forwardHandler = async (client, message) => {
    const { id, from, sender, caption, quotedMsg, type, mentionedJidList } = message;
    // try to get the forwarder from the forwardDB.
    const forwarderObj = myForwarder.getForwarder(from);
    // get all group messages.
    const forwarderMsgs = myForwarder.getGroupMessages(from);
    // if the message doesn't have a sender or the group is not a forwarder, or already sent, return.
    if (!sender || !forwarderObj || !!forwarderMsgs[id]) return;
    // create object for id.
    forwarderMsgs[id] = {};
    // if mentioned, replace mentions with the names of the people mentioned in bold.
    if (!!mentionedJidList.length) {
        const mentionObjPromises = []
        mentionedJidList.forEach(mention => mentionObjPromises.push(client.getContact(mention)))
        const mentionsObj = await Promise.all(mentionObjPromises)
        // if returns null.
        if (!!mentionsObj[0])
            message.caption ? mentionsObj.forEach(obj => message.caption = message.caption.replace(/@\d*/, b(obj.pushname || obj.name))) :
                mentionsObj.forEach(obj => message.body = message.body.replace(/@\d*/, b(obj.pushname || obj.name)))
    }
    // if messages in DB are over the limit, delete the difference.
    if (forwarderObj.maxMsgs && myForwarder.getGroupMessagesLength(from) > forwarderObj.maxMsgs)
        // remove 20% of maxMsgs from the DB.
        myForwarder.removeMessages(from, forwarderObj.maxMsgs * 0.2)
    // boolean to check if messages is a quoted message.
    const isQuoted = !!quotedMsg;
    // if quoted, get all IDs for the relevant quoted message.
    const quotedReplyIDs = isQuoted ? forwarderMsgs[quotedMsg.id] : null

    const isAddMsg = (forwarderObj.isPrefixMsg || forwarderObj.isName)

    const name = sender.pushname || sender.formattedName;
    // beginning of message.
    let addedMsg = ``
    if (isAddMsg) {
        const addedMsgArr = []
        // if prefix needed add it.
        if (forwarderObj.isPrefixMsg) addedMsgArr.push(`${myForwarder.getPrefixMsg(forwarderObj.lang)}`)
        // if name needed add it.
        if (forwarderObj.isName) addedMsgArr.push(`${b(name)}`)
        addedMsg = addedMsgArr.join(' ') + ':'
    }

    // promise array for awaiting IDs later.
    const promiseMsgIDArray = []
    switch (type) {
        case 'chat':
            forwarderObj.groups.forEach(group => {
                !!quotedReplyIDs && !!quotedReplyIDs[group] ? promiseMsgIDArray.push(client.reply(group, (isAddMsg) ? [addedMsg, message.body].join('\n\n') : message.body, quotedReplyIDs[group])) :
                    promiseMsgIDArray.push(client.sendText(group, (isAddMsg) ? [addedMsg, message.body].join('\n\n') : message.body))
            })
            break;
        case 'image':
        case 'video':
            let media = await client.decryptMedia(message)
            forwarderObj.groups.forEach(group => promiseMsgIDArray.push(client.sendFile(group, media, '', (isAddMsg) ? (!!caption ? [addedMsg, caption].join('\n\n') : addedMsg) : '', !!quotedReplyIDs && !!quotedReplyIDs[group] ? quotedReplyIDs[group] : null, true)))
            break;
        case 'sticker':
        case 'ptt':
        case 'audio':
        case 'document':
        case 'vcard':
        case 'location':
            forwarderObj.groups.forEach(async group => {
                const msg = await client.forwardMessages(group, message.id)
                promiseMsgIDArray.push(msg[0])
                client.reply(group, (isAddMsg) ? addedMsg : '', !!quotedReplyIDs && !!quotedReplyIDs[group] ? quotedReplyIDs[group] : msg[0])
            })
            break;
    }
    // wait for all messages to get an ID
    const msgIDArray = await Promise.all(promiseMsgIDArray)

    const msgIDObject = {}
    forwarderObj.groups.forEach((group, i) => msgIDObject[group] = msgIDArray[i])
    // add all message IDs sent to this messages.
    forwarderMsgs[id] = msgIDObject
    // for each group add the forwarded message as an object with the other messages associated with it as its objects.
    forwarderObj.groups.forEach(group => {
        const groupObj = myForwarder.getForwarder(group);
        if (!!groupObj) {
            // if messages in DB are over the limit, delete the difference.
            if (groupObj.maxMsgs && myForwarder.getGroupMessagesLength(group) > groupObj.maxMsgs)
                // remove 20% of maxMsgs from the DB.
                myForwarder.removeMessages(group, groupObj.maxMsgs * 0.2)

            const msgObject = {}
            msgObject[from] = id;
            groupObj.groups.forEach(group => {
                if (group != from)
                    msgObject[group] = msgIDObject[group]
            })
            // add all ids to the group by the message id of that group
            myForwarder.getGroupMessages(group)[msgIDObject[group]] = msgObject;
        }
    })

    myForwarder.writeToMessagesDB();
}

/**
 * Handles message on arrival.
 * 
 * @param {import('@open-wa/wa-automate').Client} client the wa-automate client.
 * @param {import('@open-wa/wa-automate').Message} message the message object.
 * @returns 
 */
const msgHandler = async (client, message) => {
    const { id, from, sender, isGroupMsg, chat, caption, quotedMsg, mentionedJidList } = message;
    let { body } = message;

    // if we don't send anything mark the chat as seen so we don't get it again on the next startup.
    await client.sendSeen(from)

    let groupBlackList = blackList.getGroup(from);
    // Return if sender is null or if it's body is undefined or is not a command, or the caption is not a command or (if the chatID
    // isn't in the allowed group AND it's not 'Me'). [if body doesn't start with prefix, we can make body = caption to see if it starts with prefix]
    if (!sender
        || (!!groupBlackList && groupBlackList.includes(sender.id))
        || (!body)
        || (!body.startsWith(prefix) && (!caption || !(body = caption).startsWith(prefix)))
        || (!getGroup('Allowed').includes(from) && sender.id !== botMaster)) return;

    if (spamSet.isSpam(sender.id)) return client.reply(from, errors.SPAM.info, id);
    // Add user to spam set if it's not the bot owner.
    if (sender.id !== botMaster)
        spamSet.addUser(sender.id);
    // split the body content into args.
    message.args = body.trim().split(/ +/);
    // get the command from the body sent.
    const command = message.args.shift().slice(1).toLowerCase();
    // add all content in quoted message to the args if it's not null.
    if (quotedMsg && quotedMsg.type === 'chat')
        message.args.push(...(quotedMsg.body.trim().replace(/\n+/g, ' ').split(/ +/)))

    let result = {};
    let waitMsg = null;
    switch (commands.type(command)) {
        case 'Help':
            // for a command help.
            if (message.args[0]) {
                if (commands.type(message.args[0].toLowerCase()))
                    result = { type: 'reply', info: await commands.help(message.args[0].toLowerCase()) };
                else
                    result = errors.WRONG_CMD;
            }
            // for help.
            else {
                result = await commands.execute(command);
            }
            break;
        // Owner commands, needs different args.
        case 'Owner':
            // if is a group message get the group members
            message.groupMembers = isGroupMsg ? await client.getGroupMembersId(from) : '';
            message.getGroup = getGroup;
            message.mySenders = mySenders;
            message.blackList = blackList;
            message.botMaster = botMaster;
            message.myForwarder = myForwarder;
            message.botNumber = hostNumber;
            if (sender.id !== botMaster) { result = errors.OWNER; break };
            result = await commands.execute(command, message, client);
            break;
        // Admin Commands.
        case 'Admin':
            // if is a group message get the group admins
            const groupAdmins = isGroupMsg ? await client.getGroupAdmins(from) : '';
            // check if the sender is a group admin.
            const isGroupAdmin = groupAdmins.includes(sender.id) || sender.id === botMaster || false;
            // if is a group message get the group members
            message.groupMembers = isGroupMsg ? await client.getGroupMembersId(from) : '';
            message.botNumber = hostNumber;
            if (!isGroupMsg) { result = errors.GROUP; break };
            if (!isGroupAdmin) { result = errors.ADMIN; break }
            result = await commands.execute(command, message, client);
            break;
        // Social Commands.
        case 'Social':
            if (socialSpam.isSpam(sender.id)) { result = errors.SPAM; break }
            // add to social spam set for 20 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 20000);

            waitMsg = client.reply(from, i('I\'m on it! ????'), id);
            result = await commands.execute(command, message.args);
            break;
        // Social Commands.
        case 'Forwarder':
            message.getGroup = getGroup;
            result = await commands.execute(command, message, client);
            break;
        // Info Commands.
        case 'Info':
            if (socialSpam.isSpam(sender.id)) { result = errors.SPAM; break }
            // add to social spam set for 10 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 10000);

            waitMsg = client.reply(from, i('????????????? This may take some time...'), id);
            result = await commands.execute(command, message);

            break;
        // Sticker Commands.
        case 'Sticker':
            if (quotedMsg) {
                // try to get the message object by ID.
                message.quotedMsg = await client.getMessageById(quotedMsg.id);
                // load earlier messages until getting the message object by ID.
                while (!message.quotedMsg) {
                    if (!message.quotedMsg) {
                        await client.loadEarlierMessages(from);
                        message.quotedMsg = await client.getMessageById(quotedMsg.id);
                    }
                }
            }
            waitMsg = client.reply(from, i('????????????? Please wait a moment while I do some magic...'), id);
            result = await commands.execute(command, message);
            break;
        // Media Commands.
        case 'Media':
            waitMsg = client.reply(from, i('????????????? Just sit back, enjoy the view, and i\'ll be right back...'), id);
            result = await commands.execute(command, message);
            break;
        default:
            result = errors.WRONG_CMD
            break;
    }

    waitMsg = await waitMsg

    if (!result || !result.info)
        result = errors.BAD_CMD

    switch (result.type) {
        case 'reply':
            await client.reply(from, result.info, id);
            break;
        case 'text':
            await client.sendText(from, result.info);
            break;
        case 'imgSticker':
            await client.sendImageAsSticker(from, result.info.base64, { author: 'The Multitasker Bot', keepScale: result.info.keepScale, pack: 'Stickers' })
                .catch(err => {
                    console.error(err);
                    client.reply(from, errors.STICKER_ERR.info, id);
                })
            break;
        case 'videoSticker':
            await client.sendMp4AsSticker(from, result.info.base64, { crop: result.info.crop, startTime: result.info.startTime, endTime: result.info.endTime, fps: result.info.fps }, { author: 'The Multitasker Bot', pack: 'Stickers' })
                .catch(err => {
                    console.error(`${err.name} ${err.message}`);
                    if (err.code === 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED') client.reply(from, errors.STICKER_TOO_LARGE.info, id);
                    else client.reply(from, errors.STICKER_RETRY.info, id);
                })
            break;
        case 'urlSticker':
            await client.sendStickerfromUrl(from, result.info.url, null, { author: 'The Multitasker Bot', keepScale: result.info.keepScale, pack: 'Stickers' })
                .then(stickerRes => {
                    if (!stickerRes) client.reply(from, errors.STICKER_NOT_GIF.info, id);
                })
                .catch(err => {
                    console.error(err);
                    client.reply(from, errors.STICKER_ERR.info, id);
                })
            break;
        case 'fileFromURL':
            await client.sendFileFromUrl(from, result.info.url, result.info.fileName, result.info.title, id, result.info.options, true, result.info.ptt);
            break;
        case 'filesFromURL':
            result.info
                .forEach(link => client.sendFileFromUrl(from, link, '', '', id, null, true))
            break;
        case 'sendFile':
            await client.sendFile(from, result.info.path, result.info.fileName, result.info.title, id, true)
                .then(() => result.removeFile ? converter.unlinkOutput(result.info.path) : '');
            break;
        case 'sendFiles':
            result.info.filePaths
                .forEach((filePath, i) => client.sendFile(from, filePath, result.info.fileNames[i], result.info.titles[i] ? result.info.titles[i] : '', id, true)
                    .then(() => result.removeFiles ? converter.unlinkOutput(filePath) : ''));
            break;
        case 'sendPtt':
            await client.sendPtt(from, result.info.path, id)
                .then(() => result.removeFile ? converter.unlinkOutput(result.info.path) : '')
            break;
        case 'forwardMessage':
            await client.forwardMessages(from, result.info.msgID);
            break;
        case 'sendMaster':
            await client.sendText(botMaster, result.info);
            break;
        default:
            break;
    }

    if (!!waitMsg) delMsgAfter({ client, waitMsg, from }, 1)

}

module.exports = { msgHandler, restartHandler, autoRemoveHandler, forwardHandler, welcomeMsgHandler, setHostNumber }