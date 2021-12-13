const { fetchJson } = require("../util/fetcher")
const bodies = ['square', 'mosaic', 'dot', 'circle', 'circle-zebra', 'circle-zebra-vertical', 'circular',
    ' edge-cut', 'edge-cut-smooth', 'japnese', 'leaf', 'pointed', 'pointed-edge-cut', 'pointed-in', 'pointed-in-smooth',
    'pointed-smooth', 'round', ' rounded-in', 'rounded-in-smooth', 'rounded-pointed', 'star', 'diamond']

const isValidColor = (color) => color?.length < 7 && /([0-9a-fA-F])$/g.test(color)
const isBetween = (n, min, max) => parseInt(n) && min <= n && n <= max
const addZero = (string) => ('0' + string).slice(-2)

function createDataString(options) {
    let text = ''
    const splitted = options.data.split('|')
    switch (options.type) {
        case 'email':
            text = 'mailto:'
            // 0 - Email
            text += splitted[0]?.includes('@') ? splitted[0] : 'example@mail.com'
            // 1 - Subject
            text += '?subject=' + (splitted[1] || 'Subject')
            // 2 - Message body
            text += '&body=' + (splitted[2] || 'Message')
            break;
        case 'phone':
            text = `tel:${options.data}`;
            break;
        case 'sms':
            text = 'SMSTO:'
            text += splitted[0] || '1234'
            text += ':' + (splitted[1] || 'Message')
            break;
        case 'contact':
            text = 'BEGIN:VCARD\\nVERSION:3.0\\n';
            // 0 - First name | 1 - Last name
            text += `N:${(splitted[1] || '')};${(splitted[0] || '')}\\n`
            text += `FN:${(splitted[0] || '')} ${(splitted[1] || '')}\\n`
            // 2 - Position
            if (!!splitted[2]) text += `TITLE:${splitted[2]}\\n`
            // 3 - Organization
            if (!!splitted[3]) text += `ORG:${splitted[3]}\\n`
            // 4- Website
            if (!!splitted[4]) text += `URL:${splitted[4]}\\n`
            // 5 - Email
            if (!!splitted[5]) text += `EMAIL;TYPE=INTERNET:${splitted[5]}\\n`
            // 6 - Work phone
            if (!!splitted[6]) text += `TEL;TYPE=voice,work,pref:${splitted[6]}\\n`
            // 7 - Home phone
            if (!!splitted[7]) text += `TEL;TYPE=voice,home,pref:${splitted[7]}\\n`
            // 8 - Mobile phone
            if (!!splitted[8]) text += `TEL;TYPE=voice,cell,pref:${splitted[8]}\\n`
            // 9 - Fax work
            if (!!splitted[9]) text += `TEL;TYPE=fax,work,pref:${splitted[9]}\\n`
            // 10 - Fax home
            if (!!splitted[10]) text += `TEL;TYPE=fax,home,pref:${splitted[10]}\\n`
            // 11 - Street | 12 - City | 13 - State | 14 - Zip code | 15 - Country
            if (!!splitted[11] || !!splitted[12] || !!splitted[13] || !!splitted[14] || !!splitted[15]) text += `ADR;;${(splitted[11] || '')};${(splitted[12] || '')};${(splitted[13] || '')};${(splitted[14] || '')};${(splitted[15] || '')}\\n`
            text += 'END:VCARD'
            break;
        case 'wifi':
            // 0 - Wifi name | 1 - Password Type: WEP or WPA | 2 - Password
            text = `WIFI:S:${(splitted[0] || 'WifiName')};T:${(splitted[1] || 'nopass')};P:${(splitted[2] || '')};;`;
            break;
        case 'event':
            const dt = new Date()
            text = 'BEGIN:VEVENT\\n';
            // 0 - Event title
            text += `SUMMARY:${splitted[0] || ''}\\n`;
            // 1 - Event location
            text += `LOCATION:${splitted[1] || ''}\\n`;
            // 2 - Start date: YYYY/MM/DD or YYYY.MM.DD or YYYY\MM\DD | 3 - HH:MM
            text += `DTSTART:${splitted[2]?.replace(/[./\\]/g, '') || `${dt.getFullYear()}${addZero(dt.getMonth())}${addZero(dt.getDay())}`}T${splitted[3]?.replace(/[:]/g, '') || `${addZero(dt.getHours())}${addZero(dt.getMinutes())}00`}\\n`;
            // 4 - End date: YYYY/MM/DD or YYYY.MM.DD or YYYY\MM\DD | 5 - HH:MM
            text += `DTEND:${splitted[4]?.replace(/[./\\]/g, '') || `${dt.getFullYear()}${addZero(dt.getMonth())}${addZero(dt.getDay())}`}T${splitted[5]?.replace(/[:]/g, '') || `${addZero(dt.getHours())}${addZero(dt.getMinutes())}00`}\\n`;
            text += 'END:VEVENT';
            break;
        case 'crypto':
            const type = ['bitcoin', 'bitcoincash', 'ethereum', 'litecoin', 'dash'].includes(options.coin) ? options.coin : 'bitcoin'
            // 0 - Address | 1 - Amount
            text = `${type}:${splitted[0]}?amount=${parseInt(splitted[1]) || 1}`
            break;
        case 'wa':
            // 0 - Number | 1 - Message
            text = `https://wa.me/${splitted[0] || '1234'}/?text=${encodeURI(splitted[1]) || 'hey'}`
        case 'text':
        default:
            text = options.data || 'empty';
            break;
    }
    return text

}


