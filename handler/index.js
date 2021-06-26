const { decryptMedia } = require('@open-wa/wa-automate');
const { downloader, meme, redAlerts, fetcher, compile, senders, spam } = require('./lib');

const sendersFileName = __dirname + '/lib/util/senders.json';
// Senders file object.
const ourSenders = new senders.Senders(sendersFileName);
// senders json object for all senders sorted by use case.
const getSenders = () => { return ourSenders.getSenders(); }
// Get a specific group.
const getGroup = (group) => { return ourSenders.getGroup(group); }
// a spam map to filter out the spammers.
const spamSet = new spam.Spam();
// a spam map to filter out the spammers for social fetching services.
const socialSpam = new spam.Spam();

function errLog(err) { console.error(err, '\n'); }

async function getContactsObj(array, client) {
    const promises = [];
    array.forEach(item => {
        promises.push(client.getContact(item))
    })
    return await Promise.all(promises);
}

/**
    * Checks if the given URL is valid.
    * @param string The URL we are checking for validity.
    * @returns true if valid, otherwise false.
    */
function isValidUrl(string, domain) {
    let url;
    try {
        url = new URL(string);
    } catch (err) {
        return false;
    }
    if (url.hostname.includes('www.')) { url.hostname = url.hostname.slice(4) }
    domain = domain ? domain : url.hostname;
    return (url.protocol === "http:" || url.protocol === "https:") && domain === url.hostname;
}
/**
 * Check if the given link is invalid in either the first argument (link), or in the quoted message.
 * @param {String} domain 
 * @param {String} link 
 * @param {Object} quotedM 
 * @returns Boolean
 */
function isSocialNotValid(domain, link, quotedM) {
    return (link === undefined || !isValidUrl(link, domain))
        && (quotedM === null || !isValidUrl(link = quotedM.body, domain));
}
/**
 * Forward a random message from a given group.
 * @param groupID groupID from senders file.
 * @param client the wa automate client.
 * @param chatId the charId given.
 */
async function forwardRandomMessageFromGroup(groupID, client, chatId) {
    // get all messages from given group.
    let messagesArr = await client.loadAndGetAllMessagesInChat(groupID, false);
    // get a random index for the messages array.
    let index = Math.floor(Math.random() * messagesArr.length);
    // send the random message!
    await client.forwardMessages(chatId, messagesArr[index].id);
}

