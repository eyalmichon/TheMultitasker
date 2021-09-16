const { fetcher } = require('../lib/index');
const FormData = require('form-data');
// must be before canvas.
const sharp = require('sharp');
const { createCanvas, loadImage, registerFont } = require('canvas')
const Color = require('color');
const { removebg } = require('./secrets.json');
const { isInt } = require('./utilities');
registerFont('./handler/util/fonts/SecularOne-Regular.ttf', { family: 'Secular' })
const MAX_WORDS = 500;


/**
 * helper function for stroke.
 * Using https://github.com/parmanoir/Meijster-distance
 * 
 * @param {*} binaryImage the image in binary form.
 * @param {*} width width of the picture.
 * @param {*} height height of the picture.
 * @returns array of distances.
 */
function computeDistances(binaryImage, width, height) {
    // First phase
    const infinity = width + height
    const b = binaryImage
    const g = new Array(width * height)
    for (let x = 0; x < width; x++) {
        if (b[x + 0 * width]) { g[x + 0 * width] = 0 } else {
            g[x + 0 * width] = infinity
        }
        // Scan 1
        for (let y = 1; y < height; y++) {
            if (b[x + y * width]) { g[x + y * width] = 0 } else {
                g[x + y * width] = 1 + g[x + (y - 1) * width]
            }
        }
        // Scan 2
        for (let y = height - 1; y >= 0; y--) {
            if (g[x + (y + 1) * width] < g[x + y * width]) {
                g[x + y * width] = 1 + g[x + (y + 1) * width]
            }
        }
    }

    // Euclidean
    function EDTFunc(x, i, gi) {
        return (x - i) * (x - i) + gi * gi
    }
    function EDTSep(i, u, gi, gu) {
        return Math.floor((u * u - i * i + gu * gu - gi * gi) / (2 * (u - i)))
    }

    // Second phase
    const dt = new Array(width * height)
    const s = new Array(width)
    const t = new Array(width)
    let q = 0
    let w = 0
    for (let y = 0; y < height; y++) {
        q = 0
        s[0] = 0
        t[0] = 0

        // Scan 3
        for (let u = 1; u < width; u++) {
            while (q >= 0 && EDTFunc(t[q], s[q], g[s[q] + y * width]) > EDTFunc(t[q], u, g[u + y * width])) {
                q--
            }
            if (q < 0) {
                q = 0
                s[0] = u
            } else {
                w = 1 + EDTSep(s[q], u, g[s[q] + y * width], g[u + y * width])
                if (w < width) {
                    q++
                    s[q] = u
                    t[q] = w
                }
            }
        }
        // Scan 4
        for (let u = width - 1; u >= 0; u--) {
            let d = EDTFunc(u, s[q], g[s[q] + y * width])
            d = Math.floor(Math.sqrt(d))
            dt[u + y * width] = d
            if (u === t[q]) {
                q--
            }
        }
    }

    return dt
}
/**
 * helper function for stroke.
 * 
 * @param {*} ctx canvas context
 * @param {*} threshold 
 * @returns 
 */
function toBinaryImage(ctx, threshold = 5) {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const data = ctx.getImageData(0, 0, width, height).data
    const binaryImage = new Uint8Array(width * height)
    for (let i = 0; i < data.length; i += 4) {
        const binary = data[i] < threshold ? 1 : 0
        binaryImage[i / 4] = 1 - binary
    }
    return binaryImage
}
/**
 * find the min size of font size and wrapping needed for the text.
 * @param {*} ctx canvas context.
 * @param {*} words array of words to check wraping for.
 * @param {*} fontSize the font size currently used.
 * @param {*} maxWidth the max width allowed.
 * @returns 
 */
