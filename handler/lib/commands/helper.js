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
     * @param {Boolean} ptt send the file as push to talk?
     * @returns Object information for sending a file from a URL.
     */
    fileFromURL: (url, fileName, title = '', options = null, ptt = false) => { return { type: 'fileFromURL', info: { url, fileName, title, options, ptt } } },
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
     * @param {Boolean} removeFile boolean if to remove a file after sending it.
     * @returns Object information for sending a local file. 
     */
    sendFile: (path, fileName, title = '', removeFile = true) => { return { type: 'sendFile', info: { path, fileName, title }, removeFile } },
    /**
     * Object information for sending a local music file as push to talk.
     * @param {String} path DataURL data:image/xxx;base64,xxx or the RELATIVE (should start with ./ or ../) path of the file you want to send.
     * @param {Boolean} removeFile boolean if to remove a file after sending it.
     * @returns Object information for sending a local music file.
     */
    sendPtt: (path, removeFile = true) => { return { type: 'sendPtt', info: { path }, removeFile } },
    /**
     * Object information for forwarding a message with its ID to a chat with a chatID.
     * @param {String} msgID the message ID being forwarded. 
     * @returns Object information for forwarding a message.
     */
    forwardMessage: (msgID) => { return { type: 'forwardMessage', info: { msgID } } },
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
    videoSticker: (base64, startTime = '00:00:00.0', endTime = '00:00:05.0', fps = 10, crop) => { return { type: 'videoSticker', info: { base64, crop, startTime, endTime, fps } } },
    /**
     * Object information for sending a sticker from a URL.
     * @param {String} url the image's/gif's link.
     * @param {String} keepScale boolean for cropping or not, keepscale==true means no cropping.
     * @returns Object information for sending a sticker from a URL.
     */
    urlSticker: (url, keepScale = true) => { return { type: 'urlSticker', info: { url, keepScale } } },
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
        addUserToBlackList: `${b('Usage:')} ${prefix}blacklist [tag] or reply to someone with the command.\n${b('Aliases:')}\n[blacklist, black]`,
        removeUserFromBlackList: `${b('Usage:')} ${prefix}unblacklist [tag] or reply to someone with the command.\n${b('Aliases:')}\n[unblacklist, unblack]`,
        addPrefixBlackList: `${b('Usage:')} ${prefix}addprefix [country code] inside the group you want to prefix block or !addprefix [group ID] [country code] from bot private chat.\n${b('Aliases:')}\n[addprefix]`,
        removePrefixBlackList: `${b('Usage:')} ${prefix}rmprefix [country code] inside the group you want to prefix block or !addprefix [group ID] [country code] from bot private chat.\n${b('Aliases:')}\n[rmprefix]`,
        addForwarder: `${b('Usage:')} ${prefix}addforwarder [lang] OR in the bot's chat: ${prefix}addforwader [groupID] [lang]  (where lang is a language that is in the localizations.json file)`,
        removeForwarder: `${b('Usage:')} ${prefix}rmforwarder inside the forwarder OR in the bot's chat: ${prefix}rmforwader [groupID] (where groupID is the group you want to add to the forwarder)`,
        addGroupToForwarder: `${b('Usage:')} ${prefix}addgroupforwarder [groupID] inside the forwarder OR in the bot's chat: ${prefix}addgroupforwarder [forwarder groupID] [groupID] (where groupID is the group you want to add to the forwarder)\n${b('Aliases:')}\n[addgroupforwarder, addgf]`,
        removeGroupFromForwarder: `${b('Usage:')} ${prefix}rmgroupforwarder [lang] inside the forwarder OR in the bot's chat: ${prefix}rmgroupforwarder [forwarder groupID] [groupID] (where groupID is the group you want to remove from the forwarder)\n${b('Aliases:')}\n[rmgroupforwarder, rmgf]`,
        setLanguageForwarder: `${b('Usage:')} ${prefix}setlanguageforwarder [lang] inside the forwarder OR in the bot's chat: ${prefix}setlanguageforwarder [forwarder groupID] [lang] (where lang is a language that is in the localizations.json file)\n${b('Aliases:')}\n[setlanguageforwarder, slf]`,
        setMaxMsgsForwarder: `${b('Usage:')} ${prefix}setmaxmsgsforwarder [n] inside the forwarder OR in the bot's chat: ${prefix}setmaxmsgsforwarder [forwarder groupID] [n] (where n is a number that you want to set for the max amount of saved messages)\n${b('Aliases:')}\n[setmaxmsgsforwarder, smmf]`,
        setPrefixForwarder: `${b('Usage:')} ${prefix}setprefixforwarder [flag] inside the forwarder OR in the bot's chat: ${prefix}setprefixforwarder [forwarder groupID] [flag]\n${b('Options:')}\nPrefix message ON/OFF: -p/-prefix\nName in message ON/OFF: -n/-name\n${b('Aliases:')}\n[setprefixforwarder, spf]`,
        removeMsg: `${b('Usage:')} reply with ${prefix}remove to remove a message sent by the bot\n${b('Aliases:')}\n[remove, rmv]`,
        countMessagesByText: `${b('Usage:')} ${prefix}countmsgs [text]\nCounts the amount of messages sent in the group with the text you specified.\n${b('Options:')}\n-u/-user for and tag the users to search the messages for.\n${b('Aliases:')}\n[countmsgs]`,
        spamMessage: `${b('Usage:')} ${prefix}spam [text]\nSpam the text you specified in the group with the amount of times you specified.\n${b('Options:')}\n-n for the amount to spam.\n${b('Aliases:')}\n[spammsg]`,
    },
    Admin: {
        everyone: `${b('Usage:')} ${prefix}everyone\nTags everyone in the group.\n${b('Aliases:')}\n[everyone, tagall]`,
        kick: `${b('Usage:')} ${prefix}kick [@someone] or reply to a message sent by the user with ${prefix}kick\nKicks 🦶 a participant from the group.`,
    },
    Social: {
        meme: `${b('Usage:')} ${prefix}meme and you\'ll get random meme from the following subreddits:\n SUBS_LIST.\n\nOr ${prefix}meme [subreddit] to get a random image from that subreddit.`,
        reddit: `${b('Usage:')} ${prefix}reddit and you\'ll get random post from the following subreddits:\n SUBS_LIST.\n\nOr ${prefix}reddit [subreddit] to get a random post from that subreddit.\n${b('Aliases:')}\n[reddit, rd]`,
        instagram: `${b('Usage:')} reply with ${prefix}instagram to an instagram photo/video/story link or send ${prefix}instagram [link].\n${b('Aliases:')}\n[instagram, insta, ig]`,
        twitter: `${b('Usage:')} reply with ${prefix}twitter to a twitter video link or send ${prefix}twitter [link to tweet with video].\n${b('Aliases:')}\n[twitter, tw]`,
        tiktok: `${b('Usage:')} reply with ${prefix}tiktok to a tiktok video link or send ${prefix}tiktok [link].\n${b('Aliases:')}\n[tiktok, tik, tk]`,
        facebook: `${b('Usage:')} reply with ${prefix}facebook to a facebook video link or send ${prefix}facebook [video link] or send !facebook for a random video from facebook.\n${b('Aliases:')}\n[facebook, fb]`,
        youtube: `${b('Usage:')} reply with ${prefix}youtube to a youtube video link or send ${prefix}youtube [video link].\n${b('Options:')}\n${m(`• audio only: -a`)}\n${b('Aliases:')}\n[youtube, yt]`,
        video: `${b('Usage:')} reply with ${prefix}video to a video link or send ${prefix}video [video link].\n${b('Aliases:')}\n[video, v]`,
    },
    Forwarder: {
        egg: `${b('Usage:')} ${prefix}egg and you\'ll get an 🥚\nHAPPY EGGING!`,
        fart: `${b('Usage:')} ${prefix}fart and you\'ll get a 💨\nCan you smell it?!\nAt least try to!`,

    },
    Info: {
        compile: `${b('Usage:')} ${prefix}compile [language] [code]\n${b('Available languages:')} c, cpp, c#, rill, erlang, elixir, haskell, d, java, rust, python, python2.7, ruby, scala, groovy, nodejs, nodejs14, coffeescript, spidermonkey, swift, perl, php, lua, sql, pascal, lisp, lazyk, vim, pypy, ocaml, go, bash, pony, crystal, nim, openssl, f#, r, typescript, julia`,
        covid: `${b('Usage:')} ${prefix}covid (or ${prefix}covid [1-7] for number of days to get info about) to get back information about active cases, infected people today, etc...`,
        wolfram: `${b('Usage:')} ${prefix}wolfram [question] and you'll receive an answer from Wolfram Alpha.\n${b('Options:')}\n• full answer: -f\n${b('Aliases:')}\n[wolframalpha, wolfram, wolf, wf]`,
        urban: `${b('Usage:')} ${prefix}urban [term] and you'll receive the top definition for that term from Urban Dictionary.\n${b('Options:')}\n${m(`• Word of the day: [how many days ago? 0-9] -wotd\n• random: -r`)}\n${b('Aliases:')}\n[urban, ud]`,
        translate: `${b('Usage:')} ${prefix}translate [text] and you'll receive the translation for the text from Google Translate.\n${b('Options:')}\n(defaults to english if no option used)\n${m(`• translate to: -l=[code] or -lang=[code]`)}\n${b('Language codes:')}\nAfrikaans = *af*, Albanian = *sq*, Amharic = *am*, Arabic = *ar*, Armenian = *hy*, Azerbaijani = *az*, Basque = *eu*, Belarusian = *be*, Bengali = *bn*, Bosnian = *bs*, Bulgarian = *bg*, Catalan = *ca*, Cebuano = *ceb*, Chinese (Simplified) = *zh-CN*, Chinese (Traditional) = *zh-TW*, Corsican = *co*, Croatian = *hr*, Czech = *cs*, Danish = *da*, Dutch = *nl*, English = *en*, Esperanto = *eo*, Estonian = *et*, Finnish = *fi*, French = *fr*, Frisian = *fy*, Galician = *gl*, Georgian = *ka*, German = *de*, Greek = *el*, Gujarati = *gu*, Haitian Creole = *ht*, Hausa = *ha*, Hawaiian = *haw*, Hebrew = *iw*, Hindi = *hi*, Hmong = *hmn*, Hungarian = *hu*, Icelandic = *is*, Igbo = *ig*, Indonesian = *id*, Irish = *ga*, Italian = *it*, Japanese = *ja*, Kannada = *kn*, Kazakh = *kk*, Khmer = *km*, Korean = *ko*, Kurdish = *ku*, Kyrgyz = *ky*, Lao = *lo*, Latvian = *lv*, Lithuanian = *lt*, Luxembourgish = *lb*, Macedonian = *mk*, Malagasy = *mg*, Malay = *ms*, Malayalam = *ml*, Maltese = *mt*, Maori = *mi*, Marathi = *mr*, Mongolian = *mn*, Myanmar (Burmese) = *my*, Nepali = *ne*, Norwegian = *no*, Nyanja (Chichewa) = *ny*, Pashto = *ps*, Persian = *fa*, Polish = *pl*, Portuguese (Portugal, Brazil) = *pt*, Punjabi = *pa*, Romanian = *ro*, Russian = *ru*, Samoan = *sm*, Scots Gaelic = *gd*, Serbian = *sr*, Sesotho = *st*, Shona = *sn*, Sindhi = *sd*, Sinhala (Sinhalese) = *si*, Slovak = *sk*, Slovenian = *sl*, Somali = *so*, Spanish = *es*, Sundanese = *su*, Swahili = *sw*, Swedish = *sv*, Tagalog (Filipino) = *tl*, Tajik = *tg*, Tamil = *ta*, Telugu = *te*, Thai = *th*, Turkish = *tr*, Turkmen = *tk*, Ukrainian = *uk*, Urdu = *ur*, Uzbek = *uz*, Vietnamese = *vi*, Welsh = *cy*, Xhosa = *xh*, Yiddish = *yi*, Yoruba = *yo*, Zulu = *zu*\n${b('Aliases:')}\n[translate, tran, tr]`,
        recognizeMusic: `${b('Usage:')} reply with ${prefix}recognize to an audio message or a video.\n${b('Options:')}\n${m(`• All results: -f or -full`)}\n${b('Aliases:')}\n[recognize, rec, rm]`,
        nikud: `${b('Usage:')} ${prefix}nikud [text] or reply with ${prefix}nikud to a chat message.\n${b('Aliases:')}\n[nikud, nik, נקד]`,
        grammar: `${b('Usage:')} ${prefix}grammar [text] or reply with ${prefix}grammar to a chat message for grammar fixing.\n${b('Options:')}\n• language: -l=[code] or -lang=[code]\n\n${b('Language codes:')}\nFrench = *fra*, English = *eng*\n${b('Aliases:')}\n[grammar, gram]`,
        tts: `${b('Usage:')} ${prefix}tts [text] or reply with ${prefix}tts to a chat message for text to speech.\n${b('Options:')}\n• language: -l=[code] or -lang=[code]\n\n${b('Language codes:')}\nArabic = *ara*, German = *ger*, Spanish = *spa*, French = *fra*, Hebrew = *heb*, Italian = *ita*, Japanese = *jpn*, Dutch = *dut*, Polish = *pol*, Portuguese = *por*, Romanian = *rum*, Russian = *rus*, Turkish = *tur*, Chinese = *chi*, English = *eng*\n${b('Aliases:')}\n[tts]`,
        context: `${b('Usage:')} ${prefix}context [text] or reply with ${prefix}context to a chat message for translating with context.\n${b('Options:')}\n• from language: -fl=[code] or -froml=[code] or -fromlang=[code]\n• to language: -tl=[code] or -tol=[code] or -tolang=[code]\n\n${b('Language codes:')}\nArabic = *ara*, German = *ger*, Spanish = *spa*, French = *fra*, Hebrew = *heb*, Italian = *ita*, Japanese = *jpn*, Dutch = *dut*, Polish = *pol*, Portuguese = *por*, Romanian = *rum*, Russian = *rus*, Turkish = *tur*, Chinese = *chi*, English = *eng*\n${b('Aliases:')}\n[context, cont]`,
        synonym: `${b('Usage:')} ${prefix}synonym [text] or reply with ${prefix}synonym to a chat message for getting synonyms and antonyms for the text given.\n${b('Options:')}\n• language: -l=[code] or -lang=[code]\n\n${b('Language codes:')}\nArabic = *ara*, German = *ger*, Spanish = *spa*, French = *fra*, Hebrew = *heb*, Italian = *ita*, Japanese = *jpn*, Dutch = *dut*, Polish = *pol*, Portuguese = *por*, Romanian = *rum*, Russian = *rus*, Turkish = *tur*, Chinese = *chi*, English = *eng*\n${b('Aliases:')}\n[synonym, syno]`,
        conjugate: `${b('Usage:')} ${prefix}conjugate [text] or reply with ${prefix}conjugate to a chat message for getting information about the text's conjugation.\n${b('Options:')}\n• language: -l=[code] or -lang=[code]\n\n${b('Language codes:')}\nArabic = *ara*, German = *ger*, Spanish = *spa*, French = *fra*, Hebrew = *heb*, Italian = *ita*, Japanese = *jpn*, Dutch = *dut*, Polish = *pol*, Portuguese = *por*, Romanian = *rum*, Russian = *rus*, Turkish = *tur*, Chinese = *chi*, English = *eng*\n${b('Aliases:')}\n[conjugate, conj]`,
        thisDoesntExist: `${b('Usage:')} ${prefix}thisdoesntexist [-flag] (where -flag is one of the flags below) or else a random one will be chosen.\n${b('Options:')}\n• -person\n• -cat\n• -horse\n• -rental\n• -waifu\n• -question\n• -chemical\n• -word\n• -city\n• -simpsons\n• -art\n• -video : *could take some time*\n• -ideas\n• -lyrics : \n\tTopic: type in chat or -t/topic=[topic]\n\tGenre: -g/genre=[genre]\n\tMood: -m/mood=[mood]\nGenres: [country, metal, rock, pop, rap, edm]\nMoods: [verysad, sad, neutral, happy, veryhappy]\n${b('Aliases:')}\n[thisdoesntexist, tde]`,
        emojiGenerator: `${b('Usage:')} ${prefix}emojigenerator [number] (where number is an integer between 1-999)\n${b('Aliases:')}\n[emojigenerator, randemoji]`,
        qr: `${b('Usage:')} ${prefix}qr [data] (where data is the content or content seperated with "|" if needed for some of the options below.)\n${b('Options:')}\nTypes: -type=[type]\nText (default): -type=text\nJust enter a text/website/etc.\n\nEmail: -type=email\n"email|subject|message body"\n\nPhone: -type=phone\nJust enter a phone number\n\nSMS: -type=sms\n"phone number|message"\n\nContact: -type=contact\n"first name|last name|work position|organization|Website|Email|Work phone|Home phone|Mobile phone|Fax work|Fax home|Street|City|State|Zipcode|Country"\n\nWiFi: -type=wifi\n"wifi name|WEP or WPA|Password"\n\nEvent: -type=event\n"Event title|Location|Start date|Start time|End date|End time"\n Date example: YYYY.MM.DD\nTime example: HH:MM\n\nCrypto: -type=crypto\n"Address|Amount"\nChoose the coin using -coin=[type] (where type is one of the following: [bitcoin, bitcoincash, ethereum, litecoin, dash])\n\nWhatsapp: -type=wa\n"Number|Message"\n\n${i(`Note that text can be empty between "|" that you don't want filled in above types.`)}\n\nFile: -file=[type]\nChoose one of the following: [png, svg, pdf, eps]\n\nSize: -size=[300-2000]\n\nMain body: -body=[type]\nChoose one of the following: [square, mosaic, dot, circle, circle-zebra, circle-zebra-vertical, circular, edge-cut, edge-cut-smooth, japnese, leaf, pointed, pointed-edge-cut, pointed-in, pointed-in-smooth,pointed-smooth, round,  rounded-in, rounded-in-smooth, rounded-pointed, star, diamond]\n\nEye: -eye=[0-16]\n\nEyeball: -eyeball=[0-19]\n\nBody Color: -bodycolor=[color in hex]\n\nBackground Color: -bgcolor=[color in hex]\n\nEye 1-3 Color: -eye[1-3]color=[color in hex] or all together -eyescolor=[color in hex]\n\nEyeball 1-3 Color: -eyeball[1-3]color=[color in hex] or all together -eyeballscolor=[color in hex]\n\nGradient: -gradientcolor1=[color in hex] -gradientcolor2=[color in hex]\n\nGradient type: -gradienttype=[linear, radial]\n\nGradient on eyes (default is false): -gradientoneyes=true ${b('Aliases:')}\n[qr]`,
        carInfo: `${b('Usage:')} ${prefix}carinfo [number] (where number is the car's number of length between 7-8)\n${b('Aliases:')}\n[carinfo]`
    },
    Sticker: {
        sticker: `${b('Usage:')}\n${m(`reply with ${prefix}sticker or send the image/gif/video with caption ${prefix}sticker.`)}\n${b('OR')}\n ${m('Reply to a URL of an image/gif to create the sticker from that instead.')}\n${b('Options:')}\n${m(`• cropping: -c\n• remove background (images): -r\n • background: -bg\n • background from url: -bgurl=[image link]\n• Stroke:\n • size: -size=[1-10]\n • color: -color=[color name or #hex]\n • alpha: -alpha=[0-255]\n• Text:\n • stroke color: -scolor=[color name or #hex]\n • fill color: -fcolor=[color name or #hex]\n • size: -fsize=[number 1-1000]\n • rows: -rows=[1-6]\n(for background: send an image (which you want it\'s background removed), then quote the image with the background picture you want)`)}\n${b('Aliases:')}\n${m('[sticker, s]')}`
    },
    Media: {
        removebg: `${b('Usage:')}\n${m(`reply with ${prefix}removebg to an image/sticker or send the image with caption ${prefix}removebg to receive a file without the image background.`)}\n${b('Options:')}\n${m(`• remove background (only images): -r\n• background: -bg\n• background from url: -bgurl=[image link]\n• Stroke:\n • size: -size=[1-10]\n • color: -color=[color name or #hex]\n • alpha: -alpha=[0-255]\n• Text:\n • stroke color: -scolor=[color name or #hex]\n • fill color: -fcolor=[color name or #hex]\n • size: -fsize=[number 1-1000]\n • rows: -rows=[1-6]\n(for background: send an image (which you want it\'s background removed), then quote the image with the background picture you want)`)}\n${b('Aliases:')}\n${m('[removebg, rmbg]')}`,
        toimage: `${b('Usage:')}\n${m(`reply with ${prefix}toimage to an image/sticker or send the image with caption ${prefix}toimage to receive an image.`)}\n${b('Options:')}\n${m(`• remove background (only images): -r\n• background: -bg\n• background from url: -bgurl=[image link]\n• Stroke:\n • size: -size=[1-10]\n • color: -color=[color name or #hex]\n • alpha: -alpha=[0-255]\n• Text:\n • stroke color: -scolor=[color name or #hex]\n • fill color: -fcolor=[color name or #hex]\n • size: -fsize=[number 1-1000]\n • rows: -rows=[1-6]\n• File:\n • get image/sticker as a file: -file or -f\n(for background: send an image (which you want it\'s background removed), then quote the image with the background picture you want)`)}\n${b('Aliases:')}\n${m('[toimage, image, img]')}`,
        videotomp3: `${b('Usage:')}\n${m(`reply with ${prefix}videotomp3 to a video or send the video with caption ${prefix}videotomp3 to receive the audio of the video file.`)}\n${b('Aliases:')}\n${m('[videotomp3, v2mp3, v2m]')}`,
    },
    Help: {
        help: `Oh, I see you've found the 🐰 🥚\n${b('What did you expect to find here...? ')}\n\nWell if you're already here, I have a cool story for you which starts like this...\n\n`
    }
}

module.exports = {
    b, m, i,
    help,
    returnType,
    prefix
}