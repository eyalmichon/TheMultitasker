const { b, m, i, help, returnType, prefix } = require("./helper");
const { errors } = require('./errors');
const { randomStory } = require("../extras");

class Help {
    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Help', ...cmd } }

    createHelp(commands) {
        let text = [`${b('Hello, these are the available commands:')}`];
        let sections = {};
        for (const [key, value] of Object.entries(commands)) {
            if (!value.alias && value.type !== 'Owner')
                if (!sections[value.type])
                    sections[value.type] = [key];
                else
                    sections[value.type].push(key);
        }
        for (const [key, value] of Object.entries(sections)) {
            text.push(`${b(key + ':')}\n${m(value.join(', '))}`)
        }
        text.push(`${b(`Usage:`)} ${prefix}[command]\n\nFor more information about each command use ${prefix}help [command]`)
        text.push(i('The Multitasker 🧙‍♂️'))

        return text.join('\n\n');
    }

    constructor(commands) {
        this.helpText = this.createHelp(commands);

        commands.help = this.addInfo(this.help);
    }

    help = {
        func: () => { return returnType.reply(this.helpText) },
        help: async () => help.Help.help + await randomStory()
    }
}

module.exports = { Help }