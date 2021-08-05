const { fetchBase64, fetchHead, MAX_SIZE_ALLOWED } = require('../util/fetcher')
const { getFileSize } = require('./converter')
const reddit = require('./reddit');

const subreddits = reddit.subreddits;

/**
 * Create custom meme
 * @param  {String} imageUrl URL of the background image.
 * @param  {String} topText Text on top.
 * @param  {String} bottomText Text on bottom.
 */
const custom = (imageUrl, top, bottom) => new Promise((resolve, reject) => {
    topText = top.trim().replace(/\s/g, '_').replace(/\?/g, '~q').replace(/\%/g, '~p').replace(/\#/g, '~h').replace(/\//g, '~s')
    bottomText = bottom.trim().replace(/\s/g, '_').replace(/\?/g, '~q').replace(/\%/g, '~p').replace(/\#/g, '~h').replace(/\//g, '~s')
    fetchBase64(`https://api.memegen.link/images/custom/${topText}/${bottomText}.png?background=${imageUrl}`, 'image/png')
        .then((result) => resolve(result))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})

/**
 * Get a post from a random subreddit
 *
 * @returns {Promise} Promise of {type, title, url}
 * @returns {Promise} Promise of {type, title, path} if type === 'video'
 */
const randomRedditPost = () => new Promise(async (resolve, reject) => {
    reddit.randomPost().then(res => {
        switch (res.type) {
            case 'video':
                if (getFileSize(res.path) > MAX_SIZE_ALLOWED) return resolve(randomRedditPost());
                break;
            case 'image/gif':
                if (fetchHead(res.url) === 'CONTENT_TOO_LARGE') return resolve(randomRedditPost());
                break;
            // not yet supported...
            case 'gfycat':
            case undefined:
                return resolve(randomRedditPost());
            default:
                break;
        }
        resolve(res);
    }).catch(err => {
        console.error(err)
        reject(err);
    })

});
/**
 * Get a post from a specific subreddit
 *
 * @returns {Promise} Promise of {type, title, url}
 * @returns {Promise} Promise of {type, title, path} if type === 'video'
 */
const subRedditPost = (sub) => new Promise(async (resolve, reject) => {
    reddit.postFromSub(sub).then(res => {
        switch (res.type) {
            case 'video':
                if (getFileSize(res.path) > MAX_SIZE_ALLOWED) return resolve(subRedditPost(sub));
                break;
            case 'image/gif':
                if (fetchHead(res.url) === 'CONTENT_TOO_LARGE') return resolve(subRedditPost(sub));
                break;
            // not yet supported...
            case 'gfycat':
                return resolve(subRedditPost(sub));
            case undefined:
                throw 'NO_MEDIA';
            default:
                break;
        }
        resolve(res);
    }).catch(err => {
        reject(err);
    })
})
/**
 * Get a meme/image from a random subreddit
 *
 * @return  {Promise} Return a random image post. {title, url}
 */
const randomRedditImg = () => reddit.randomImg();
/**
 * Get a meme/image from a specific subreddit
 *
 * @return  {Promise} Return an image post. {title, url}
 */
const subRedditImg = (sub) => reddit.imgFromSub(sub);

module.exports = {
    randomRedditImg,
    randomRedditPost,
    subRedditImg,
    subRedditPost,
    custom,
    subreddits
}
