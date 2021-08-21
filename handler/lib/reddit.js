const { fetchJson, fetchToFile } = require('../util/fetcher')
const { mergeVideoAudio, shrinkVideoSize } = require('../util/converter')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// list of subreddits to get a random subreddit from.
const subreddits = ['dankmemes', 'facepalm', 'funny', 'cursedcomments', 'blursedimages', 'bikinibottomtwitter'
    , 'hmmm', 'memeeconomy', 'memes', 'ani_bm', 'okbuddyretard', '2meirl4meirl', 'PrequelMemes', 'me_irl'
    , 'forbiddensnacks', 'nextfuckinglevel', 'oddlysatisfying', 'shittylifehacks', 'therewasanattempt', 'tihi', 'unexpected'
    , 'watchpeopledieinside', 'whatcouldgowrong']

/**
 * Get a random subreddits from the list of subreddits.
 * @returns Random subreddit.
 */
function getRandomSub() {
    return subreddits[Math.floor(Math.random() * subreddits.length)];
}
/**
 * Helper function to get the post info which is the JSON file of the post.
 * @param {String} link link to the subreddit, example: https://api.reddit.com/r/Unexpected/top.json?limit=100
 * @returns {Promise} Promise of the json from reddit's API.
 */
function getPostInfo(link) {
    return new Promise((resolve, reject) => {

        fetchJson(link)
            .then(json => {
                if (json.error || json.data.children.length === 0) throw 'SUB_ERROR';

                // Filter out sticked posts if they appear, and all posts that should have media included.
                let postArray = json.data.children.filter(post => !post.data.stickied
                    && (post.data.post_hint || (post.data.url.endsWith('jpg') || post.data.url.endsWith('png')) || (post.data.crosspost_parent_list && (post.data.crosspost_parent_list[0].url.endsWith('jpg') || post.data.crosspost_parent_list[0].url.endsWith('png')))));

                if (postArray.length === 0) throw 'NO_MEDIA';

                // if more than half of the posts are over_18 I guess it's a porn subreddit. REMOVE THIS IF YOU WANT IT...
                if (postArray.filter(post => post.data.over_18).length >= postArray.length / 2) throw 'PORN_ERROR';

                // Get a random post from the array.
                let postInfo = postArray[Math.floor(Math.random() * postArray.length)].data;
                // In case there is a post inside a post inside a post...
                while (postInfo.crosspost_parent_list && postInfo.crosspost_parent_list.length)
                    postInfo = postInfo.crosspost_parent_list[0];

                resolve(postInfo);
            })
            .catch(err => {
                reject(err);
            });
    })
}

/**
 * Get a post from a given subreddit.
 * @returns {Promise} Promise of {type, title, url}
 * @returns {Promise} Promise of {type, title, path} if type === 'video'
 */
