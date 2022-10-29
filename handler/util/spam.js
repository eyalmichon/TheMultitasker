/**
 * Timer for knowing how much time has passed since setTimeout was called.
 * @param {Function} callback The function to call when the timer is done.
 * @param {Number} delay The amount of time to wait before calling the callback.
 */
class Timer {
    constructor(func, delay) {
        this.func = func;
        this.delay = delay;
        this.timer = setTimeout(this.func, this.delay);
        this.start = new Date();
    }
    /**
     * Return the time left for the timer.
     * @returns {Number} time left in milliseconds.
     */
    remainingTime() {
        let timeLeft = this.delay - (new Date() - this.start);
        return timeLeft < 0 ? 0 : timeLeft;
    }
    /**
     * Reset the timer.
     */
    stopTimer() {
        clearTimeout(this.timer);
    }
}

/**
 * Class for handling the spam protection.
 */
class Spam {
    constructor() {
        this.spamObject = {};
    }

    /**
     * 
     * @param {String} user user to add into the spam set.
     * @param {String} command command to add into the spam set.
     * @param timeout time in milliseconds.
     */
    addUser(user, command, timeout = 4000) {
        // check if the command already exists in the spam dictionary.
        if (!this.spamObject[command])
            this.spamObject[command] = {};

        // if the user is in the spam set, return.
        if (this.spamObject[command][user]) return

        this.spamObject[command][user] = new Timer(() => {
            this.spamObject[command][user] = null;
            delete this.spamObject[command][user];
        }, timeout);
    }

    /**
     * Return how much time is left for the user to be able to use the command again.
     * @param {String} user user to check.
     * @param {String} command command to check.
     * @returns {Number} time left in milliseconds.
     */
    timeLeft(user, command) {
        if (!this.spamObject[command] || !this.spamObject[command][user]) return 0
        return this.spamObject[command][user].remainingTime();
    }

    /**
     * Check if the user is in the spam object for a specific command.
     * @param {String} user user to check.
     * @param {String} command command to check.
     * @returns {Boolean} true if the user is in the spam object.
     */
    isSpam(user, command) {
        return this.timeLeft(user, command) > 0;
    }
}

module.exports = {
    Spam
}