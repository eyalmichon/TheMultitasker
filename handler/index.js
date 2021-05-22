const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const fs = require("fs");
var Hjson = require('hjson');
const AbortController = require('abort-controller');
const sendersFileName = __dirname + '/senders.json';
const configFileName = __dirname + '/config.hjson';
// file for all senders sorted by use reason. should look something like this:
// {"Me": "","RedAlerts MessageOnly": [],"RedAlerts":[]}
var senders = JSON.parse(fs.readFileSync(sendersFileName, 'utf8'));
// file for all configurations.
var config = Hjson.parse(fs.readFileSync(configFileName, 'utf8'));
var map = fs.readFileSync(__dirname + '/map.html', 'utf8');
const json = require('./cities.json');
// boolean switch for RedAlerts
var RedAlertsActivated = false;

// get an array of longitude and latitude of the given cities from the json file.
function getLongLat(cities) {
    longLatArr = [];
    cities.forEach(city => {
        cityData = json[city];
        if (cityData != undefined) {
            longLatArr.push('[' + cityData.lat + ',' + cityData.lng + ']');

        }
    });
    return longLatArr.join(',');
}
// get an of all cities organized into their zones.
function findCities(cities) {
    // init an empty dictionary.
    let info = {};
    // go over all the cities given.
    cities.forEach(city => {
        // get city data from json file.
        cityData = json[city];
        // if the city's zone isn't in the dictionary
        if (!info[cityData.zone])
            // add an empty array with the zone as a key.
            info[cityData.zone] = [];
        // add the city name into the array of the zone's key
        info[cityData.zone].push(cityData.name)
    });
    return info;
}
// a 0 from left if needed (to date and time)
function addZero(string) {
    return ("0" + string).slice(-2);
}
// get the date and time of day.
function getDateTime() {
    let date_ob = new Date();
    // adjust 0 before single digit date
    let date = addZero(date_ob.getDate());
    // current month
    let month = addZero(date_ob.getMonth() + 1);
    // current year
    let year = date_ob.getFullYear();
    // current hours
    let hours = addZero(date_ob.getHours());
    // current minutes
    let minutes = addZero(date_ob.getMinutes());
    // current seconds
    let seconds = addZero(date_ob.getSeconds());
    // prints date & time in YYYY-MM-DD HH:MM:SS format
    return date + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds;
}
// check if we got a correct number, this is the best we can do i guess...
function isCorrectNumber(num) {
    return num.startsWith('972') && (num.endsWith('@c.us') || num.endsWith('@g.us') && (num.length === 17 || num.length === 28))

}
function removeFromArray(array, element) {
    return array.filter(item => item !== element);
}
function addSender(group, number) {
    if (senders[group] === undefined || !isCorrectNumber(number) || group === 'Me')
        return false;
    if (!senders[group].includes(number)) {
        senders[group].push(number);
        fs.writeFileSync(sendersFileName, JSON.stringify(senders));
    }
    return true;
}

function removeSender(group, number) {
    if (senders[group] === undefined || !isCorrectNumber(number) || group === 'Me')
        return false;
    if (senders[group].includes(number)) {
        senders[group] = removeFromArray(senders[group], number);
        fs.writeFileSync(sendersFileName, JSON.stringify(senders));
    }
    return true;
}
// funtion that implements sleep for async functions.
async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

// use fetch function with a timeout so if it's stuck we can can abort it.
async function fetchWithTimeout(url, requestOptions, timeout) {
    const controller = new AbortController();
    // add a timeout of 1 second for fetch
    const id = setTimeout(() => controller.abort(), timeout);
    // add signal object for requestOptions
    requestOptions.signal = controller.signal

    const response = await fetch(url, requestOptions);
    clearTimeout(id);

    return response;
}

