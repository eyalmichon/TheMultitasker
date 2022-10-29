const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { compile, covid, wolfram, parser, urban, translate, recognize, nikud, reverso, doesntExist, downloader, extras, qrcode, carInfo, currency, imagine, fetcher } = require("..");
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
    }

    compile = {
        func: (message) => {
            let compiler = message.args.shift();
            let code = message.args.join(' ');
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
                    return errors.UNKNOWN;
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
                    return errors.UNKNOWN;
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
                    return errors.UNKNOWN;
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
                    return errors.UNKNOWN;
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
                    return errors.UNKNOWN;
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
                    return errors.UNKNOWN;
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
                    return errors.UNKNOWN;
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
                    return errors.UNKNOWN;
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
                    return errors.UNKNOWN;
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
                    return errors.UNKNOWN;
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
                        return errors.UNKNOWN;
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

            if (!!options.quality)
                options.num_inference_steps = options.quality;
            if (!!options.freedom)
                options.guide_scale = options.freedom;
            if (!!options.ratio)
                options.aspect_ratio = options.ratio;
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
                    return errors.UNKNOWN;
                })
        },
        help: () => help.Info.imagine,
        timer: () => 60
    }
}

module.exports = { Info }