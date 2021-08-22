const { b, m, i } = require('../../util/style');

/**
 * The bot's global prefix.
 */
const prefix = '!';

/**
 * Creates the requested return type object easily.
 */
const returnType = {
    /**
     * Object information for sending a reply.
     * @param {String} text The text you want to send as a reply.
     * @returns Object information for sending a reply.
     */
    reply: (text) => { return { type: 'reply', info: text } },
    /**
     * Object information for sending a text.
     * @param {String} text The text you want to send.
     * @returns Object information for sending a text.
     */
    text: (text) => { return { type: 'text', info: text } },
    /**
     * Object information for sending a file from a URL.
     * @param {String} url the url from where to send the file from.
     * @param {String} fileName the file name that'll be set for the file.
     * @param {String} title the caption to add to the sent message.
     * @param {Object} options options for the fetch request.
     * @returns Object information for sending a file from a URL.
     */
    fileFromURL: (url, fileName, title = '', options = null) => { return { type: 'fileFromURL', info: { url, fileName, title, options } } },
    /**
     * Object information for sending files from URLs.
     * @param {Array} urlsArray an array of URLs.
     * @returns Object information for sending files from URLs.
     */
    filesFromURL: (urlsArray) => { return { type: 'filesFromURL', info: urlsArray } },
    /**
     * Object information for sending a local file.
     * @param {String} path DataURL data:image/xxx;base64,xxx or the RELATIVE (should start with ./ or ../) path of the file you want to send.
     * @param {String} fileName the file name that'll be set for the file.
     * @param {String} title the caption to add to the sent message.
     * @returns Object information for sending a local file. 
     */
    sendFile: (path, fileName, title = '') => { return { type: 'sendFile', info: { path, fileName, title } } },
    /**
     * Object information for sending a local music file as push to talk.
     * @param {String} path DataURL data:image/xxx;base64,xxx or the RELATIVE (should start with ./ or ../) path of the file you want to send.
     * @returns Object information for sending a local music file.
     */
    sendPtt: (path) => { return { type: 'sendPtt', info: { path } } },
    /**
     * Object information for forwarding a message with its ID to a chat with a chatID.
     * @param {String} chatID the chat to forward to.
     * @param {String} msgID the message ID being forwarded. 
     * @returns Object information for forwarding a message.
     */
    forwardMessage: (chatID, msgID) => { return { type: 'forwardMessage', info: { chatID, msgID } } },
    /**
     * Object information for sending a sticker from an image.
     * @param {String} base64 the image's base64.
     * @param {String} keepScale boolean for cropping or not, keepscale==true means no cropping.
     * @returns Object information for sending a sticker from an image.
     */
    imgSticker: (base64, keepScale = true) => { return { type: 'imgSticker', info: { base64, keepScale } } },
    /**
     * Object information for sending a sticker from a video.
     * @param {String} base64 the image's base64.
     * @param {String} crop boolean for cropping or not.
     * @returns Object information for sending a sticker from an video.
     */
    videoSticker: (base64, crop) => { return { type: 'videoSticker', info: { base64, crop } } },
    /**
     * Object information for sending a sticker from a URL.
     * @param {String} url the image's/gif's link.
     * @param {String} keepScale boolean for cropping or not, keepscale==true means no cropping.
     * @returns Object information for sending a sticker from a URL.
     */
    urlSticker: (url, keepScale) => { return { type: 'urlSticker', info: { url, keepScale } } },
    /**
     * Object information for sending a text to the bot master.
     * @param {String} text the string of text.
     * @returns Object information for sending a text to the bot master.
     */
    sendMaster: (text) => { return { type: 'sendMaster', info: text } },
}

