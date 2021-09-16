const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { parser, redAlerts, fetcher } = require("..");
const { decryptMedia } = require("@open-wa/wa-automate");

class Owner {

    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Owner', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }

    constructor(commands) {
        commands.redalerts = this.addInfo(this.redAlerts);

        commands.addsender = this.addInfo(this.addSender);

        commands.rmsender = this.addInfo(this.removeSender);
        commands.rmvsender = this.alias(this.removeSender);

        commands.kickall = this.addInfo(this.kickAll);

        commands.membersof = this.addInfo(this.membersOf);

        commands.id = this.addInfo(this.chatIDs);
        commands.jid = this.alias(this.chatIDs);
        commands.chatids = this.alias(this.chatIDs);

        commands.tag = this.addInfo(this.tag);

        commands.blacklist = this.addInfo(this.addUserToBlackList)
        commands.black = this.alias(this.addUserToBlackList)

        commands.unblacklist = this.addInfo(this.removeUserFromBlackList)
        commands.unblack = this.alias(this.removeUserFromBlackList)

        commands.addprefix = this.addInfo(this.addPrefixBlackList)

        commands.rmprefix = this.addInfo(this.removePrefixBlackList)

        commands.m = this.addInfo(this.m);

        commands.up = this.addInfo(this.uploadImg)

        commands.send = this.addInfo(this.uploadImg)


    }

    redAlerts = {
        func: (client, getGroup, option) => {
            let text = '';
            switch (option) {
                case 'on':
                    if (redAlerts.getState())
                        text = `🚨 Red Alerts ${b('already')} activated!`;
                    else {
                        redAlerts.changeState(true);
                        redAlerts.alerts(client, getGroup);
                        text = `🚨 Red Alerts has been ${b('activated!')}`;
                    }
                    break;
                case 'off':
                    if (redAlerts.getState()) {
                        redAlerts.changeState(false);
                        text = `🚨 Red Alerts has been ${b('deactivated!')}`;
                    }
                    else
                        text = `🚨 Red Alerts ${b('already')} deactivated!`;
                    break;
                default:
                    break;
            }
            return returnType.reply(text);
        },
        help: () => help.Owner.redAlerts
    }

