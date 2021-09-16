const fs = require('fs');
const path = require('path')
const sendersPath = path.join(__dirname, 'senders.json');

class Senders {
    constructor() {
        // file for all senders sorted by use reason. should look something like this:
        // {"Me": "","RedAlerts-MessageOnly": [],"RedAlerts":[]}
        if (!fs.existsSync(sendersPath)) {
            console.error(`Couldn't find senders.json in ${sendersPath}, creating it...\nPLEASE FILL OUT YOUR NUMBER IN THE "Me" KEY.`)
            fs.writeFileSync(sendersPath, `{
                "Me": "Enter your number here -> ******@c.us",
                "Allowed": [],
                "RedAlerts-MessageOnly": [],
                "RedAlerts": [],
            }`)
        }
        this.senders = require('./senders.json')
    }
    // return the whole senders json object.
    getSenders() { return this.senders; }
    // return a specific group from the json object.
    getGroup(group) { return this.senders[group]; }

    // check if we got a correct number, this is the best we can do I guess...
    // Might want to delete or replace prefix.
    isCorrectNumber(num) {
        return num.startsWith('972') && (num.endsWith('@c.us') || num.endsWith('@g.us')) && (num.length === 17 || num.length === 28);

    }

    // Removes a given item from the array.
    removeFromArray(array, element) {
        return array.filter(item => item !== element);
    }

    /**
     * Add a sender to the senders.json file.
     * @param group The group which we want to add to.
     * @param number The phone number which we want to add.
     * @returns true if added successfully or if was already there, false is the group doesn't 
     * exist or the number entered was incorrect or 'Me' group was selected.
     */
    addSender(group, number) {
        if (this.senders[group] === undefined || !this.isCorrectNumber(number) || group === 'Me')
            return false;
        if (!this.senders[group].includes(number)) {
            this.senders[group].push(number);
            fs.writeFileSync(sendersPath, JSON.stringify(this.senders));
        }
        return true;
    }
    /**
     * Remove a sender from the senders.json file.
     * @param group The group which we want to remove from.
     * @param number The phone number which we want to remove.
     * @returns true if removed or not found, false is the group doesn't 
     * exist or the number entered was incorrect or 'Me' group was selected.
     */
    removeSender(group, number) {
        if (this.senders[group] === undefined || !this.isCorrectNumber(number) || group === 'Me')
            return false;
        if (this.senders[group].includes(number)) {
            this.senders[group] = this.removeFromArray(this.senders[group], number);
            fs.writeFileSync(sendersPath, JSON.stringify(this.senders));
        }
        return true;
    }
}

module.exports = {
    Senders
}