const { promisify } = require('util');
const { getInstaInfo, getTwitterInfo } = require('./util/video-url-link');
const ytdl = require('ytdl-core');
const { getVideoMeta } = require('tiktok-scraper');
const { fetchHead, fetchToFile, MAX_SIZE_ALLOWED } = require('./fetcher');
const { toMP3 } = require('./converter');

const igGetInfo = promisify(getInstaInfo);
const twtGetInfo = promisify(getTwitterInfo);

/**
 * Get Instagram Metadata using forked video-url-link
 *
 * @param  {String} url The Instagram URL.
 */
const insta = (url) => new Promise((resolve, reject) => {
    console.log('looking for instagram content on ' + url)
    const uri = url.replace(/\?.*$/g, '')
    igGetInfo(uri, {})
        .then((result) => {
            const promises = [];
            // Then go over the returned list of videos/images.
            result.list.forEach(item => {
                // If there is a video key in the JSON, get the video.
                if (item.video !== undefined) {
                    if (fetchHead(item.video) !== 'CONTENT_TOO_LARGE')
                        promises.push(item.video);
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
 * Get Twitter Metadata using forked video-url-link
 *
 * @param  {String} url The twitter URL.
 */
const tweet = (url) => new Promise((resolve, reject) => {
    console.log('looking for a twitter video on ' + url)
    twtGetInfo(url, {})
        // return the variants list.
        .then((content) => content['variants'])
        .then((data) => {
            let link;
            let bitrate = 0;
            // Then go over the returned list of videos and find the max bitrate video.
            data.forEach(item => {
                if (item.bitrate !== undefined && bitrate < item.bitrate) {
                    bitrate = item.bitrate;
                    link = item['url'];
                }
            });
            if (fetchHead(link) === 'CONTENT_TOO_LARGE')
                resolve('CONTENT_TOO_LARGE');
            else
                resolve(link);
        })
        .catch((err) => {
            console.error(err);
            reject(err);
        })
});

/**
 * Get Tiktok Metadata
 *
 * @param  {String} url
 */
const tiktok = (url) => new Promise((resolve, reject) => {
    console.log('looking for tiktok video on ' + url)
    const options = {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36",
        "referer": "https://www.tiktok.com/",
        "cookie": "tt_webid_v2=689854141086886123"
    };
    getVideoMeta(url, { noWaterMark: true, hdVideo: true, headers: options })
        .then((result) => {
            let collector = result.collector[0];
            let info = { options: options, title: collector.text };
            if (collector.videoUrlNoWaterMark) {
                info.link = collector.videoUrlNoWaterMark;
            } else {
                info.link = collector.videoUrl;
            }
            resolve(info);
        }).catch((err) => {
            console.error(err);
            reject(err);
        })
})

/**
 * Get Youtube videos download link.
 * @param {URL} url link to youtube video.
 * @returns {Promise} Returns a Promise of {link, title}
 */
const youtube = (url) => new Promise((resolve, reject) => {
    console.log('looking for a youtube video on ' + url)
    ytdl.getInfo(url).then(res => {
        // get link which has audio and smaller than MAX_SIZE_ALLOWED MB in size.
        let link = res.formats.filter(info => info.hasAudio === true && info.hasVideo === true && info.contentLength < MAX_SIZE_ALLOWED)[0].url;
        let title = res.videoDetails.title;
        resolve({ link: link, title: title });
    }).catch(err => {
        console.error(err);
        reject(err);
    })
})
/**
 * Get Youtube videos into mp3.
 * @param {URL} url link to youtube video.
 * @returns {Promise} Returns a Promise of {link, title}
 */
const youtubeMp3 = (url) => new Promise((resolve, reject) => {
    console.log('looking for a youtube video on ' + url + ' to mp3')
    ytdl.getInfo(url).then(response => {
        let link = response.formats.filter(info => info.hasVideo === false && info.contentLength < MAX_SIZE_ALLOWED)[0].url;
        fetchToFile(link, 'mp3').then(res => {

            toMP3(res.filePath).then(output => resolve({ link: output, title: response.videoDetails.title }))
        })
    }).catch(err => {
        console.error(err);
        reject(err);
    })
})


module.exports = {
    insta,
    tweet,
    tiktok,
    youtube,
    youtubeMp3
}
