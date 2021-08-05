class Spam {
    constructor() {
        this.spamSet = new Set();
    }
    /**
     * 
     * @param {String} user user to add into the spam set.
     * @param timeout time in milliseconds.
     */
    addUser(user, timeout = 4000) {
        this.spamSet.add(user);
        setTimeout(() => {
            this.spamSet.delete(user);
        }, timeout);
    }

    isSpam(user) {
        return this.spamSet.has(user);
    }
}

module.exports = {
    Spam
}