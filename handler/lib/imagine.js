const puppeteer = require('puppeteer');
const { fetchJson } = require('../util/fetcher');
const { isBetween, randomUserAgent } = require('../util/utilities');
const { imagineSecrets } = require('../util/secrets.json');


var tokenExpired = true;
var bearerToken = null;
const aspect_ratio = {
    // Cinema 16:9
    "1": 1.7777777777777777,
    // Landscape 3:2
    "2": 1.5,
    // Square 1:1
    "3": 1,
    // Tablet 2:3
    "4": 0.6666666666666666,
    // Phone 9:16
    "5": 0.5625
}

imagineSecrets.userAgent = randomUserAgent();

async function getBearerToken() {
    let bearerToken = await fetchJson(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${imagineSecrets.googleApi}`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,he;q=0.8",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua": imagineSecrets.userAgent,
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "x-client-data": imagineSecrets['x-client-data'],
            "x-client-version": imagineSecrets['x-client-version'],
            "x-firebase-gmpid": imagineSecrets['x-firebase-gmpid']
        },
        "referrerPolicy": "no-referrer",
        "body": "{\"returnSecureToken\":true}",
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    })
        .then(json => json.idToken);
    return bearerToken;
}


/**
 * Function for getting an image created from a text using stable diffusion.
 * @param {String} text The text to create the image from.
 * @param {Object} options The options for the image.
 * Options:
 * - enhance: Whether to enhance the image or not. Default: false.
 * - num_inference_steps: Quality, the number of artistic steps the A.I. takes while creating. The more steps, the higher the quality. Default: 25.
 * - guide_scale: Guidance scale is the level of freedom (or strictness) you allow the A.I. when creating from your prompt. Higher values force the A.I. to follow your prompt. Default: 7.5.
 * - aspect_ratio: The aspect ratio of the image. Default: 1 (square).
 * - init_image: The image to start the creation from.
 * - strength: The strength of the image.
 * - negative_prompt: a description of what you do *not* want in the image - the A.I. will stay away from concepts in the negative prompt.
 */
const textToImage = (text, options = {}) => new Promise(async (resolve, reject) => {
    // check if token expired and get new one if needed.
    if (bearerToken == null || tokenExpired) {
        bearerToken = await getBearerToken();
        tokenExpired = false;
        setTimeout(() => {
            tokenExpired = true;
        }, 3600000);
    }

    // should enhance image
    options.enhance = !!options.enhance
    // options for num_inference_steps
    if (!isBetween(options.num_inference_steps, 25, 150))
        options.num_inference_steps = 25;
    options.num_inference_steps = parseInt(options.num_inference_steps);

    // options for guide_scale (keep only 1 digit after the dot)
    options.guide_scale = Math.floor(options.guide_scale * 10) / 10;
    if (!isBetween(options.guide_scale, 0, 30))
        options.guide_scale = 7.5;
    options.guide_scale = parseFloat(options.guide_scale);

    // options for aspect_ratio
    if (!aspect_ratio[options.aspect_ratio])
        options.aspect_ratio = aspect_ratio[3];

    // options for init_image
    if (options.init_image) {
        if (!isBetween(options.prompt_strength, 0, 1))
            options.prompt_strength = 0.5;
        options.prompt_strength = Math.floor(options.prompt_strength * 100) / 100;
    }

    console.log(`Creating image with text: ${text} and options: ${JSON.stringify(options, (key, value) => key === 'init_image' ? value.substring(0, 30) : value)}`);

    puppeteer.launch({ headless: true }).then(async browser => {
        const page = await browser.newPage();
        await page.setUserAgent(imagineSecrets.userAgent);
        await page.goto('https://google.com/');

        const result = await page.evaluate(async (bearerToken, text, options, imagineSecrets) => {
            return fetch(`${imagineSecrets.apiUrl}/generate`, {
                "headers": {
                    "accept": "application/json",
                    "accept-language": "en-US,en;q=0.9,he;q=0.8",
                    "authorization": `Bearer ${bearerToken}`,
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "pragma": "no-cache",
                    "sec-ch-ua": imagineSecrets.userAgent,
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site"
                },
                "referrer": imagineSecrets.refferer,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": `{"prompt": "${text}","aspect_ratio": ${options.aspect_ratio},"num_inference_steps": ${options.num_inference_steps},"guidance_scale": ${options.guide_scale} ${options.init_image ? `,"init_image":"data:image/jpeg;base64,${options.init_image}","strength":${options.prompt_strength}` : ""} ${options.negative_prompt ? `,"negative_prompt":"${options.negative_prompt}"` : ""}}`,
                "method": "POST",
                "mode": "cors",
            })
                .then(res => res.json())
                .then(json => {
                    if (options.enhance) {
                        return fetch(`${imagineSecrets.apiUrl}/enhance`, {
                            "headers": {
                                "accept": "application/json",
                                "accept-language": "en-US,en;q=0.9,he;q=0.8",
                                "authorization": `Bearer ${bearerToken}`,
                                "cache-control": "no-cache",
                                "content-type": "application/json",
                                "pragma": "no-cache",
                                "sec-ch-ua": imagineSecrets.userAgent,
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-platform": "\"Windows\"",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-site"
                            },
                            "referrer": imagineSecrets.refferer,
                            "referrerPolicy": "strict-origin-when-cross-origin",
                            "body": `{"id":"${json.results[0].id}"}`,
                            "method": "POST",
                            "mode": "cors",
                        })
                            .then(res => res.json())
                            .then(json => {
                                return { id: json.results[0].id, image_url: json.results[0].enhanced_image_url };
                            })
                    }
                    // no enhance
                    return { id: json.results[0].id, image_url: json.results[0].image_url };
                })
                .catch(err => {
                    console.error(err);
                    return { error: err };
                });
        }, bearerToken, text, options, imagineSecrets)

        // close browser
        await browser.close();


        // if error return error
        if (result.error)
            reject(result.error);

        console.log(`Got image with id: ${result.id}`);
        if (options.enhance)
            console.log(`Enhanced image with id: ${result.id}`);

        resolve(result)
    })

})

module.exports = {
    textToImage
}