function wrapLines(ctx, words, fontSize, maxWidth, maxRows) {
    ctx.font = `${fontSize}px Secular`
    let lines = [],
        space = ctx.measureText(' ').width,
        width = 0,
        line = '',
        word = '',
        len = words.length,
        w = 0,
        noFit = false,
        i;
    for (i = 0; i < len; i++) {
        word = words[i];
        w = word ? ctx.measureText(word).width : 0;
        if (w) {
            width += space + w;
        }
        if (w > maxWidth || word.length > 20) {
            lines.push(word);
        } else if (w && width < maxWidth) {
            line += (i ? ' ' : '') + word;
        } else {
            !i || lines.push(line !== '' ? line.trim() : '');
            line = word;
            width = w;
        }
    }
    if (len !== i || line !== '') {
        lines.push(line.trim());
    }
    if (words.length > MAX_WORDS || fontSize === 0)
        return { lines: lines, fontSize: 1 };
    lines.forEach(line => {
        if (ctx.measureText(line).width > maxWidth)
            noFit = true
    })
    // if the line doesn't fit inside the box of maxWidth or we have more than maxRows lines, 
    // call the function recursively with a smaller fontSize.
    if (noFit || lines.length > maxRows) {
        if (fontSize > 150)
            fontSize -= 10
        else if (fontSize > 100)
            fontSize -= 5
        else if (fontSize > 80)
            fontSize -= 1
        else
            fontSize -= 0.5

        return wrapLines(ctx, words, fontSize, maxWidth, maxRows)
    }
    return { lines: lines, fontSize: fontSize };
}
/**
 * helper function for addText.
 * @param {*} text text to return array for.
 * @returns array of words from text.
 */
function getWords(text) {
    return text.replace(/\n\n/g, ' ` ').replace(/(\n\s|\s\n)/g, '\r')
        .replace(/\s\s/g, ' ').replace('`', ' ').replace(/(\r|\n)/g, ' ' + ' ').split(' ')
}
/**
 * Trys to remove the background of a given buffer.
 * @param {*} buffer the buffer image string.
 * @param {*} options {bgurl: "[some image url]", bg: "[buffer of an image]"}
 * @returns buffer image without it's background OR it's background replaced with another.
 */
const removeBG = (buffer, options = {}) => new Promise((resolve, reject) => {
    console.log('Trying to remove background...');

    let form = new FormData();
    form.append('image_file', buffer)
    form.append('size', 'auto')
    if (!!options.bgurl) form.append('bg_image_url', options.bgurl)
    if (!!options.bg) form.append('bg_image_file', options.bg)

    let i = Math.floor(Math.random() * removebg.length)
    let randomKey = removebg[i]
    console.log(`Using key number ${i} in from the array.`)

    fetcher.fetchJson('https://api.remove.bg/v1.0/removebg', {
        method: "POST",
        body: form,
        headers: { 'X-Api-Key': randomKey, "Accept": "application/json" },
        encoding: null
    })
        .then(res => {
            if (res.errors) throw res.errors;

            resolve(new Buffer.from(res.data.result_b64, 'base64'));
        })
        .catch(err => {
            console.error(err);
            console.log('Trying another API...');
            fetcher.uploadImage(buffer)
                .then(imgLink => fetcher.fetchBase64('https://bg.experte.de/?url=' + imgLink))
                .then(base64 => resolve(new Buffer.from(base64, 'base64')))
                .catch(err => {
                    console.error(err);
                    reject(err);
                })
        })
})

/**
 * Add a stroke to an image that has transparent background.
 * See https://github.com/liajoy/image-stroke for more.
 * Options:
 *      thickness: the size of the stroke.
 *      color: the color of the stroke.
 *      alpha: the transparency of the stroke.
 * @param {*} buffer the buffer image string.
 * @param {*} options {size: "[0-10]", color: "[color name or #hex]", alpha: "[0-255]"}
 * @returns buffer image of the image with a stroke added.
 */
const addStroke = (buffer, options = {}) => new Promise((resolve, reject) => {
    console.log('Adding a stroke...')

    let thickness = options.size;
    let color = (options.color === undefined || options.color === true) ? 'white' : options.color;
    let alpha = options.alpha;

    if (!isInt(thickness) || thickness < 0 || 10 < thickness)
        thickness = '5';
    thickness *= 5;

    if (!isInt(alpha) || alpha < 0 || 255 < alpha)
        alpha = '255';

    try { color = Color(color) }
    catch { color = Color('white') }
    const colorArray = color.array().concat(color.alpha() * alpha)

    const canvas = createCanvas()
    const ctx = canvas.getContext('2d')

    return loadImage(buffer)
        .then(img => {
            const width = canvas.width = img.width
            const height = canvas.height = img.height

            ctx.drawImage(img, 0, 0)

            const binaryImage = toBinaryImage(ctx)
            const distances = computeDistances(binaryImage, canvas.width, canvas.height)
            const imageData = ctx.getImageData(0, 0, width + thickness, height + thickness)
            const { data } = imageData
            for (let i = 0; i < data.length; i += 4) {
                const distance = distances[i / 4]
                if (distance < thickness) {
                    [
                        data[i],
                        data[i + 1],
                        data[i + 2],
                        data[i + 3]
                    ] = colorArray
                }
            }
            ctx.putImageData(imageData, 0, 0)
            ctx.drawImage(img, 0, 0)

            const outBuffer = canvas.toBuffer('image/png')
            resolve(outBuffer);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })

})

