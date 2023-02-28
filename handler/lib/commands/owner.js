const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { parser, redAlerts, fetcher } = require("..");
const { decryptMedia } = require("@open-wa/wa-automate");

class Owner {

    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Owner', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }

    constructor(commands, defaultTimer) {
        this.defaultTimer = defaultTimer;

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
        commands.spam = this.alias(this.spamMessage)

        commands.joingroup = this.addInfo(this.joinGroup)

        // commands.m = this.addInfo(this.m);

        commands.up = this.addInfo(this.uploadImg)

    }

    redAlerts = {
        func: (message, client) => {
            let text = '';
            switch (message.args[0]) {
                case 'on':
                    if (redAlerts.getState())
                        text = `🚨 Red Alerts ${b('already')} activated!`;
                    else {
                        redAlerts.changeState(true);
                        redAlerts.alerts(client, message.getGroup);
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
        help: () => help.Owner.redAlerts,
        timer: () => this.defaultTimer
    }

    addSender = {
        func: (message) => {
            const group = message.args[0], id = message.args[1], lang = message.args[2];
            let text = '';
            if (message.mySenders.addSender(group, id, lang))
                text = `📧 Sender has been ${b('added')} to senders`;
            else
                text = `📛 Group name or number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.addSender,
        timer: () => this.defaultTimer
    }

    removeSender = {
        func: (message) => {
            const group = message.args[0], id = message.args[1];
            let text = '';
            if (message.mySenders.removeSender(group, id))
                text = `📧 Sender has been ${b('removed')} from senders`;
            else
                text = `📛 Group name or number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.removeSender,
        timer: () => this.defaultTimer
    }

    addForwarder = {
        func: (message) => {
            // get the language from args[0] if args[1] is empty
            let lang = message.args[1] || message.args[0];
            // if args[1] is empty, get group ID from 'group'
            let groupID = !!message.args[1] ? message.args[0] : message.from;
            let text = '';
            if (message.myForwarder.addForwarder(groupID, lang))
                text = `📧 Forwarder has been ${b('added')} to forwardDB`;
            else
                text = `📛 Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => '',
        timer: () => this.defaultTimer
    }
    removeForwarder = {
        func: (message) => {
            // if args[0] is empty, get group ID from 'group'
            let groupID = !!message.args[0] ? message.args[0] : message.from;
            let text = '';
            if (message.myForwarder.removeForwarder(groupID))
                text = `📧 Forwarder has been ${b('removed')} from forwardDB`;
            else
                text = `📛 Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => '',
        timer: () => this.defaultTimer
    }
    addGroupToForwarder = {
        func: (message) => {
            // get the group from args[0] if args[1] is empty
            let groupID = message.args[1] || message.args[0];
            // if args[1] is empty, get group ID from 'group'
            let forwarder = !!message.args[1] ? message.args[0] : message.from;
            let text = '';
            if (message.myForwarder.addGroup(forwarder, groupID))
                text = `📧 Group has been ${b('added')} to ${forwarder} in forwardDB`;
            else
                text = `📛 Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => '',
        timer: () => this.defaultTimer
    }
    removeGroupFromForwarder = {
        func: (message) => {
            // get the group from args[0] if args[1] is empty
            let groupID = message.args[1] || message.args[0];
            // if args[1] is empty, get group ID from 'group'
            let forwarder = !!message.args[1] ? message.args[0] : message.from;
            let text = '';
            if (message.myForwarder.removeGroup(forwarder, groupID))
                text = `📧 Group has been ${b('removed')} from ${forwarder} in forwardDB`;
            else
                text = `📛 Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => '',
        timer: () => this.defaultTimer
    }
    setLanguageForwarder = {
        func: (message) => {
            // get the language from args[0] if args[1] is empty
            let lang = message.args[1] || message.args[0];
            // if args[1] is empty, get group ID from 'group'
            let forwarder = !!message.args[1] ? message.args[0] : message.from;
            let text = '';
            if (message.myForwarder.setLanguage(forwarder, lang))
                text = `📧 Group language has been ${b('set')} to ${lang} for ${forwarder} in forwardDB`;
            else
                text = `📛 Language given "${lang}" was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => '',
        timer: () => this.defaultTimer
    }
    setMaxMsgsForwarder = {
        func: (message) => {
            // get the language from args[0] if args[1] is empty
            let n = message.args[1] || message.args[0];
            // if args[1] is empty, get group ID from 'group'
            let forwarder = !!message.args[1] ? message.args[0] : message.from;
            let text = '';
            if (message.myForwarder.setMaxMsgs(forwarder, n))
                text = `📧 Group maxMsgs has been ${b('set')} to ${n} for ${forwarder} in forwardDB`;
            else
                text = `📛 maxMsgs number given "${n}" or Forwarder "${forwarder} were ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => help.Owner.setMaxMsgsForwarder,
        timer: () => this.defaultTimer
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
                text = `📧 Group prefix message has been ${b('changed')} for ${forwarder} in forwardDB`;
            else
                text = `📛 Group number given was ${b('incorrect!')} [Are you the master of the bot?!?]`;
            return returnType.reply(text);
        },
        help: () => '',
        timer: () => this.defaultTimer
    }

    addUserToBlackList = {
        func: (message) => {
            let groupID = message.from;
            let user = !!message.quotedMsg ? message.quotedMsg.sender.id : message.mentionedJidList[0]
            if (!user || user === message.botMaster || !message.isGroupMsg) return returnType.reply('⛔ Error, wrong usage.')

            let text = '';
            switch (message.blackList.addUserToList(groupID, user)) {
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
        help: () => help.Owner.addUserToBlackList,
        timer: () => this.defaultTimer
    }
    removeUserFromBlackList = {
        func: (message) => {
            let groupID = message.from;
            let user = !!message.quotedMsg ? message.quotedMsg.sender.id : message.mentionedJidList[0]
            if (!user || !message.isGroupMsg) return returnType.reply('⛔ Error, wrong usage.')

            let text = '';
            switch (message.blackList.removeUserFromList(groupID, user)) {
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
        help: () => help.Owner.removeUserFromBlackList,
        timer: () => this.defaultTimer
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
        help: () => help.Owner.addPrefixBlackList,
        timer: () => this.defaultTimer
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
                    text = `⛔ Error, check logs.`;
                    break;
                default:
                    text = `Unknown Error`;
            }
            return returnType.reply(text);
        },
        help: () => help.Owner.removePrefixBlackList,
        timer: () => this.defaultTimer
    }

    kickAll = {
        func: async (message, client) => {
            const options = parser.parse(message.args);
            let groupId = options.id;

            if (groupId)
                message.groupMembers = await client.getGroupMembersId(groupId);

            if (message.groupMembers) {
                message.groupMembers.filter(member => member !== message.botMaster && member !== message.botNumber).forEach(member => {
                    console.log(`Kicking ${member} from ${groupId ? groupId : message.from}`);
                    client.removeParticipant(groupId ? groupId : message.from, member);
                })
                return { info: true };
            }
            else
                return errors.GROUP;
        },
        help: () => help.Owner.kickAll,
        timer: () => this.defaultTimer
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
        help: () => help.Owner.membersOf,
        timer: () => this.defaultTimer
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
        help: () => help.Owner.ID,
        timer: () => this.defaultTimer
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
        help: () => help.Owner.tag,
        timer: () => this.defaultTimer
    }

    removeMsg = {
        func: async (message, client) => {
            const options = parser.parse(message.args);
            let all = options.a

            if (!message.quotedMsg)
                return errors.NO_QUOTED_MESSAGE;

            client.deleteMessage(message.from, message.id, false);

            if (all) {

                // ************* until this function is fixed... *************
                // const messages = await client.loadEarlierMessagesTillDate(message.from, timestamp);

                // this is a workaround for the above function.
                let messages = await client.loadAndGetAllMessagesInChat(message.from, true)
                let fetchArr = [];

                let quotedMsg = messages.find(msg => msg.id === message.quotedMsg.id);

                if (!quotedMsg)
                    while (true) {
                        fetchArr = await client.loadEarlierMessages(message.from);
                        console.log(`Fetched ${fetchArr.length} messages.`)
                        // if not array or empty array, break.
                        if (!Array.isArray(fetchArr) || !fetchArr.length) break;
                        messages.push(...fetchArr);
                        // check if the quoted message is in the array, if it is we are done.
                        if (quotedMsg = fetchArr.find(msg => msg.id === message.quotedMsg.id)) {
                            console.log('Quoted message found in array, breaking.')
                            break;
                        }
                    }

                if (!quotedMsg) return
                const timestamp = quotedMsg.timestamp;

                messages = messages.filter(msg => msg.timestamp >= timestamp && msg.sender.id === quotedMsg.sender.id).map(msg => msg.id)


                console.log(`Deleting ${messages.length} messages from ${quotedMsg.sender.id}...`);
                await client.deleteMessage(message.from, messages, false);
            }
            else
                client.deleteMessage(message.from, message.quotedMsg.id, false);

            return { info: true };
        },
        help: () => help.Owner.removeMsg,
        timer: () => this.defaultTimer
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
        help: () => help.Owner.countMessagesByText,
        timer: () => this.defaultTimer
    }

    spamMessage = {
        func: async (message, client) => {
            const options = parser.parse(message.args, false);
            let n = options.n || 1;
            let text = options.joinedText;
            let to = options.to;
            let join = options.join;
            let tagall = options.tag;

            if (join) {
                to = await client.joinGroupViaLink(join);
                // wait for 2 seconds before sending the messages.
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log(`Spamming ${n} messages to ${to ? to : message.from}`)
            if (message.quotedMsg)
                for (let i = 0; i < n; i++) {
                    console.log(`Forwarding message ${i + 1} of ${n}`)
                    await client.forwardMessages(to ? to : message.from, message.quotedMsg.id);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            else if (text)
                for (let i = 0; i < n; i++) {
                    console.log(`Sending message ${i + 1} of ${n}`)
                    await client.sendText(to ? to : message.from, text);
                }

            if (tagall) {
                let groupMembers = await client.getGroupMembersId(to)
                console.log(`Tagging ${groupMembers.length} members`)
                await client.sendTextWithMentions(to ? to : message.from, groupMembers.map(member => `@${member.replace('@c.us', '')}`).join(' '))
                if (groupMembers.length > 100)
                    await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (join) {
                // wait 1 second before leaving the group.
                await new Promise(resolve => setTimeout(resolve, 1000));
                await client.leaveGroup(to);
            }

            return { info: true };
        },
        help: () => help.Owner.spamMessage,
        timer: () => this.defaultTimer
    }

    joinGroup = {
        func: (message, client) => {
            const options = parser.parse(message.args);
            let link = options.url
            if (!link)
                return errors.NO_LINK;
            client.joinGroupViaLink(link);
            return { info: true };
        },
        help: () => help.Owner.joinGroup,
        timer: () => this.defaultTimer
    }

    //debugging
    m = {
        func: (message) => {
            if (message.quotedMsg)
                console.log(message.quotedMsg.mimetype)
            return { info: true };
        },
        help: () => help.Owner.m,
        timer: () => this.defaultTimer
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
        help: () => '',
        timer: () => this.defaultTimer
    }
}

module.exports = { Owner }