    addSender = {
        func: (senders, group, id) => {
            let text = '';
            if (senders.addSender(group, id))
                text = `📧 Sender has been ${b('added')} to senders json`;
            else
                text = `📛 Group name or number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.addSender
    }

    removeSender = {
        func: (senders, group, id) => {
            let text = '';
            if (senders.removeSender(group, id))
                text = `📧 Sender has been ${b('removed')} from senders json`;
            else
                text = `📛 Group name or number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.removeSender
    }

    addUserToBlackList = {
        func: (blackList, message, botMaster) => {
            let groupID = message.from;
            let user = !!message.quotedMsg ? message.quotedMsg.sender.id : message.mentionedJidList[0]
            if (!user || user === botMaster || !message.isGroupMsg) return returnType.reply('⛔ Error, wrong usage.')

            let text = '';
            switch (blackList.addUserToList(groupID, user)) {
                case 'USER_EXISTS':
                    text = `User already exists in the black list for this group.`;
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
        help: () => help.Owner.addUserToBlackList
    }
    removeUserFromBlackList = {
        func: (blackList, message) => {
            let groupID = message.from;
            let user = !!message.quotedMsg ? message.quotedMsg.sender.id : message.mentionedJidList[0]
            if (!user || !message.isGroupMsg) return returnType.reply('⛔ Error, wrong usage.')

            let text = '';
            switch (blackList.removeUserFromList(groupID, user)) {
                case 'NO_USERS':
                    text = `⛔ Error, there are no users in this group's black list.`;
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
        help: () => help.Owner.removeUserFromBlackList
    }
    addPrefixBlackList = {
        func: (blackList, num) => {
            let text = '';
            switch (blackList.addPrefix(num)) {
                case 'PREFIX_EXISTS':
                    text = `Prefix already exists.`;
                    break;
                case 'PREFIX_BAD_FORMAT':
                    text = `Prefix not in the right format, ex: 972`;
                    break;
                case true:
                    text = `Prefix added successfully!`;
                    break;
                default:
                    text = `Unknown Error`;
            }
            return returnType.reply(text);
        },
        help: () => help.Owner.addPrefixBlackList
    }
    removePrefixBlackList = {
        func: (blackList, num) => {
            let text = '';
            switch (blackList.removePrefix(num)) {
                case 'PREFIX_NOT_FOUND':
                    text = `I didn't find ${num} in the blacklist.`;
                    break;
                case true:
                    text = `Prefix removed successfully!`;
                    break;
                case false:
                    text = `⛔ Error, check logs.`;
                    break;
                default:
                    text = `Unknown Error`;
            }
            return returnType.reply(text);
        },
        help: () => help.Owner.removePrefixBlackList
    }

    kickAll = {
        func: (client, groupMembers, groupId, botMaster, botNumber) => {
            if (groupMembers) {

                groupMembers.filter(member => member !== botMaster && member !== botNumber).forEach(member => {
                    client.removeParticipant(groupId, member);
                })
                return { info: true };
            }
            else
                return errors.GROUP;
        },
        help: () => help.Owner.kickAll
    }

    membersOf = {
        func: async (client, senders, ID) => {
            if (!ID || !senders.isCorrectNumber(ID))
                return errors.WRONG_ID;
            // gets all the phone numbers from a given group.
            let membersNum = await client.getGroupMembersId(ID);
            const promises = [];
            // get all the objects of user info.
            membersNum.forEach(item => {
                promises.push(client.getContact(item))
            })
            let membersObj = await Promise.all(promises);
            // get all public shown names of the found numbers.
            let memberNames = [];
            membersObj.forEach(member => {
                memberNames.push(member.pushname ? member.pushname : member.name)
            })
            // send the list of names to the bot master.
            return returnType.sendMaster(memberNames.join(', '))
        },
        help: () => help.Owner.membersOf
    }

    chatIDs = {
        func: (client, args) => {

            const options = parser.parse(args);
            let all = !!options.a || !!options.all;

            return client.getAllChatIds()
                .then(async ids => {
                    const chatIDsPromises = [];
                    if (all)
                        ids.forEach(id => chatIDsPromises.push(client.getChatById(id).then(chatObject => (`${chatObject.formattedTitle}\n${id}`))))
                    else
                        ids.forEach(id => chatIDsPromises.push(client.getChatById(id).then(chatObject => chatObject.isGroup ? (`${chatObject.formattedTitle}\n${id}`) : undefined)))
                    return await Promise.all(chatIDsPromises)
                })
                .then(res => {
                    return returnType.sendMaster(res.filter(item => item !== undefined).join('\n'));
                })
        },
        help: () => help.Owner.ID
    }

    tag = {
        func: (client, mentionedJidList, from, n) => {
            let tagList = [];

            mentionedJidList.forEach(mentioned => {
                tagList.push(`@${mentioned.replace('@c.us', '')}`)
            });
            let tagText = tagList.join(' ');
            for (let i = 0; i < n; i++) {
                client.sendTextWithMentions(from, tagText);
            }
            return { info: true };
        },
        help: () => help.Owner.tag
    }

    //debugging
    m = {
        func: (message) => {
            if (message.quotedMsg)
                console.log(message.quotedMsg.mimetype)
            return { info: true };
        },
        help: () => help.Owner.m
    }

    uploadImg = {
        func: async (message) => {
            if (message.quotedMsg) message = message.quotedMsg;
            return fetcher.uploadImage(await decryptMedia(message))
                .then(res => {
                    console.log(res)
                    return returnType.reply(res);
                })

        },
        help: () => ''
    }

}

module.exports = { Owner }