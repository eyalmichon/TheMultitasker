const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { compile, covid, wolfram } = require("..");

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
            if (args[0] === '-f') {
                args.shift();
                let question = args.join(' ');
                return wolfram.getFullAnswer(question)
                    .then(base64 => returnType.sendFile(`data:document/png;base64,${base64}`, `the_multitasker_${question}.png`))
                    .catch(() => errors.CANT_ANSWER_WOLF)

            }
            else
                return wolfram.getAnswer(args.join(' '))
                    .then(res => returnType.fileFromURL(res.img, 'the_multitasker.gif', res.text))
                    .catch(() => errors.CANT_ANSWER_WOLF)
        },
        help: () => help.Info.covid
    }
}

module.exports = { Info }