const { fetchText, fetchJson } = require("../util/fetcher")
// emojis from https://unicode.org/Public/emoji/14.0/emoji-test.txt
const EMOJIS = shuffle(require('../util/emoji-compact.json'))

/**
 * Fisher–Yates shuffle -> https://bost.ocks.org/mike/shuffle/
 * @param {*} array 
 * @returns 
 */
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

const randomStory = () => new Promise((resolve, reject) => {
    fetchText('http://www.plotshot.com/index.php?shot-search=tags&shot-sort=date-posted-desc')
        .then(text => text.match(/<blockquote>\n<p.+?>\n(.+)<\/p><\/blockquote>/))
        .then(match => resolve(match[1].replace('Our hero, ', '').replace(/ +\./g, '.').replace(/ ,/g, ',').replace(/ +/g, ' ')))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})

const randomEmoji = (n) => new Promise((resolve, reject) => {

    length = EMOJIS.length;
    let text = ``;
    for (let i = 0; i < n; i++) {
        text += EMOJIS[Math.floor(Math.random() * length)]
    }
    resolve(text)
})


module.exports = {
    randomStory,
    randomEmoji
}