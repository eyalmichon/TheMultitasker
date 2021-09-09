const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { imageProcessing, parser, converter } = require("..");
const { decryptMedia } = require("@open-wa/wa-automate");

class Media {
    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Media', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }

    constructor(commands) {
        commands.removebg = this.addInfo(this.removeBG)
        commands.rmbg = this.alias(this.removeBG)

        commands.videotomp3 = this.addInfo(this.videoTomp3)
        commands.v2mp3 = this.alias(this.videoTomp3)
        commands.v2m = this.alias(this.videoTomp3)
    }

    removeBG = {
        func: (args, message) => {
            const options = parser.parse(args);
            const quoted = !!message.quotedMsg;
            const ogMsg = message;
            let stroke = !!options.s || !!options.stroke;
            let text = !!options.t || !!options.text;
            // if there is a quoted message, use it to make the sticker.
            if (quoted) message = message.quotedMsg;

            if (message.type !== 'image' && quoted && ogMsg.type !== 'image') return errors.NOT_IMG

            return decryptMedia(message).then(async buffer => {
                let base64 = buffer.toString('base64');

                if (options.bg || !!options.bgurl) {
                    if (quoted)
                        options.bg = await decryptMedia(ogMsg);
                    base64 = await imageProcessing.removeBG(base64, options);
                }
                else
                    base64 = await imageProcessing.removeBG(base64);
                if (stroke)
                    base64 = await imageProcessing.addStroke(base64, options)
                if (text)
                    base64 = await imageProcessing.addText(base64, options)

                return returnType.sendFile(`data:document/png;base64,${base64}`, `the_multitasker.png`, '', false)
            })
        },
        help: () => help.Media.removebg
    }

    videoTomp3 = {
        func: (args, message) => {

            // if there is a quoted message, use it to make the sticker.
            if (message.quotedMsg) message = message.quotedMsg;
            // check if the message is a video.
            if (message.type !== 'video') errors.CONV_NOT_VIDEO;
            // check if video size is larger than 15MB (CHANGEABLE)
            if (message.size > 15728640) errors.CONV_VIDEO_TOO_LARGE;

            return decryptMedia(message)
                .then(mediaData => {

                    const path = converter.saveBinary(mediaData, 'mp3');

                    return converter.toMP3(path)
                        .then(mp3Path => {
                            return returnType.sendPtt(mp3Path)
                        })
                        .catch(err => {
                            console.error(err);
                            return errors.UNKNOWN
                        })
                })
        },
        help: () => help.Media.videotomp3
    }

}


module.exports = { Media }