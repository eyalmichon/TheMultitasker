const { fetchText } = require('../util/fetcher');
const { Covid } = require('../util/config.json');
const { randomUserAgent } = require('../util/utilities');
const cheerio = require('cheerio');

const BASE_URL = Covid.url;
const options = { "User-Agent": randomUserAgent() };
const countries = [
    "afghanistan", "albania", "algeria", "andorra", "angola", "anguilla", "antigua-and-barbuda",
    "argentina", "armenia", "aruba", "australia", "austria", "azerbaijan", "bahamas", "bahrain",
    "bangladesh", "barbados", "belarus", "belgium", "belize", "benin", "bermuda", "bhutan", "bolivia",
    "bosnia-and-herzegovina", "botswana", "brazil", "british-virgin-islands", "brunei-darussalam", "bulgaria",
    "burkina-faso", "burundi", "cabo-verde", "cambodia", "cameroon", "canada", "caribbean-netherlands",
    "cayman-islands", "central-african-republic", "chad", "channel-islands", "chile", "china", "china-hong-kong-sar",
    "china-macao-sar", "colombia", "congo", "costa-rica", "cote-d-ivoire", "croatia", "cuba", "curacao", "cyprus",
    "czech-republic", "democratic-republic-of-the-congo", "denmark", "djibouti", "dominica", "dominican-republic",
    "ecuador", "egypt", "el-salvador", "equatorial-guinea", "eritrea", "estonia", "ethiopia", "faeroe-islands",
    "falkland-islands-malvinas", "fiji", "finland", "france", "french-guiana", "french-polynesia", "gabon",
    "gambia", "georgia", "germany", "ghana", "gibraltar", "greece", "greenland", "grenada", "guadeloupe",
    "guatemala", "guinea", "guinea-bissau", "guyana", "haiti", "holy-see", "honduras", "hungary", "iceland",
    "india", "indonesia", "iran", "iraq", "ireland", "isle-of-man", "israel", "italy", "jamaica", "japan",
    "jordan", "kazakhstan", "kenya", "kuwait", "kyrgyzstan", "laos", "latvia", "lebanon", "liberia",
    "libya", "liechtenstein", "lithuania", "luxembourg", "macedonia", "madagascar", "malawi", "malaysia",
    "maldives", "mali", "malta", "martinique", "mauritania", "mauritius", "mayotte", "mexico", "moldova",
    "monaco", "mongolia", "montenegro", "montserrat", "morocco", "mozambique", "myanmar", "namibia", "nepal",
    "netherlands", "new-caledonia", "new-zealand", "nicaragua", "niger", "nigeria", "norway", "oman", "pakistan",
    "panama", "papua-new-guinea", "paraguay", "peru", "philippines", "poland", "portugal", "qatar", "reunion",
    "romania", "russia", "rwanda", "saint-barthelemy", "saint-kitts-and-nevis", "saint-lucia", "saint-martin",
    "saint-vincent-and-the-grenadines", "san-marino", "saudi-arabia", "senegal", "serbia", "seychelles",
    "sierra-leone", "singapore", "sint-maarten", "slovakia", "slovenia", "somalia", "south-africa",
    "south-korea", "spain", "sri-lanka", "state-of-palestine", "sudan", "suriname", "swaziland",
    "sweden", "switzerland", "syria", "taiwan", "tanzania", "thailand", "timor-leste", "togo",
    "trinidad-and-tobago", "tunisia", "turkey", "turks-and-caicos-islands", "uganda", "uk", "ukraine",
    "united-arab-emirates", "uruguay", "us", "uzbekistan", "venezuela", "viet-nam", "zambia", "zimbabwe"
]

/**
     * get information from the official API.
     * @param {*} days number of days to get, 1-7
     * @param {*} country country to get data from.
     * @returns information about infected people on these days.
     */
