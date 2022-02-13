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
            fs.writeFileSync(prefixPath, '{}')

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
            this.groups[groupID] = removeFromArray(this.groups[groupID], user)
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

    getPrefixes(id) { return this.prefix[id] }
    addPrefix(groupID, num) {
        if (isInt(num) && 0 < num.length) {
            if (!this.prefix[groupID]) {
                this.prefix[groupID] = []
            }

            if (this.prefix[groupID].includes(num)) return 'PREFIX_EXISTS';

            this.prefix[groupID].push(num)
            try {
                fs.writeFileSync(prefixPath, JSON.stringify(this.prefix))
            }
            catch (err) {
                console.error(err)
                return false;
            }
            return true;


        }
        else return 'PREFIX_BAD_FORMAT';
    }
    removePrefix(groupID, num) {
        if (this.prefix[groupID].includes(num)) {
            this.prefix[groupID] = removeFromArray(this.prefix[groupID], num)
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