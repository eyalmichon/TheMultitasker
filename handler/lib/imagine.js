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

const models = {
    "1.5": {
        name: "v1.5",
        prefix: "",
        postfix: "",
        negative_prompt: ""
    },
    "2.1": {
        name: "v2.1",
        prefix: "",
        postfix: "",
        negative_prompt: ""
    },
    "2.1-vangogh": {
        name: "v2.1",
        prefix: "",
        postfix: "colorful, visible brushstrokes, very detailed, featured on artstation, 4k, cinematic light, art by Vincent van Gogh",
        negative_prompt: ""
    },
    "2.1-picasso": {
        name: "v2.1",
        prefix: "",
        postfix: "colorful, very detailed, 4k, art by Pablo Picasso",
        negative_prompt: ""
    },
    "2.1-alicezhang": {
        name: "v2.1",
        prefix: "",
        postfix: "colorful, visible brushstrokes, very detailed, featured on artstation, 4k, cinematic light, art by alice x zhang",
        negative_prompt: ""
    },
    "openjourney": {
        name: "openjourney",
        prefix: "mdjrny-v4 style",
        postfix: "",
        negative_prompt: ""
    },
    "analog": {
        name: "analog",
        prefix: "analog style",
        postfix: "",
        negative_prompt: "blur haze"
    },
    "duchaiten": {
        name: "duchaiten",
        prefix: "",
        postfix: "",
        negative_prompt: "lowres, disfigured, ostentatious, ugly, oversaturated, grain, low resolution, disfigured, blurry, bad anatomy, disfigured, poorly drawn face, mutant, mutated, extra limb, ugly, poorly drawn hands, missing limbs, blurred, floating limbs, disjointed limbs, deformed hands, blurred, out of focus, long neck, long body, ugly, disgusting, bad drawing, childish, cut off cropped, distorted, imperfect, surreal, bad hands, text, error, extra digit, fewer digits, cropped , worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, Lots of hands, extra limbs, extra fingers, conjoined fingers, deformed fingers, old, ugly eyes, imperfect eyes, skewed eyes , unnatural face, stiff face, stiff body, unbalanced body, unnatural body, lacking body, details are not clear, details are sticky, details are low, distorted details, ugly hands, imperfect hands, (mutated hands and fingers:1.5), (long body :1.3), (mutation, poorly drawn :1.2) bad hands, fused ha nd, missing hand, disappearing arms, disappearing thigh, disappearing calf, disappearing legs, ui, missing fingers"
    },
    "deliberate": {
        name: "deliberate",
        prefix: "",
        postfix: "",
        negative_prompt: "deformed, bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, disgusting, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, blurry, ((((mutated hands and fingers)))), watermark, watermarked, oversaturated, censored, distorted hands, amputation, missing hands, obese, doubled face, double hands, b&w, black and white, sepia, human, man, woman"
    },
    "dreamshaper": {
        name: "dreamshaper",
        prefix: "",
        postfix: "",
        negative_prompt: ""
    },
    "double-exposure": {
        name: "double-exposure",
        prefix: "dublex style",
        postfix: "",
        negative_prompt: ""
    },
    "redshift": {
        name: "redshift",
        prefix: "redshift style",
        postfix: "",
        negative_prompt: ""
    },
    "nitro": {
        name: "nitro",
        prefix: "",
        postfix: "",
        negative_prompt: ""
    },
    "arcane": {
        name: "nitro-arcane",
        prefix: "arcane style",
        postfix: "",
        negative_prompt: ""
    },
    "archer": {
        name: "nitro-archer",
        prefix: "archer style",
        postfix: "",
        negative_prompt: ""
    },
    "disney": {
        name: "nitro-disney",
        prefix: "modern disney style",
        postfix: "",
        negative_prompt: "person human"
    },
    "synthwave": {
        name: "synthwave-punk",
        prefix: "snthwve style nvinkpunk",
        postfix: "",
        negative_prompt: "cartoon, 3d, ((disfigured)), ((bad art)), ((deformed)), ((poorly drawn)), ((extra limbs)), ((close up)), ((b&w)), weird colors, blurry"
    },
    "vector-art": {
        name: "vector-art",
        prefix: "vector-art",
        postfix: "",
        negative_prompt: "low poly, tetric, mosaic, disfigured, kitsch, ugly, oversaturated, grain, low-res, Deformed, blurry, bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, blurry, floating limbs, disconnected limbs, malformed hands, blur, out of focus, long neck, long body, ugly, disgusting, poorly drawn, mutilated, mangled, old, surreal, pixel-art, black and white, childish, watermark"
    },
    "pixel": {
        name: "pixel",
        prefix: "",
        postfix: "",
        negative_prompt: ""
    },
    "pixel-scenery": {
        name: "pixel-scenery",
        prefix: "16bitscene",
        postfix: "",
        negative_prompt: ""
    },
    "pixel-character": {
        name: "pixel-character",
        prefix: "pixelsprite",
        postfix: "",
        negative_prompt: ""
    },
    "anything": {
        name: "anything-v3.0",
        prefix: "",
        postfix: "",
        negative_prompt: ""
    },
    "eimis": {
        name: "eimis",
        prefix: "",
        postfix: "",
        negative_prompt: "lowres, bad anatomy, ((bad hands)), text, error, ((missing fingers)), cropped, jpeg artifacts, worst quality, low quality, signature, watermark, blurry, deformed, extra ears, deformed, disfigured, mutation, censored, ((multiple_girls))"
    },
    "waifu": {
        name: "waifu",
        prefix: "",
        postfix: "",
        negative_prompt: "lowres, (bad anatomy, bad hands:1.1), text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, blurry, b&w, weird colors, (cartoon, 3d, bad art, poorly drawn, close up, blurry:1.5), (disfigured, deformed, extra limbs:1.5)"
    },
    "grapefruit": {
        name: "grapefruit",
        prefix: "",
        postfix: "",
        negative_prompt: "(((big hands))), (((ugly mouth, ugly eyes, missing teeth, crooked teeth, close-up, cropped, out of frame))), worst quality, low quality, jpeg artifacts, ugly, duplicate, painful, mutilated, extra fingers, mutated hands, badly drawn hands, badly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, deformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, bad anatomy, tilt, watermark, watermarked"
    },
    "pfg": {
        name: "pfg",
        prefix: "",
        postfix: "",
        negative_prompt: "teeth, missing hand, missing arm, splitting arm, wrong anatomy, split nipples, phong shader, bad render nipples, black and white, fat, muscled, fitness"
    },
    "realistic-vision": {
        name: "realistic-vision",
        prefix: "((RAW, analog style))",
        postfix: "((film grain, skin details, high detailed skin texture, 8k hdr, dslr))",
        negative_prompt: "((((realistic, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime)))), cropped, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck"
    },
    "f222": {
        name: "f222",
        prefix: "",
        postfix: "",
        negative_prompt: "shiny skin, oily skin, unrealistic lighting, portrait, cartoon, anime, fake, airbrushed skin, deformed, blur, blurry, bokeh, warp hard bokeh, gaussian, out of focus, out of frame, obese, odd proportions, asymmetrical, super thin, fat,dialog, words, fonts, teeth, ((((ugly)))), (((duplicate))), ((morbid)), monochrome, b&w, [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), mutated hands, (fused fingers), (too many fingers), (((long neck)))"
    },
    "ppp": {
        name: "ppp",
        prefix: "",
        postfix: "",
        negative_prompt: ""
    },
    "hassan": {
        name: "hassan",
        prefix: "",
        postfix: "",
        negative_prompt: "anime, cartoon, fake, drawing, illustration, boring, 3d render, long neck, out of frame, extra fingers, mutated hands, ((monochrome)), ((poorly drawn hands)), 3DCG, cgstation, ((flat chested)), red eyes, multiple subjects, extra heads, close up, man asian, text ,watermarks, logo"
    },
}

