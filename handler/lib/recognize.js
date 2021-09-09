const { fetcher } = require('.');
const { ACRCloud } = require('../util/secrets.json');
var crypto = require('crypto');
const FormData = require('form-data');


// helper function for music.
function buildStringToSign(method, uri, accessKey, dataType, signatureVersion, timestamp) {
    return [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
}

// helper function for music.
function sign(signString, accessSecret) {
    return crypto.createHmac('sha1', accessSecret)
        .update(Buffer.from(signString, 'utf-8'))
        .digest().toString('base64');
}

/**
 * This module can recognize music using ACRCloud by most of audio/video files. 
 * Audio: mp3, wav, m4a, flac, aac, amr, ape, ogg ...
 * Video: mp4, mkv, wmv, flv, ts, avi ...
 * @param {*} data binary data of image/video.
 * @returns Array of results.
 */
const music = (data) => new Promise(async (resolve, reject) => {
    console.log(`trying to recognize a song...`)

    // options from secrets file.
    // {
    //  host: string;
    //  endpoint: string;
    //  signature_version: string;
    //  data_type: string;
    //  secure: boolean;
    //  access_key: string;
    //  access_secret: string;
    //}
    const options = ACRCloud[Math.floor(Math.random() * ACRCloud.length)];

    let current_data = new Date();
    let timestamp = current_data.getTime() / 1000;

    let stringToSign = buildStringToSign('POST',
        options.endpoint,
        options.access_key,
        options.data_type,
        options.signature_version,
        timestamp);

    let signature = sign(stringToSign, options.access_secret);

    let form = new FormData();
    form.append('sample', data);
    form.append('sample_bytes', data.length);
    form.append('access_key', options.access_key);
    form.append('data_type', options.data_type);
    form.append('signature_version', options.signature_version);
    form.append('signature', signature);
    form.append('timestamp', timestamp);

    await fetcher.fetchJson("http://" + options.host + options.endpoint, { method: 'POST', body: form })
        .then(json => {
            if (json.status.code) throw 'NO_RESULT';

            const musicData = json.metadata.music;

            console.log(`Found a match: ${musicData[0].title}`)

            const output = [];
            musicData.forEach(music => {
                let text = [];

                if (!!music.title) text.push(`*Title:* ${music.title}`)
                if (!!music.artists[0] && music.artists[0].name) text.push(`*Artists:* ${music.artists[0].name}`)
                if (!!music.album && music.album.name) text.push(`*Album:* ${music.album.name}`)
                if (!!music.genres) text.push(`*Genre:* ${music.genres[0].name}`)
                if (!!music.external_metadata) {
                    if (!!music.external_metadata.youtube) text.push(`*YouTube:* https://www.youtube.com/watch?v=${music.external_metadata.youtube.vid}`)
                    if (!!music.external_metadata.spotify) text.push(`*Spotify:* https://open.spotify.com/track/${music.external_metadata.spotify.track.id}`)
                    if (!!music.external_metadata.deezer) text.push(`*Deezer:* https://www.deezer.com/us/track/${music.external_metadata.deezer.track.id}`)
                }
                if (!!music.release_date) text.push(`*Release Date:* ${music.release_date}`)
                text.push(`*Accuracy: ${music.score}%*`)

                output.push(text.join('\n'))
            })
            resolve(output)
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
})


module.exports = { music }