/**
 * Add text to an image (top and bottom text).
 * Options:
 *      scolor: the color of the stroke.
 *      fcolor: the color of the text fill.
 *      fsize: the size of the font.
 *      rows: the max number of rows for the text.
 * @param {*} buffer the buffer image.
 * @param {*} options {scolor: "[color name or #hex]", fcolor: "[color name or #hex]", fsize: "[number]", rows: "[number]"}
 * @returns 
 */
const addText = (buffer, options = {}) => new Promise((resolve, reject) => {

    let textArray = options.joinedText.split('|');
    const topText = !!textArray[0] ? textArray[0].trim() : '';
    const bottomText = !!textArray[1] ? textArray[1].trim() : '';
    console.log(`Adding text... Got Top: ${topText}, and Bottom: ${bottomText}`)

    // color for stroke.
    let strokeColor = (options.scolor === undefined || options.scolor === true) ? 'black' : options.scolor;
    try { Color(strokeColor) }
    catch { strokeColor = 'black' }

    // color for fill.
    let fillColor = (options.fcolor === undefined || options.fcolor === true) ? 'white' : options.fcolor;
    try { Color(fillColor) }
    catch { fillColor = 'white' }

    // size of font.
    if (!isInt(options.fsize) || options.fsize < 1 || 1000 < options.fsize)
        options.fsize = false;

    // number of max rows for text. (max set to 6 but feel free to change it.)
    if (!isInt(options.rows) || options.rows < 1 || 6 < options.rows)
        options.rows = 3;

    const canvas = createCanvas()
    const ctx = canvas.getContext('2d')

    return loadImage(buffer)
        .then(img => {
            const width = canvas.width = img.width
            const height = canvas.height = img.height

            ctx.drawImage(img, 0, 0)
            ctx.strokeStyle = strokeColor;
            ctx.fillStyle = fillColor;
            ctx.lineJoin = "round";
            ctx.miterLimit = 2;
            ctx.textAlign = 'center'

            // calculate base font size to start with.
            const baseFontSize = !!options.fsize ? options.fsize : Math.min(Math.floor(height / 5), Math.floor(width / 5));

            // top text.
            var { lines, fontSize } = wrapLines(ctx, getWords(topText), baseFontSize, width, options.rows)
            ctx.lineWidth = Math.floor(fontSize / 10) + 5;
            ctx.textBaseline = 'top';
            lines.forEach((line, i) => {
                ctx.strokeText(line, width / 2, fontSize * i)
                ctx.fillText(line, width / 2, fontSize * i)
            })

            // bottom text.
            var { lines, fontSize } = wrapLines(ctx, getWords(bottomText), baseFontSize, width, options.rows)
            ctx.lineWidth = Math.floor(fontSize / 10) + 5;
            ctx.textBaseline = 'bottom';
            // if there is more than one line, write in a loop in reverse.
            if (lines.length > 1)
                lines.reverse().forEach((line, i) => {
                    ctx.strokeText(line, width / 2, height - fontSize * i)
                    ctx.fillText(line, width / 2, height - fontSize * i)
                })
            // if there is no text, don't write.
            else if (!!lines.length) {
                ctx.strokeText(lines[0], width / 2, height)
                ctx.fillText(lines[0], width / 2, height)
            }

            const outBuffer = canvas.toBuffer('image/png')
            resolve(outBuffer);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })

})



module.exports = {
    removeBG,
    addStroke,
    addText,
    sharp
}