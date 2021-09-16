const { fetchJson } = require("../util/fetcher");
const { isInt } = require("../util/utilities");

/* Urban Dictionary API:
http://api.urbandictionary.com/v0/autocomplete-extra?term=word
http://api.urbandictionary.com/v0/autocomplete?term=word
http://api.urbandictionary.com/v0/define?defid=217456
http://api.urbandictionary.com/v0/define?term=test
http://api.urbandictionary.com/v0/random
http://api.urbandictionary.com/v0/words_of_the_day
*/


/**
 * Get the top result on Urban Dictionary by best rated one.
 * @param {String} term the word you're looking for.
 * @returns Object of {word, definition, example}
 */
const topResult = (term) => new Promise((resolve, reject) => {
    console.log(`looking for ${term} on top results of Urban Dictionary`);

    fetchJson(encodeURI(`https://api.urbandictionary.com/v0/define?term=${term}`))
        .then(json => {

            if (json.list.length === 0) return resolve('');

            let thumbs = -1;
            let bestDef;
            // find best definition by votes.
            json.list.forEach(def => {
                if (def.thumbs_up > thumbs) {
                    thumbs = def.thumbs_up;
                    bestDef = def;
                }
            });
            resolve({ word: bestDef.word, definition: bestDef.definition.replace(/[\[\]\r]/g, ''), example: bestDef.example.replace(/[\[\]\r]/g, '') })
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
})
/**
 * Get a random result from Urban Dictionary.
 * @param {String} term the word you're looking for.
 * @returns Object of {word, definition, example}
 */
const random = () => new Promise((resolve, reject) => {
    console.log(`looking for a random result on Urban Dictionary`);

    fetchJson(`https://api.urbandictionary.com/v0/random`)
        .then(json => {
            let rand = json.list[Math.floor(json.list.length * Math.random())]
            resolve({ word: rand.word, definition: rand.definition.replace(/[\[\]\r]/g, ''), example: rand.example.replace(/[\[\]\r]/g, '') })
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
})

/**
 * Get a word of the day result from Urban Dictionary.
 * Can get last 10 days.
 * @param {String} term the word you're looking for.
 * @returns Object of {word, definition, example, date}
 */
const wordOfTheDay = (day) => new Promise((resolve, reject) => {
    console.log(`looking for a word from word of the day on Urban Dictionary, from ${day} days ago.`);
    if (!day || !isInt(day) || 0 > day || day > 9)
        day = 0;

    fetchJson(`https://api.urbandictionary.com/v0/words_of_the_day`)
        .then(json => {
            let word = json.list[day]
            resolve({ word: word.word, definition: word.definition.replace(/[\[\]\r]/g, ''), example: word.example.replace(/[\[\]\r]/g, ''), date: word.date })
        })
        .catch(err => {
            console.error(err + '\n\n' + term);
            reject(err);
        })
})

module.exports = {
    topResult,
    random,
    wordOfTheDay
}