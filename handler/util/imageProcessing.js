const { fetcher } = require('../lib/index');

removeBG = (mediaData) => new Promise((resolve, reject) => {
    fetcher.uploadImage(mediaData)
        .then(imgLink => fetcher.fetchBase64('https://bg.experte.de/?url=' + imgLink))
        .then(finalImg => resolve(finalImg))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})

module.exports = {
    removeBG
}