const mutexify = require('mutexify/promise')
const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');

class Forwarder {

    /**
     * Creates the group if needed and gets all the IDs.
     * singleton way using a mutex.
     * @param {*} client 
     * @param {*} name 
     * @param {*} fromID 
     * @returns 
     */
    async getIDsFromDB(client, name, fromID) {

        if (!this.groupsDB[name]) {
            try {
                var release = await this.lock()

                if (!this.groupsDB[name]) {

                    let messagesArr = await client.loadAndGetAllMessagesInChat(fromID, false);
                    this.groupsDB[name] = [];
                    messagesArr.forEach(message => {
                        this.groupsDB[name].push(message.id);
                    });
                }
                release();
            }
            catch (err) {
                console.error(err);
                release();
            }
        }
        return this.groupsDB[name];
    }

    getRandomID(array) {
        // get a random index for the messages array.
        let index = Math.floor(Math.random() * array.length);
        return array[index];
    }
    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Forwarder', ...cmd } }

    constructor(commands) {
        this.lock = mutexify()
        this.groupsDB = {};

        commands.egg = this.addInfo(this.egg);

        commands.fart = this.addInfo(this.fart);
    }

    egg = {
        func: async (message, client) => {
            // get all messages from given group.
            // In order for this to WORK you'll need to have the senders file with the group ID.
            let ids = await this.getIDsFromDB(client, 'egg', message.getGroup("ProjectEgg"))
            let id = this.getRandomID(ids)
            return returnType.forwardMessage(id)
        },
        help: () => help.Forwarder.egg
    }
    fart = {
        func: async (message, client) => {
            // get all messages from given group.
            // In order for this to WORK you'll need to have the senders file with the group ID.
            let ids = await this.getIDsFromDB(client, 'fart', message.getGroup("Fartictionary"))
            let id = this.getRandomID(ids)
            return returnType.forwardMessage(id)
        },
        help: () => help.Forwarder.fart
    }

}

module.exports = { Forwarder }