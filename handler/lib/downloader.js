const { promisify } = require('util')
const { instagram, twitter } = require('video-url-link');

const igGetInfo = promisify(instagram.getInfo);
const twtGetInfo = promisify(twitter.getInfo);


/**
 * Get Instagram Metadata using video-url-link
 *
 * @param  {String} url The instagram URL.
 */
const insta = (url) => new Promise((resolve, reject) => {
    const uri = url.replace(/\?.*$/g, '')
    igGetInfo(uri, {})
        // return the variants list.
        .then((result) => resolve(result['list']))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})

/**
 * Get Twitter Metadata using video-url-link
 *
 * @param  {String} url The twitter URL.
 */
const tweet = (url) => new Promise((resolve, reject) => {
    twtGetInfo(url, {})
        // return the variants list.
        .then((content) => resolve(content['variants']))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})



module.exports = {
    insta,
    tweet
}
