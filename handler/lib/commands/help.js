const { b, m, i, help, returnType, prefix } = require("./helper");
const { errors } = require('./errors');
const { randomStory } = require("../extras");

class Help {
    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Help', ...cmd } }

    createHelp(commands) {
        let text = [`${b('Hello, these are the available commands:')}`];
        let ownerText = text.slice()
        let sections = {};
        for (const [key, value] of Object.entries(commands)) {
            if (!value.alias) {
                if (!sections[value.type])
                    sections[value.type] = [key];
                else
                    sections[value.type].push(key);
            }
        }
        for (const [key, value] of Object.entries(sections)) {
            if (key !== 'Owner')
                text.push(`${b(key + ':')}\n${m(value.join(', '))}`)
            ownerText.push(`${b(key + ':')}\n${m(value.join(', '))}`)
        }
        text.push(`${b(`Usage:`)} ${prefix}[command]\n\nFor more information about each command use ${prefix}help [command]`)
        ownerText.push(`${b(`Usage:`)} ${prefix}[command]\n\nFor more information about each command use ${prefix}help [command]`)
        text.push(i('The Multitasker 🧙‍♂️'))
        ownerText.push(i('The Multitasker 🧙‍♂️'))

        return [text.join('\n\n'), ownerText.join('\n\n')];
    }

    constructor(commands, defaultTimer) {
        this.defaultTimer = defaultTimer;

        [this.helpText, this.ownerText] = this.createHelp(commands);

        commands.help = this.addInfo(this.help);
    }

    help = {
        func: (isOwner) => {
            const text = isOwner ? returnType.reply(this.ownerText) : returnType.reply(this.helpText)
            return text;
        },
        help: async () => help.Help.help + await randomStory(),
        timer: () => this.defaultTimer
    }
}

module.exports = { Help }