const infected = (days = '1', country = 'israel') => new Promise((resolve, reject) => {
    console.log(`looking for last ${days} days of Covid data in ${country}...`);

    if (!parseInt(days) || 0 >= days || days > 7)
        days = 1;

    if (!countries.includes(country))
        country = 'israel'

    return fetchText(`${BASE_URL}/coronavirus/country/${country}/`, options)
        .then(body => {
            const $ = cheerio.load(body);

            const img = `${BASE_URL}` + $('h1 div img').attr('src');
            const tempCases = $('div#maincounter-wrap').eq(0).text().split(':')[1].trim();
            const cases = parseInt(tempCases.replace(/,/g, ''), 10);
            const tempDeaths = $('div#maincounter-wrap').eq(1).text().split(':')[1].trim();
            const deaths = parseInt(tempDeaths.replace(/,/g, ''), 10);
            const tempRecovered = $('div#maincounter-wrap').eq(2).text().split(':')[1].trim();
            const recovered = parseInt(tempRecovered.replace(/,/g, ''), 10);
            const activeCases = [];
            const closedCases = [];

            $('div .col-md-6').eq(0).each((i, el) => {
                const $element = $(el);
                const tempInfected = $element.find('div.number-table-main').text();
                const infected = parseInt(tempInfected.replace(/,/g, ''), 10);
                const tempInMidCondition = $element.find('span.number-table').eq(0).text();
                const inMidCondition = parseInt(tempInMidCondition.replace(/,/g, ''), 10);
                const tempCritical = $element.find('span.number-table').eq(1).text();
                const criticalStates = parseInt(tempCritical.replace(/,/g, ''), 10);

                activeCases.push({
                    infected,
                    inMidCondition,
                    criticalStates
                });
            });

            $('div .col-md-6').eq(1).each((i, el) => {
                const $element = $(el);
                const infected = $element.find('div.number-table-main').text();
                const casesWhichHadAnOutcome = parseInt(infected.replace(/,/g, ''), 10);
                const tempRecovered = $element.find('span.number-table').eq(0).text();
                const recovered = parseInt(tempRecovered.replace(/,/g, ''), 10);
                const tempDeaths = $element.find('span.number-table').eq(1).text();
                const deaths = parseInt(tempDeaths.replace(/,/g, ''), 10);

                closedCases.push({
                    casesWhichHadAnOutcome,
                    recovered,
                    deaths
                });
            });

            const last7Days = { dates: [], text: [] }

            const $last7Days = $('div .col-md-12').end()


            last7Days.dates.push($last7Days.find('.news_date').text().split(' ').slice(0, 2).join(' '))

            $last7Days.find('.news_li').each((i, el) => {
                last7Days.text.push($(el).text().replace(/in.*/, '').trim())
            })


            $last7Days.find('.btn.btn-light.date-btn').each((i, el) => {
                last7Days.dates.push($(el).text().trim())
            })

            const finalText = [];
            let byDays = [];
            for (let i = 0; i < days && i < last7Days.dates.length; i++)
                byDays.push(`📅 ${last7Days.dates[i]}: ${last7Days.text[i]}`)

            finalText.push(byDays.join('\n'))
            finalText.push(`🩺 Active Cases: ${cases - deaths - recovered}\n💀 Deaths: ${deaths}\n💪 Recovered: ${recovered}\n📈 Total Cases: ${cases}`)
            if (activeCases.length) finalText.push(`****** 🟢 Active Cases 🟢 ******\n🦠 Infected: ${activeCases[0].infected}\n🤕 In Mid Condition: ${activeCases[0].inMidCondition}\n🆘 Critical States: ${activeCases[0].criticalStates}`)
            if (closedCases.length) finalText.push(`****** 🔴 Closed Cases 🔴 ******\n🦸‍♂️ Recovered: ${closedCases[0].recovered}\n💀 Deaths: ${closedCases[0].deaths}\n📊 Cases Which Had An Outcome: ${closedCases[0].casesWhichHadAnOutcome}`)

            resolve({ text: finalText.join('\n\n'), img })
        })
        .catch(err => {
            console.error(err);
            reject(err);
        });
});

module.exports = {
    infected
}