const getPost = (sub) => new Promise((resolve, reject) => {
    console.log('looking for posts on ' + sub)
    let link = `https://api.reddit.com/r/${sub}/top.json?limit=100`;
    const promises = [];
    getPostInfo(link).then(postInfo => {

        console.log(`Post found: Title: ${postInfo.title} Url: ${postInfo.url} Post Link: https://reddit.com${postInfo.permalink}`)
        switch (postInfo.post_hint) {
            // if it's a video hosted on reddit's servers
            case 'hosted:video':

                let url = postInfo.secure_media.reddit_video.fallback_url

                // fetch video.
                promises.push(fetchToFile(url, 'mp4'))
                // try to fetch audio for video.
                promises.push(fetchToFile(url.replace(/(?<=DASH_).*/g, 'audio.mp4'), 'mp4'))
                Promise.all(promises)
                    .then(paths => {
                        // if audio was found.
                        if (paths[1].status === 200) {
                            mergeVideoAudio(paths[0].filePath, paths[1].filePath)
                                .then(outputPath => resolve({ type: 'video', title: postInfo.title, path: outputPath }))
                        }
                        // no audio.
                        else {
                            shrinkVideoSize(paths[0].filePath)
                                .then(outputPath => resolve({ type: 'video', title: postInfo.title, path: outputPath }))
                        }

                    })
                break;
            // if it's a gif or an image hosted on reddit's servers.
            case 'image':
                resolve({ type: 'image/gif', title: postInfo.title, url: postInfo.url })
                break;
            // if it's a gfycat/imgur/other link.
            case 'link':
                if (['i.imgur.com', 'imgur.com'].includes(postInfo.domain) && postInfo.preview.reddit_video_preview) {
                    resolve({ type: 'image/gif', title: postInfo.title, url: postInfo.preview.reddit_video_preview.fallback_url })
                }
                else if ('gfycat.com' === postInfo.domain)
                    resolve({ type: 'gfycat', title: postInfo.title, url: postInfo.url })
                else
                    resolve({ type: undefined, title: postInfo.title, url: postInfo.url })
                break;
            case 'rich:video':
                // if it's a youtube link.
                if (['youtube.com', 'youtu.be', 'm.youtube.com'].includes(postInfo.domain))
                    resolve({ type: 'youtube', title: postInfo.title, url: postInfo.url })
                else
                    resolve({ type: undefined, title: postInfo.title, url: postInfo.url })
                break;
            default:
                if (postInfo.url.endsWith('jpg') || postInfo.url.endsWith('png'))
                    resolve({ type: 'image/gif', title: postInfo.title, url: postInfo.url })
                else
                    resolve({ type: undefined, title: postInfo.title, url: postInfo.url })
                break;
        }
    })
        .catch(err => {
            reject(err);
        });
})
/**
 * Helper function to get the image post info which is the JSON file of the image post.
 * @param {String} link link to the subreddit, example: https://api.reddit.com/r/Unexpected/top.json?limit=100
 * @returns {Promise} Promise of the json from reddit's API.
 */
function getImagePostInfo(link) {
    return new Promise((resolve, reject) => {

        fetchJson(link)
            .then(json => {
                if (json.error || json.data.children.length === 0) throw 'SUB_ERROR';

                let postArray = json.data.children.filter(post => !post.data.stickied
                    && ((post.data.url.endsWith('jpg') || post.data.url.endsWith('png')) || (post.data.crosspost_parent_list && (post.data.crosspost_parent_list[0].url.endsWith('jpg') || post.data.crosspost_parent_list[0].url.endsWith('png')))));

                if (postArray.length === 0) throw 'NO_MEDIA';

                // if more than half of the posts are over_18 I guess it's a porn subreddit. REMOVE THIS IF YOU WANT IT...
                if (postArray.filter(post => post.data.over_18).length >= postArray.length / 2) throw 'PORN_ERROR';

                let postInfo = postArray[Math.floor(Math.random() * postArray.length)].data;

                resolve(postInfo);
            })
            .catch(err => {
                reject(err);
            });
    })
}
/**
 * Get an image post from a given subreddit.
 * @returns {Promise} Promise of {title, url}
 */
const getImg = (sub) => new Promise((resolve, reject) => {
    console.log('looking for image posts on ' + sub)
    // Get 100 posts from top section from sub.
    let link = `https://api.reddit.com/r/${sub}/top.json?limit=100`;
    getImagePostInfo(link)
        .then(postInfo => {
            console.log(`Post found: Title: ${postInfo.title} Url: ${postInfo.url} Post Link: https://reddit.com${postInfo.permalink}`)

            resolve({ title: postInfo.title, url: postInfo.url });
        })
        .catch(err => {
            reject(err);
        });
})

/**
 * Get a random image post from reddit.
 * If no image found, search again recursively.
 * @returns {Promise} Promise of {title, url}
 */
const randomImg = () => getImg(getRandomSub()).catch(err => {
    if (err === 'NO_MEDIA') return randomImg(getRandomSub())
    else return err;
});
/**
 * Get an image post from a given subreddit.
 * @returns {Promise} Promise of {title, url}
 */
const imgFromSub = (sub) => getImg(sub);


/**
 * Get a random post from reddit.
 * @returns {Promise} Promise of {type, title, url}
 */
const randomPost = () => getPost(getRandomSub());

/**
 * Get a post from a specific subreddit.
 * @returns {Promise} Promise of {type, title, url}
 */
const postFromSub = (sub) => getPost(sub);

module.exports = {
    randomPost,
    randomImg,
    imgFromSub,
    postFromSub,
    subreddits
}