/**
 * Helper function to get all the models
 * @returns {string[]}
 */
function getModels() {
    return Object.keys(models).map(key => key);
}

imagineSecrets.userAgent = randomUserAgent();

async function getBearerToken() {
    let bearerToken = await fetchJson(`${imagineSecrets.premium ? 'https://securetoken.googleapis.com/v1/token' : 'https://identitytoolkit.googleapis.com/v1/accounts:signUp'}?key=${imagineSecrets.googleApi}`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,he;q=0.8",
            "cache-control": "no-cache",
            "content-type": imagineSecrets.premium ? "application/x-www-form-urlencoded" : "application/json",
            "pragma": "no-cache",
            "sec-ch-ua": imagineSecrets.userAgent,
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "x-client-data": imagineSecrets.premium ? imagineSecrets.premium['x-client-data'] : imagineSecrets['x-client-data'],
            "x-client-version": imagineSecrets.premium ? imagineSecrets.premium['x-client-version'] : imagineSecrets['x-client-version'],
            "x-firebase-gmpid": imagineSecrets.premium ? imagineSecrets.premium['x-firebase-gmpid'] : imagineSecrets['x-firebase-gmpid'],
        },
        "body": imagineSecrets.premium ? `grant_type=refresh_token&refresh_token=${imagineSecrets.premium.refreshToken}` : "{\"returnSecureToken\":true}",
        "method": "POST",
    })
        .then(json => {
            return imagineSecrets.premium ? json.id_token : json.idToken
        });
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
 * - model: The model of the A.I. to use. Default: 2.1.
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
    options.enhance = !!options.enhance || !!options.hd
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
    else
        options.aspect_ratio = aspect_ratio[options.aspect_ratio];

    // options for init_image
    if (options.init_image) {
        if (!isBetween(options.prompt_strength, 0, 1))
            options.prompt_strength = 0.5;
        options.prompt_strength = Math.floor(options.prompt_strength * 100) / 100;
    }

    if (models[options.model] && models[options.model].prefix)
        text = `${models[options.model].prefix}, ${text}`;
    if (models[options.model] && models[options.model].postfix)
        text = `${text}, ${models[options.model].postfix}`;
    if (models[options.model] && models[options.model].negative_prompt && !options.negative_prompt)
        options.negative_prompt = models[options.model].negative_prompt;

    options.model = models[options.model]?.name || 'v2.1';

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
                "body": `{"prompt": "${text}","aspect_ratio": ${options.aspect_ratio},"num_inference_steps": ${options.num_inference_steps},"guidance_scale": ${options.guide_scale} ${options.init_image ? `,"init_image":"data:image/jpeg;base64,${options.init_image}","strength":${options.prompt_strength}` : ""} ${options.negative_prompt ? `,"negative_prompt":"${options.negative_prompt}"` : ""}, "model": "${options.model}"}`,
                "method": "POST",
                "mode": "cors",
            })
                .then(res => {
                    if (res.status === 401) {
                        console.log('Insufficient permissions, please check your token');
                        throw new Error('Insufficient permissions')
                    }
                    return res.json()
                })
                .then(json => {
                    if (options.enhance) {
                        return fetch(`${imagineSecrets.enhanceUrl}`, {
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
                    return { error: err.message };
                });
        }, bearerToken, text, options, imagineSecrets)

        // close browser
        await browser.close();


        // if error return error
        if (result.error)
            return reject(result.error);

        console.log(`Got image with id: ${result.id}`);
        if (options.enhance)
            console.log(`Enhanced image with id: ${result.id}`);

        resolve(result)
    })

})

const enhanceImage = (base64) => new Promise(async (resolve, reject) => {
    return textToImage('a', { init_image: base64, prompt_strength: "0", model: "1.5", enhance: true })
        .then(res => {
            resolve(res)
        })
        .catch(err => {
            reject(err)
        })
})


module.exports = {
    textToImage,
    enhanceImage
}