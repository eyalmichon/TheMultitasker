const { b, m, i, help, returnType, prefix } = require("./helper");
const { errors } = require('./errors');
const { compile, covid, wolfram, parser, urban, translate, recognize, nikud, reverso, doesntExist, downloader, extras, qrcode, carInfo, currency, imagine, fetcher, ai } = require("..");
const { decryptMedia } = require("@open-wa/wa-automate");

class Info {
    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Info', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }


    constructor(commands, defaultTimer) {
        this.defaultTimer = defaultTimer;

        commands.compile = this.addInfo(this.compile)

        commands.covid = this.addInfo(this.covid)
        commands.corona = this.alias(this.covid)

        commands.wolfram = this.addInfo(this.wolfram)
        commands.wolframalpha = this.alias(this.wolfram)
        commands.wolf = this.alias(this.wolfram)
        commands.wf = this.alias(this.wolfram)

        commands.urban = this.addInfo(this.urban)
        commands.ud = this.alias(this.urban)

        commands.translate = this.addInfo(this.translate)
        commands.tran = this.alias(this.translate)
        commands.tr = this.alias(this.translate)

        commands.recognize = this.addInfo(this.recognizeMusic)
        commands.rec = this.alias(this.recognizeMusic)
        commands.rm = this.alias(this.recognizeMusic)

        commands.nikud = this.addInfo(this.nikud)
        commands.nik = this.alias(this.nikud)
        commands.נקד = this.alias(this.nikud)

        commands.grammar = this.addInfo(this.grammar)
        commands.gram = this.alias(this.grammar)

        commands.tts = this.addInfo(this.tts)

        commands.context = this.addInfo(this.context)
        commands.cont = this.alias(this.context)

        commands.synonym = this.addInfo(this.synonym)
        commands.syno = this.alias(this.synonym)

        commands.conjugate = this.addInfo(this.conjugate)
        commands.conj = this.alias(this.conjugate)

        commands.thisdoesntexist = this.addInfo(this.thisDoesntExist)
        commands.tde = this.alias(this.thisDoesntExist)

        commands.emojigenerator = this.addInfo(this.emojiGenerator)
        commands.randemoji = this.alias(this.emojiGenerator)

        commands.qr = this.addInfo(this.qr)

        commands.carinfo = this.addInfo(this.carInfo)

        commands.currency = this.addInfo(this.curreny)

        commands.imagine = this.addInfo(this.imagine)

        commands.enhance = this.addInfo(this.enhanceImage)

        commands.poll = this.addInfo(this.poll)

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
    }

    compile = {
        func: (message) => {
            let compiler = message.args.shift();
            let code = message.body.replace(`${prefix}compile ${compiler}`, '').trim();
            return compile.compile(compiler, code)
                .then(result => returnType.reply(result))
        },
        help: () => help.Info.compile,
        timer: () => this.defaultTimer
    }

    covid = {
        func: (message) => {
            return covid.infected(message.args[0])
                .then(infectedInfo => returnType.reply(infectedInfo))
        },
        help: () => help.Info.covid,
        timer: () => this.defaultTimer
    }

    wolfram = {
        func: (message) => {
            const options = parser.parse(message.args, false);
            let full = !!options.f || !!options.full;
            let question = options.joinedText;

            if (full)
                return wolfram.getFullAnswer(question)
                    .then(base64 => returnType.sendFile(`data:document/png;base64,${base64}`, `the_multitasker_${question}.png`, '', false))
                    .catch(() => errors.CANT_ANSWER_WOLF)

            else
                return wolfram.getAnswer(question)
                    .then(res => returnType.fileFromURL(res.img, 'the_multitasker.gif', res.text))
                    .catch(() => errors.CANT_ANSWER_WOLF)
        },
        help: () => help.Info.wolfram,
        timer: () => this.defaultTimer
    }

