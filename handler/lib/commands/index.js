const { errors } = require('./errors')
const { prefix } = require('./helper')
const { Admin } = require("./admin");
const { Forwarder } = require("./forwarder");
const { Info } = require("./info");
const { Owner } = require("./owner");
const { Social } = require("./social");
const { Sticker } = require('./sticker');
const { Help } = require('./help');

class Commands {
    // Initialize all commands to the commands object.
    constructor() {
        this.commands = {};
        new Owner(this.commands);
        new Admin(this.commands);
        new Social(this.commands);
        new Forwarder(this.commands);
        new Info(this.commands);
        new Sticker(this.commands);
        // Keep last.
        new Help(this.commands);
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

}

module.exports = {
    Commands,
    prefix,
    errors
}