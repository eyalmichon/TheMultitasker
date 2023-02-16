const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { parser } = require("..");

class Admin {
    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Admin', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }

    constructor(commands, defaultTimer) {
        this.defaultTimer = defaultTimer;

        commands.everyone = this.addInfo(this.everyone)
        commands.tagall = this.alias(this.everyone)

        commands.kick = this.addInfo(this.kick)

        commands.adduser = this.addInfo(this.addParticipant)

        commands.promote = this.addInfo(this.promote)

        commands.demote = this.addInfo(this.demote)

        commands.invitelink = this.addInfo(this.groupInviteLink)

        commands.mutelist = this.addInfo(this.addUserToMuteList)
        commands.mute = this.alias(this.addUserToMuteList)

        commands.unmutelist = this.addInfo(this.removeUserFromMuteList)
        commands.unmute = this.alias(this.removeUserFromMuteList)

        commands.profilepic = this.addInfo(this.getProfilePic)
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
        help: () => help.Admin.everyone,
        timer: () => this.defaultTimer
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
        help: () => help.Admin.kick,
        timer: () => this.defaultTimer
    }

    promote = {
        func: (message, client) => {
            // Promote the quoted person 
            if (!!message.quotedMsg)
                client.promoteParticipant(message.from, message.quotedMsg.sender.id);
            // Go over the mentioned members and promote them all.
            message.mentionedJidList.forEach(member => {
                if (member !== message.botMaster)
                    client.promoteParticipant(message.from, member);
            })
            return { info: true };
        },
        help: () => help.Admin.promote,
        timer: () => this.defaultTimer
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
        help: () => help.Admin.demote,
        timer: () => this.defaultTimer
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
        help: () => help.Admin.addParticipant,
        timer: () => this.defaultTimer
    }

    groupInviteLink = {
        func: (message, client) => {
            return client.getGroupInviteLink(message.from).then(link => {
                return returnType.reply(link);
            })
        },
        help: () => help.Admin.groupInviteLink,
        timer: () => this.defaultTimer
    }

    addUserToMuteList = {
        func: (message) => {
            let groupID = message.from;
            let user = !!message.quotedMsg ? message.quotedMsg.sender.id : message.mentionedJidList[0]
            if (!user || user === message.botMaster || user === message.botNumber || !message.isGroupMsg) return returnType.reply('⛔ Error, wrong usage.')

            let text = '';
            switch (message.muteList.addUserToList(groupID, user)) {
                case 'USER_EXISTS':
                    text = `User already exists in the mute list for this group.`;
                    break;
                case true:
                    text = `User has been added successfully!`;
                    break;
                case false:
                    text = `⛔ Error, check logs.`;
                    break;
                default:
                    text = `⛔ Unknown Error`;
            }
            return returnType.reply(text);
        },
        help: () => help.Admin.addUserToMuteList,
        timer: () => this.defaultTimer
    }
    removeUserFromMuteList = {
        func: (message) => {
            let groupID = message.from;
            let user = !!message.quotedMsg ? message.quotedMsg.sender.id : message.mentionedJidList[0]
            if (!user || !message.isGroupMsg) return returnType.reply('⛔ Error, wrong usage.')

            let text = '';
            switch (message.muteList.removeUserFromList(groupID, user)) {
                case 'NO_USERS':
                    text = `⛔ Error, there are no users in this group's mute list.`;
                    break;
                case true:
                    text = `User has been removed successfully!`;
                    break;
                case false:
                    text = `⛔ Error, check logs.`;
                    break;
                default:
                    text = `⛔ Unknown Error`;
            }
            return returnType.reply(text);
        },
        help: () => help.Admin.removeUserFromMuteList,
        timer: () => this.defaultTimer
    }
    getProfilePic = {
        func: async (message, client) => {
            let msg = message.quotedMsg || message;
            console.log(`Getting profile pic of ${msg.sender.pushname}`)
            let link = await client.getProfilePicFromServer(msg.sender.id).catch(err => { return { err: err } });
            if (link.err) return returnType.reply(`⛔ Error, ${msg.sender.pushname} is private or doesn't have a profile pic.`)
            return returnType.fileFromURL(link, 'profile.jpg', `Here's the profile pic of ${msg.sender.pushname}`);
        },
        help: () => help.Admin.getProfilePic,
        timer: () => this.defaultTimer
    }
}

module.exports = { Admin }