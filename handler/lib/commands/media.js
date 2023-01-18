const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { imageProcessing, parser, converter, fetcher } = require("..");
const { decryptMedia } = require("@open-wa/wa-automate");

class Media {
    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Media', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }

    constructor(commands, defaultTimer) {
        this.defaultTimer = defaultTimer;

        commands.removebg = this.addInfo(this.removeBG)
        commands.rmbg = this.alias(this.removeBG)

        commands.toimage = this.addInfo(this.toImage)
        commands.image = this.alias(this.toImage)
        commands.img = this.alias(this.toImage)

        commands.videotomp3 = this.addInfo(this.videoTomp3)
        commands.v2mp3 = this.alias(this.videoTomp3)
        commands.v2m = this.alias(this.videoTomp3)

        commands.addbackground = this.addInfo(this.addBackground)
        commands.bg = this.alias(this.addBackground)
    }

    removeBG = {
        func: (message) => {
            const options = parser.parse(message.args);
            const quoted = !!message.quotedMsg;
            const ogMsg = message;
            let stroke = !!options.s || !!options.stroke;
            let text = !!options.t || !!options.text;
            // if there is a quoted message, use it to make the sticker.
            if (quoted) message = message.quotedMsg;

            if (message.type !== 'image' && message.type !== 'sticker' && ogMsg.type !== 'image') return errors.NOT_IMG

            return decryptMedia(message).then(async buffer => {
                if (message.type === 'sticker')
                    buffer = await imageProcessing.sharp(buffer).toFormat('png').toBuffer()

                if (!!options.bg || !!options.bgurl) {
                    if (quoted)
                        options.bg = await decryptMedia(ogMsg);
                    buffer = await imageProcessing.removeBG(buffer, options);
                }
                else
                    buffer = await imageProcessing.removeBG(buffer, options);
                if (stroke)
                    buffer = await imageProcessing.addStroke(buffer, options)
                if (text)
                    buffer = await imageProcessing.addText(buffer, options)

                let base64 = buffer.toString('base64');
                return returnType.sendFile(`data:document/png;base64,${base64}`, `the_multitasker.png`, '', false)
            })
                .catch((err) => {
                    return errors.UNKNOWN()
                })
        },
        help: () => help.Media.removebg,
        timer: () => this.defaultTimer
    }
    toImage = {
        func: (message) => {
            const options = parser.parse(message.args);
            const isQuoted = !!message.quotedMsg;
            const ogMsg = message;
            let rmbg = !!options.r || !!options.rb;
            let bg = !!options.bg;
            let stroke = !!options.s || !!options.stroke;
            let text = !!options.t || !!options.text;
            let file = !!options.f || !!options.file;
            // if there is a quoted message, use it to make the sticker.
            if (isQuoted) message = message.quotedMsg;

            if (message.type !== 'image' && message.type !== 'sticker' && ogMsg.type !== 'image') return errors.NOT_IMG

            return decryptMedia(message).then(async buffer => {
                if (message.type === 'sticker')
                    buffer = await imageProcessing.sharp(buffer).toFormat('png').toBuffer()

                if (rmbg)
                    buffer = await imageProcessing.removeBG(buffer, options);

                if (stroke)
                    buffer = await imageProcessing.addStroke(buffer, options)
                if (text)
                    buffer = await imageProcessing.addText(buffer, options)
                if (bg && (isQuoted || (options.url && fetcher.isValidURL(options.url)))) {
                    if (isQuoted)
                        options.bg = await decryptMedia(ogMsg);
                    else {
                        options.bg = await fetcher.fetchImageBuffer(options.url).catch(() => null)

                    }
                    if (options.bg) buffer = await imageProcessing.addBackground(buffer, options.bg)
                }

                let base64 = buffer.toString('base64');
                if (file) return returnType.sendFile(`data:document/png;base64,${base64}`, `the_multitasker.png`, '', false)
                else return returnType.sendFile(`data:image/png;base64,${base64}`, `the_multitasker.png`, '', false)
            })
                .catch((err) => {
                    console.error(err)
                    return errors.UNKNOWN()
                })
        },
        help: () => help.Media.toimage,
        timer: () => this.defaultTimer
    }



    videoTomp3 = {
        func: (message) => {

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
                            return errors.UNKNOWN()
                        })
                })
        },
        help: () => help.Media.videotomp3,
        timer: () => this.defaultTimer
    }

    addBackground = {
        func: async (message) => {
            const options = parser.parse(message.args);
            const toSticker = !!options.s || !!options.sticker;
            const fromURL = !!options.url;
            if (!message.quotedMsg && !fromURL)
                return errors.NO_QUOTED_MESSAGE
            if (!['image', 'sticker'].includes(message.type) || (!fromURL && !['image', 'sticker'].includes(message.quotedMsg.type)))
                return errors.NOT_IMG

            let imgBuffer = await decryptMedia(message.quotedMsg);
            if (message.quotedMsg.type === 'sticker')
                imgBuffer = await imageProcessing.sharp(imgBuffer).toFormat('png').toBuffer()

            if (fromURL && fetcher.isValidURL(options.url)) {
                var bgBuffer = await fetcher.fetchImageBuffer(options.url).catch(() => null);
            }
            else {
                var bgBuffer = await decryptMedia(message);
                if (message.type === 'sticker')
                    bgBuffer = await imageProcessing.sharp(bgBuffer).toFormat('png').toBuffer()
            }
            if (!bgBuffer) return errors.UNKNOWN()
            return imageProcessing.addBackground(imgBuffer, bgBuffer)
                .then(buffer => {
                    if (toSticker)
                        return returnType.imgSticker(buffer)
                    else
                        return returnType.sendFile(`data:image/png;base64,${buffer.toString('base64')}`, 'bg.png', '', false)
                })
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN()
                })


        },
        help: () => help.Media.addBackground,
        timer: () => this.defaultTimer
    }
}


module.exports = { Media }