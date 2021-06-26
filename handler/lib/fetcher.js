const fetch = require('node-fetch');
const AbortController = require('abort-controller');
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

const fetchHead = (url) => {
    return fetch(url, { method: 'HEAD' })
        .then(response => {
            // return error if more than 30MB
            if (response.headers.get('content-length') > 31457280) return 'CONTENT-TOO-LARGE';
            else return true;
        }).catch(err=>{
            console.error(err)
            return 'NO-CONTENT-LENGTH';
        })
}
/**
 * Fetch Text from Url
 *
 * @param {String} url
 * @param {Object} options
 */
const fetchText = (url, options) => {
    return new Promise((resolve, reject) => {
        return fetch(url, options)
            .then(response => {
                response.text()
            })
            .then(text => resolve(text))
            .catch(err => {
                console.error(err)
                reject(err)
            })
    })
}

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


module.exports = {
    fetchJson,
    fetchText,
    fetchBase64,
    fetchWithTimeout,
    fetchHead
}