const help = {
    Owner: {
        redAlerts: `${b('Usage:')} ${prefix}redalerts [on/off]\nSends Red Alerts 🚀 as message with (or without) location on GoogleMaps.`,
        addSender: `${b('Usage:')} ${prefix}addsender [group] [ID]\nAdd a number to the senders json file.`,
        removeSender: `${b('Usage:')} ${prefix}rmsender [group] [ID]\nRemove a number from the senders json file.\n${b('Aliases:')}\n[rmsender, rmvsender]`,
        kickAll: `${b('Usage:')} ${prefix}kickall\nKicks 🦶 all participants from the group.`,
        membersOf: `${b('Usage:')} ${prefix}membersof [group ID]\nGet a list of names from a specific group.`,
        ID: `${b('Usage:')} ${prefix}id\nGet a list of all group IDs that the bot is part of.\n${b('Aliases:')}\n[id, jid]`,
        tag: `${b('Usage:')} ${prefix}tag [number of tags] [@people]\nMass spam tag people with any amount of mentions.\n${b('⚠ WARNING! DO NOT ABUSE. ⚠')}`,
        m: `Get the ${b('mimetype')} of the message.`,
    },
    Admin: {
        everyone: `${b('Usage:')} ${prefix}everyone\nTags everyone in the group.\n${b('Aliases:')}\n[everyone, tagall]`,
        kick: `${b('Usage:')} ${prefix}kick [@someone] or reply to a message send by the user with ${prefix}kick\nKicks 🦶 a participant from the group.`,
    },
    Social: {
        meme: `${b('Usage:')} ${prefix}meme and you\'ll get random meme from the following subreddits:\n SUBS_LIST.\n\nOr ${prefix}meme [subreddit] to get a random image from that subreddit.`,
        reddit: `${b('Usage:')} ${prefix}reddit and you\'ll get random post from the following subreddits:\n SUBS_LIST.\n\nOr ${prefix}reddit [subreddit] to get a random post from that subreddit.\n${b('Aliases:')}\n[reddit, rd]`,
        instagram: `${b('Usage:')} reply with ${prefix}instagram to an instagram photo/video/story link or send ${prefix}instagram [link].\n${b('Aliases:')} [instagram, insta, ig]`,
        twitter: `${b('Usage:')} reply with ${prefix}twitter to a twitter video link or send ${prefix}twitter [link to tweet with video].\n${b('Aliases:')} [twitter, tw]`,
        tiktok: `${b('Usage:')} reply with ${prefix}tiktok to a tiktok video link or send ${prefix}tiktok [link].\n${b('Aliases:')} [tiktok, tik, tk]`,
        facebook: `${b('Usage:')} reply with ${prefix}facebook to a facebook video link or send ${prefix}facebook [video link] or send !facebook for a random video from facebook.\n${b('Aliases:')} [facebook, fb]`,
        youtube: `${b('Usage:')} reply with ${prefix}youtube to a youtube video link or send ${prefix}youtube [video link].\n${b('Options:')}\n${m(`- audio only: -a`)}\n${b('Aliases:')} [youtube, yt]`,
        video: `${b('Usage:')} reply with ${prefix}video to a video link or send ${prefix}video [video link].\n${b('Aliases:')} [video, v]`,
    },
    Forwarder: {
        egg: `${b('Usage:')} ${prefix}egg and you\'ll get an 🥚\nHAPPY EGGING!`,
        fart: `${b('Usage:')} ${prefix}fart and you\'ll get a 💨\nCan you smell it?!\nAt least try to!`,

    },
    Info: {
        compile: `${b('Usage:')} ${prefix}compile [language] [code]\n${b('Available languages:')} c ,cpp ,c# ,rill ,erlang ,elixir ,haskell ,d ,java ,rust ,python ,python2.7 ,ruby ,scala ,groovy ,nodejs ,nodejs14 ,coffeescript ,spidermonkey ,swift ,perl ,php ,lua ,sql ,pascal ,lisp ,lazyk ,vim ,pypy ,ocaml ,go ,bash ,pony ,crystal ,nim ,openssl ,f# ,r ,typescript ,julia`,
        covid: `${b('Usage:')} ${prefix}covid (or ${prefix}covid [1-7] for number of days to get info about) to get back information about active cases, infected people today, etc...`,
        wolfram: `${b('Usage:')} ${prefix}wolfram [question] and you'll receive an answer from Wolfram Alpha.\n${b('Options:')}\nfull answer: -f\n${b('Aliases:')} [wolframalpha, wolfram, wolf, wf]`
    },
    Sticker: {
        sticker: `${b('Usage:')}\n${m(`reply with ${prefix}sticker or send the image/gif/video with caption ${prefix}sticker.`)}\n${b('OR')}\n ${m('Reply to a URL with an image/gif to create the sticker from that instead.')}\n${b('Options:')}\n${m(`- cropping: -c\n- remove background: -r`)}\n${b('Aliases:')}\n${m('[sticker, s]')}`
    },
    Help: {
        help: `Oh, I see you've found the 🐰 🥚\n${b('What did you expect to find here...?')}\n\nWell if you're already here, I have a cool story for you which starts like this...\n\n`
    }
}

module.exports = {
    b, m, i,
    help,
    returnType,
    prefix
}