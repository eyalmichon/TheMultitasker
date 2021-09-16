const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { decryptMedia } = require("@open-wa/wa-automate");
const { parser, imageProcessing, fetcher } = require("..");

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
            const quoted = !!message.quotedMsg;
            const ogMsg = message;
            // if there is a quoted message, use it to make the sticker.
            if (quoted) message = message.quotedMsg;

            let crop = !!options.c || !!options.crop;
            let rmbg = !!options.r || !!options.rb;
            let stroke = !!options.s || !!options.stroke;
            let text = !!options.t || !!options.text;

            // if the user tries to make a sticker from a message that has a link in it, change the type to url.
            if (!!options.url) message.type = 'url'

            switch (message.type) {
                case 'image':
                case 'sticker':
                    return decryptMedia(message)
                        .then(async buffer => {
                            if (message.type === 'sticker')
                                buffer = await imageProcessing.sharp(buffer).toFormat('png').toBuffer()

                            if (rmbg) {
                                if (!!options.bg || !!options.bgurl) {
                                    if (quoted)
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
                            if (err === 'TOO_LONG') return errors.TEXT_TOO_LONG
                            return errors.UNKNOWN
                        })

                case 'video':
                    var buffer = await decryptMedia(message);
                    var base64 = buffer.toString('base64');
                    return returnType.videoSticker(base64, crop);
                case 'url':
                    // Don't allow sending stickers that are more than 10MB large. (10485760 bytes)
                    if (await fetcher.checkSize(options.url, 10485760) === 'CONTENT_TOO_LARGE') return errors.CONTENT_TOO_LARGE
                    return returnType.urlSticker(options.url, !crop)

                case 'chat':
                case 'audio':
                case 'ptt':
                case 'document':
                default:
                    return errors.BAD_CMD;
            }
        },
        help: () => help.Sticker.sticker
    }
}

module.exports = { Sticker }