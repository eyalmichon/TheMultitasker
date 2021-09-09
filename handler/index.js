const { Commands, prefix, errors } = require('./lib/commands');
const commands = new Commands();

const { b, m, i } = require('./util/style');

const { senders, spam, converter, redAlerts } = require('./lib');

const sendersFilePath = __dirname + '/util/senders.json';
// Senders file object.
const mySenders = new senders.Senders(sendersFilePath);
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
// Clean tmp folder in case there are leftovers.
converter.cleanTmp();

/**
 * Delete a message after a certain time.
 * @param {*} object ogject of {client, waitMsg, from}
 * @param {*} time time in seconds.
 */
function delMsgAfter(object, time = 60) {
    setTimeout(() => object.client.deleteMessage(object.from, object.waitMsg, false), time * 1000);
}

/**
 * Restart all commands after an application crash/restart.
 * @param {*} client the wa-automate client.
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
 * Handles message on arrival.
 * 
 * @param {*} client the wa-automate client.
 * @param {*} message the message object.
 * @returns 
 */
const msgHandler = async (client, message) => {
    const { id, from, chatId, sender, isGroupMsg, chat, caption, quotedMsg, mentionedJidList } = message;
    let { body } = message;

    // if we don't send anything mark the chat as seen so we don't get it again on the next startup.
    client.sendSeen(chatId);



    // Return if sender is null or if it's body is undefined or is not a command, or the caption is not a command or (if the chatID
    // isn't in the allowed group AND it's not 'Me'). [if body doesn't start with prefix, we can make body = caption to see if it starts with prefix]
    if (!sender
        || (!body)
        || (!body.startsWith(prefix) && (!caption || !(body = caption).startsWith(prefix)))
        || ((!getGroup('Allowed').includes(from) && getGroup('Me') !== from))) return;

    if (spamSet.isSpam(sender.id)) return client.reply(from, errors.SPAM.info, id);
    // Add user to spam set if it's not the bot owner.
    if (sender.id !== botMaster)
        spamSet.addUser(sender.id);
    // split the body content into args.
    const args = body.trim().split(/ +/);
    // get the command from the body sent.
    const command = args.shift().slice(1).toLowerCase();
    // add all content in quoted message to the args if it's not null.
    if (quotedMsg && quotedMsg.type === 'chat')
        args.push(...(quotedMsg.body.trim().replace(/\n+/g, ' ').split(/ +/)))
    // Bot's number.
    const botNumber = await client.getHostNumber() + '@c.us';
    // if is a group message get the groups ID.
    const groupId = isGroupMsg ? chat.groupMetadata.id : '';
    // if is a group message get the group admins
    const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : '';
    // check if the sender is a group admin.
    const isGroupAdmin = groupAdmins.includes(sender.id) || false;
    // if is a group message get the group members
    const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : '';

    let result = {};
    let waitMsg = null;
    switch (commands.type(command)) {
        case 'Help':
            // for a command help.
            if (args[0]) {
                if (commands.type(args[0].toLowerCase()))
                    result = { type: 'reply', info: await commands.help(args[0].toLowerCase()) };
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
            if (sender.id !== botMaster) { result = errors.OWNER; break };
            switch (command) {
                case 'redalerts':
                    result = await commands.execute(command, client, getGroup, args[0]);
                    break;
                case 'addsender':
                case 'rmsender':
                case 'rmvsender':
                    result = await commands.execute(command, mySenders, args[0], args[1]);
                    break;
                case 'kickall':
                    result = await commands.execute(command, client, groupMembers, groupId, botMaster, botNumber);
                    break;
                case 'membersof':
                    result = await commands.execute(command, client, mySenders, args[0], botMaster);
                    break;
                case 'id':
                case 'jid':
                case 'chatids':
                    result = await commands.execute(command, client, args);
                    break;
                case 'tag':
                    result = await commands.execute(command, client, mentionedJidList, from, args[0]);
                    break;
                case 'm':
                    result = await commands.execute(command, message);
                    break;
                default:
                    result = await commands.execute(command, message);
                    break;
            }
            break;
        // Admin Commands.
        case 'Admin':
            if (!isGroupMsg) { result = errors.GROUP; break };
            if (!isGroupAdmin) { result = errors.ADMIN; break }
            switch (command) {
                case 'everyone':
                case 'tagall':
                    result = await commands.execute(command, client, message, groupMembers, botNumber);
                    break;
                case 'kick':
                    result = await commands.execute(command, client, message);
                    break;
                default:
                    break;
            }
            break;
        // Social Commands.
        case 'Social':
            if (socialSpam.isSpam(sender.id)) { result = errors.SPAM; break }
            // add to social spam set for 20 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 20000);

            waitMsg = client.reply(from, i('I\'m on it! 🔨'), id);
            result = await commands.execute(command, args);

            break;
        // Social Commands.
        case 'Forwarder':
            result = await commands.execute(command, client, getGroup);
            break;
        // Info Commands.
        case 'Info':
            if (socialSpam.isSpam(sender.id)) { result = errors.SPAM; break }
            // add to social spam set for 10 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 10000);

            waitMsg = client.reply(from, i('🧙‍♂️ This may take some time...'), id);
            result = await commands.execute(command, args, message);

            break;
        // Sticker Commands.
        case 'Sticker':
            waitMsg = client.reply(from, i('🧙‍♂️ Please wait a moment while I do some magic...'), id);
            result = await commands.execute(command, message, args);

            break;
        // Media Commands.
        case 'Media':
            waitMsg = client.reply(from, i('🧙‍♂️ Ah, just sit back and i\'ll be right back...'), id);
            result = await commands.execute(command, args, message);

            break;
        default:
            break;
    }

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
            await client.sendMp4AsSticker(from, result.info.base64, { crop: result.info.crop }, { author: 'The Multitasker Bot', pack: 'Stickers' })
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
            await client.sendFileFromUrl(from, result.info.url, result.info.fileName, result.info.title, id, result.info.options, true);
            break;
        case 'filesFromURL':
            result.info
                .forEach(link => client.sendFileFromUrl(from, link, '', '', id, null, true))
            break;
        case 'sendFile':
            await client.sendFile(from, result.info.path, result.info.fileName, result.info.title, id, true)
                .then(() => result.removeFile ? converter.unlinkOutput(result.info.path) : '');
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

    waitMsg = await waitMsg
    if (!!waitMsg) delMsgAfter({ client, waitMsg, from }, 1)

}

module.exports = { msgHandler, restartHandler }