    urban = {
        func: async (message) => {
            const options = parser.parse(message.args);
            let result
            let text = [];
            let wotd = !!options.wotd;
            let random = !!options.r;
            let term = options.joinedText;

            if (wotd)
                result = await urban.wordOfTheDay(term);
            else if (random)
                result = await urban.random();
            else {
                if (!!term)
                    result = await urban.topResult(term)
                else
                    return errors.BAD_CMD
            }

            if (!result) return errors.NON_FOUND_URBAN

            if (wotd)
                text.push(`${b('Date:')} ${result.date}`)

            text.push(`${b('Word:')} ${result.word}`)
            text.push(`${b('Definition:')} ${result.definition}`)
            text.push(`${b('Example:')} ${result.example}`)

            return returnType.reply(text.join('\n\n'));

        },
        help: () => help.Info.urban,
        timer: () => this.defaultTimer
    }

    translate = {
        func: (message) => {
            const options = parser.parse(message.args);

            const to = options.l || options.lang;

            return translate.text(options.joinedText, to)
                .then(res => returnType.reply(res))
                .catch(err => {
                    console.error(err);
                    if (err === 'WRONG_LANG_CODE') return errors.WRONG_LANG_CODE;
                    return errors.UNKNOWN();
                })
        },
        help: () => help.Info.translate,
        timer: () => this.defaultTimer
    }

    recognizeMusic = {
        func: async (message) => {
            const options = parser.parse(message.args);

            const full = !!options.f || !!options.full;
            if (message.quotedMsg) message = message.quotedMsg;
            if (!['ptt', 'audio', 'video'].includes(message.type)) return errors.WRONG_TYPE_RECO

            const data = await decryptMedia(message);
            return recognize.music(data)
                .then(res => full ? returnType.reply(res.join('\n\n')) : returnType.reply(res[0]))
                .catch(err => {
                    console.error(err);
                    if (err === 'NO_RESULT') return errors.NO_RESULT_RECO;
                    return errors.UNKNOWN();
                })
        },
        help: () => help.Info.recognizeMusic,
        timer: () => this.defaultTimer
    }

