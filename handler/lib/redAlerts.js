const { fetchWithTimeout } = require('../util/fetcher')
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const config = require('../util/config.json');
const json = require('../util/redAlerts/cities.json');

var map = fs.readFileSync(path.join(__dirname, '../util/redAlerts/map.html'), 'utf8');
var isActivated = config.RedAlerts.Activated;

/**
 * Change the isActivated state from true to false or the other way around.
 * @param {boolean} bool 
 */
const changeState = (bool) => {
    isActivated = config.RedAlerts.Activated = bool;
    fs.writeFileSync(path.join(__dirname, '../util/config.json'), JSON.stringify(config))
}
/**
 * Get the current state of isAvtivated.
 * @returns returns the state of isActivated.
 */
const getState = () => { return isActivated; }

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
    return ('0' + string).slice(-2);
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
    return date + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
}

// funtion that implements sleep for async functions.
async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}
/**
 * Function is in charge of fetching alerts for red alerts 
 * and sending them with a map or without it.
 * @param client the wa automate client.
 * @param getGroup the senders group JSON object
 */
const alerts = async (client, getGroup) => {

    // ID for previous alert.
    let prevID = 0;
    let prevJson = {};
    // url for fetching json data.
    const redAlertsURL = config.RedAlerts.url;

    let requestOptions = {
        method: 'GET',
        headers: config.RedAlerts.requestOptions
    };


    while (isActivated) {
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
                    getGroup('RedAlerts-MessageOnly').forEach(groupM => {
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
                            getGroup('RedAlerts').forEach(async groupM => {
                                await client.sendImage(groupM, `data:image/png;base64,${base64}`, '', alert);
                            });
                            await browser.close();
                        });
                    }
                    else {
                        getGroup('RedAlerts').forEach(groupM => {
                            client.sendText(groupM, alert);
                        });
                    }
                }
            }

        } catch (error) {
            console.log('Fetch timed out!\nError was: ' + error);
        }

        // sleep for 1 second between checking for alerts.
        await sleep(1000);
    }
}

module.exports = {
    alerts,
    changeState,
    getState
}