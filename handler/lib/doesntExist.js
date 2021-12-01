const puppeteer = require('puppeteer');
const fetcher = require("../util/fetcher")


async function getScreenshot(url, options = {}) {
    return new Promise((resolve, reject) => {
        return puppeteer.launch({ headless: true }).then(async browser => {
            const page = await browser.newPage();
            await page.goto(url);

            if (!!options.waitFor)
                await page.waitForSelector(options.waitFor)

            if (options.remove?.length) {
                await page.evaluate((options) => {
                    options.remove.forEach(element => {
                        document.querySelector(element).outerHTML = ''
                    })
                }, options)
            }

            if (!!options.timeout)
                await page.waitForTimeout(options.timeout)

            if (!!options.clip) {
                let selector = await page.$(options.clip.selector)
                let box = await selector.boundingBox()
                var buffer = await selector.screenshot({ clip: { x: box.x + options.clip.x, y: box.y + options.clip.y, height: box.height + options.clip.height, width: box.width + options.clip.width } });
            }
            else
                var buffer = await page.screenshot({ fullPage: true });

            await browser.close();

            resolve(buffer)
        })
            .catch(err => {
                console.error(err);
                reject(err);
            })
    })
}
async function getSrcFromPuppet(url, options = {}) {
    return new Promise((resolve, reject) => {
        return puppeteer.launch({ headless: true }).then(async browser => {
            const page = await browser.newPage();
            await page.goto(url);

            if (!!options.waitFor)
                await page.waitForSelector(options.waitFor)

            let link = await page.evaluate((options) => document.getElementById(options.id).src, options)

            await browser.close();

            resolve(link)
        })
            .catch(err => {
                console.error(err);
                reject(err);
            })
    })
}


const person = () => new Promise((resolve, reject) => {
    console.log(`Looking for a person that doesn't exist.`)
    return fetcher.fetchBase64('https://thispersondoesnotexist.com/image')
        .then(res => resolve({ type: 'img', info: res }))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})
const cat = () => new Promise((resolve, reject) => {
    console.log(`Looking for a cat that doesn't exist.`)
    return fetcher.fetchBase64('https://thiscatdoesnotexist.com/')
        .then(res => resolve({ type: 'img', info: res }))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})
const horse = () => new Promise((resolve, reject) => {
    console.log(`Looking for a horse that doesn't exist.`)
    return fetcher.fetchBase64('https://thishorsedoesnotexist.com/')
        .then(res => resolve({ type: 'img', info: res }))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})
const rental = () => new Promise((resolve, reject) => {
    console.log(`Looking for a rental that doesn't exist.`)
    return getScreenshot('https://thisrentaldoesnotexist.com/')
        .then(res => resolve({ type: 'img', info: res.toString('base64') }))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})
const waifu = () => new Promise((resolve, reject) => {
    console.log(`Looking for a waifu that doesn't exist.`)
    return fetcher.fetchBase64(`https://www.thiswaifudoesnotexist.net/example-${Math.floor(Math.random() * 100000)}.jpg`)
        .then(res => resolve({ type: 'img', info: res }))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})
const question = () => new Promise((resolve, reject) => {
    console.log(`Looking for a question that doesn't exist.`)
    return getScreenshot('https://stackroboflow.com/', { waitFor: '#question > p:nth-child(1)' })
        .then(res => resolve({ type: 'img', info: res.toString('base64') }))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})
const chemical = () => new Promise((resolve, reject) => {
    console.log(`Looking for a chemical that doesn't exist.`)
    return getScreenshot('https://thischemicaldoesnotexist.com/', { timeout: 1000 })
        .then(res => resolve({ type: 'img', info: res.toString('base64') }))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})
const word = () => new Promise((resolve, reject) => {
    console.log(`Looking for a word that doesn't exist.`)
    return getScreenshot('https://www.thisworddoesnotexist.com/', { clip: { x: -10, y: -10, width: 10, height: -10, selector: '#definition-zone > div' } })
        .then(res => resolve({ type: 'img', info: res.toString('base64') }))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})
