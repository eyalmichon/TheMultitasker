class Spam {
    constructor() {
        this.spamSet = {};
    }
    /**
     * 
     * @param {String} user user to add into the spam set.
     * @param timeout time in milliseconds.
     */
    addUser(user, command, timeout = 4000) {
        // check if the command already exists in the spam dictionary.
        if (!this.spamSet[command])
            this.spamSet[command] = new Set();

        // if the user is in the spam set, return.
        if (this.spamSet[command].has(user)) return

        this.spamSet[command].add(user);
        setTimeout(() => {
            this.spamSet[command].delete(user);
        }, timeout);

    }

    isSpam(user, command) {
        return this.spamSet[command] && this.spamSet[command].has(user);
    }

}

module.exports = {
    Spam
}