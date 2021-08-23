const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { compile, covid, wolfram, parser, urban } = require("..");

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
                    .then(base64 => returnType.sendFile(`data:document/png;base64,${base64}`, `the_multitasker_${question}.png`))
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
}

module.exports = { Info }