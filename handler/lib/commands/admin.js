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
        func: (client, message, groupMembers, botNumber) => {
            let mentionlist = [];
            groupMembers
                .filter(member => member !== message.sender.id && member !== botNumber)
                .forEach(member => {
                    mentionlist.push(`@${member.replace('@c.us', '')}`)
                });
            client.sendTextWithMentions(message.from, mentionlist.join(' '))
            return { info: true };
        },
        help: () => help.Admin.everyone
    }

    kick = {
        func: (client, message, botMaster) => {
            // *bot master is immune to kick command*
            // Kick the quoted person 
            if (!!message.quotedMsg && message.quotedMsg.sender.id !== botMaster)
                client.removeParticipant(message.from, message.quotedMsg.sender.id);
            // Go over the mentioned members and kick them all.
            message.mentionedJidList.forEach(member => {
                if (member !== botMaster)
                    client.removeParticipant(message.from, member);
            })
            return { info: true };
        },
        help: () => help.Admin.kick
    }
}

module.exports = { Admin }