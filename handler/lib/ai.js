const { fetchJson, fetchText } = require('../util/fetcher');
const { AISecrets } = require('../util/secrets.json');
const { randomUserAgent } = require('../util/utilities');


/**
 * Returns a randomly selected key from the API_KEYS array.
 *
 * @returns {string} A randomly selected key from an array of keys.
 */
function getRandomKey(keys) {
    return keys[Math.floor(Math.random() * keys.length)]
}
/**
 * Generates a random UUID
 * @returns {string} A random UUID
 */
function generateUID() {
    var d = new Date().getTime();
    var uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uid;
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
    return fetchJson(AISecrets.oneai.apiEndpoint, {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "api-key": getRandomKey(AISecrets.oneai.keys),
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

    console.log(`Summarizing text: ${text.substring(0, 100)}...`)

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

    console.log(`Extracting topics from text: ${text.substring(0, 100)}...`)

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

    console.log(`Splitting text into sentences: ${text.substring(0, 100)}...`)

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

    console.log(`Anonymizing text: ${text.substring(0, 100)}...`)

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
    const API_KEY = getRandomKey(AISecrets.oneai.keys);
    return fetchJson(`${AISecrets.oneai.apiEndpoint}/async/file?pipeline=%7B%22input_type%22%3A%22conversation%22%2C%22steps%22%3A%5B%7B%22skill%22%3A%22transcribe%22%2C%22params%22%3A%7B%22speaker_detection%22%3A${speakerDetection}%2C%22timestamp_per_word%22%3A${timestampPerWord}%2C%22timestamp_per_label%22%3A${timestampPerLabel}%2C%22engine%22%3A%22whisper%22%7D%7D%5D%2C%22output_type%22%3A%22json%22%2C%22multilingual%22%3A%7B%22enabled%22%3Atrue%7D%2C%22content_type%22%3A%22audio%2Fmp3%22%7D`,
        {
            headers: {
                "api-key": API_KEY,
                "Content-Type": "application/json",
            },
            body: file,
            method: "POST",
        })
        .then((res) => {
            const taskId = res.task_id;
            const checkStatus = new Promise((resolve, reject) => {
                const interval = setInterval(async () => {
                    const taskStatus = await fetchJson(`${AISecrets.oneai.apiEndpoint}/async/tasks/${taskId}`,
                        {
                            headers: {
                                "api-key": API_KEY,
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

/**
 * Detect AI content.
 * @param {string} text - Text to check
 * @returns {Promise} - The score of the AI content
 * @example
 * aiContentDetector('My name is John Doe. I live in New York City.')
 * // => score: 0.000051
 */
const aiContentDetector = (text) => new Promise((resolve, reject) => {

    console.log(`Checking for AI content for the following text: ${text.substring(0, 100)}...`)

    if (!text) return reject({ message: 'Text is empty', code: 0 });
    if (text.length > 25000) return reject({ message: 'Text is too long', code: 1 });

    const result = text.length < 1500 ?
        fetchJson(AISecrets.contentDetector.short.apiEndpoint, {
            "headers": {
                "accept": "text/plain, */*; q=0.01",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            "body": `action=ai_content_detector_recaptcha&inputs=${text.split(' ').join('+')}&token=`,
            "method": "POST",
            "user-agent": randomUserAgent()
        })
            .then(data => {
                console.log(data);
                return data.find(item => item.label === 'LABEL_1').score
            })
        :
        fetchJson(AISecrets.contentDetector.long.apiEndpoint, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "content-type": "application/json",
            },
            "referrer": AISecrets.contentDetector.long.referrer,
            "body": `{\"text\":\"${text}\"}`,
            "method": "POST",
            "user-agent": randomUserAgent()
        })
            .then(data => {
                console.log(data);
                return data.summary.human ? data.results[0].probability : 1 - data.results[0].probability
            })
    return result.then(data => {
        resolve(data);
    })
        .catch(err => {
            console.error(err);
            return reject({ message: 'Unknown error, check logs', code: '2' });
        })

});

/**
 * Generate an excuse.
 * @param {string} target - Target persona to generate excuse for.
 * @param {string} messup - Messup to generate excuse for.
 * @param {number} professionalism - Professionalism of the excuse.
 * @returns {Promise} - The generated excuse.
 */
const excuseGenerator = (target, messup, professionalism) => new Promise((resolve, reject) => {
    console.log(`Generating excuse for ${target} with messup of ${messup.length > 200 ? messup.substring(0, 200) + '...' : messup} and professionalism of ${professionalism}...`)

    // check that professionalism is between 0-100
    professionalism = professionalism > 100 ? 100 : professionalism < 0 ? 0 : professionalism;
    // slice target to 50 chars
    target = target.substring(0, 50);

    return fetchJson(AISecrets.excuseGenerator.apiEndpoint, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,he;q=0.8",
            "content-type": "application/json",
        },
        "referrer": AISecrets.excuseGenerator.referrer,
        "body": `{"0":{"json":{"messup":"${messup}","request":"","professionalism":${professionalism},"target":"${target}"}}}`,
        "method": "POST",
        "user-agent": randomUserAgent()
    })
        .then(data => {
            const res = {
                excuse: data[0].result.data.json.generation,
                targetResponse: data[0].result.data.json.targetsGeneration,
            }
            resolve(res);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
});

/**
 * Generate a random idea.
 * @returns {Promise} - The generated idea.
 * @example
 * randomIdea()
 * // => "A new way to make money"
 */
const randomIdea = () => new Promise(async (resolve, reject) => {
    console.log(`Generating random idea...`)

    fetchJson(AISecrets.randomIdea.apiEndpoint, {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9,he;q=0.8",
            "x-requested-with": "XMLHttpRequest"
        },
        "body": null,
        "method": "GET",
        "user-agent": randomUserAgent()
    })
        .then(data => resolve(data.new_idea.idea))
        .catch(err => {
            console.error(err)
            reject(err)
        })
})

/**
 * Interpret a dream.
 * @param {string} dream - Dream to interpret.
 * @returns {Promise} - The interpretation of the dream.
 */
const dreamInterpretation = (dream) => new Promise(async (resolve, reject) => {
    console.log(`Interpreting dream: ${dream.substring(0, 100)}...`)

    if (dream.split(' ').length < 5)
        reject({ message: "Dream must be at least 5 words", code: 0 })

    fetchJson(AISecrets.dreamInterpretation.apiEndpoint, {
        "headers": {
            "accept": "*/* ",
            "accept-language": "en-US,en;q=0.9,he;q=0.8",
            "content-type": "application/json",
            "uid": generateUID(),
        },
        "referrer": AISecrets.dreamInterpretation.referrer,
        "body": `{\"dream\":\"${dream}\",\"lat\":null,\"long\":null}`,
        "method": "POST",
        "user-agent": randomUserAgent()
    })
        .then(data => {
            if (!data.success)
                reject({ message: data, code: 1 })
            resolve({
                dream: data.dream.dream,
                interpretation: data.dream.interpretation
            })
        })
        .catch(err => {
            console.error(err)
            reject(err)
        })

})

/**
 * Fix SQL code.
 * @param {string} sqlCode - SQL code to fix.
 * @returns {Promise} - The fixed SQL code.
 */
const sqlFixer = (sqlCode) => new Promise(async (resolve, reject) => {
    console.log(`Trying to fix the following SQL code: ${sqlCode}`)

    // reaplce all newlines with \\n with regex
    sqlCode = sqlCode.replace(/(\r\n|\n|\r)/gm, '\\n')
    return fetchJson(`${AISecrets.sql.apiEndpoint}/7/execute`, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9,he;q=0.8",
            "content-type": "application/json",
        },
        "body": `{\"variables\":{\"sql_query\":\"${sqlCode}\"},\"anonymous_id\":\"${generateUID()}\"}`,
        "method": "POST",
    })
        .then(data => resolve(data.result))
        .catch(err => {
            console.error(err)
            reject(err)
        })
})

/**
 * Explain SQL code.
 * @param {string} sqlCode - SQL code to explain.
 * @returns {Promise} - The explanation of the SQL code.
 */
const sqlExplainer = (sqlCode) => new Promise(async (resolve, reject) => {
    console.log(`Trying to explain the following SQL code: ${sqlCode}`)
    // reaplce all newlines with \\n with regex
    sqlCode = sqlCode.replace(/(\r\n|\n|\r)/gm, '\\n')
    return fetchJson(`${AISecrets.sql.apiEndpoint}/4/execute`, {
        "headers": {
            "accept": "application/json",
            "content-type": "application/json",
        },
        "body": `{\"variables\":{\"query\":\"${sqlCode}\"},\"anonymous_id\":\"${generateUID()}\"}`,
        "method": "POST",
    })
        .then(data => resolve(data.result))
        .catch(err => {
            console.error(err)
            reject(err)
        })
})

/**
 * Base function for the wonderful.
 * @param {*} options includes body
 */
const wonderfulBase = (options) => new Promise((resolve, reject) => {

    return fetchJson(AISecrets.wonderful.apiEndpoint, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,he;q=0.8",
            "content-type": "application/json",
        },
        "body": options.body,
        "method": "POST",
        "user-agent": randomUserAgent()
    })
        .then(async res => {
            let status = res.status
            let id = res.id
            let result
            // set status to failed after 30 seconds
            let timer = setTimeout(() => {
                status = 'timeout'
            }, 30000)
            while (status !== 'succeeded' && status !== 'timeout') {
                await fetchJson(`${AISecrets.wonderful.apiEndpoint}/${id}`, {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US,en;q=0.9,he;q=0.8",
                    },
                    "body": null,
                    "method": "GET",
                    "user-agent": randomUserAgent()
                })
                    .then(res => {
                        status = res.status
                        result = res.output
                    })
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
            clearTimeout(timer)

            if (status === 'succeeded')
                resolve(result)

            else
                reject({ message: result, code: status })
        })
})
/**
 * Colorize an image.
 * @param {Buffer} buffer - Image to colorize.
 * @param {Object} options - Options for the colorization.
 * @param {string} options.url - URL to colorize.
 * @returns {Promise} - The colorized image.
 */
const colorizeImage = (buffer, options) => new Promise((resolve, reject) => {
    console.log(`Colorizing image...`)

    let link = options?.url || buffer
    let _options = {
        body: JSON.stringify(
            {
                "version": "9451bfbf652b21a9bccc741e5c7046540faa5586cfa3aa45abc7dbb46151a4f7",
                "input": {
                    "image": link,
                    "mode": "Real Gray Colorization",
                    "classes": "88"
                }
            })
    }
    return wonderfulBase(_options)
        .then(res => resolve(res.map(link => link.image)))
        .catch(err => {
            console.error(err);
            reject(err);
        });
})

/**
 * Upscale an image.
 * @param {Buffer} buffer - Image to upscale.
 * @param {Object} options - Options for the upscaling.
 * @param {string} options.url - URL to upscale.
 * @returns {Promise} - The upscaled image.
 */
const upscaleImage = (buffer, options) => new Promise((resolve, reject) => {
    console.log(`Upscaling image...`)
    let link = options?.url || buffer
    let _options = {
        body: JSON.stringify(
            {
                "version": "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
                "input": {
                    "img": link,
                    "version": "v1.4",
                    "scale": 2
                }
            })
    }
    return wonderfulBase(_options)
        .then(res => resolve(res))
        .catch(err => {
            console.error(err);
            reject(err);
        });
})

/**
 * Generate a prayer.
 * @param {string} text - Text to generate a prayer for.
 * @param {string} type - Type of prayer to generate. Can be 'bible' or 'quran'.
 * @returns {Promise} - The generated prayer.
 */
const prayerGPT = (text, type) => new Promise((resolve, reject) => {
    console.log(`Generating prayer for ${text.length > 100 ? text.substring(0, 100) + '...' : text}`)

    if (!['bible', 'quran'].includes(type))
        return reject({ message: 'Invalid type', code: 0 })

    return fetchText(AISecrets.prayer.apiEndpoint, {
        "headers": {
            "accept": "text/plain, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9,he;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        },
        "body": `input=${text}&book=${type}`,
        "method": "POST",
        "user-agent": randomUserAgent()
    })
        .then(res => resolve(res.substring(res.indexOf('<hr />') + 6, res.length - 6).replace(/<br \/>/g, '\n')))
        .catch(err => {
            console.error(err);
            reject({ message: err, code: 1 });
        });
})

module.exports = {
    summarize,
    topics,
    splitBySentence,
    anonymize,
    htmlContent,
    transcribe,
    aiContentDetector,
    excuseGenerator,
    randomIdea,
    dreamInterpretation,
    sqlFixer,
    sqlExplainer,
    colorizeImage,
    upscaleImage,
    prayerGPT
};