module.exports = msgHandler = async (client, message) => {
    const { type, id, from, chatId, t, sender, isGroupMsg, chat, caption, fromMe, isMedia, isGif, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message;
    // if we don't send anything mark the chat as seen so we don't get it again on the next startup.
    client.sendSeen(chatId);

    let { body } = message;
    // bot's prefix.
    const prefix = '!';

    // Return if spam or message is from bot or if its body is undefined or is not a command, or the caption is not a command or (if the chatID
    // isn't in the allowed group AND it's not 'Me'). [if body doesn't start with prefix, we can make body =caption to see if it starts with prefix]
    if (spamSet.isSpam(sender.id)
        || (body === undefined || fromMe)
        || (!body.startsWith(prefix) && (caption === undefined || !(body = caption).startsWith(prefix)))
        || ((!getGroup('Allowed').includes(from) && getGroup('Me') !== from))) return;
    spamSet.addUser(sender.id);

    // get the command from the body sent.
    const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
    // split the body content into args.
    const args = body.trim().split(/ +/).slice(1);
    // Bot's number.
    const botNumber = await client.getHostNumber() + '@c.us';
    // phone number of the owner of the bot, THIS NEEDS TO BE SET MANUALLY.
    const botMaster = getGroup('Me');
    // if is a group message get the groups ID.
    const groupId = isGroupMsg ? chat.groupMetadata.id : '';
    // if is a group message get the group admins
    const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : '';
    // check if the sender is a group admin.
    const isGroupAdmin = groupAdmins.includes(sender.id) || false;
    // if is a group message get the group members
    const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : '';
    // save for easy access.
    let link = (quotedMsg != null) ? quotedMsg.body : args[0];
    // get the quoted message if its not null.
    let newMessage = quotedMsg || message;


    switch (command) {
        case 'help':
        case 'commands':
            if (args[0] === undefined)
                await client.reply(from, '*Available commands:* url, sticker, meme, everyone, kick, instagram, twitter, compile, egg, fart.\nSend "!help [command]" for command info.', id);
            else
                switch (args[0]) {
                    case 'url':
                        await client.reply(from, '*Usage:* !url [image/gif URL goes here] [Option for cropping: true/false (defaults true)]', id);
                        break;
                    case 's':
                    case 'sticker':
                        await client.reply(from, '*Usage:* reply with !sticker [Option for cropping: true/false (defaults true)] or send the image/gif/video with caption !sticker.\naliases: [sticker, s]', id);
                        break;
                    case 'meme':
                        await client.reply(from, '*Usage:* !meme and you\'ll get random meme from dankmemes, wholesomeanimemes, wholesomememes, MemeEconomy, memes, terriblefacebookmemes, historymemes.', id);
                        break;
                    case 'kick':
                        await client.reply(from, '*Usage:* !kick [@tag the people you want to kick]', id);
                        break;
                    case 'ig':
                    case 'instagram':
                        await client.reply(from, '*Usage:* reply with !instagram to an instagram photo/video/story link or send !instagram [link].\naliases: [instagram, ig]', id);
                        break;
                    case 'tw':
                    case 'twitter':
                        await client.reply(from, '*Usage:* reply with !twitter to a twitter video link or send !twitter [tweet with video link].\naliases: [twitter, tw]', id);
                        break;
                    case 'compile':
                        await client.reply(from, '*Usage:* !compile [language] [code]\n*Available languages:* c ,cpp ,c# ,rill ,erlang ,elixir ,haskell ,d ,java ,rust ,python ,python2.7 ,ruby ,scala ,groovy ,nodejs ,nodejs14 ,coffeescript ,spidermonkey ,swift ,perl ,php ,lua ,sql ,pascal ,lisp ,lazyk ,vim ,pypy ,ocaml ,go ,bash ,pony ,crystal ,nim ,openssl ,f# ,r ,typescript ,julia', id);
                        break;
                    case 'egg':
                        await client.reply(from, '*Usage:* !egg and you\'ll get an 🥚\nHAPPY EGGING!', id);
                        break;
                    case 'fart':
                        await client.reply(from, '*Usage:* !fart and you\'ll get a 💨\nCan you smell it?!\nAt least try to!', id);
                        break;
                    default:
                        await client.reply(from, "Are you making up commands?\nUse !help for *real* available commands.")
                        break;
                }
            break;
        case 'addsender':
            if (from === botMaster && ourSenders.addSender(args[0], args[1]))
                await client.sendText(from, '📧 Sender has been *added* to senders json');
            else
                await client.sendText(from, '📛 Group name or number given was *incorrect!* [Are you the master of the bot?!?]');
            break;
        case 'rmsender':
        case 'rmvsender':
            if (from === botMaster && ourSenders.removeSender(args[0], args[1]))
                await client.sendText(from, '📧 Sender has been *removed* from senders json');
            else
                await client.sendText(from, '📛 Group name or number given was *incorrect!* [Are you the master of the bot?!?]');
            break;
        case 'redalerts':
            // only lets 'Me' activate RedAlerts.
            if (from === botMaster) {
                if (args[0] === 'on') {
                    if (redAlerts.getState())
                        await client.sendText(from, '🚨 Red Alerts *already* activated!');
                    else {
                        redAlerts.changeState(true);
                        await client.sendText(from, '🚨 Red Alerts has been *activated!*');
                        redAlerts.alerts(client, getSenders);
                    }
                }
                if (args[0] === 'off') {
                    if (redAlerts.getState()) {
                        redAlerts.changeState(false);
                        await client.sendText(from, '🚨 Red Alerts has been *deactivated!*');
                    }
                    else
                        await client.sendText(from, '🚨 Red Alerts *already* deactivated!');
                }
            }

            break;
        case 'url':
            if (isValidUrl(link)) {

                if (await fetcher.fetchHead(link) === 'CONTENT-TOO-LARGE') return await client.reply(from, '📛 Sorry, the file you\'re trying to get is too large to handle...', id);
                await client.reply(from, '🧙‍♂️ Please wait a moment while I do some magic...', id);
                let shouldCrop = args[1] === 'true' ? true : false;
                // if sendStickerfromUrl returns false, means it's not an image/gif.
                if (!(await client.sendStickerfromUrl(chatId, link, null, { author: 'The Multitasker Bot', keepScale: !shouldCrop, pack: 'Stickers' }))) { await client.reply(from, '📛 Not an image/gif', id); }
            }
            else
                await client.reply(from, 'Are you sure this is a valid URL?\nSee !help url for more info.', id);
            break;
        case 's':
        case 'sticker':
            if (!newMessage.mimetype) return client.reply(from, '📛 Sorry, this is not the right way to use this command!\nSee !help for more details.', id)
            await client.reply(from, '🧙‍♂️ Please wait a moment while I do some magic...', id);
            const mediaData = await decryptMedia(newMessage);
            const Base64 = `data:${newMessage.mimetype};base64,${mediaData.toString('base64')}`;
            let shouldCrop = args[0] === 'true' ? true : false;
            switch (newMessage.mimetype) {
                case 'image/jpeg':
                    await client.sendImageAsSticker(from, Base64, { author: 'The Multitasker Bot', keepScale: !shouldCrop, pack: 'Stickers' })
                        .catch(err => {
                            errLog(err);
                            client.reply(from, '📛 There was an error processing your sticker.', id);
                        });
                    break;
                case 'video/mp4':
                    await client.sendMp4AsSticker(from, Base64, { crop: shouldCrop }, { author: 'The Multitasker Bot', pack: 'Stickers' })
                        .catch(err => {
                            errLog(`${err.name} ${err.message}`);
                            if (err.code === 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED') return client.reply(from, '📛 There was an error processing your sticker.\nThe image/video was too large.', id);
                            client.reply(from, '📛 There was an error processing your sticker.\nMaybe try to edit the length and resend.', id);
                        });
                    break;
                default:
                    break;
            }
            break;

        case 'meme':
            if (socialSpam.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
            // add to social spam map for 5 seconds.
            socialSpam.addUser(sender.id, 5000);
            if (args[0] !== undefined && botMaster === sender.id && 0 < args[0] && args[0] <= 10) {
                for (let i = 0; i < args[0]; i++) {
                    let { image, title } = await meme.random();
                    await client.sendImage(from, image, '', title);
                }
            }
            else {
                let { image, title } = await meme.random();
                await client.sendImage(from, image, '', title);
            }
            break;
        // TO-DO custom meme.
        case 'everyone':
        case 'tagall':
            if (!isGroupMsg) return client.reply(from, '📛 Sorry, this command can only be used within a group!', id);
            if (!isGroupAdmin) return client.reply(from, '📛 Failed, this command can only be used by group admins!', id);
            let mentionlist = [];
            groupMembers.forEach(member => {
                if ((member !== sender.id) && (member !== botNumber)) mentionlist.push(`@${member.replace('@c.us', '')}`)
            });
            await client.sendTextWithMentions(from, mentionlist.join(' '));
            break;
        case 'kick':
            if (!isGroupMsg) return client.reply(from, '📛 Sorry, this command can only be used within a group!', id)
            if (!isGroupAdmin) return client.reply(from, '📛 Failed, this command can only be used by group admins!', id);
            if (quotedMsg !== null)
                await client.removeParticipant(groupId, quotedMsg.sender.id);
            mentionedJidList.forEach(member => {
                client.removeParticipant(groupId, member);
            })
            break;
        case 'kickall':
            if (botMaster !== sender.id) return client.reply(from, '📛 Failed, this command can only be used by the bot master!', id);
            groupMembers.forEach(member => {
                if (member !== sender.id && member !== botNumber) client.removeParticipant(groupId, member);
            })
            break;
        case 'ig':
        case 'insta':
        case 'instagram':
            if (socialSpam.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
            // add to social spam map for 20 seconds.
            socialSpam.addUser(sender.id, 20000);
            // Return if link isn't valid.
            if (isSocialNotValid('instagram.com', link, newMessage))
                return client.reply(from, '📛 Sorry, the link you sent is invalid.\nSee !help for more details.', id);

            await client.reply(from, '_I\'m on it! 🔨_', id)
            // Get videos/images from link.
            downloader.insta(link).then(async (linkList) => {
                // Then go over the returned list of videos/images.
                linkList.forEach(async item => {
                    client.sendFileFromUrl(from, item, '', '', null, null, true);
                })
            }).catch((err) => {
                errLog(`${err.name} ${err.message}`);
                if (err.message === 'Not Found instagram') { return client.reply(from, '📛 Error, the link you sent was invalid.', id) }
                client.reply(from, '📛 Error, private user or wrong link', id)
            })
            break;


        case 'tw':
        case 'twitter':
            if (socialSpam.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
            // add to social spam map for 20 seconds.
            socialSpam.addUser(sender.id, 20000);
            // Return if link isn't valid.
            if (isSocialNotValid('twitter.com', link, newMessage))
                return client.reply(from, 'Sorry, the link you sent is invalid.\nSee !help for more details.', id);

            await client.reply(from, '_I\'m on it! 🔨_', id)
            // Get videos/images from link.
            downloader.tweet(link).then(async (result) => {
                if (await fetcher.fetchHead(result) === 'CONTENT-TOO-LARGE') return await client.reply(from, '📛 Sorry, the file you\'re trying to get is too large to handle...', id);
                await client.sendFileFromUrl(from, result, 'video.mp4', '', null, null, true);
            }).catch((err) => {
                errLog(err);
                client.reply(from, 'Error, private user, wrong link or not a video.', id)
            });
            break;


        case 'membersof':
            // only allows bot master to use 
            if (botMaster !== sender.id) return client.reply(from, '📛 Failed, this command can only be used by the bot master!', id);
            if (!ourSenders.isCorrectNumber(args[0])) return client.reply(from, '📛 Failed, number entered was incorrect.', id);
            // gets all the phone numbers from a given group.
            let membersNum = await client.getGroupMembersId(args[0]);
            // get all the objects of user info.
            let membersObj = await getContactsObj(membersNum, client);
            // get all public shown names of the found numbers.
            let memberNames = [];
            membersObj.forEach(member => {
                memberNames.push(member['pushname'] ? member['pushname'] : member['name'])
            })
            // send the list of names to the bot master.
            await client.sendText(botMaster, memberNames.join(', '));
            break;

        case 'compile':
            let compiler = args.shift();
            let code = args.join(' ');
            let result = await compile.compile(compiler, code);

            await client.reply(from, result, id);
            break;
        case 'egg':
            await forwardRandomMessageFromGroup(getGroup("ProjectEgg"), client, chatId);
            break;
        case 'fart':
            await forwardRandomMessageFromGroup(getGroup("Fartictionary"), client, chatId);
            break;
        // just in case you want to refresh the session.
        case 'refresh':
            if (botMaster !== sender.id) return client.reply(from, '📛 Failed, this command can only be used by the bot master!', id);
            client.refresh();
            break;
        default:
            await client.reply(from, "Are you making up commands?\nUse !help for *real* available commands.", id);

            break;
    }
}