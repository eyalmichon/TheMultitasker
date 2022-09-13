const fs = require('fs');
const path = require('path')
const { removeFromArray } = require('../utilities');
const groupsPath = path.join(__dirname, 'groups.json');

class MuteList {

    constructor() {
        if (!fs.existsSync(groupsPath)) {
            console.error(`Couldn't find groups.json in ${groupsPath}, creating it...`)
            fs.writeFileSync(groupsPath, '{}')
        }
        this.groups = require('./groups.json')

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

}
module.exports = { MuteList }