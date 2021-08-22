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
        else if (isValidURL(arg))
            url = arg;
        else
            joinedText.push(arg)
    });

    options.url = url;
    options.joinedText = joinedText.join(' ');
    return options
}


module.exports = {
    parse
}