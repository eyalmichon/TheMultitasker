const fs = require('fs');
const path = require('path')
const sendersPath = path.join(__dirname, 'senders.json');
const { languages } = require('./localizations.json');

class Senders {
    constructor() {
        // file for all senders sorted by use reason. should look something like this:
        // {"Me": "","RedAlerts-MessageOnly": [],"RedAlerts":[]}
        if (!fs.existsSync(sendersPath)) {
            console.error(`Couldn't find senders.json in ${sendersPath}, creating it...\nPLEASE FILL OUT YOUR NUMBER IN THE "Me" KEY.`)
            fs.writeFileSync(sendersPath, `{
                "Me": "Enter your number here -> ******@c.us",
                "Allowed": [],
                "WelcomeMsg": {},
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
    isCorrectNumber(num) {
        return (num.endsWith('@c.us') || num.endsWith('@g.us')) && (num.length > 16 && num.length < 29);
    }

    // Removes a given item from the array.
    removeFromArray(array, element) {
        return array.filter(item => item !== element);
    }

    // Get the type of an object.
    TypeOf(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    }

    /**
     * Add a sender to the senders.json file.
     * @param group The group which you want to add to.
     * @param number The phone number which you want to add.
     * @param lang The language of the group.
     * @returns true if added successfully or if was already there, false if the group doesn't 
     * exist or the number entered was incorrect or 'Me' group was selected.
     */
    addSender(group, number, lang) {
        const _group = this.senders[group];
        if (!_group || !this.isCorrectNumber(number) || group === 'Me')
            return false;

        if (this.TypeOf(_group) === 'Object') {
            // if it's not there already, add it.
            if (!_group[number] && !!lang && languages.includes(lang)) {
                this.senders[group] = lang;
                fs.writeFileSync(sendersPath, JSON.stringify(this.senders));
            }
            else return false
        }
        else
            // if it's not there already, add it.
            if (!_group.includes(number)) {
                this.senders[group].push(number);
                fs.writeFileSync(sendersPath, JSON.stringify(this.senders));
            }
            else return false

        return true;
    }
    /**
     * Remove a sender from the senders.json file.
     * @param group The group which you want to remove from.
     * @param number The phone number which you want to remove.
     * @returns true if removed or not found, false if the group doesn't 
     * exist or the number entered was incorrect or 'Me' group was selected.
     */
    removeSender(group, number) {
        const _group = this.senders[group];
        if (!_group || !this.isCorrectNumber(number) || group === 'Me')
            return false;

        if (this.TypeOf(_group) === 'Object') {
            if (_group[number]) {
                delete this.senders[group]
                fs.writeFileSync(sendersPath, JSON.stringify(this.senders));
            }
            else return false
        }
        else
            if (_group.includes(number)) {
                this.senders[group] = this.removeFromArray(_group, number)
                fs.writeFileSync(sendersPath, JSON.stringify(this.senders));
            }
            else return false
        return true;
    }
}

module.exports = {
    Senders
}