const fs = require('fs');
const path = require('path')
const forwardDBPath = path.join(__dirname, 'forwardDB.json');
const messagesDBPath = path.join(__dirname, 'messagesDB.json');
const { languages, prefixMsg } = require('./localizations.json');

class Forwarder {
    constructor() {
        // Database for all groups that should forward messages from one another.
        if (!fs.existsSync(forwardDBPath)) {
            console.error(`Couldn't find forwardDB.json in ${forwardDBPath}, creating it...\n`)
            fs.writeFileSync(forwardDBPath, `{}`)
        }
        // Database for all group messages to keep track of each message ID.
        if (!fs.existsSync(messagesDBPath)) {
            console.error(`Couldn't find messagesDB.json in ${messagesDBPath}, creating it...\n`)
            fs.writeFileSync(messagesDBPath, `{}`)
        }
        this.forwarders = require('./forwardDB.json')
        this.messagesDB = require('./messagesDB.json')
    }
    // return the whole forwardDB json object.
    getForwarders() { return this.forwarders; }
    // return a specific forwarder from the json object.
    getForwarder(group) { return this.forwarders[group]; }
    // return all message IDs from the json object.
    getGroupMessages(group) { return this.messagesDB[group]; }
    // Return the length of the messages object for a given group.
    getGroupMessagesLength(group) { return Object.keys(this.messagesDB[group]).length; }
    // return the prefix message of the given language.
    getPrefixMsg(lang) { return prefixMsg[lang] }

    // check if we got a correct number, this is the best we can do I guess...
    // Might want to delete or replace prefix.
    isCorrectNumber(num) {
        return (num.endsWith('@c.us') || num.endsWith('@g.us')) && (num.length === 17 || num.length === 28);

    }

    // Removes a given item from the array.
    removeFromArray(array, element) {
        return array.filter(item => item !== element);
    }


    /**
     * Add a forwarder to the forwardDB.json file.
     * @param forwarder The group/chat which you want to become a forwarder.
     * @param lang The language of the group.
     * @returns true if added successfully or if was already there, 
     * false exist or the number entered or language code was incorrect.
     */
    addForwarder(forwarder, lang) {
        if (!this.isCorrectNumber(forwarder) || !languages.includes(lang))
            return false;

        // if it's not there already, add it.
        if (!this.forwarders[forwarder]) {
            // maxMsgs:false for infinite msgs.
            this.forwarders[forwarder] = { groups: [], lang, isName: true, isPrefixMsg: true, maxMsgs: false };
            this.writeToForwardersDB();
            this.messagesDB[forwarder] = {}
            this.writeToMessagesDB();
        }
        return true;
    }
    /**
     * Add a group to a forwarder in forwardDB.json file.
     * @param forwarder The group which you want to add to.
     * @param group The phone number which you want to add.
     * @returns true if added successfully or if was already there, false if the group doesn't 
     * exist or the number entered or language code was incorrect.
     */
    addGroup(forwarder, group) {
        if (!this.forwarders[forwarder] || !this.isCorrectNumber(group))
            return false;

        this.forwarders[forwarder].groups.push(group);
        this.writeToForwardersDB();


        return true;
    }
    /**
     * Remove a forwarder from the forwardDB.json file.
     * @param forwarder The group which you want to remove from.
     * @returns true if removed or not found, false is the group doesn't 
     * exist or the number entered was incorrect or 'Me' group was selected.
     */
    removeForwarder(forwarder) {
        if (!this.forwarders[forwarder])
            return false;

        delete this.forwarders[forwarder];
        this.writeToForwardersDB();
        delete this.messagesDB[forwarder];
        this.writeToMessagesDB();
        return true;
    }
    /**
     * Remove a group from a forwarder in the forwardDB.json file.
     * @param forwarder The group which you want to remove from.
     * @param group The phone number which you want to remove.
     * @returns true if removed or not found, false is the group doesn't 
     * exist or the number entered was incorrect or 'Me' group was selected.
     */
    removeGroup(forwarder, group) {
        if (!this.forwarders[forwarder])
            return false;

        if (this.forwarders[forwarder].groups.includes(group)) {
            this.forwarders[forwarder].groups = this.removeFromArray(this.forwarders[forwarder].groups, group);
            this.writeToForwardersDB();
        }
        else return false;

        return true;
    }
    /**
     * Remove messages from messagesDB for a given forwarder.
     * @param {*} forwarder The group which you want to remove from.
     * @param {*} n The amount of messages to remove.
     * @returns 
     */
    removeMessages(forwarder, n) {
        if (n < 0) return;

        let i = n;
        const groupMsgs = this.getGroupMessages(forwarder);
        for (const id in groupMsgs) {
            if (i === 0) break;
            // delete the message by ID.
            delete groupMsgs[id]
            i--;
        }
        this.writeToMessagesDB();
        return n;
    }
    /**
     * Change the language that is set for the given forwarder.
     * @param {*} forwarder The group which you want to remove from.
     * @param {*} lang The language of the group.
     * @returns false if the forwarder doesn't exist or the language is not legal, true if changed.
     */
    setLanguage(forwarder, lang) {
        if (!this.forwarders[forwarder] || !languages.includes(lang))
            return false;

        this.forwarders[forwarder].lang = lang;
        this.writeToForwardersDB();
        return true;
    }
    /**
     * Change the maxMsgs that is set for the given forwarder.
     * @param {*} forwarder The group which you want to remove from.
     * @param {*} n The new max amount of messages.
     * @returns false if the forwarder doesn't exist or the language is not legal, true if changed.
     */
    setMaxMsgs(forwarder, n) {
        const parsedN = !!parseInt(n) ? parseInt(n) : n;
        if (!this.forwarders[forwarder] || (!parsedN && parsedN !== 'false'))
            return false;

        this.forwarders[forwarder].maxMsgs = parsedN;
        this.writeToForwardersDB();
        return true;
    }
    /**
     * Change the prefixMsg boolean that is set for the given forwarder.
     * if set to true messages will have a message added before the actual message with
     * i.e "forwarded from:".
     * @param {*} forwarder The group which you want to remove from.
     * @returns false if the forwarder doesn't exist, true if changed.
     */
    setPrefixMsgBool(forwarder) {
        if (!this.forwarders[forwarder])
            return false;

        this.forwarders[forwarder].isPrefixMsg = !this.forwarders[forwarder].isPrefixMsg;
        this.writeToForwardersDB();
        return true;
    }
    /**
     * Change the name boolean that is set for the given forwarder.
     * if set to true messages will have a message added before the actual message with the
     * sender's name.
     * @param {*} forwarder The group which you want to remove from.
     * @returns false if the forwarder doesn't exist, true if changed.
     */
    setNameBool(forwarder) {
        if (!this.forwarders[forwarder])
            return false;

        this.forwarders[forwarder].isName = !this.forwarders[forwarder].isName;
        this.writeToForwardersDB();
        return true;
    }

    writeToForwardersDB() {
        fs.writeFileSync(forwardDBPath, JSON.stringify(this.forwarders));
    }

    writeToMessagesDB() {
        fs.writeFileSync(messagesDBPath, JSON.stringify(this.messagesDB));
    }
}

module.exports = {
    Forwarder
}