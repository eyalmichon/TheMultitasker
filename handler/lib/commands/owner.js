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

        commands.addforwarder = this.addInfo(this.addForwarder)

        commands.rmforwarder = this.addInfo(this.removeForwarder)

        commands.addgroupforwarder = this.addInfo(this.addGroupToForwarder)
        commands.addgf = this.alias(this.addGroupToForwarder)

        commands.rmgroupforwarder = this.addInfo(this.removeGroupFromForwarder)
        commands.rmgf = this.alias(this.removeGroupFromForwarder)

        commands.setlanguageforwarder = this.addInfo(this.setLanguageForwarder)
        commands.slf = this.alias(this.setLanguageForwarder)

        commands.setmaxmsgsforwarder = this.addInfo(this.setMaxMsgsForwarder)
        commands.smmf = this.alias(this.setMaxMsgsForwarder)

        commands.setprefixforwarder = this.addInfo(this.setPrefixForwarder)
        commands.spf = this.alias(this.setPrefixForwarder)

        commands.remove = this.addInfo(this.removeMsg)
        commands.rmv = this.alias(this.removeMsg)

        commands.countmsgs = this.addInfo(this.countMessagesByText)

        commands.spammsg = this.addInfo(this.spamMessage)

        commands.m = this.addInfo(this.m);

        commands.up = this.addInfo(this.uploadImg)

    }

    redAlerts = {
        func: (message, client) => {
            let text = '';
            switch (message.args[0]) {
                case 'on':
                    if (redAlerts.getState())
                        text = `???? Red Alerts ${b('already')} activated!`;
                    else {
                        redAlerts.changeState(true);
                        redAlerts.alerts(client, message.getGroup);
                        text = `???? Red Alerts has been ${b('activated!')}`;
                    }
                    break;
                case 'off':
                    if (redAlerts.getState()) {
                        redAlerts.changeState(false);
                        text = `???? Red Alerts has been ${b('deactivated!')}`;
                    }
                    else
                        text = `???? Red Alerts ${b('already')} deactivated!`;
                    break;
                default:
                    break;
            }
            return returnType.reply(text);
        },
        help: () => help.Owner.redAlerts
    }

    addSender = {
        func: (message) => {
            const group = message.args[0], id = message.args[1], lang = message.args[2];
            let text = '';
            if (message.mySenders.addSender(group, id, lang))
                text = `???? Sender has been ${b('added')} to senders`;
            else
                text = `???? Group name or number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.addSender
    }

    removeSender = {
        func: (message) => {
            const group = message.args[0], id = message.args[1];
            let text = '';
            if (message.mySenders.removeSender(group, id))
                text = `???? Sender has been ${b('removed')} from senders`;
            else
                text = `???? Group name or number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.removeSender
    }

    addForwarder = {
        func: (message) => {
            // get the language from args[0] if args[1] is empty
            let lang = message.args[1] || message.args[0];
            // if args[1] is empty, get group ID from 'group'
            let groupID = !!message.args[1] ? message.args[0] : message.from;
            let text = '';
            if (message.myForwarder.addForwarder(groupID, lang))
                text = `???? Forwarder has been ${b('added')} to forwardDB`;
            else
                text = `???? Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => ''
    }
    removeForwarder = {
        func: (message) => {
            // if args[0] is empty, get group ID from 'group'
            let groupID = !!message.args[0] ? message.args[0] : message.from;
            let text = '';
            if (message.myForwarder.removeForwarder(groupID))
                text = `???? Forwarder has been ${b('removed')} from forwardDB`;
            else
                text = `???? Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => ''
    }
    addGroupToForwarder = {
        func: (message) => {
            // get the group from args[0] if args[1] is empty
            let groupID = message.args[1] || message.args[0];
            // if args[1] is empty, get group ID from 'group'
            let forwarder = !!message.args[1] ? message.args[0] : message.from;
            let text = '';
            if (message.myForwarder.addGroup(forwarder, groupID))
                text = `???? Group has been ${b('added')} to ${forwarder} in forwardDB`;
            else
                text = `???? Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => ''
    }
    removeGroupFromForwarder = {
        func: (message) => {
            // get the group from args[0] if args[1] is empty
            let groupID = message.args[1] || message.args[0];
            // if args[1] is empty, get group ID from 'group'
            let forwarder = !!message.args[1] ? message.args[0] : message.from;
            let text = '';
            if (message.myForwarder.removeGroup(forwarder, groupID))
                text = `???? Group has been ${b('removed')} from ${forwarder} in forwardDB`;
            else
                text = `???? Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => ''
    }
    setLanguageForwarder = {
        func: (message) => {
            // get the language from args[0] if args[1] is empty
            let lang = message.args[1] || message.args[0];
            // if args[1] is empty, get group ID from 'group'
            let forwarder = !!message.args[1] ? message.args[0] : message.from;
            let text = '';
            if (message.myForwarder.setLanguage(forwarder, lang))
                text = `???? Group language has been ${b('set')} to ${lang} for ${forwarder} in forwardDB`;
            else
                text = `???? Language given "${lang}" was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => ''
    }
    setMaxMsgsForwarder = {
        func: (message) => {
            // get the language from args[0] if args[1] is empty
            let n = message.args[1] || message.args[0];
            // if args[1] is empty, get group ID from 'group'
            let forwarder = !!message.args[1] ? message.args[0] : message.from;
            let text = '';
            if (message.myForwarder.setMaxMsgs(forwarder, n))
                text = `???? Group maxMsgs has been ${b('set')} to ${n} for ${forwarder} in forwardDB`;
            else
                text = `???? maxMsgs number given "${n}" or Forwarder "${forwarder} were ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.setMaxMsgsForwarder
    }
    setPrefixForwarder = {
        func: (message) => {
            const options = parser.parse(message.args);

            // if args[0] is empty, get group ID from 'group'
            let forwarder = options.joinedText || message.from;

            let result = '';
            if (options.prefix || options.p)
                result = message.myForwarder.setPrefixMsgBool(forwarder)
            else if (options.name || options.n)
                result = message.myForwarder.setNameBool(forwarder)

            let text = '';
            if (result)
                text = `???? Group prefix message has been ${b('changed')} for ${forwarder} in forwardDB`;
            else
                text = `???? Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => ''
    }

    addUserToBlackList = {
        func: (message) => {
            let groupID = message.from;
            let user = !!message.quotedMsg ? message.quotedMsg.sender.id : message.mentionedJidList[0]
            if (!user || user === message.botMaster || !message.isGroupMsg) return returnType.reply('??? Error, wrong usage.')

            let text = '';
            switch (message.blackList.addUserToList(groupID, user)) {
                case 'USER_EXISTS':
                    text = `User already exists in the black list for this group.`;
                    break;
                case true:
                    text = `User has been added successfully!`;
                    break;
                case false:
                    text = `??? Error, check logs.`;
                    break;
                default:
                    text = `??? Unknown Error`;
            }
            return returnType.reply(text);
        },
        help: () => help.Owner.addUserToBlackList
    }
    removeUserFromBlackList = {
        func: (message) => {
            let groupID = message.from;
            let user = !!message.quotedMsg ? message.quotedMsg.sender.id : message.mentionedJidList[0]
            if (!user || !message.isGroupMsg) return returnType.reply('??? Error, wrong usage.')

            let text = '';
            switch (message.blackList.removeUserFromList(groupID, user)) {
                case 'NO_USERS':
                    text = `??? Error, there are no users in this group's black list.`;
                    break;
                case true:
                    text = `User has been removed successfully!`;
                    break;
                case false:
                    text = `??? Error, check logs.`;
                    break;
                default:
                    text = `??? Unknown Error`;
            }
            return returnType.reply(text);
        },
        help: () => help.Owner.removeUserFromBlackList
    }
    addPrefixBlackList = {
        func: (message) => {
            // get the prefix from args[0] if args[1] is empty
            let num = message.args[1] || message.args[0];
            // if args[1] is empty, get group ID from 'group'
            let groupID = !!message.args[1] ? message.args[0] : message.from;
            let text = '';
            switch (message.blackList.addPrefix(groupID, num)) {
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
        func: (message) => {
            // get the prefix from args[0] if args[1] is empty
            let num = message.args[1] || message.args[0];
            // if args[1] is empty, get group ID from 'group'
            let groupID = !!message.args[1] ? message.args[0] : message.from;
            let text = '';
            switch (message.blackList.removePrefix(groupID, num)) {
                case 'PREFIX_NOT_FOUND':
                    text = `I didn't find ${num} in the blacklist.`;
                    break;
                case true:
                    text = `Prefix removed successfully!`;
                    break;
                case false:
                    text = `??? Error, check logs.`;
                    break;
                default:
                    text = `Unknown Error`;
            }
            return returnType.reply(text);
        },
        help: () => help.Owner.removePrefixBlackList
    }

    kickAll = {
        func: (message, client) => {
            if (message.groupMembers) {
                message.groupMembers.filter(member => member !== message.botMaster && member !== message.botNumber).forEach(member => {
                    client.removeParticipant(message.from, member);
                })
                return { info: true };
            }
            else
                return errors.GROUP;
        },
        help: () => help.Owner.kickAll
    }

    membersOf = {
        func: async (message, client) => {
            const ID = message.args[0];
            if (!ID || !message.mySenders.isCorrectNumber(ID))
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
        func: (message, client) => {

            const options = parser.parse(message.args);
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
        func: (message, client) => {
            let tagList = [];
            const n = message.args[0] || 1;
            message.mentionedJidList.forEach(mentioned => {
                tagList.push(`@${mentioned.replace('@c.us', '')}`)
            });
            let tagText = tagList.join(' ');
            for (let i = 0; i < n; i++) {
                client.sendTextWithMentions(message.from, tagText);
            }
            return { info: true };
        },
        help: () => help.Owner.tag
    }

    removeMsg = {
        func: (message, client) => {
            if (message.quotedMsg.sender.id === message.botNumber) {
                client.deleteMessage(message.from, message.quotedMsg.id, false);
            }
            return { info: true };
        },
        help: () => help.Owner.removeMsg
    }

    countMessagesByText = {
        func: (message, client) => {
            const options = parser.parse(message.args);
            let user = options.u || options.user;
            let text = options.joinedText;
            if (!text)
                return errors.NO_TEXT;
            return client.loadAndGetAllMessagesInChat(message.from, false)
                .then(messages => {
                    let count = 0;

                    if (user) {
                        mentionedJidList.forEach(mentioned => { text = text.replace(mentioned, '') });
                        messages.forEach(message => {
                            message.mentionedJidList.forEach(mentioned => {
                                if (message.type === 'chat' && message.body.includes(text) && mentioned === message.sender.id)
                                    count++;
                            })
                        })
                    }
                    else
                        messages.forEach(message => {
                            if (message.type === 'chat' && message.body.includes(text))
                                count++;
                        })

                    return returnType.reply(`${count} messages found.`);
                })
        },
        help: () => help.Owner.countMessagesByText
    }

    spamMessage = {
        func: (message, client) => {
            const options = parser.parse(message.args);
            let n = options.n || 1;
            let text = options.joinedText;
            if (text)
                for (let i = 0; i < n; i++)
                    client.sendText(message.from, text);
            else if (message.quotedMsg)
                for (let i = 0; i < n; i++)
                    client.forwardMessages(message.from, message.quotedMsg.id);
            return { info: true };
        },
        help: () => help.Owner.spamMessage
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