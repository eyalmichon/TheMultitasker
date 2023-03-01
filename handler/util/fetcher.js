const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');
const AbortController = require('abort-controller');
const secrets = require('../util/secrets.json');
const { getFileTypeFromBuffer } = require('./utilities');

// 500 MB
const MAX_SIZE_ALLOWED = 524288000;

const getRandomFileName = () => {
    var timestamp = new Date().toISOString().replace(/[-:.Z]/g, "");
    var random = ("" + Math.random()).substring(2, 6);
    var random_number = timestamp + random;
    return random_number;
}

/**
    * Checks if the given URL is valid.
    * @param url The URL we are checking for validity.
    * @returns true if valid, otherwise false.
    */
function isValidURL(url) {
    var pattern = /^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i
    return pattern.test(url);
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
 * @param {*} maxSize max size allowed.
 * @returns CONTENT_TOO_LARGE if above MAX_SIZE_ALLOWED, OK if below.
 */
const checkSize = (url, maxSize = MAX_SIZE_ALLOWED) => new Promise((resolve, reject) => {
    fetch(url, { method: 'HEAD', timeout: 3000 })
        .then(response => {
            // return error if more than MAX_SIZE_ALLOWED MB
            if (response.headers.get('content-length') > maxSize) return resolve('CONTENT_TOO_LARGE');
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
const fetchBase64 = (url) => new Promise((resolve, reject) => {
    return fetch(url)
        .then((res) => res.buffer())
        .then((buffer) => resolve(buffer.toString('base64')))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})
/**
 * Fetch buffer from url
 * @param {String} url
 */
const fetchBuffer = (url) => new Promise((resolve, reject) => {
    return fetch(url)
        .then((res) => res.buffer())
        .then((buffer) => resolve(buffer))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})


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
const fetchToFile = (url, extension, options = {}) => new Promise((resolve, reject) => {
    const fileName = getRandomFileName();
    const filePath = `./handler/tmp/${fileName}.${extension}`;
    fetch(url, options).then(res => {
        if (res.status === 200) {

            res.body.pipe(fs.createWriteStream(filePath))
                .on('error', () => reject('error'))
                .on('finish', () => resolve({ status: res.status, filePath: filePath }))
        }
        else {
            resolve({ status: res.status, filePath: null });
        }
    })
        .catch(err => {
            console.error(err);
            reject(err);
        });
})
/**
 * Upload image to Imgur
 * * Supported mimetype:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`s
 * @param {Buffer} buffer Image Buffer
 */
const uploadImage = (buffer) => new Promise((resolve, reject) => {
    ext = getFileTypeFromBuffer(buffer)
    if (![`jpeg`, `jpg`, `png`].includes(ext)) throw 'UNSUPPORTED_FILETYPE';

    let form = new FormData();
    form.append('image', buffer, 'blob')
    fetch('https://api.imgur.com/3/image/', {
        method: "post",
        headers: {
            Authorization: `Client-ID ${secrets.Imgur.ID}`
        },
        body: form
    })
        .then(res => res.json())
        .then(json => {
            if (json.error) throw json.error
            resolve(json.data.link);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        });
})

/**
 * Upload image to transfer.sh
 * 
 * @param {Buffer} buffer Image Buffer
 * @returns uploaded file's link.
 */
const uploadFile = (buffer) => new Promise((resolve, reject) => {
    const { ext } = getFileTypeFromBuffer(buffer)
    fetch(`http://transfer.sh/${getRandomFileName()}.${ext}`, {
        method: "put",
        body: buffer
    })
        .then(res => res.text())
        .then(res => resolve(res))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})

const fetchFileType = (buffer) => {
    try { return getFileTypeFromBuffer(buffer) }
    catch { return null }
}


const fetchImageBuffer = (url) => new Promise(async (resolve, reject) => {
    if (isValidURL(url)) {
        const size = await checkSize(options.url)
        if (size === 'CONTENT_TOO_LARGE') reject(errors.CONTENT_TOO_LARGE)
        return fetchBuffer(url)
            .then(buffer => resolve(buffer))
            .catch(err => {
                console.error(err)
                reject(err)
            })
    }
    else {
        return reject('INVALID_URL')
    }
})



module.exports = {
    fetchJson,
    fetchText,
    fetchBase64,
    fetchBuffer,
    fetchWithTimeout,
    checkSize,
    fetchToFile,
    fetchImageBuffer,
    getRandomFileName,
    uploadImage,
    uploadFile,
    fetchFileType,
    isValidURL,
    MAX_SIZE_ALLOWED
}
