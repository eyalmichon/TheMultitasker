// Fork of video-url-link fixing run-time issues.

const { fetchText } = require('./fetcher');
const util = require('util');
const request = require('request').defaults({ jar: true });
var _ = require('lodash');
const AUTHORIZATION = 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';
const API_GUEST = 'https://api.twitter.com/1.1/guest/activate.json';
const API_TIMELINE = 'https://api.twitter.com/2/timeline/conversation/%s.json?tweet_mode=extended'

/**
 * Get twitter ID
 *
 * @param {string} url
 * @return {string}
 */
const getTwitterID = (url) => {
    var regex = /twitter\.com\/[^/]+\/status\/(\d+)/;
    var matches = regex.exec(url);
    return matches && matches[1];
};

/**
 * Get twitter Info
 *
 * @param {string} url
 * @param {Object} options
 * @param {Function(Error, Object)} callback
 */
const getTwitterInfo = (url, options, callback) => {
    if (typeof options === 'function') callback = options, options = {};
    const id = getTwitterID(url);
    if (id) {
        req({
            url: API_GUEST,
            method: 'POST',
        }, options, (error, body) => {
            if (error) {
                callback(error);
            } else {
                let guest_token;
                try {
                    guest_token = JSON.parse(body).guest_token;
                } catch (err) {
                    return callback(new Error(err));
                }
                req({
                    url: util.format(API_TIMELINE, id),
                    method: 'GET',
                    headers: {
                        'x-guest-token': guest_token
                    }
                }, options, (error, body) => {
                    if (error) {
                        callback(error);
                    } else {
                        try {
                            const info = JSON.parse(body);
                            callback(null, {
                                full_text: info['globalObjects']['tweets'][id]['full_text'],
                                variants: info['globalObjects']['tweets'][id]['extended_entities']['media'][0]['video_info']['variants']
                            });
                        } catch (err) {
                            return callback(new Error(err));
                        }
                    }
                });
            }
        });
    } else {
        callback(new Error('Not a twitter URL'));
    }
}

function req(opt, options, callback) {
    opt = _.defaultsDeep({
        headers: {
            'authorization': AUTHORIZATION
        }
    }, opt, options);
    request(opt, (error, response, body) => {
        if (error) {
            callback(error);
        } else {
            if (response.statusCode == 200 && body) {
                callback(null, body);
            } else {
                callback(new Error('Twitter API error'));
            }
        }
    });
}


/**
 * Get instagram Info
 *
 * @param {string} url
 * @param {Object} options
 * @param {Function(Error, Object)} callback
 */
const getInstaInfo = (url, options, callback) => {
    if (typeof options === 'function') callback = options, options = {};
    options = {
        gzip: true,
        method: 'GET',
        timeout: 5000,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
        },
        jar: true
    };
    options.url = url;
    request(options, (error, response, body) => {
        if (error) {
            callback(error);
        } else {
            if (response.statusCode == 200 && body) {
                try {
                    const data = JSON.parse(body.match(/<script type="text\/javascript">window._sharedData = (.*);<\/script>/)[1]) || {};
                    const type = data.entry_data.PostPage[0].graphql.shortcode_media.__typename;
                    let info = {};
                    if (type === 'GraphImage') {
                        info.list = [{
                            image: data.entry_data.PostPage[0].graphql.shortcode_media.display_url
                        }];
                    } else if (type === 'GraphSidecar') {
                        info.list = data.entry_data.PostPage[0].graphql.shortcode_media.edge_sidecar_to_children.edges.map((item) => ({
                            image: item.node.display_url,
                            video: item.node.video_url,
                        }));
                    } else if (type === 'GraphVideo') {
                        info.list = [{
                            image: data.entry_data.PostPage[0].graphql.shortcode_media.display_url,
                            video: data.entry_data.PostPage[0].graphql.shortcode_media.video_url,
                        }];
                    }
                    callback(null, info);
                } catch (err) {
                    return callback(new Error('Parse Error'));
                }
            } else {
                callback(new Error('Not Found instagram'));
            }
        }
    });
}


/**
 * Facebook HD and SD video scraper.
 * @param {String} url The Facebook link of the video.
 * @returns {Promise} a Promise of { download: { hd , sd }, thumb, title }
 */
const getFacebookInfo = (url) => new Promise((resolve, reject) => {
    let result = {
        download: {
            hd: undefined,
            sd: undefined
        },
        thumb: undefined,
        title: undefined
    };
    fetchText(url,
        {
            resolveWithFullResponse: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.47 Safari/537.36'
            }
        })
        .then(videoPageResponse => {
            // HD link
            videoPageResponse.replace(/hd_src_no_ratelimit:"([^"]+)"/, (content, link) => {
                result.download.hd = link;
                return content;
                // SD link
            }).replace(/sd_src_no_ratelimit:"([^"]+)"/, (content, link) => {
                result.download.sd = link;
                return content;
                // thumb link
            }).replace(/video_id:"([^"]+)"/, (content, videoId) => {
                result.thumb = `https://graph.facebook.com/${videoId}/picture`;
                return content;
            });
            // find title
            let matches;
            if (matches = videoPageResponse.match(/h2 class="uiHeaderTitle"?[^>]+>(.+?)<\/h2>/)) {
                result.title = matches[matches.length - 1];
            } else if (matches = videoPageResponse.match(/title id="pageTitle">(.+?)<\/title>/)) {
                result.title = matches[matches.length - 1];
            }

            resolve(result);
        })
        .catch(err => {
            reject(err);
        })

})

module.exports = {
    getInstaInfo,
    getTwitterInfo,
    getFacebookInfo
}