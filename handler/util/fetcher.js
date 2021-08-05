const fetch = require('node-fetch');
const fs = require('fs');
const AbortController = require('abort-controller');
const MAX_SIZE_ALLOWED = 47185920;

function getRandomFileName() {
    var timestamp = new Date().toISOString().replace(/[-:.Z]/g, "");
    var random = ("" + Math.random()).substring(2, 6);
    var random_number = timestamp + random;
    return random_number;
}


/**
 *Fetch Json from Url
 *
 *@param {String} url
 *@param {Object} options
 */
const fetchJson = (url, options) =>
    new Promise((resolve, reject) =>
        fetch(url, options)
            .then(response => response.json())
            .then(json => resolve(json))
            .catch(err => {
                console.error(err)
                reject(err)
            })
    )
/**
 * Check if the file located at the url is too large to handle by trying to get the content-length from the header.
 * @param {*} url url of file
 * @returns CONTENT_TOO_LARGE if above MAX_SIZE_ALLOWED, OK if below.
 */
const checkSize = (url) => new Promise((resolve, reject) => {
    fetch(url, { method: 'HEAD' })
        .then(response => {
            // return error if more than MAX_SIZE_ALLOWED MB
            if (response.headers.get('content-length') > MAX_SIZE_ALLOWED) return resolve('CONTENT_TOO_LARGE');
            else return resolve('OK');
        }).catch(err => {
            console.error(err)
            reject(err);
        })
})

/**
 * Fetch Text from Url
 *
 * @param {String} url
 * @param {Object} options
 */
const fetchText = (url, options) => new Promise((resolve, reject) => {
    fetch(url, options)
        .then(response => response.text())
        .then(text => resolve(text))
        .catch(err => {
            console.error(err)
            reject(err)
        })
})


/**
 * Fetch base64 from url
 * @param {String} url
 */
const fetchBase64 = (url, mimetype) => {
    return new Promise((resolve, reject) => {
        // console.log('Get base64 from:', url)
        return fetch(url)
            .then((res) => {
                const _mimetype = mimetype || res.headers.get('content-type')
                res.buffer()
                    .then((result) => resolve(`data:${_mimetype};base64,` + result.toString('base64')))
            })
            .catch((err) => {
                console.error(err)
                reject(err)
            })
    })
}

/**
 * use fetch function with a timeout so if it's stuck we can can abort it.
 * @param {String} url The URL trying to fetch.
 * @param {JSON} requestOptions the options for fetch.
 * @param {Number} timeout the amount of time to wait before timeout.
 * @returns the response from fetch
 */
const fetchWithTimeout = async (url, requestOptions, timeout) => {
    const controller = new AbortController();
    // add a timeout of 1 second for fetch
    const id = setTimeout(() => controller.abort(), timeout);
    // add signal object for requestOptions
    requestOptions.signal = controller.signal

    const response = await fetch(url, requestOptions);
    clearTimeout(id);

    return response;
}


/**
 * 
 * @param {*} url URL of file.
 * @param {*} extension extension of file.
 * @returns a Promise which holds {status, filePath}
 */
const fetchToFile = (url, extension) => new Promise((resolve, reject) => {
    const fileName = getRandomFileName();
    const filePath = `./handler/tmp/${fileName}.${extension}`;
    fetch(url).then(res => {
        if (res.status === 200) {

            res.body.pipe(fs.createWriteStream(filePath))
                .on('error', () => reject('error'))
                .on('finish', () => resolve({ status: res.status, filePath: filePath }))
        }
        else {
            resolve({ status: res.status, filePath: null });
        }
    }).catch(err => {
        console.error(err);
        reject(err);
    });
})

module.exports = {
    fetchJson,
    fetchText,
    fetchBase64,
    fetchWithTimeout,
    checkSize,
    fetchToFile,
    MAX_SIZE_ALLOWED
}
