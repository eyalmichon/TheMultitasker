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

        commands.emojigenerator = this.addInfo(this.emojiGenerator)
        commands.randemoji = this.alias(this.emojiGenerator)

        commands.qr = this.addInfo(this.qr)

        commands.carinfo = this.addInfo(this.carInfo)

        commands.currency = this.addInfo(this.curreny)

        commands.poll = this.addInfo(this.poll)
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
            const options = parser.parse(message.args, false);
            let country = options.c || 'israel';

            return covid.infected(message.args[0], country)
                .then(infectedInfo => returnType.fileFromURL(infectedInfo.img, 'the_multitasker.gif', infectedInfo.text))
                .catch(err => {
                    console.error(err)
                    return errors.UNKNOWN();
                })
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
}

module.exports = { Info }