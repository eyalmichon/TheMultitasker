const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { decryptMedia } = require("@open-wa/wa-automate");
const { parser, imageProcessing, fetcher, sticker } = require("..");
const { fetchFileType } = require("../../util/fetcher");

class Sticker {

    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Sticker', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }

    constructor(commands) {
        commands.sticker = this.addInfo(this.sticker);
        commands.s = this.alias(this.sticker);

    }

    sticker = {
        func: async (args, message) => {
            const options = parser.parse(args)
            const isQuoted = !!message.quotedMsg;
            const ogMsg = message;
            // if there is a quoted message, use it to make the sticker.
            if (isQuoted) message = message.quotedMsg;

            let crop = !!options.c || !!options.crop;
            let rmbg = !!options.r || !!options.rb;
            let stroke = !!options.s || !!options.stroke;
            let text = !!options.t || !!options.text;

            let reply = !!options.rep || !!options.reply
            let msg = !!options.m || !!options.message
            let time = options.time
            let phone = options.phone || options.p
            let name = options.name || options.n

            if (reply && isQuoted) {
                const replyMsg = !!message.quotedMsg ? message : ogMsg
                const repliedMsg = !!message.quotedMsg ? message.quotedMsg : message

                // the phone and name for the replied message.
                let rphone = options.rphone || options.rp
                let rname = options.rname || options.rn

                const replyOptions = { phone: typeof phone === 'string' ? phone?.replace(/_/g, ' ') : replyMsg.sender.formattedName, name: !!name ? (typeof name === 'string' ? name?.replace(/_/g, ' ') : replyMsg.sender.pushname) : null, type: replyMsg.type }
                const repliedOptions = {
                    phone: typeof rphone === 'string' ? rphone?.replace(/_/g, ' ') : repliedMsg.sender.formattedName, name: !!rname ? (typeof rname === 'string' ? rname?.replace(/_/g, ' ') : repliedMsg.sender.pushname) : null, type: repliedMsg.type
                }

                switch (repliedMsg.type) {
                    case 'chat':
                        repliedOptions.text = repliedMsg.body
                        break;
                    case 'sticker':
                        repliedOptions.buffer = await decryptMedia(repliedMsg);
                        break;
                    case 'image':
                    case 'video':
                        repliedOptions.buffer = await decryptMedia(repliedMsg)
                        if (!!repliedMsg.caption) repliedOptions.text = repliedMsg.caption
                        if (['gif', null].includes(fetchFileType(repliedOptions.buffer))) repliedOptions.type = 'GIF'
                        if (repliedMsg.type === 'video')
                            repliedOptions.buffer = Buffer.from(repliedMsg.mediaData.preview._b64, 'base64')
                        break;
                    case 'document':
                        repliedOptions.document = repliedMsg.filename
                        repliedOptions.buffer = Buffer.from(repliedMsg.mediaData.preview._b64, 'base64')
                        break;
                    case 'ptt':
                    case 'audio':
                        repliedOptions.time = options.rl || options.rlength || (`${('0' + Math.floor(repliedMsg.duration / 60)).slice(-2)}:${('0' + repliedMsg.duration % 60).slice(-2)}`)
                        break;
                }

                switch (replyMsg.type) {
                    case 'chat':
                        replyOptions.text = options.joinedText;
                        break;
                    case 'sticker':
                        replyOptions.buffer = await decryptMedia(replyMsg);
                        break;
                    case 'image':
                        replyOptions.buffer = await decryptMedia(replyMsg);
                        replyOptions.width = replyMsg.width;
                        replyOptions.height = replyMsg.height;
                        if (!!replyMsg.caption) replyOptions.text = replyMsg.caption
                        break;
                    case 'video':
                        replyOptions.buffer = await decryptMedia(replyMsg);
                        replyOptions.width = replyMsg.width;
                        replyOptions.height = replyMsg.height;
                        if (!!replyMsg.caption) replyOptions.text = replyMsg.caption
                        if (['gif', null].includes(fetchFileType(replyOptions.buffer))) replyOptions.type = 'GIF'
                        replyOptions.time = options.l || options.length || (`${('0' + Math.floor(replyMsg.duration / 60)).slice(-2)}:${('0' + replyMsg.duration % 60).slice(-2)}`)
                        replyOptions.buffer = Buffer.from(replyMsg.mediaData.preview._b64, 'base64')
                        break;
                    case 'ptt':
                        let profilePicURL = message.sender.profilePicThumbObj.eurl
                        repliedOptions.buffer = !!profilePicURL ? await fetcher.fetchBuffer(profilePicURL) : null;
                        replyOptions.time = options.l || options.length || (`${('0' + Math.floor(replyMsg.duration / 60)).slice(-2)}:${('0' + replyMsg.duration % 60).slice(-2)}`)
                        break;
                    case 'audio':
                        break;
                    case 'document':
                        break;
                }

                const replyBuffer = await sticker.reply(replyOptions, repliedOptions, time)
                return returnType.imgSticker(replyBuffer, !crop)
            }

            phone = typeof phone === 'string' ? phone?.replace(/_/g, ' ') : message.sender.formattedName;
            if (!!name) name = typeof name === 'string' ? name?.replace(/_/g, ' ') : message.sender.pushname;

            // if the user tries to make a sticker from a message that has a link in it, change the type to url.
            if (!!options.url) message.type = 'url'

            switch (message.type) {
                case 'sticker':
                case 'image':
                    return decryptMedia(message)
                        .then(async buffer => {
                            if (message.type === 'sticker')
                                buffer = await imageProcessing.sharp(buffer).toFormat('png').toBuffer()

                            if (msg)
                                buffer = message.type === 'sticker' ?
                                    await sticker.sticker(time, phone, name, buffer) :
                                    await sticker.image(options.joinedText || message.caption, time, phone, name, { buffer, width: message.width, height: message.height })

                            if (rmbg) {
                                if (!!options.bg || !!options.bgurl) {
                                    if (isQuoted)
                                        options.bg = await decryptMedia(ogMsg);
                                    buffer = await imageProcessing.removeBG(buffer, options);
                                }
                                else
                                    buffer = await imageProcessing.removeBG(buffer);
                            }
                            if (stroke)
                                buffer = await imageProcessing.addStroke(buffer, options)
                            if (text)
                                buffer = await imageProcessing.addText(buffer, options)

                            return returnType.imgSticker(buffer, !crop);
                        })
                        .catch((err) => {
                            console.error(err);
                            return errors.UNKNOWN
                        })

                case 'video':
                    return decryptMedia(message).then(buffer => {
                        let base64 = buffer.toString('base64');
                        return returnType.videoSticker(base64, crop);
                    })
                case 'url':
                    // Don't allow sending stickers that are more than 10MB large. (10485760 bytes)
                    if (await fetcher.checkSize(options.url, 10485760) === 'CONTENT_TOO_LARGE') return errors.CONTENT_TOO_LARGE
                    return returnType.urlSticker(options.url, !crop)
                case 'chat':
                    return sticker.text(options.joinedText, time, phone, name)
                        .then(base64 => returnType.imgSticker(base64, !crop))
                case 'audio':
                    var length = options.l || options.length || (`${('0' + Math.floor(message.duration / 60)).slice(-2)}:${('0' + message.duration % 60).slice(-2)}`)
                    return sticker.audio(time, phone, name, length)
                        .then(base64 => returnType.imgSticker(base64, !crop))
                case 'ptt':
                    var length = options.l || options.length || (`${('0' + Math.floor(message.duration / 60)).slice(-2)}:${('0' + message.duration % 60).slice(-2)}`)
                    let profilePicURL = message.sender.profilePicThumbObj.eurl
                    let profilePic = !!profilePicURL ? await fetcher.fetchBuffer(profilePicURL) : null;
                    return sticker.ptt(time, phone, name, length, profilePic)
                        .then(base64 => returnType.imgSticker(base64, !crop))
                case 'document':
                default:
                    return errors.BAD_CMD;
            }
        },
        help: () => help.Sticker.sticker
    }
}

module.exports = { Sticker }