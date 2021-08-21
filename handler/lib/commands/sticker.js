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
        func: async (message, args) => {
            const options = parser.parse(args)

            // if there is a quoted message, use it to make the sticker.
            if (message.quotedMsg) message = message.quotedMsg;

            let crop = !!options.c || !!options.crop;
            let rmbg = !!options.r || !!options.rb;

            // if the user tries to make a sticker from a message that has a link in it, change the type to url.
            if (options.url) message.type = 'url'

            switch (message.type) {
                case 'image':
                    return decryptMedia(message)
                        .then(async mediaData => {
                            var base64 = `data:${message.mimetype};base64,${mediaData.toString('base64')}`;

                            if (rmbg)
                                base64 = await imageProcessing.removeBG(mediaData);

                            return returnType.imgSticker(base64, !crop);
                        })
                        .catch(() => errors.UNKNOWN)

                case 'video':
                    var mediaData = await decryptMedia(message);
                    var base64 = `data:${message.mimetype};base64,${mediaData.toString('base64')}`;
                    return returnType.videoSticker(base64, crop);
                case 'url':
                    // Don't allow sending stickers that are more than 10MB large. (10485760 bytes)
                    if (await fetcher.checkSize(options.url, 10485760) === 'CONTENT_TOO_LARGE') return errors.CONTENT_TOO_LARGE
                    return returnType.urlSticker(options.url, !crop)
                case 'sticker':

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