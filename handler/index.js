const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const fs = require("fs");
var Hjson = require('hjson');

// file for all senders sorted by use reason. should look something like this:
// {"Me": "","RedAlerts MessageOnly": [],"RedAlerts":[]}
var senders = Hjson.parse(fs.readFileSync(__dirname + '/senders.hjson', 'utf8'));
var map = fs.readFileSync(__dirname + '/map.html', 'utf8');
const json = require('./cities.json');

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

// funtion that implements sleep for async functions.
async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

async function redAlerts(client) {
    var activateRedAlerts = true;
    // ID for previous alert.
    var prevID = 0;

    // site for fetching json data.
    const redAlertsURL = 'https://www.tzevaadom.co.il/WarningMessages/Alert/alerts.json';

    var requestOptions = {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://www.oref.org.il/'
        },
        body: null
    };


    while (activateRedAlerts) {
        // fetch the json file from the official servers.
        let rawData = await fetch(redAlertsURL, requestOptions);
        try {

            let data = await rawData.json();
            if (prevID != data.id) {

                prevID = data.id;
                let cities = findCities(data.data);
                var alert = "🔴 אזעקת צבע אדום:\n\n" + getDateTime() + "\n\n";

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
                senders["RedAlerts MessageOnly"].forEach(groupM => {
                    client.sendText(groupM, alert);

                })
                // only send an image if there is more than one city.
                if (data.data.length > 1) {
                    puppeteer.launch().then(async browser => {
                        const page = await browser.newPage();
                        page.setViewport({ width: 500, height: 500 });
                        let mapCpy = map.replace('LONG_LAT_AREA', getLongLat(data.data));
                        await page.setContent(mapCpy);
                        var base64 = await page.screenshot({ encoding: "base64" });
                        // send to all group memebers
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
        } catch (error) {
            // console.log(error);
        }

        // sleep for 1 second between checking for alerts.
        await sleep(1000);
    }
}

module.exports = msgHandler = async (client) => {
    await redAlerts(client);
    // client.onAnyMessage(message => {
    //     // // Cut message Cache if cache more than 3K
    //     // client.getAmountOfLoadedMessages().then((msg) => (msg >= 3000) && client.cutMsgCache())
    // });
}