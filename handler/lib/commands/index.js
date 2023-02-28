const { errors } = require('./errors')
const { prefix, getRandomWaitMsg } = require('./helper')
const { Admin } = require("./admin");
const { Forwarder } = require("./forwarder");
const { Info } = require("./info");
const { Owner } = require("./owner");
const { Social } = require("./social");
const { Sticker } = require('./sticker');
const { Media } = require('./media');
const { Help } = require('./help');
const { AI } = require('./ai');

class Commands {
    // Initialize all commands to the commands object.
    constructor() {
        this.commands = {};
        new Owner(this.commands, 0);
        new Admin(this.commands, 0);
        new Social(this.commands, 20);
        new Forwarder(this.commands, 5);
        new Info(this.commands, 10);
        new Sticker(this.commands, 5);
        new Media(this.commands, 5);
        new AI(this.commands, 60)
        // Keep last.
        new Help(this.commands, 0);
    }
    /**
     * Get the type of the command.
     * @param {String} cmd 
     * @returns type of command.
     */
    type(cmd) {
        return this.commands[cmd] && this.commands[cmd].type;
    }
    /**
     * execute the command from the commands object.
     * 
     * @param {String} cmd 
     * @returns command's return value.
     */
    execute(cmd) {
        return this.commands[cmd] && this.commands[cmd].func.apply(this, [].slice.call(arguments, 1));
    }
    /**
     * get help usage for the command.
     * @param {String} cmd 
     * @returns usage of the command.
     */
    help(cmd) {
        return this.commands[cmd] && this.commands[cmd].help();
    }
    /**
     * Spam timer for a command.
     * @param {String} cmd
     * @returns time in ms.
     */
    timer(cmd) {
        return this.commands[cmd] && this.commands[cmd].timer() * 1000;
    }

}

module.exports = {
    Commands,
    prefix,
    errors,
    getRandomWaitMsg
}