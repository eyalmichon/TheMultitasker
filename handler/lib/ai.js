const { fetchJson } = require('../util/fetcher');
const { AISecrets } = require('../util/secrets.json');

const API_KEYS = AISecrets.keys;

/**
 * Returns a randomly selected key from the API_KEYS array.
 *
 * @returns {string} A randomly selected key from the API_KEYS array.
 */
function getRandomKey() {
    return API_KEYS[Math.floor(Math.random() * API_KEYS.length)]
}

/**
 * Makes a POST request to the API endpoint with input text and options
 * 
 * @param {string} text - The input text to be sent to the API
 * @param {Object} options - An object containing the API step type and parameters
 * @param {string} options.type - The type of API step to be performed
 * @param {Object} options.params - The parameters for the API step
 * @returns {Promise} A Promise that resolves with the API response or rejects with an error
 */
const baseAPICall = (text, options) => new Promise((resolve, reject) => {
    return fetchJson(AISecrets.AIAPI, {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "api-key": getRandomKey(),
            "content-type": "application/json",
        },
        "body": JSON.stringify({
            input: text,
            steps: [{ skill: options.type, params: options.params }],
            output_type: "json",
            multilingual: { enabled: true }, "content_type": "application/json"
        }),
        "method": "POST",
    })
        .then((res) => {
            resolve(res);
        })
        .catch((err) => {
            reject(err);
        });
});

/**
 * Summarize text
 * @param {string} text - Text to summarize
 * @param {object} options - Additional options
 * @param {number} options.maxLength - Max length of the summary
 * @param {number} options.minLength - Min length of the summary
 * @returns {Promise} - Result of the API call
 * @example
 * summarize('My name is John Doe. I live in New York City. I am 25 years old.')
 * // => 'My name is John Doe. I live in New York City.'
 */
const summarize = (text, options = {}) => new Promise((resolve, reject) => {

    console.log(`Summarizing text: ${text.substr(0, 100)}...`)

    const autoLength = (options.maxLength || options.minLength) ? false : true;
    const maxLength = options.maxLength || 100;
    const minLength = options.minLength || 5;
    return baseAPICall(text, { type: 'summarize', params: { auto_length: autoLength, max_length: maxLength, min_length: minLength } })
        .then((res) => {
            resolve(res.output[0].contents[0].utterance);
        })
        .catch((err) => {
            reject(err);
        });
});

/**
 * Extract topics from text
 * @param {string} text - Text to extract topics from
 * @returns {Promise} - Result of the API call
 * @example
 * topics('My name is John Doe. I live in New York City.')
 * // => ['New York City']
 */
const topics = (text) => new Promise((resolve, reject) => {

    console.log(`Extracting topics from text: ${text.substr(0, 100)}...`)

    return baseAPICall(text, { type: 'article-topics' })
        .then((res) => {
            resolve(res.output[0].labels.length ? res.output[0].labels.map(topic => topic.value) : []);
        })
        .catch((err) => {
            reject(err);
        });
});

/**
 * Split text into sentences.
 * @param {string} text - Text to split into sentences
 * @returns {Promise} - Result of the API call
 * @example
 * splitBySentence('My name is John Doe. I live in New York City.')
 * // => ['My name is John Doe.', 'I live in New York City.']
 */
const splitBySentence = (text) => new Promise((resolve, reject) => {

    console.log(`Splitting text into sentences: ${text.substr(0, 100)}...`)

    return baseAPICall(text, { type: 'sentences' })
        .then((res) => {
            resolve(res.output[0].labels.length ? res.output[0].labels.map(sentence => sentence.value) : []);
        })
        .catch((err) => {
            reject(err);
        });
});

/**
 * Anonymize text.
 * @param {string} text - Text to anonymize
 * @returns {Promise} - Result of the API call
 * @example
 * anonymize('My name is John Doe. I live in New York City.')
 * // => 'My name is ****. I live in ****.'
 */
const anonymize = (text) => new Promise((resolve, reject) => {

    console.log(`Anonymizing text: ${text.substr(0, 100)}...`)

    return baseAPICall(text, { type: 'anonymize' })
        .then((res) => {
            resolve(res.output[0].contents[0].utterance);
        })
        .catch((err) => {
            reject(err);
        });
});

/**
 * Extract text content from HTML.
 * @param {string} text - HTML to extract text from
 * @returns {Promise} - Result of the API call
 * @example
 * htmlToText('<p>My name is John Doe. I live in New York City.</p>')
 * // => 'My name is John Doe. I live in New York City.'
 */
const htmlContent = (text) => new Promise((resolve, reject) => {

    console.log(`Extracting article from HTML: ${text}`);

    return baseAPICall(text, { type: 'html-extract-article' })
        .then((res) => {
            resolve(res.output[0].contents[0].utterance);
        })
        .catch((err) => {
            reject(err);
        });
});

/**
 * Extract text from an audio file.
 * @param {string} file - Binary data of the audio file
 * @param {object} options - Additional options
 * @param {boolean} options.speakerDetection - Enable speaker detection
 * @param {boolean} options.timestampPerLabel - Enable timestamp per label
 * @param {boolean} options.timestampPerWord - Enable timestamp per word
 * @returns {Promise} - Result of the API call
 */
const transcribe = (file, options = {}) => new Promise((resolve, reject) => {

    console.log(`Transcribing file with options: ${JSON.stringify(options)}`)

    const speakerDetection = options.speakerDetection || false;
    const timestampPerLabel = options.timestampPerLabel || false;
    const timestampPerWord = options.timestampPerWord || false;
    const _API_KEY = getRandomKey();
    return fetchJson(`${AISecrets.AIAPI}/async/file?pipeline=%7B%22input_type%22%3A%22conversation%22%2C%22steps%22%3A%5B%7B%22skill%22%3A%22transcribe%22%2C%22params%22%3A%7B%22speaker_detection%22%3A${speakerDetection}%2C%22timestamp_per_word%22%3A${timestampPerWord}%2C%22timestamp_per_label%22%3A${timestampPerLabel}%2C%22engine%22%3A%22whisper%22%7D%7D%5D%2C%22output_type%22%3A%22json%22%2C%22multilingual%22%3A%7B%22enabled%22%3Atrue%7D%2C%22content_type%22%3A%22audio%2Fmp3%22%7D`,
        {
            headers: {
                "api-key": _API_KEY,
                "Content-Type": "application/json",
            },
            body: file,
            method: "POST",
        })
        .then((res) => {
            const taskId = res.task_id;
            const checkStatus = new Promise((resolve, reject) => {
                const interval = setInterval(async () => {
                    const taskStatus = await fetchJson(`${AISecrets.AIAPI}/async/tasks/${taskId}`,
                        {
                            headers: {
                                "api-key": _API_KEY,
                                "Content-Type": "application/json",
                            }
                        });
                    if (taskStatus.status !== 'RUNNING') {
                        clearInterval(interval);
                        resolve(taskStatus);
                    }
                }, 2000);
            });
            return checkStatus;
        })
        .then((res) => {
            const text = res.result.output[0].contents.map((sentence) => `${speakerDetection ? `${sentence.speaker} ` : ''}${timestampPerLabel ? `[${sentence.timestamp}]` : ''}${speakerDetection || timestampPerLabel ? ':' : ''} ${sentence.utterance}`) || [];
            resolve(text);
        })
        .catch((err) => {
            reject(err);
        }
        );
});

module.exports = {
    summarize,
    topics,
    splitBySentence,
    anonymize,
    htmlContent,
    transcribe,
};