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

        commands.m = this.addInfo(this.m);

        commands.up = this.addInfo(this.uploadImg)
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
                case 'off':
                    if (redAlerts.getState()) {
                        redAlerts.changeState(false);
                        text = `🚨 Red Alerts has been ${b('deactivated!')}`;
                    }
                    else
                        text = `🚨 Red Alerts ${b('already')} deactivated!`;
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

    kickAll = {
        func: (client, groupMembers, groupId, botMaster, botNumber) => {
            if (groupMembers) {

                groupMembers.filter(member => member !== botMaster && member !== botNumber).forEach(member => {
                    client.removeParticipant(groupId, member);
                })
                return {};
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
            return {};
        },
        help: () => help.Owner.tag
    }

    //debugging
    m = {
        func: (message) => {
            if (message.quotedMsg)
                console.log(message.quotedMsg.mimetype)
            return {};
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