const { fetchText } = require("../util/fetcher")

const randomStory = () => new Promise((resolve, reject) => {
    fetchText('http://www.plotshot.com/index.php?shot-search=tags&shot-sort=date-posted-desc')
        .then(text => text.match(/<blockquote>\n<p.+?>\n(.+)<\/p><\/blockquote>/))
        .then(match => resolve(match[1]))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})


module.exports = {
    randomStory
}