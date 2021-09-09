const { promisify } = require('util');
const path = require('path');
const { getInstaInfo, getTwitterInfo, getFacebookInfo } = require('../util/video-url-link');
const youtubedl = require('youtube-dl-exec')
const ytdl = require('ytdl-core');
const { getVideoMeta } = require('tiktok-scraper');
const { checkSize, fetchToFile, getRandomFileName, MAX_SIZE_ALLOWED } = require('../util/fetcher');
const converter = require('../util/converter');

const igGetInfo = promisify(getInstaInfo);
const twtGetInfo = promisify(getTwitterInfo);

/**
 * Download a video or audio only using youtube-dl.
 * @param {String} url 
 * @param {Boolean} audio 
 * @returns output path of the video.
 */
const video = (url, audio) => new Promise((resolve, reject) => {

    console.log('looking for video content on ' + url);

    const fileName = getRandomFileName();
    const fullPath = path.join(__dirname, '../tmp/');
    const options = { 'max-filesize': `${MAX_SIZE_ALLOWED}`, 'no-playlist': '', o: `${fullPath + fileName}.%(ext)s`, f: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" };

    if (audio) options["x"] = ''; options["audio-format"] = "mp3"; options["ffmpeg-location"] = converter.ffmpegPath

    youtubedl(url, options)
        .then(res => {
            if (res.includes('Aborting')) {
                console.error(res);
                return reject('CONTENT_TOO_LARGE');
            }

            const outputPath = res.match(/(?<=Merging formats into ").*?(?=")|(?<=Destination: ).*?(?=\n)/g).pop();
            const fileSize = converter.getFileSize(outputPath);
            if (fileSize > MAX_SIZE_ALLOWED) {
                console.error(res);
                converter.unlinkOutput(outputPath);
                reject('CONTENT_TOO_LARGE');
            }
            else
                resolve(outputPath);

        })
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})

/**
 * Get Instagram Metadata using forked video-url-link
 *
 * @param  {String} url The Instagram URL.
 */
const insta = (url) => new Promise((resolve, reject) => {
    console.log('looking for instagram content on ' + url);
    const uri = url.replace(/\?.*$/g, '')
    igGetInfo(uri, {})
        .then(async (result) => {
            const promises = [];
            const linkArr = [];
            // Then go over the returned list of videos/images.
            result.list.forEach(item => {
                // If there is a video key in the JSON, get the video.
                if (item.video) {
                    promises.push(checkSize(item.video)
                        .then(res => { if (res === 'OK') linkArr.push(item.video) }))
                }
                // Else if the requested item didn't have a video in it.
                else
                    linkArr.push(item.image)
            })
            await Promise.all(promises)

            if (linkArr.length)
                resolve(linkArr);
            else
                reject('EMPTY')
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
        .then(content => content.variants)
        .then(data => {
            let link;
            let bitrate = 0;
            // Then go over the returned list of videos and find the max bitrate video.
            data.forEach(item => {
                if (item.bitrate !== undefined && bitrate < item.bitrate) {
                    bitrate = item.bitrate;
                    link = item.url;
                }
            });

            checkSize(link).then(res => (res === 'OK') ? resolve(link) : resolve('CONTENT_TOO_LARGE'))

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
        .then(result => {
            let collector = result.collector[0];
            let info = { options: options, title: collector.text };
            if (collector.videoUrlNoWaterMark) {
                info.link = collector.videoUrlNoWaterMark;
            } else {
                info.link = collector.videoUrl;
            }

            checkSize(info.link).then(res => (res === 'OK') ? resolve(info) : resolve('CONTENT_TOO_LARGE'));

        })
        .catch((err) => {
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
    console.log('looking for a youtube video on ' + url + ' to mp3');
    ytdl.getInfo(url).then(response => {
        let link = response.formats.filter(info => info.hasVideo === false && info.contentLength < MAX_SIZE_ALLOWED)[0].url;

        console.log(`Title: ${response.videoDetails.title} Url: ${link}`)

        if (link === null) throw 'LINK_NOT_FOUND';

        fetchToFile(link, 'mp3').then(res => {

            converter.toMP3(res.filePath).then(output => resolve({ path: output, title: response.videoDetails.title }))
        })
    }).catch(err => {
        console.error(err);
        reject(err);
    })
})


const facebook = (url) => new Promise(async (resolve, reject) => {
    console.log('looking for a facebook video on ' + url);
    getFacebookInfo(url).then(async result => {
        let link;
        console.log(`Title: ${result.title}\nHD: ${result.download.hd}\nSD: ${result.download.sd}`)

        if (result.download.hd && (await checkSize(result.download.hd) === 'OK'))
            link = result.download.hd;
        else if (result.download.sd && (await checkSize(result.download.sd) === 'OK'))
            link = result.download.sd;
        else
            reject('');

        resolve({ link: link, title: result.title });
    }).catch(err => {
        console.error(err);
        reject(err);
    })
})

module.exports = {
    insta,
    tweet,
    tiktok,
    facebook,
    youtube,
    youtubeMp3,
    video
}
