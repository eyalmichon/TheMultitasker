const { isValidURL } = require("./fetcher");


const parse = (args, getURL = true) => {

    const options = {};
    const joinedText = [];
    let key, value, url;

    args.forEach(arg => {
        value = true;
        if (arg[0] === '-') {
            if (arg.length < 2) return;

            key = arg.slice(1);

            if (key.includes('=')) {
                let index = key.indexOf('=');
                value = key.slice(index + 1, key.length);
                key = key.slice(0, index);
            }

            options[key] = value;
        }
        else if (getURL && isValidURL(arg))
            url = arg;
        else
            joinedText.push(arg)
    });

    options.url = url;
    options.joinedText = joinedText.join(' ');
    return options
}
/**
 * Get all strings between quatation marks into an array and return the array, everything with -flag or without quotes is added to the array.
 * @param {*} args the arguments to parse.
 * @returns {Array} the array of strings and flags.
 */
const parseStrings = (args) => {
    let ogString = args.join(' ').replace(/[‘’]/g, '\'').replace(/[“”״]/g, '\"');
    let strings = [];

    const regex = /"([^"]*)"/;
    let match;
    while ((match = regex.exec(ogString)) !== null) {
        strings.push(match[1]);
        ogString = ogString.replace(match[0], '');
    }
    // split the string with ' ' and add to the array.
    ogString.split(' ').forEach(str => {
        if (str !== '')
            strings.push(str);
    })

    return strings;
}

module.exports = {
    parse,
    parseStrings
}