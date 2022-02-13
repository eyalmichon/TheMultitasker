const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { parser } = require("..");

class Admin {
    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Admin', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }

    constructor(commands) {
        commands.everyone = this.addInfo(this.everyone)
        commands.tagall = this.alias(this.everyone)

        commands.kick = this.addInfo(this.kick)

        commands.adduser = this.addInfo(this.addParticipant)

        commands.promote = this.addInfo(this.promote)

        commands.demote = this.addInfo(this.demote)

        commands.invitelink = this.addInfo(this.groupInviteLink)
    }
    everyone = {
        func: (message, client) => {
            const mentionlist = [];
            message.groupMembers
                .filter(member => member !== message.sender.id && member !== message.botNumber)
                .forEach(member => {
                    mentionlist.push(`@${member.replace('@c.us', '')}`)
                });
            client.sendTextWithMentions(message.from, mentionlist.join(' '))
            return { info: true };
        },
        help: () => help.Admin.everyone
    }

    kick = {
        func: (message, client) => {
            // *bot master is immune to kick command*
            // Kick the quoted person 
            if (!!message.quotedMsg && message.quotedMsg.sender.id !== message.botMaster)
                client.removeParticipant(message.from, message.quotedMsg.sender.id);
            // Go over the mentioned members and kick them all.
            message.mentionedJidList.forEach(member => {
                if (member !== message.botMaster)
                    client.removeParticipant(message.from, member);
            })
            return { info: true };
        },
        help: () => help.Admin.kick
    }

    promote = {
        func: (message, client) => {
            // *bot master is immune to promote command*
            // Promote the quoted person 
            if (!!message.quotedMsg && message.quotedMsg.sender.id !== message.botMaster)
                client.promoteParticipant(message.from, message.quotedMsg.sender.id);
            // Go over the mentioned members and promote them all.
            message.mentionedJidList.forEach(member => {
                if (member !== message.botMaster)
                    client.promoteParticipant(message.from, member);
            })
            return { info: true };
        },
        help: () => help.Admin.promote
    }

    demote = {
        func: (message, client) => {
            // *bot master is immune to demote command*
            // Demote the quoted person 
            if (!!message.quotedMsg && message.quotedMsg.sender.id !== message.botMaster)
                client.demoteParticipant(message.from, message.quotedMsg.sender.id);
            // Go over the mentioned members and demote them all.
            message.mentionedJidList.forEach(member => {
                if (member !== message.botMaster)
                    client.demoteParticipant(message.from, member);
            })
            return { info: true };
        },
        help: () => help.Admin.demote
    }

    addParticipant = {
        func: (message, client) => {
            // add the given jid to the group
            const options = parser.parse(message.args);
            // check if number is in format of @c.us
            if (options.joinedText.endsWith('@c.us')) {
                client.addParticipant(message.from, options.joinedText);
            } else {
                return errors.INVALID_JID;
            }
            return { info: true };
        },
        help: () => help.Admin.addParticipant
    }

    groupInviteLink = {
        func: (message, client) => {
            return client.getGroupInviteLink(message.from).then(link => {
                return returnType.reply(link);
            })
        },
        help: () => help.Admin.groupInviteLink
    }


}
module.exports = { Admin }