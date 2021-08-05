const { decryptMedia } = require('@open-wa/wa-automate');
const { downloader, meme, redAlerts, fetcher, compile, covid, wolfram, senders, spam, converter } = require('./lib');

const sendersFileName = __dirname + '/lib/util/senders.json';
// Senders file object.
const ourSenders = new senders.Senders(sendersFileName);
// senders json object for all senders sorted by use case.
const getSenders = () => { return ourSenders.getSenders(); }
// Get a specific group.
const getGroup = (group) => { return ourSenders.getGroup(group); }
// phone number of the owner of the bot, THIS NEEDS TO BE SET MANUALLY.
const botMaster = getGroup('Me');
// a spam set to filter out the spammers.
const spamSet = new spam.Spam();
// a spam set to filter out the spammers for social fetching services.
const socialSpam = new spam.Spam();
// Set if want to delete the bot's messages after a given time or not.
var deleteMessages = true;

function errLog(err) { console.error(err, '\n'); }
/**
 * Make text bold.
 * @param {String} string 
 * @returns 
 */
function b(string) { return `*${string}*` }
/**
 * Make text monospace.
 * @param {String} string 
 * @returns 
 */
function m(string) { return `\`\`\`${string}\`\`\`` }
/**
 * Make text italic.
 * @param {String} string 
 * @returns 
 */
function i(string) { return `_${string}_` }

async function getContactsObj(array, client) {
    const promises = [];
    array.forEach(item => {
        promises.push(client.getContact(item))
    })
    return await Promise.all(promises);
}
function delMsgAfter(object, time = 60) {
    if (deleteMessages)
        setTimeout(() => object.client.deleteMessage(object.from, object.msg, false), time * 1000);
}

/**
    * Checks if the given URL is valid.
    * @param string The URL we are checking for validity.
    * @returns true if valid, otherwise false.
    */
function isValidUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (err) {
        return false;
    }

    return (url.protocol === "http:" || url.protocol === "https:");
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

    // Return if sender is null or spam or message is from bot or if its body is undefined or is not a command, or the caption is not a command or (if the chatID
    // isn't in the allowed group AND it's not 'Me'). [if body doesn't start with prefix, we can make body =caption to see if it starts with prefix]

    if (!sender
        || (body === undefined)
        || (!body.startsWith(prefix) && (caption === undefined || !(body = caption).startsWith(prefix)))
        || ((!getGroup('Allowed').includes(from) && getGroup('Me') !== from))) return;

    if (spamSet.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
    // Add user to spam set if it's not the bot owner.
    if (sender.id !== botMaster)
        spamSet.addUser(sender.id);

    // get the command from the body sent.
    const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
    // split the body content into args.
    const args = body.trim().split(/ +/).slice(1);
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
    // save for easy access.
    let link = (quotedMsg != null) ? quotedMsg.body : args[0];
    // Check if it's actually a link.
    if (!isValidUrl(link)) link = undefined;
    // get the quoted message if its not null.
    let newMessage = quotedMsg || message;


    switch (command) {
        case 'help':
        case 'commands':
            let helpReply = '';
            if (args[0] === undefined)
                helpReply = `${b('Available commands:')}\n${m('url, sticker, meme, reddit, instagram, facebook, twitter, tiktok, youtube, youtubemp3, compile, wolfram, covid, egg, fart.')}\n${b('Admin commands:')}\n${m('everyone, kick.')}\n${b('More info:')}\n${m('Send "' + prefix + 'help [command]" for command info.')}`;
            else
                switch (args[0]) {
                    case 'url':
                        helpReply = `${b('Usage:')} ${prefix}url [image/gif URL goes here] [Option for cropping: true/false (defaults false)]`;
                        break;
                    case 's':
                    case 'sticker':
                        helpReply = `${b('Usage:')} reply with ${prefix}sticker [Option for cropping: true/false (defaults false)] or send the image/gif/video with caption ${prefix}sticker.\n${b('Aliases:')} [sticker, s]`;
                        break;
                    case 'meme':
                        helpReply = `${b('Usage:')} ${prefix}meme and you\'ll get random meme from the following subreddits:\n ${meme.subreddits.join(', ')}.\n\nOr !meme [subreddit] to get a random image from that subreddit.`;
                        break;
                    case 'rd':
                    case 'reddit':
                        helpReply = `${b('Usage:')} ${prefix}reddit and you\'ll get random post from the following subreddits:\n ${meme.subreddits.join(', ')}.\n\nOr !reddit [subreddit] to get a random post from that subreddit.`;
                        break;
                    case 'kick':
                        helpReply = `${b('Usage:')} ${prefix}kick [@tag the people you want to kick]`;
                        break;
                    case 'ig':
                    case 'instagram':
                        helpReply = `${b('Usage:')} reply with ${prefix}instagram to an instagram photo/video/story link or send ${prefix}instagram [link].\n${b('Aliases:')} [instagram, ig]`;
                        break;
                    case 'tw':
                    case 'twitter':
                        helpReply = `${b('Usage:')} reply with ${prefix}twitter to a twitter video link or send ${prefix}twitter [link to tweet with video].\n${b('Aliases:')} [twitter, tw]`;
                        break;
                    case 'fb':
                    case 'facebook':
                        helpReply = `${b('Usage:')} reply with ${prefix}facebook to a facebook video link or send ${prefix}facebook [video link].\n${b('Aliases:')} [facebook, fb]`;
                        break;
                    case 'tk':
                    case 'tik':
                    case 'tiktok':
                        helpReply = `${b('Usage:')} reply with ${prefix}tiktok to a tiktok video link or send ${prefix}tiktok [link].\n${b('Aliases:')} [tiktok, tik, tk]`;
                        break;
                    case 'yt':
                    case 'youtube':
                        helpReply = `${b('Usage:')} reply with ${prefix}youtube to a youtube video link or send ${prefix}youtube [video link].\n${b('Aliases:')} [youtube, yt]`;
                        break;
                    case 'ytm':
                    case 'yt2mp3':
                    case 'ytmusic':
                    case 'youtubemp3':
                        helpReply = `${b('Usage:')} reply with ${prefix}youtubemp3 to a youtube video link or send ${prefix}youtubemp3 [video link].\n${b('Aliases:')} [youtubemp3, ytm, yt2mp3, ytmusic]`;
                        break;
                    case 'compile':
                        helpReply = `${b('Usage:')} ${prefix}compile [language] [code]\n${b('Available languages:')} c ,cpp ,c# ,rill ,erlang ,elixir ,haskell ,d ,java ,rust ,python ,python2.7 ,ruby ,scala ,groovy ,nodejs ,nodejs14 ,coffeescript ,spidermonkey ,swift ,perl ,php ,lua ,sql ,pascal ,lisp ,lazyk ,vim ,pypy ,ocaml ,go ,bash ,pony ,crystal ,nim ,openssl ,f# ,r ,typescript ,julia`;
                        break;
                    case 'wf':
                    case 'wolf':
                    case 'wolfram':
                    case 'wolframalpha':
                        helpReply = `${b('Usage:')} ${prefix}wolfram [question] and you'll receive an answer from Wolfram Alpha.\n${b('Aliases:')} [wolframalpha, wolfram, wolf, wf]`;
                        break;
                    case 'covid':
                    case 'corona':
                        helpReply = `${b('Usage:')} ${prefix}covid (or ${prefix}covid [1-7] for number of days to get info about) to get back information about active cases, infected people today, etc...`;
                        break;
                    case 'egg':
                        helpReply = `${b('Usage:')} ${prefix}egg and you\'ll get an 🥚\nHAPPY EGGING!`;
                        break;
                    case 'fart':
                        helpReply = `${b('Usage:')} ${prefix}fart and you\'ll get a 💨\nCan you smell it?!\nAt least try to!`;
                        break;
                    default:
                        helpReply = `Are you making up commands?\nUse ${prefix}help for ${b('real')} available commands.`;
                        break;
                }
            await client.reply(from, helpReply, id)
                .then(msg => delMsgAfter({ client: client, msg: msg, from: from }))
            break;
        case 'addsender':
            if (from === botMaster && ourSenders.addSender(args[0], args[1]))
                await client.sendText(from, `📧 Sender has been ${b('added')} to senders json`);
            else
                await client.sendText(from, `📛 Group name or number given was ${b('incorrect!')} [Are you the master of the bot?!?]`);
            break;
        case 'rmsender':
        case 'rmvsender':
            if (from === botMaster && ourSenders.removeSender(args[0], args[1]))
                await client.sendText(from, `📧 Sender has been ${b('removed')} from senders json`);
            else
                await client.sendText(from, `📛 Group name or number given was ${b('incorrect!')} [Are you the master of the bot?!?]`);
            break;
        case 'redalerts':
            // only lets 'Me' activate RedAlerts.
            if (from === botMaster) {
                if (args[0] === 'on') {
                    if (redAlerts.getState())
                        await client.sendText(from, `🚨 Red Alerts ${b('already')} activated!`);
                    else {
                        redAlerts.changeState(true);
                        await client.sendText(from, `🚨 Red Alerts has been ${b('activated!')}`);
                        redAlerts.alerts(client, getGroup);
                    }
                }
                if (args[0] === 'off') {
                    if (redAlerts.getState()) {
                        redAlerts.changeState(false);
                        await client.sendText(from, `🚨 Red Alerts has been ${b('deactivated!')}`);
                    }
                    else
                        await client.sendText(from, `🚨 Red Alerts ${b('already')} deactivated!`);
                }
            }

            break;
        case 'url':
            if (!link) return client.reply(from, '📛 Error, no link', id);
            if (isValidUrl(link)) {
                if (await fetcher.fetchHead(link) === 'CONTENT_TOO_LARGE') return await client.reply(from, '📛 Sorry, the file you\'re trying to get is too large to handle...', id);
                client.reply(from, '🧙‍♂️ Please wait a moment while I do some magic...', id).then(msg => {

                    let shouldCrop = args[1] === 'true' ? true : false;
                    // if sendStickerfromUrl returns false, means it's not an image/gif.
                    client.sendStickerfromUrl(chatId, link, null, { author: 'The Multitasker Bot', keepScale: !shouldCrop, pack: 'Stickers' })
                        .then(stickerRes => {

                            if (!stickerRes) { client.reply(from, '📛 Not an image/gif', id); }
                            delMsgAfter({ client: client, msg: msg, from: from }, 1)
                        })
                })
            }
            else
                await client.reply(from, `📛 Are you sure this is a valid URL?\nSee ${prefix}help url for more info.`, id);
            break;
        case 's':
        case 'sticker':
            if (!newMessage.mimetype) return client.reply(from, `📛 Sorry, this is not the right way to use this command!\nSee ${prefix}help for more details.`, id);

            client.reply(from, '🧙‍♂️ Please wait a moment while I do some magic...', id).then(async msg => {

                const mediaData = await decryptMedia(newMessage);
                const Base64 = `data:${newMessage.mimetype};base64,${mediaData.toString('base64')}`;
                let shouldCrop = args[0] === 'true' ? true : false;
                switch (newMessage.mimetype) {
                    case 'image/jpeg':
                        await client.sendImageAsSticker(from, Base64, { author: 'The Multitasker Bot', keepScale: !shouldCrop, pack: 'Stickers' })
                            .catch(err => {
                                errLog(err);
                                client.reply(from, '📛 There was an error processing your sticker.', id);
                            })
                            .finally(() => delMsgAfter({ client: client, msg: msg, from: from }, 1))
                        break;
                    case 'video/mp4':
                        await client.sendMp4AsSticker(from, Base64, { crop: shouldCrop }, { author: 'The Multitasker Bot', pack: 'Stickers' })
                            .catch(err => {
                                errLog(`${err.name} ${err.message}`);
                                if (err.code === 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED') client.reply(from, '📛 There was an error processing your sticker.\nThe image/video was too large.', id);
                                else client.reply(from, '📛 There was an error processing your sticker.\nMaybe try to edit the length and resend.', id);
                            })
                            .finally(() => delMsgAfter({ client: client, msg: msg, from: from }, 1))
                        break;
                    default:
                        break;
                }
            })
            break;

        // TO-DO custom meme.
        case 'meme':
            if (socialSpam.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
            // add to social spam set for 5 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 5000);
            const memePost = [];

            // find a random meme on a specific sub.
            if (args[0] !== undefined && args[0].match(/^[0-9a-zA-Z]+$/))
                memePost.push(meme.subRedditImg(args[0]))

            // find a random meme on a random sub.
            else
                memePost.push(meme.randomRedditImg())
            await Promise.all(memePost)
                .then(promise => {
                    let post = promise[0];
                    client.sendFileFromUrl(from, post.url, '', post.title, id, null, true)

                })
                .catch(err => {
                    errLog(err);
                    if (err === 'SUB_ERROR') client.reply(from, '📛 Error, this subreddit doesn\'t exist.', id);
                    else if (err === 'NO_MEDIA') client.reply(from, '📛 Error, this subreddit doesn\'t contain any media.', id);
                    else if (err === 'PORN_ERROR') client.reply(from, '📛 Error, this is a porn subreddit. 🔞', id);
                    else client.reply(from, '📛 Error has occurred.', id);
                })
            break;
        case 'rd':
        case 'reddit':
            if (socialSpam.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
            // add to social spam set for 20 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 20000);

            client.reply(from, '🧙‍♂️ This may take some time...', id).then(async msg => {

                const redditPost = [];
                // get a post from a specific subreddit.
                if (args[0] !== undefined && args[0].match(/^[0-9a-zA-Z]+$/))
                    redditPost.push(meme.subRedditPost(args[0]))
                // get a post from a random subreddit.
                else
                    redditPost.push(meme.randomRedditPost());

                await Promise.all(redditPost)
                    .then(async promise => {
                        let post = promise[0];
                        switch (post.type) {
                            case 'video':
                                await client.sendFile(from, post.path, 'the_multitasker.mp4', post.title, id, true)
                                    .then(() => converter.unlinkOutput(post.path));
                                break;
                            case 'image/gif':
                                await client.sendFileFromUrl(from, post.url, '', post.title, id, null, true);
                                break;
                            case 'youtube':
                                downloader.youtube(post.url)
                                    .then(info => { client.sendFileFromUrl(from, info.link, 'the_multitasker.mp4', info.title, id, null, true); })
                                    .catch(err => {
                                        if (err.name === 'TypeError') client.reply(from, '📛 Error, video ID does not match expected format.', id);
                                        else if (err.message === 'Not a YouTube domain') client.reply(from, '📛 Error, this is not a Youtube domain.', id);
                                        else client.reply(from, '📛 Error, wrong link or not a video.', id);
                                    })
                                break;
                            default:
                                break;
                        }
                    })
                    .catch(err => {
                        errLog(err);
                        if (err === 'SUB_ERROR') return client.reply(from, '📛 Error, this subreddit doesn\'t exist.', id);
                        else if (err === 'NO_MEDIA') return client.reply(from, '📛 Error, this subreddit doesn\'t contain any media.', id);
                        else if (err === 'PORN_ERROR') return client.reply(from, '📛 Error, this is a porn subreddit. 🔞', id);
                        else return client.reply(from, '📛 Error has occurred.', id);
                    })
                    .finally(() => delMsgAfter({ client: client, msg: msg, from: from }, 1))
            })
            break;
        case 'everyone':
        case 'tagall':
            if (!isGroupMsg) return client.reply(from, '📛 Sorry, this command can only be used within a group!', id);
            if (!isGroupAdmin) return client.reply(from, '📛 Failed, this command can only be used by group admins!', id);
            let mentionlist = [];
            groupMembers.forEach(member => {
                if ((member !== sender.id) && (member !== botNumber)) mentionlist.push(`@${member.replace('@c.us', '')}`)
            });
            client.sendTextWithMentions(from, mentionlist.join(' '))
                .then((msg) => delMsgAfter({ client: client, msg: msg, from: from }));
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
            if (!link) return client.reply(from, '📛 Error, no link', id);

            if (socialSpam.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
            // add to social spam set for 20 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 20000);

            client.reply(from, i('I\'m on it! 🔨'), id).then(msg => {

                // Get videos/images from link.
                downloader.insta(link)
                    .then((linkList) => {
                        // Then go over the returned list of videos/images.
                        linkList.forEach(item => {
                            client.sendFileFromUrl(from, item, '', '', id, null, true);
                        })
                    }).catch((err) => {
                        if (err.message === 'Not Found instagram') client.reply(from, '📛 Error, the link you sent was invalid.', id);
                        else if (err.message === 'Parse Error') client.reply(from, '📛 Error, this is not a valid Instagram link.', id);
                        else client.reply(from, '📛 Error, private user or wrong link', id);
                    })
                    .finally(() => delMsgAfter({ client: client, msg: msg, from: from }, 1))
            })
            break;


        case 'tw':
        case 'twitter':
            if (!link) return client.reply(from, '📛 Error, no link', id);

            if (socialSpam.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
            // add to social spam set for 20 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 20000);

            client.reply(from, i('I\'m on it! 🔨'), id).then(msg => {

                // Get videos/images from link.
                downloader.tweet(link)
                    .then(async (result) => {
                        if (result === 'CONTENT_TOO_LARGE') return await client.reply(from, '📛 Sorry, the file you\'re trying to get is too large to handle...', id);

                        await client.sendFileFromUrl(from, result, 'the_multitasker.mp4', '', id, null, true);
                    }).catch((err) => {
                        if (err.message === 'Twitter API error') client.reply(from, '📛 Twitter API error, maybe this link is not a valid twitter link.', id);
                        else if (err.message === 'Not a twitter URL') client.reply(from, '📛 Error, this is not a not a twitter URL.', id);
                        else client.reply(from, '📛 Error, private user, wrong link or not a video.', id);
                    })
                    .finally(() => delMsgAfter({ client: client, msg: msg, from: from }, 1))
            })
            break;
        case 'tk':
        case 'tik':
        case 'tiktok':
            if (!link) return client.reply(from, '📛 Error, no link', id);

            if (socialSpam.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
            // add to social spam set for 20 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 20000);

            client.reply(from, i('I\'m on it! 🔨'), id).then(msg => {

                downloader.tiktok(link)
                    .then(async (info) => {
                        await client.sendFileFromUrl(from, info.link, 'the_multitasker.mp4', info.title, id, { headers: info.options }, true)
                    }).catch(() => {
                        client.reply(from, '📛 Error, wrong link or not a video.', id);
                    })
                    .finally(() => delMsgAfter({ client: client, msg: msg, from: from }, 1))
            })
            break;
        case 'yt':
        case 'youtube':
            if (!link) return client.reply(from, '📛 Error, no link', id);

            if (socialSpam.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
            // add to social spam set for 20 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 20000);

            client.reply(from, i('I\'m on it! 🔨'), id).then(msg => {

                downloader.youtube(link)
                    .then(info => client.sendFileFromUrl(from, info.link, 'the_multitasker.mp4', info.title, id, null, true))
                    .catch(err => {
                        if (err.name === 'TypeError') client.reply(from, '📛 Error, video ID does not match expected format.', id);
                        else if (err.message === 'Not a YouTube domain') client.reply(from, '📛 Error, this is not a Youtube domain.', id);
                        else client.reply(from, '📛 Error, wrong link or not a video.', id);
                    })
                    .finally(() => delMsgAfter({ client: client, msg: msg, from: from }, 1))
            })
            break;
        case 'ytm':
        case 'yt2mp3':
        case 'ytmusic':
        case 'youtubemp3':
            if (!link) return client.reply(from, '📛 Error, no link', id);

            if (socialSpam.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
            // add to social spam set for 20 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 20000);

            client.reply(from, i('I\'m on it! 🔨'), id).then(msg => {


                downloader.youtubeMp3(link)
                    .then(info => {
                        client.sendPtt(from, info.link, id)
                            .then(() => converter.unlinkOutput(info.link))
                    })
                    .catch(err => {
                        if (err.name === 'TypeError') client.reply(from, '📛 Error, video ID does not match expected format.', id);
                        else if (err.message === 'Not a YouTube domain') client.reply(from, '📛 Error, this is not a Youtube domain.', id);
                        else client.reply(from, '📛 Error, wrong link or not a video.', id);
                    })
                    .finally(() => delMsgAfter({ client: client, msg: msg, from: from }, 1))
            })

            break;
        case 'fb':
        case 'facebook':

            if (socialSpam.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
            // add to social spam set for 20 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 20000);

            client.reply(from, i('I\'m on it! 🔨'), id).then(msg => {

                if (link)
                    downloader.facebook(link).then(info => client.sendFileFromUrl(from, info.link, 'the_multitasker.mp4', info.title, id, null, true))
                        .catch(err => {
                            if (err.name === 'TypeError') client.reply(from, '📛 Error, couldn\'t find video download, maybe the video is not public...', id);
                            else client.reply(from, '📛 Error, wrong link or not a video.', id);
                        })
                        .finally(() => delMsgAfter({ client: client, msg: msg, from: from }, 1))
                else
                    downloader.facebookRandom().then(info => client.sendFileFromUrl(from, info.link, 'the_multitasker.mp4', info.title, id, null, true))
                        .catch(err => {
                            if (err.name === 'TypeError') client.reply(from, '📛 Error, couldn\'t find video download, maybe the video is not public...', id);
                            else client.reply(from, '📛 Error, wrong link or not a video.', id);
                        })
                        .finally(() => delMsgAfter({ client: client, msg: msg, from: from }, 1))
            })
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
            compile.compile(compiler, code)
                .then(result => client.reply(from, result, id))
                .then((msg) => delMsgAfter({ client: client, msg: msg, from: from }))
            break;

        case 'covid':
        case 'corona':
            if (socialSpam.isSpam(sender.id)) return client.reply(from, '📛 Sorry, I don\'t like spammers!', id);
            // add to social spam set for 10 seconds.
            if (sender.id !== botMaster)
                socialSpam.addUser(sender.id, 10000);

            covid.infected(args[0])
                .then(infectedInfo => client.reply(from, infectedInfo, id))

            break;
        case 'wf':
        case 'wolf':
        case 'wolfram':
        case 'wolframalpha':
            if (args[0] === '-f') {
                args.shift();
                let question = args.join(' ');
                wolfram.getFullAnswer(question)
                    .then(base64 => {
                        client.sendFile(from, `data:document/png;base64,${base64}`, `the_multitasker_${question}.png`, '', id, true)
                    })
                    .catch(() => client.reply(from, '📛 Error, can\'t answer that question.', id))

            }
            else
                wolfram.getAnswer(args.join(' '))
                    .then(res => client.sendFileFromUrl(from, res.img, 'the_multitasker.gif', res.text, id, null, true))
                    .catch(() => client.reply(from, '📛 Error, can\'t answer that question.', id))

            break;
        case 'egg':
            await forwardRandomMessageFromGroup(getGroup("ProjectEgg"), client, chatId);
            break;
        case 'fart':
            await forwardRandomMessageFromGroup(getGroup("Fartictionary"), client, chatId);
            break;
        case 'tag':
            if (botMaster !== sender.id) return client.reply(from, '📛 Failed, this command can only be used by the bot master!', id);
            let tagList = [];
            mentionedJidList.forEach(mentioned => {
                tagList.push(`@${mentioned.replace('@c.us', '')}`)
            });
            let tagText = tagList.join(' ');
            for (let i = 0; i < args[0]; i++) {
                client.sendTextWithMentions(from, tagText);
            }

            break;

        // just in case you want to refresh the session.
        // case 'refresh':
        //     if (botMaster !== sender.id) return client.reply(from, '📛 Failed, this command can only be used by the bot master!', id);
        //     client.refresh();
        //     break;
        default:
            await client.reply(from, `Are you making up commands?\nUse ${prefix}help for ${b('real')} available commands.`, id);

            break;
    }
}