const { fetcher } = require('.');
const { Nikud } = require('../util/config.json')
const options = Nikud.requestOptions

const nikud = (text) => new Promise((resolve, reject) => {
    console.log(`Getting nikud for ${text}`)
    const body = {
        task: "nakdan",
        data: text,
        addmorph: true,
        keepqq: false,
        matchpartial: true,
        nodageshdefmem: false,
        patachma: false,
        keepmetagim: true,
        genre: "modern"
    }
    options.body = JSON.stringify(body)
    fetcher.fetchJson(Nikud.url, options)
        .then(res => {
            const words = [];
            res.forEach(word => {
                if (!!word.options.length) words.push(word.options[0][0].replace('|', ''))
                else words.push(word.word)
            })
            resolve(words.join(''))
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
})

module.exports = { nikud }