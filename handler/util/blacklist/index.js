const fs = require('fs');
const path = require('path')
const { isInt, removeFromArray } = require('../utilities');
const groupsPath = path.join(__dirname, 'groups.json');
const prefixPath = path.join(__dirname, 'prefix.json');

class BlackList {

    constructor() {
        if (!fs.existsSync(groupsPath)) {
            console.error(`Couldn't find groups.json in ${groupsPath}, creating it...`)
            fs.writeFileSync(groupsPath, '{}')
        }
        this.groups = require('./groups.json')

        if (!fs.existsSync(prefixPath)) {
            console.error(`Couldn't find prefix.json in ${prefixPath}, creating it...`)
            fs.writeFileSync(prefixPath, '{"prefixes":[]}')

        }
        this.prefix = require('./prefix.json')
    }

    getGroup(id) { return this.groups[id] }
    addUserToList(groupID, user) {
        if (!this.groups[groupID]) {
            this.groups[groupID] = []
        }

        if (this.groups[groupID].includes(user)) return 'USER_EXISTS';

        this.groups[groupID].push(user)
        try {
            fs.writeFileSync(groupsPath, JSON.stringify(this.groups))
        }
        catch (err) {
            console.error(err)
            return false;
        }
        return true;
    }
    removeUserFromList(groupID, user) {
        if (this.groups[groupID]) {
            this.groups = removeFromArray(this.groups[groupID], user)
            try {
                fs.writeFileSync(groupsPath, JSON.stringify(this.groups))
            }
            catch (err) {
                console.error(err)
                return false;
            }
            return true;
        }
        else return 'NO_USERS'
    }

    getPrefixes() { return this.prefix.prefixes }
    addPrefix(num) {
        if (isInt(num) && 0 < num.length && num.length < 7) {
            if (!this.prefix.prefixes.includes(num)) {
                this.prefix.prefixes.push(num)
                try {
                    fs.writeFileSync(prefixPath, JSON.stringify(this.prefix))
                }
                catch (err) {
                    console.error(err)
                    return false;
                }
                return true;
            }
            else return 'PREFIX_EXISTS';
        }
        else return 'PREFIX_BAD_FORMAT';
    }
    removePrefix(num) {
        if (this.prefix.prefixes.includes(num)) {
            this.prefix.prefixes = removeFromArray(this.prefix.prefixes, num)
            try {
                fs.writeFileSync(prefixPath, JSON.stringify(this.prefix))
            }
            catch (err) {
                console.error(err)
                return false;
            }
            return true;
        }
        else return 'PREFIX_NOT_FOUND';
    }
}

module.exports = { BlackList }