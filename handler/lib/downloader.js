const { promisify } = require('util')
const { twitter, instagram } = require('video-url-link');
const { fetchHead } = require('./fetcher')

const igGetInfo = promisify(instagram.getInfo);
const twtGetInfo = promisify(twitter.getInfo);


/**
 * Get Instagram Metadata using video-url-link
 *
 * @param  {String} url The Instagram URL.
 */
const insta = (url) => new Promise((resolve, reject) => {
    const uri = url.replace(/\?.*$/g, '')
    igGetInfo(uri, {})
        .then((result) => {
            const promises = [];
            // Then go over the returned list of videos/images.
            result['list'].forEach(item => {
                // If there is a video key in the JSON, get the video.
                if (item['video'] !== undefined) {
                    if (fetchHead(item['video']) !== 'CONTENT-TOO-LARGE')
                        promises.push(item['video']);
                }
                // Else if the requested item didn't have a video in it.
                else
                    promises.push(item['image'])
            })

            resolve(Promise.all(promises));
        })
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
        .then((content) => content['variants'])
        .then((data) => {
            let link;
            let bitrate = 0;
            // Then go over the returned list of videos and find the max bitrate video.
            data.forEach(item => {
                if (item['bitrate'] !== undefined && bitrate < item['bitrate']) {
                    bitrate = item['bitrate'];
                    link = item['url'];
                }
            });
            resolve(link);
        })
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})



module.exports = {
    insta,
    tweet
}
