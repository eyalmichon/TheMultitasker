const { fetchJson, fetchBase64 } = require('./fetcher')

/**
 * Get meme from a random subreddit
 *
 * @param  {String} subreddit
 * @return  {Promise} Return meme from dankmemes, wholesomeanimemes, wholesomememes, MemeEconomy, memes, terriblefacebookmemes, historymemes
 */
const random = () => new Promise((resolve, reject) => {
    const subreddits = ['dankmemes', 'surrealmemes', 'whitepeopletwitter', 'facepalm', 'funny'
        , 'cursedcomments', 'blursedimages', 'bikinibottomtwitter', 'hmmm', 'memeeconomy', 'nukedmemes', 'nextfuckinglevel', 'memes', 'ani_bm'
        , 'okbuddyretard', '2meirl4meirl', 'PrequelMemes', 'me_irl']
    const randSub = subreddits[Math.random() * subreddits.length | 0]
    console.log('looking for memes on ' + randSub)
    fetchJson('https://meme-api.herokuapp.com/gimme/' + randSub)
        .then(async (result) => {
            resolve({ image: await fetchBase64(result.url), title: result.title })
        })
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})

/**
 * Create custom meme
 * @param  {String} imageUrl URL of the background image.
 * @param  {String} topText Text on top.
 * @param  {String} bottomText Text on bottom.
 */
const custom = async (imageUrl, top, bottom) => new Promise((resolve, reject) => {
    topText = top.trim().replace(/\s/g, '_').replace(/\?/g, '~q').replace(/\%/g, '~p').replace(/\#/g, '~h').replace(/\//g, '~s')
    bottomText = bottom.trim().replace(/\s/g, '_').replace(/\?/g, '~q').replace(/\%/g, '~p').replace(/\#/g, '~h').replace(/\//g, '~s')
    fetchBase64(`https://api.memegen.link/images/custom/${topText}/${bottomText}.png?background=${imageUrl}`, 'image/png')
        .then((result) => resolve(result))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})

module.exports = {
    random,
    custom
}
