const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { fetchJson, fetchText, fetchToFile } = require("../util/fetcher");
const { randomUserAgent, base64Logo } = require("../util/utilities");


// french: 'fra', english: 'eng'
const grammarLangs = {
    fra: 'fra', eng: 'eng'
};

const voices = {
    ara: 'Mehdi22k', ger: 'Claudia22k', spa: 'Ines22k',
    fra: 'Alice22k', heb: 'he-IL-Asaf', ita: 'Chiara22k',
    jpn: 'Sakura22k', dut: 'Femke22k', pol: 'Ania22k',
    por: 'Celia22k', rum: 'ro-RO-Andrei', rus: 'Alyona22k',
    tur: 'Ipek22k', chi: 'Lulu22k', eng: 'Heather22k'
};

const contextLangs = {
    ara: 'arabic', ger: 'german', spa: 'spanish',
    fra: 'french', heb: 'hebrew', ita: 'italian',
    jpn: 'japanese', dut: 'dutch', pol: 'polish',
    por: 'portuguese', rum: 'romanian', rus: 'russian',
    tur: 'turkish', chi: 'chinese', eng: 'english'
};
// arabic: 'ara', german: 'ger', spanish: 'spa',
// french: 'fra', hebrew: 'heb', italian: 'ita',
// japanese: 'jpn', dutch: 'dut', polish: 'pol',
// portuguese: 'por', romanian: 'rum', russian: 'rus',
// english: 'eng'
const synonymLangs = {
    ara: 'ar', ger: 'de', spa: 'es',
    fra: 'fr', heb: 'he', ita: 'it',
    jpn: 'ja', dut: 'nl', pol: 'pl',
    por: 'pt', rum: 'ro', rus: 'ru',
    eng: 'en'
};

const grammar = (text, from = 'eng') => new Promise((resolve, reject) => {

    if (!grammarLangs[from]) from = 'eng';
    else from = grammarLangs[from]

    console.log(`Getting grammar fixed from ${from} for the following text: ${text}`)

    const ua = randomUserAgent();

    fetchJson(encodeURI(`https://orthographe.reverso.net/api/v1/Spelling?text=${text}&language=${from}`), {
        "headers": {
            "accept": "*/*",
            "Connection": "keep-alive",
            "User-Agent": ua
        },
    })
        .then(res => resolve(res.text))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})

/**
 * Text to speech.
 * @param {String} text the text to convert into speech.
 * @param {String} from the language to use.
 * @returns 
 */
const tts = (text, from = voices.english) => new Promise((resolve, reject) => {

    if (!voices[from]) from = voices.eng
    else from = voices[from]

    console.log(`Getting tts from ${from} for the following text: ${text}`)

    const ua = randomUserAgent()
    const base64 = Buffer.from(text).toString('base64')
    const link = `https://voice.reverso.net/RestPronunciation.svc/v1/output=json/GetVoiceStream/voiceName=${from}?inputText=${base64}`
    const options = {
        "headers": {
            "accept": "*/*",
            "User-Agent": ua
        }
    }
    fetchToFile(link, 'mp3', options)
        .then(res => {
            if (res.filePath)
                resolve(res.filePath)
            else {
                console.error(res);
                reject('NULL_PATH')
            }
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })

})

/**
 * Translate with context for text in from and to languges.
 * @param {String} text the text to find context for.
 * @param {String} from the text's origin language.
 * @param {Stirng} to the translated language.
 * @returns array of { from, to } context sentences.
 */
const context = (text, from = contextLangs.eng, to = contextLangs.heb) => new Promise((resolve, reject) => {

    if (!contextLangs[from]) from = contextLangs.eng
    else from = contextLangs[from]

    console.log(`Getting context from ${from} to ${to} for the following text: ${text}`)

    if (!contextLangs[to]) to = contextLangs.heb
    else to = contextLangs[to]

    const ua = randomUserAgent();

    const contextData = []
    contextData.push({ from, to })

    fetchText(encodeURI(`https://context.reverso.net/translation/${from}-${to}/${text}`), {
        "headers": {
            "accept": "*/*",
            "Connection": "keep-alive",
            "User-Agent": ua
        },
    })
        .then(res => cheerio.load(res))
        .then($ => {
            $('.example').each((i, item) => {
                const data = $(item).text().trim().split('\n').map(item => item.trim()).filter(item => !!item.length)
                if (data.length > 1)
                    contextData.push({ from: data[0], to: data[1] })
            })
            resolve(contextData)

        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
})

/**
 * Get synonyms and antonyms for words.
 * @param {String} text the words.
 * @param {String} from from which language.
 * @returns object of {synonyms, antonyms}
 */
const synonym = (text, from = synonymLangs.eng) => new Promise((resolve, reject) => {

    if (!synonymLangs[from]) from = synonymLangs.eng
    else from = synonymLangs[from]

    console.log(`Getting synonyms and antonyms from ${from} of the following text: ${text}`)

    const ua = randomUserAgent();

    fetchText(encodeURI(`https://synonyms.reverso.net/synonym/${from}/${text}?filter=unlock`), {
        "headers": {
            "accept": "*/*",
            "Connection": "keep-alive",
            "User-Agent": ua
        },
    })
        .then(res => cheerio.load(res))
        .then($ => {
            const result = {}
            result.synonyms = Array.from(new Set($('.word-opt').text().trim().split('\n').map(item => item.trim()).filter(item => !!item.length).sort()))
            result.antonyms = Array.from(new Set($('.antonyms-wrapper').text().trim().split('\n').map(item => item.trim()).filter(item => !!item.length && item !== 'Antonyms:').sort()))
            resolve(result)
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
})

const conjugator = (text, from = contextLangs.eng, hq = false) => new Promise((resolve, reject) => {

    if (!contextLangs[from]) from = contextLangs.eng
    else from = contextLangs[from]

    console.log(`Getting conjugations from ${from} for the following text: ${text}`)

    puppeteer.launch({ headless: true }).then(async browser => {

        const page = await browser.newPage();

        if (hq) await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 2 });

        await page.goto(`https://conjugator.reverso.net/conjugation-${from}-verb-${text}.html`);
        await page.waitForSelector('#ch_divSimple');
        const element = await page.$('#ch_divSimple');
        await page.waitForSelector('#btnScroll');
        await page.waitForSelector('.top-horizontal');
        await page.evaluate((base64Logo) => {
            let img = document.createElement('img');
            img.src = `data:image/png;base64,${base64Logo}`;
            img.style.position = 'absolute';
            img.style.right = '10px';
            img.style.bottom = '10px';
            img.style.height = '10%';
            // Remove ad.
            let ad = document.querySelector('.top-horizontal');
            ad.parentNode.removeChild(ad);
            // remove button at bottom right.
            let button = document.querySelector('#btnScroll');
            button.parentNode.removeChild(button);
            // the div which the data is in.
            let div = document.querySelector('#ch_divSimple');
            div.appendChild(img);
        }, base64Logo);
        const base64 = await element.screenshot({ encoding: "base64" });
        resolve(base64);
    })
        .catch(err => {
            console.error(err);
            reject(err);
        })
})


module.exports = {
    grammar,
    tts,
    context,
    synonym,
    conjugator
}