async function redAlerts(client) {
    // ID for previous alert.
    let prevID = 0;
    let prevJson = {};
    // site for fetching json data.
    const redAlertsURL = config["RedAlertsURL"];

    let requestOptions = {
        method: 'GET',
        headers: config["RedAlertsRequestOptions"]
    };


    while (RedAlertsActivated) {
        try {
            // fetch the json file from the official servers.
            let response = await fetchWithTimeout(redAlertsURL, requestOptions, 4000);
            let length = await response.headers.get('content-length');
            if (length > 0) {
                let data = await response.json();
                if (prevID != data.id && prevJson != prevJson) {

                    prevID = data.id;
                    prevJson = data;
                    let cities = findCities(data.data);
                    let alert = "🔴 אזעקת צבע אדום:\n\n" + getDateTime() + "\n\n";

                    for (const [area, city] of Object.entries(cities)) {
                        firstCity = json[city[0]];
                        if (firstCity == undefined)
                            continue;
                        if (firstCity.countdown > 60)
                            alert += "*• " + area + ":* " + city.join(', ') + " (" + firstCity.time + ")\n\n";
                        else
                            alert += "*• " + area + ":* " + city.join(', ') + " (" + firstCity.countdown + " שניות)\n\n";
                    }
                    // console.log(prevID, data.title, cities);
                    alert += "```בוט שומר החומות```";

                    // send to groups only alert without image.
                    senders["RedAlerts-MessageOnly"].forEach(groupM => {
                        client.sendText(groupM, alert);
                    })

                    // only send an image if there is more than one city.
                    if (data.data.length > 1) {
                        puppeteer.launch().then(async browser => {
                            const page = await browser.newPage();
                            page.setViewport({ width: 500, height: 500 });
                            let mapCpy = map.replace('LONG_LAT_AREA', getLongLat(data.data));
                            // set contents of the page.
                            await page.setContent(mapCpy);
                            // save image in base64.
                            var base64 = await page.screenshot({ encoding: "base64" });
                            // send to all group memebers.
                            senders["RedAlerts"].forEach(async groupM => {
                                await client.sendImage(groupM, `data:image/png;base64,${base64}`, '', alert);
                            });
                            await browser.close();
                        });
                    }
                    else {
                        senders["RedAlerts"].forEach(groupM => {
                            client.sendText(groupM, alert);
                        });
                    }

                }
            }

        } catch (error) {
            console.log('fetch timed out!\nError was: ' + error);
        }

        // sleep for 1 second between checking for alerts.
        await sleep(1000);
    }
}

module.exports = msgHandler = async (client, message) => {
    const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, isGif, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message;
    let { body } = message;
    const prefix = '!';
    // get the command from the body sent.
    const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
    // for checking if the body starts with our bot prefix
    const isCmd = body.startsWith(prefix)
    // Return if it's not a command.
    if (!isCmd) return;
    // get the next arg after the command.
    const arg = body.substring(body.indexOf(' ') + 1);
    // split the body content into args.
    const args = body.trim().split(/ +/).slice(1);


    switch (command) {
        case 'addsender':
            if (from === senders["Me"] && addSender(args[0], args[1]))
                client.sendText(from, "📧 Sender has been *added* to senders json");
            else
                client.sendText(from, "📛 Group name or number given was *incorrect!* [Are you the master of the bot?!?]");
            break;
        case 'rmvsender':
            if (from === senders["Me"] && removeSender(args[0], args[1]))
                client.sendText(from, "📧 Sender has been *removed* from senders json");
            else
                client.sendText(from, "📛 Group name or number given was *incorrect!* [Are you the master of the bot?!?]");
            break;
        case 'redalerts':
            if (arg === 'on') {
                if (RedAlertsActivated)
                    client.sendText(from, "🚨 Red Alerts *already* activated!");
                else {
                    RedAlertsActivated = true;
                    client.sendText(from, "🚨 Red Alerts has been *activated!*");
                    redAlerts(client);
                }
            }
            if (arg === 'off') {
                if (RedAlertsActivated) {
                    RedAlertsActivated = false;
                    client.sendText(from, "🚨 Red Alerts has been *deactivated!*");
                }
                else
                    client.sendText(from, "🚨 Red Alerts *already* deactivated!");
            }

            break;

        default:
            break;
    }

}