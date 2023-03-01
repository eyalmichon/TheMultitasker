const { b, m, i, help, returnType, prefix } = require("./helper");
const { errors } = require('./errors');
const { decryptMedia } = require("@open-wa/wa-automate");
const { recognize, doesntExist, downloader, fetcher, parser, imagine, ai } = require("..");
const { uploadImage } = require("../../util/fetcher");

class AI {

    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'AI', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }

    constructor(commands, defaultTimer) {
        this.defaultTimer = defaultTimer;

        commands.recognize = this.addInfo(this.recognizeMusic)
        commands.rec = this.alias(this.recognizeMusic)
        commands.rm = this.alias(this.recognizeMusic)

        commands.thisdoesntexist = this.addInfo(this.thisDoesntExist)
        commands.tde = this.alias(this.thisDoesntExist)

        commands.imagine = this.addInfo(this.imagine)

        commands.enhance = this.addInfo(this.enhanceImage)

        commands.summarize = this.addInfo(this.summarize)
        commands.sum = this.alias(this.summarize)

        commands.topics = this.addInfo(this.topics)

        commands.splitbysentence = this.addInfo(this.splitBySentence)
        commands.sbs = this.alias(this.splitBySentence)

        commands.anonymize = this.addInfo(this.anonymize)
        commands.anon = this.alias(this.anonymize)

        commands.htmlcontent = this.addInfo(this.htmlContent)
        commands.html = this.alias(this.htmlContent)

        commands.transcribe = this.addInfo(this.transcribe)
        commands.tb = this.alias(this.transcribe)

        commands.aicontentdetection = this.addInfo(this.aiContentDetection)
        commands.acd = this.alias(this.aiContentDetection)

        commands.excusegenerator = this.addInfo(this.excuseGenerator)
        commands.excuse = this.alias(this.excuseGenerator)

        commands.randomidea = this.addInfo(this.randomIdea)

        commands.dreaminterpretation = this.addInfo(this.dreamInterpretation)
        commands.dreaminterpret = this.alias(this.dreamInterpretation)
        commands.di = this.alias(this.dreamInterpretation)

        commands.sqlfixer = this.addInfo(this.sqlFixer)
        commands.sqlf = this.alias(this.sqlFixer)

        commands.sqlexplainer = this.addInfo(this.sqlExplainer)
        commands.sqle = this.alias(this.sqlExplainer)

        commands.colorizeimage = this.addInfo(this.colorizeImage)
        commands.colorize = this.alias(this.colorizeImage)

        commands.upscaleimage = this.addInfo(this.upscaleImage)
        commands.upscale = this.alias(this.upscaleImage)

        commands.prayer = this.addInfo(this.prayer)
    }

    recognizeMusic = {
        func: async (message) => {
            const options = parser.parse(message.args);

            const full = !!options.f || !!options.full;
            if (message.quotedMsg) message = message.quotedMsg;
            if (!['ptt', 'audio', 'video'].includes(message.type)) return errors.WRONG_TYPE_RECO

            const data = await decryptMediaryptMedia(message);
            return recognize.music(data)
                .then(res => full ? returnType.reply(res.join('\n\n')) : returnType.reply(res[0]))
                .catch(err => {
                    console.error(err);
                    if (err === 'NO_RESULT') return errors.NO_RESULT_RECO;
                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.recognizeMusic,
        timer: () => this.defaultTimer
    }

    thisDoesntExist = {
        func: (message) => {
            const types = ['person', 'cat', 'horse', 'rental', 'waifu', 'question',
                'chemical', 'word', 'city', 'simpsons', 'art', 'video', 'ideas', 'lyrics']
            const options = parser.parse(message.args);
            const hq = !!options.hq || !!options.hd;
            let type = null;
            types.forEach(t => {
                if (options[t]) {
                    type = t
                    return;
                }
            })
            if (!type)
                type = types[Math.floor(Math.random() * types.length)]

            return doesntExist.thisDoesntExist(type, options)
                .then(result => {
                    switch (result.type) {
                        case 'text':
                            return returnType.reply(result.info);
                        case 'img':
                            if (hq) return returnType.sendFile(`data:document/png;base64,${result.info}`, `the_multitasker_${options.joinedText}.png`, '', false)
                            else return returnType.sendFile(`data:image/png;base64,${result.info}`, `the_multitasker_${options.joinedText}.png`, '', false)
                        case 'videoLink':
                            return downloader.video(result.info)
                                .then(path => returnType.sendFile(path))
                    }
                })
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.thisDoesntExist,
        timer: () => this.defaultTimer
    }

    imagine = {
        func: async (message) => {
            const options = parser.parse(message.args);

            if (!options.joinedText) return errors.EMPTY_TEXT;

            if (!!options.quality) {
                options.num_inference_steps = options.quality;
                delete options.quality;
            }
            if (!!options.freedom) {
                options.guide_scale = options.freedom;
                delete options.freedom;
            }
            if (!!options.ratio) {
                options.aspect_ratio = options.ratio;
                delete options.ratio;
            }
            if (!!options.v) {
                options.model = options.v;
                delete options.v;
            }
            if (message.type === 'image' || (message.quotedMsg && message.quotedMsg.type === 'image'))
                options.image = true;
            if (!!options.image) {
                // if it's a url
                if (options.url) {
                    // 15MB limit
                    await fetcher.checkSize(options.url, 15728640)
                        .then(async res => {
                            if (res === 'OK')
                                options.init_image = await fetcher.fetchBase64(options.url)
                            else
                                console.error(`Error in imagine (checkSize): ${res}\n Url: ${options.url}`)
                        })
                }
                // if it's an image.
                else if (message.type === 'image')
                    options.init_image = await decryptMedia(message).then(buffer => buffer.toString('base64'));
                // if it's a quoted image.
                else if (!!message.quotedMsg)
                    if (message.quotedMsg.type === 'image') {
                        options.init_image = await decryptMedia(message.quotedMsg).then(buffer => buffer.toString('base64'))
                    }
                if (!!options.strength)
                    options.prompt_strength = options.strength;
            }
            if (!!options.neg)
                options.negative_prompt = parser.parseStringForFlag(message.args, 'neg');

            return imagine.textToImage(options.joinedText, options)
                .then(result => returnType.fileFromURL(result.image_url, 'the_multitasker.png', options.joinedText))
                .catch(err => {
                    console.error(err);
                    if (err === 'Insufficient permissions')
                        return errors.INSUFFICIENT_PERMISSIONS_IMAGINE;

                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.imagine,
        timer: () => this.defaultTimer
    }

    enhanceImage = {
        func: async (message) => {
            if (message.type !== 'image' && (!message.quotedMsg || message.quotedMsg.type !== 'image'))
                return errors.NOT_IMG;

            message = message.type === 'image' ? message : message.quotedMsg;

            const base64 = await decryptMedia(message).then(buffer => buffer.toString('base64'));

            return imagine.enhanceImage(base64)
                .then(result => returnType.fileFromURL(result.image_url, 'the_multitasker.png', 'enhanced image'))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.enhanceImage,
        timer: () => this.defaultTimer
    }

    summarize = {
        func: (message) => {
            const options = parser.parse(message.args);
            const text = options.joinedText;
            if (!text) return errors.EMPTY_TEXT;
            const long = !!options.long;
            if (!long && text.length > 10000) return errors.CONTENT_TOO_LARGE;
            const maxLength = Math.abs(parseInt(options.max)) || 100;
            const minLength = Math.abs(parseInt(options.min)) || 5;

            return ai.summarize(text, { maxLength, minLength })
                .then(result => returnType.reply(result))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                }
                )
        },
        help: () => help.AI.summarize,
        timer: () => this.defaultTimer
    }

    topics = {
        func: (message) => {
            const options = parser.parse(message.args);
            const text = options.joinedText;
            if (!text) return errors.EMPTY_TEXT;
            const long = !!options.long;
            if (!long && text.length > 10000) return errors.CONTENT_TOO_LARGE;
            const hash = !!options.hash;

            return ai.topics(text)
                .then(result => returnType.reply(hash ? result.map(topic => `#${topic}`).join(' ') : result.join(', ')))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                }
                )
        },
        help: () => help.AI.topics,
        timer: () => this.defaultTimer
    }

    splitBySentence = {
        func: (message) => {
            const options = parser.parse(message.args);
            const text = options.joinedText;
            if (!text) return errors.EMPTY_TEXT;
            const long = !!options.long;
            if (!long && text.length > 10000) return errors.CONTENT_TOO_LARGE;

            return ai.splitBySentence(text)
                .then(result => returnType.reply(result.join('\n\n')))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                }
                )
        },
        help: () => help.AI.splitBySentence,
        timer: () => this.defaultTimer
    }

    anonymize = {
        func: (message) => {
            const options = parser.parse(message.args);
            const text = options.joinedText;
            if (!text) return errors.EMPTY_TEXT;
            const long = !!options.long;
            if (!long && text.length > 10000) return errors.CONTENT_TOO_LARGE;

            return ai.anonymize(text)
                .then(result => returnType.reply(result))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                }
                )
        },
        help: () => help.AI.anonymize,
        timer: () => this.defaultTimer
    }

    htmlContent = {
        func: (message) => {
            const options = parser.parse(message.args);
            const url = options.url;
            if (!url) return errors.EMPTY_TEXT;
            const long = !!options.long;
            if (!long && url.length > 10000) return errors.CONTENT_TOO_LARGE;

            return ai.htmlContent(url)
                .then(result => returnType.reply(result))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                }
                )
        },
        help: () => help.AI.htmlContent,
        timer: () => this.defaultTimer
    }

    transcribe = {
        func: async (message) => {
            const options = parser.parse(message.args);
            if (!message.quotedMsg) return errors.NO_QUOTED_MESSAGE;

            if (!['ptt', 'audio'].includes(message.quotedMsg.type)) return errors.WRONG_TYPE_RECO;

            const long = !!options.long;
            if (!long && message.duration > 60) return errors.CONTENT_TOO_LARGE;

            const data = await decryptMedia(message.quotedMsg);
            if (!data) return errors.UNKNOWN();

            const speakerDetection = options.speaker ? true : false;
            const timestampPerLabel = options.ts ? true : false;

            return ai.transcribe(data, { speakerDetection, timestampPerLabel })
                .then(result => returnType.reply(result.join('\n\n')))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.transcribe,
        timer: () => this.defaultTimer
    }

    aiContentDetection = {
        func: async (message) => {
            const options = parser.parse(message.args);
            const text = options.joinedText;
            if (!text) return errors.EMPTY_TEXT;

            return ai.aiContentDetection(text)
                .then(percent => returnType.reply(`${percent}% human generated content`))
                .catch(err => {
                    console.error(err);
                    switch (err.code) {
                        case 0:
                            return errors.EMPTY_TEXT;
                        case 1:
                            return errors.CONTENT_TOO_LARGE;
                        case 2:
                            return errors.UNKNOWN();
                        default:
                            return errors.UNKNOWN();
                    }
                })
        },
        help: () => help.AI.aiContentDetection,
        timer: () => this.defaultTimer
    }

    excuseGenerator = {
        func: (message) => {
            const options = parser.parse(message.args);
            const messup = options.joinedText;
            const target = options.target || 'Boss';
            const professionalism = options.pro || 50;
            if (!messup) return errors.EMPTY_TEXT

            return ai.excuseGenerator(target, messup, professionalism)
                .then(result => {
                    return returnType.reply(`${b(`Excuse:`)}\n${result.excuse}\n\n${b(`Target's response:`)}${result.targetResponse}`)
                })
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.excuseGenerator,
        timer: () => this.defaultTimer
    }

    randomIdea = {
        func: (message) => {
            return ai.randomIdea()
                .then(result => returnType.reply(result))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.randomIdea,
        timer: () => this.defaultTimer
    }

    dreamInterpretation = {
        func: (message) => {
            const options = parser.parse(message.args);
            const text = options.joinedText;
            if (!text) return errors.EMPTY_TEXT;

            return ai.dreamInterpretation(text)
                .then(result => returnType.reply(result))
                .catch(err => {
                    console.error(err);
                    if (err.code === 0)
                        return errors.TOO_SHORT;
                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.dreamInterpretation,
        timer: () => this.defaultTimer
    }

    sqlFixer = {
        func: (message) => {
            if (message.type !== 'chat' || (message.quotedMsg && message.quotedMsg.type !== 'chat'))
                return errors.ONLY_TEXT;

            const sqlCode = message.body.replace(`${prefix}sqlfixer `, '').trim();
            if (!sqlCode) return errors.EMPTY_TEXT;

            return ai.sqlFixer(sqlCode)
                .then(result => returnType.reply(result))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.sqlFixer,
        timer: () => this.defaultTimer
    }

    sqlExplainer = {
        func: (message) => {
            if (message.type !== 'chat' || (message.quotedMsg && message.quotedMsg.type !== 'chat'))
                return errors.ONLY_TEXT;

            const sqlCode = message.body.replace(`${prefix}sqlexplainer `, '').trim();
            if (!sqlCode) return errors.EMPTY_TEXT;

            return ai.sqlExplainer(sqlCode)
                .then(result => returnType.reply(result))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.sqlExplainer,
        timer: () => this.defaultTimer
    }

    colorizeImage = {
        func: async (message) => {
            const options = parser.parse(message.args);

            if (message.type !== 'image' && (message.quotedMsg && message.quotedMsg.type !== 'image') && !options.url) return errors.BAD_CMD;

            const link = options.url || await decryptMedia(message.quotedMsg || message).then(buffer => uploadImage(buffer)).catch(err => {
                console.error(err);
                return errors.UNKNOWN();
            });

            if (!link) return errors.UNKNOWN();

            return ai.colorizeImage(link)
                .then(result => returnType.filesFromURL(result))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.colorizeImage,
        timer: () => this.defaultTimer
    }

    upscaleImage = {
        func: async (message) => {
            const options = parser.parse(message.args);

            if (message.type !== 'image' && (message.quotedMsg && message.quotedMsg.type !== 'image') && !options.url) return errors.BAD_CMD;

            const link = options.url || await decryptMedia(message.quotedMsg || message).then(buffer => uploadImage(buffer)).catch(err => {
                console.error(err);
                return errors.UNKNOWN();
            });


            if (!link) return errors.UNKNOWN();

            return ai.upscaleImage(link)
                .then(result => returnType.fileFromURL(result, 'upscaled.jpg', 'Upscaled image'))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.upscaleImage,
        timer: () => this.defaultTimer
    }

    prayer = {
        func: (message) => {
            const options = parser.parse(message.args);
            const type = options.type || 'bible';
            const text = options.joinedText;
            if (!text) return errors.EMPTY_TEXT;

            return ai.prayerGPT(text, type)
                .then(result => returnType.reply(result))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.AI.prayer,
        timer: () => this.defaultTimer
    }



}

module.exports = { AI }