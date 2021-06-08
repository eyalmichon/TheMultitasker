const fs = require('fs');

class Senders {
    constructor(sendersFileName) {
        // file for all senders sorted by use reason. should look something like this:
        // {"Me": "","RedAlerts-MessageOnly": [],"RedAlerts":[]}
        this.senders = JSON.parse(fs.readFileSync(sendersFileName, 'utf8'));
        this.sendersFileName = sendersFileName;
    }
    getSenders() { return this.senders; }

    // check if we got a correct number, this is the best we can do I guess...
    isCorrectNumber(num) {
        return num.startsWith('972') && (num.endsWith('@c.us') || num.endsWith('@g.us') && (num.length === 17 || num.length === 28))

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
            fs.writeFileSync(this.sendersFileName, JSON.stringify(this.senders));
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
            fs.writeFileSync(this.sendersFileName, JSON.stringify(this.senders));
        }
        return true;
    }
}

module.exports = {
    Senders
}