const city = () => new Promise((resolve, reject) => {
    console.log(`Looking for a city that doesn't exist.`)
    return getScreenshot('http://thiscitydoesnotexist.com/', { clip: { x: 0, y: 0, width: 0, height: 0, selector: 'body > center > img' } })
        .then(res => resolve({ type: 'img', info: res.toString('base64') }))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})
const simpsons = () => new Promise((resolve, reject) => {
    console.log(`Looking for a simpson that doesn't exist.`)
    return getScreenshot('https://www.thisfuckeduphomerdoesnotexist.com/', { remove: ['body > div > div.attribution-wrapper'], clip: { x: 0, y: 0, width: 0, height: 0, selector: '#image-payload' } })
        .then(res => resolve({ type: 'img', info: res.toString('base64') }))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})
const art = () => new Promise((resolve, reject) => {
    console.log(`Looking for an art that doesn't exist.`)
    return fetcher.fetchBase64('https://thisartworkdoesnotexist.com/')
        .then(res => resolve({ type: 'img', info: res }))
        .catch(err => {
            console.error(err);
            reject(err);
        })

})
const video = () => new Promise((resolve, reject) => {
    console.log(`Looking for a video that doesn't exist.`)
    return getSrcFromPuppet('https://www.thismusicvideodoesnotexist.com/', { id: 'musicVideo' })
        .then(res => resolve({ type: 'videoLink', info: res }))
        .catch(err => {
            console.error(err);
            reject(err);
        })

})
const ideas = () => new Promise((resolve, reject) => {
    console.log(`Looking for an idea that doesn't exist.`)
    return fetcher.fetchText('https://thisideadoesnotexist.com/')
        .then(res => {
            let match = res.match(/<h2>\s+(.*?)\s+<\/h2>/) || [];
            let info = match[1] || '';
            resolve({ type: 'text', info })
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })

})

const lyricsOptions = {
    genres: ['country', 'metal', 'rock', 'pop', 'rap', 'edm'],
    moods: ['verysad', 'sad', 'neutral', 'happy', 'veryhappy']
}
const lyrics = (topic, genre, mood) => new Promise((resolve, reject) => {
    console.log(`Looking for lyrics that don't exist.`)
    if (!lyricsOptions.genres.includes(genre))
        genre = lyricsOptions.genres[Math.floor(Math.random() * lyricsOptions.genres.length)]
    if (!lyricsOptions.moods.includes(mood))
        mood = lyricsOptions.moods[Math.floor(Math.random() * lyricsOptions.moods.length)]

    return fetcher.fetchJson("https://theselyricsdonotexist.com/generate.php", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,he;q=0.8",
            "content-type": "text/plain;charset=UTF-8",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "Referer": `https://theselyricsdonotexist.com/?query=${encodeURI(topic)}`,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `{"message":"${topic}","lyricsGenre":"${genre}","lyricMood":"${mood}"}`,
        "method": "POST"
    })
        .then(json => json.message.replace(/<b>/g, '').replace(/<\/b>/g, '').replace(/<br \/>/g, ''))
        .then(lyrics => resolve({ type: 'text', info: `Topic: ${topic}\nGenre: ${genre}\nMood: ${mood}\n\n${lyrics}` }))
        .catch(err => {
            console.error(err);
            reject(err);
        })
})

const thisDoesntExist = (type, options) => new Promise(async (resolve, reject) => {
    let result = {};
    switch (type) {
        case 'person': result = await person(); break;
        case 'cat': result = await cat(); break;
        case 'horse': result = await horse(); break;
        case 'rental': result = await rental(); break;
        case 'waifu': result = await waifu(); break;
        case 'question': result = await question(); break;
        case 'chemical': result = await chemical(); break;
        case 'word': result = await word(); break;
        case 'city': result = await city(); break;
        case 'simpsons': result = await simpsons(); break;
        case 'art': result = await art(); break;
        case 'video': result = await video(); break;
        case 'ideas': result = await ideas(); break;
        case 'lyrics':
            let topic = options.t || options.topic || options.joinedText;
            let genre = options.g || options.genre;
            let mood = options.m || options.mood;
            result = await lyrics(topic, genre, mood);
            break;
        default:
            reject('NOT_LEGAL');
            break;

    }
    resolve(result);

})

module.exports = {
    thisDoesntExist
}