/**
 * Get a qr code for different options from qrcode monkey's api.
 * @param {Object} options 
 * @returns link to qr code as a png/svg/pdf/eps.
 */
const qr = (options) => new Promise(async (resolve, reject) => {
    const file = ['png', 'svg', 'pdf', 'eps'].includes(options?.file) ? options.file : 'png'
    const size = isBetween(options.size, 300, 2000) ? parseInt(options.size) : 1000

    const body = bodies.includes(options.body) ? options.body : 'square'
    // frame with a number between 0-16 concatenated to it.
    const eye = isBetween(options.eye, 0, 16) ? 'frame' + options.eye : 'frame0'
    // ball with a number between 0-19 concatenated to it.
    const eyeBall = isBetween(options.eyeball, 0, 19) ? 'ball' + options.eyeball : 'ball0'  // 0-19
    // create data string object by options.type.
    const data = createDataString(options)

    // logo of the multitasker path on the servers.
    const logo = options?.logo == 'false' ? '' : '39e6f3331508880188f3e543e504351d2b425df7.png'
    const logoMode = options?.logomode == 'clean' ? 'clean' : 'default'

    const bodyColor = isValidColor(options.bodycolor) ? options.bodycolor : '000000'
    const bgColor = isValidColor(options.bgcolor) ? options.bgcolor : 'FFFFFF'

    let eye1Color = isValidColor(options.eye1color) ? options.eye1color : '000000'
    let eye2Color = isValidColor(options.eye2color) ? options.eye2color : '000000'
    let eye3Color = isValidColor(options.eye3color) ? options.eye3color : '000000'
    if (!!options.eyescolor && isValidColor(options.eyescolor)) eye1Color = eye2Color = eye3Color = options.eyescolor

    let eyeBall1Color = isValidColor(options.eyeball1color) ? options.eyeball1color : 'e7007c'
    let eyeBall2Color = isValidColor(options.eyeball2color) ? options.eyeball2color : 'e7007c'
    let eyeBall3Color = isValidColor(options.eyeball3color) ? options.eyeball3color : 'e7007c'
    if (!!options.eyeballscolor && isValidColor(options.eyeballscolor)) eyeBall1Color = eyeBall2Color = eyeBall3Color = options.eyeballscolor

    let gradientColor1 = isValidColor(options.gradientcolor1) ? `"#${options.gradientcolor1}"` : null
    let gradientColor2 = isValidColor(options.gradientcolor2) ? `"#${options.gradientcolor2}"` : null
    if (!!gradientColor1 || !!gradientColor2) {
        if (!gradientColor1) gradientColor1 = `"#000000"`
        if (!gradientColor2) gradientColor2 = `"#000000"`
    }
    const gradientType = ['linear', 'radial'].includes(options?.gradienttype) ? options.gradienttype : 'linear'
    const gradientOnEyes = options?.gradientoneyes == 'true' ? 'true' : 'false'


    return fetchJson("https://api.qrcode-monkey.com/qr/custom", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,he;q=0.8",
            "content-type": "text/plain;charset=UTF-8",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "Referer": "https://www.qrcode-monkey.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `{\
                    "data":"${data}",\
                    "config":{\
                        "body":"${body}",\
                        "eye":"${eye}",\
                        "eyeBall":"${eyeBall}",\
                        "bodyColor":"#${bodyColor}",\
                        "bgColor":"#${bgColor}",\
                        "eye1Color":"#${eye1Color}",\
                        "eye2Color":"#${eye2Color}",\
                        "eye3Color":"#${eye3Color}",\
                        "eyeBall1Color":"#${eyeBall1Color}",\
                        "eyeBall2Color":"#${eyeBall2Color}",\
                        "eyeBall3Color":"#${eyeBall3Color}",\
                        "gradientColor1":${gradientColor1},\
                        "gradientColor2":${gradientColor2},\
                        "gradientType":"${gradientType}",\
                        "gradientOnEyes":${gradientOnEyes},\
                        "logo":"${logo}",\
                        "logoMode":"${logoMode}"},\
                        "size":${size},\
                        "download": "imageUrl",\
                        "file":"${file}"}`,
        "method": "POST"
    })
        .then(json => resolve('https://' + json.imageUrl.substring(2)))
        .catch(err => {
            console.error(err);
            reject(err);
        })

})

module.exports = {
    qr
}