    nikud = {
        func: async (message) => {
            const options = parser.parse(message.args);
            if (message.quotedMsg) message = message.quotedMsg;

            if (message.type !== 'chat') return errors.ONLY_TEXT

            return nikud.nikud(options.joinedText)
                .then(text => returnType.reply(text))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.Info.nikud,
        timer: () => this.defaultTimer
    }

    grammar = {
        func: (message) => {
            const options = parser.parse(message.args);
            const lang = options.l || options.lang;
            if (message.quotedMsg) message = message.quotedMsg;

            if (message.type !== 'chat') return errors.ONLY_TEXT

            return reverso.grammar(options.joinedText, lang)
                .then(text => returnType.reply(text))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.Info.grammar,
        timer: () => this.defaultTimer
    }
    tts = {
        func: (message) => {
            const options = parser.parse(message.args);
            const lang = options.l || options.lang;
            if (message.quotedMsg) message = message.quotedMsg;

            if (message.type !== 'chat') return errors.ONLY_TEXT

            return reverso.tts(options.joinedText, lang)
                .then(path => returnType.sendPtt(path))
                .catch(err => {
                    console.log(err)
                    if (err === 'NULL_PATH') return errors.TEXT_TOO_LONG
                    return errors.UNKNOWN();
                })
        },
        help: () => help.Info.tts,
        timer: () => this.defaultTimer
    }
    context = {
        func: (message) => {
            const options = parser.parse(message.args);
            const from = options.fl || options.froml || options.fromlang;
            const to = options.tl || options.tol || options.tolang;
            if (message.quotedMsg) message = message.quotedMsg;

            if (message.type !== 'chat') return errors.ONLY_TEXT

            return reverso.context(options.joinedText, from, to)
                .then(result => {
                    const text = []
                    const langs = result.shift()
                    result.forEach(item => {
                        text.push(`${langs.from}: ${item.from}\n${langs.to}: ${item.to}`)
                    })
                    return returnType.reply(text.join('\n\n'))
                })
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.Info.context,
        timer: () => this.defaultTimer
    }
    synonym = {
        func: (message) => {
            const options = parser.parse(message.args);
            const lang = options.l || options.lang;
            if (message.quotedMsg) message = message.quotedMsg;

            if (message.type !== 'chat') return errors.ONLY_TEXT

            return reverso.synonym(options.joinedText, lang)
                .then(result => returnType.reply(`${b('Synonyms:')} ${result.synonyms.join(', ')}\n\n${b('Antonyms:')} ${result.antonyms.join(', ')}`))
                .catch(err => {
                    console.log(err)
                    return errors.UNKNOWN();
                })
        },
        help: () => help.Info.synonym,
        timer: () => this.defaultTimer
    }
    conjugate = {
        func: (message) => {
            const options = parser.parse(message.args);
            const lang = options.l || options.lang;
            const hq = !!options.hq || !!options.hd;
            if (message.quotedMsg) message = message.quotedMsg;

            if (message.type !== 'chat') return errors.ONLY_TEXT

            return reverso.conjugator(options.joinedText, lang, hq)
                .then(base64 => {
                    if (hq) return returnType.sendFile(`data:document/png;base64,${base64}`, `the_multitasker_${options.joinedText}.png`, '', false)
                    else return returnType.sendFile(`data:image/png;base64,${base64}`, `the_multitasker_${options.joinedText}.png`, '', false)
                })
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })
        },
        help: () => help.Info.conjugate,
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
        help: () => help.Info.thisDoesntExist,
        timer: () => this.defaultTimer
    }

    emojiGenerator = {
        func: (message) => {
            const n = parseInt(message.args[0])
            if (!!n && n < 1000)
                return extras.randomEmoji(n)
                    .then(emojis => returnType.reply(emojis))
            else
                return errors.EMOJI_GEN_ERROR;
        },
        help: () => help.Info.emojiGenerator,
        timer: () => this.defaultTimer
    }
    qr = {
        func: (message) => {
            const options = parser.parse(message.args, false);
            const file = options.file || 'png'
            options.data = options.joinedText;
            if (!options.data) return errors.EMPTY_TEXT;

            return qrcode.qr(options)
                .then(imgLink => returnType.fileFromURL(imgLink, `the_multitasker.${file}`, options.data))
                .catch(err => {
                    console.error(err);
                    return errors.UNKNOWN();
                })

        },
        help: () => help.Info.qr,
        timer: () => this.defaultTimer
    }
    carInfo = {
        func: (message) => {
            return carInfo.infoByCarNumber(message.args[0])
                .then(info => returnType.reply(info))
                .catch(err => {
                    console.error(err);
                    if (err === 'WRONG_LENGTH')
                        return errors.WRONG_CAR_NUMBER_LENGTH
                    else if (err === 'NOT_FOUND')
                        return errors.NOT_FOUND_CAR_NUMBER_INFO
                    else
                        return errors.UNKNOWN();
                })

        },
        help: () => help.Info.carInfo,
        timer: () => this.defaultTimer
    }
    curreny = {
        func: (message) => {
            const options = parser.parse(message.args)
            const from = options.from || 'usd';
            const to = options.to || 'ils';
            const amount = options.joinedText || '1';

            return currency.checkCurrency(from, to, amount)
                .then(result => returnType.reply(result))
                .catch(err => returnType.reply(err))
        },
        help: () => help.Info.currency + currency.getCurrenciesString(),
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
                    return errors.UNKNOWN();
                })
        },
        help: () => help.Info.imagine,
        timer: () => 60
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
        help: () => help.Info.enhanceImage,
        timer: () => 60
    }

    poll = {
        func: (message) => {
            const splittedText = message.args.join(' ').split(',').map(t => t.trim());

            if (splittedText.length < 1) return errors.EMPTY_TEXT;

            const question = splittedText.shift();
            const options = splittedText;
            if (!options || options.length < 2) return errors.POLL_ERROR_TOO_LESS;
            if (options.length > 12) return errors.POLL_ERROR_TOO_MANY;


            return returnType.sendPoll(question, options)
        },
        help: () => help.Info.poll,
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
        help: () => help.Info.summarize,
        timer: () => 60
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
        help: () => help.Info.topics,
        timer: () => 60
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
        help: () => help.Info.splitBySentence,
        timer: () => 60
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
        help: () => help.Info.anonymize,
        timer: () => 60
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
        help: () => help.Info.htmlContent,
        timer: () => 60
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
        help: () => help.Info.transcribe,
        timer: () => 60
    }


}

module.exports = { Info }