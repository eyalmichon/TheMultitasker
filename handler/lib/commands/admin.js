const { b, m, i, help } = require("./helper");
const { errors } = require('./errors');

class Admin {
    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Admin', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }

    constructor(commands) {
        commands.everyone = this.addInfo(this.everyone)
        commands.tagall = this.alias(this.everyone)

        commands.kick = this.addInfo(this.kick)
    }
    everyone = {
        func: (client, groupMembers, senderID, botNumber) => {
            let mentionlist = [];
            groupMembers
                .filter(member => member !== senderID && member !== botNumber)
                .forEach(member => {
                    mentionlist.push(`@${member.replace('@c.us', '')}`)
                });
            client.sendTextWithMentions(from, mentionlist.join(' '))
            return { info: true };
        },
        help: () => help.Admin.everyone
    }

    kick = {
        func: (client, message) => {
            if (message.quotedMsg !== null)
                client.removeParticipant(message.from, message.quotedMsg.sender.id);

            message.mentionedJidList.forEach(member => {
                client.removeParticipant(message.from, member);
            })
            return { info: true };
        },
        help: () => help.Admin.kick
    }
}

module.exports = { Admin }