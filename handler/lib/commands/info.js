const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { compile, covid, wolfram, parser, urban, translate, recognize } = require("..");
const { decryptMedia } = require("@open-wa/wa-automate");
const fs = require("fs");

class Info {
    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Info', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }


    constructor(commands) {
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
    }

    compile = {
        func: (args) => {
            let compiler = args.shift();
            let code = args.join(' ');
            return compile.compile(compiler, code)
                .then(result => returnType.reply(result))
        },
        help: () => help.Info.compile
    }

    covid = {
        func: (args) => {
            return covid.infected(args[0])
                .then(infectedInfo => returnType.reply(infectedInfo))
        },
        help: () => help.Info.covid
    }

    wolfram = {
        func: (args) => {
            const options = parser.parse(args);
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
        help: () => help.Info.wolfram
    }

    urban = {
        func: async (args) => {
            const options = parser.parse(args);
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
        help: () => help.Info.urban
    }

    translate = {
        func: (args) => {
            const options = parser.parse(args);

            const to = options.l || options.lang;

            return translate.text(options.joinedText, to)
                .then(res => returnType.reply(res))
                .catch(err => {
                    if (err === 'WRONG_LANG_CODE') return errors.WRONG_LANG_CODE;
                    return errors.UNKNOWN;
                })
        },
        help: () => help.Info.translate
    }

    recognizeMusic = {
        func: async (args, message) => {
            const options = parser.parse(args);

            const full = !!options.f || !!options.full;
            if (message.quotedMsg) message = message.quotedMsg;
            if (!['ptt', 'audio', 'video'].includes(message.type)) return errors.WRONG_TYPE_RECO

            const data = await decryptMedia(message);
            fs.writeFileSync('./test.mp3', data)
            return recognize.music(data)
                .then(res => full ? returnType.reply(res.join('\n\n')) : returnType.reply(res[0]))
                .catch(err => {
                    if (err === 'NO_RESULT') return errors.NO_RESULT_RECO;
                    return errors.UNKNOWN;
                })
        },
        help: () => help.Info.recognizeMusic
    }
}

module.exports = { Info }