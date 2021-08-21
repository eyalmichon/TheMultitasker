/**
    * Checks if the given URL is valid.
    * @param url The URL we are checking for validity.
    * @returns true if valid, otherwise false.
    */
function isValidURL(url) {
    var pattern = /^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i
    return pattern.test(url);
}

const parse = (args) => {

    let options = {};

    args.forEach(arg => {
        if (arg[0] === '-') {
            if (arg.includes('url') || arg.length < 2) return;
            if (arg[1] === '-')
                options[arg.slice(2)] = true;
            else
                options[arg.slice(1)] = true;
        }
        if (isValidURL(arg))
            options.url = arg
    });
    return options
}


module.exports = {
    parse
}