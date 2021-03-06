const { fetchJson } = require('../util/fetcher');
const { Covid } = require('../util/config.json');
const { isInt } = require('../util/utilities');

/**
* more options from the API:
* "body": "{\"requests\":[{\"id\":\"0\",\"queryName\":\"externalLinks\",\"single\":false,\"parameters\":{}},
* {\"id\":\"1\",\"queryName\":\"infectedPerDate\",\"single\":false,\"parameters\":{}},
* {\"id\":\"2\",\"queryName\":\"updatedPatientsOverallStatus\",\"single\":false,\"parameters\":{}},
* {\"id\":\"3\",\"queryName\":\"sickPerDateTwoDays\",\"single\":false,\"parameters\":{}},
* {\"id\":\"4\",\"queryName\":\"sickPatientPerLocation\",\"single\":false,\"parameters\":{}},
* {\"id\":\"5\",\"queryName\":\"patientsStatus\",\"single\":false,\"parameters\":{}},
* {\"id\":\"7\",\"queryName\":\"vaccinated\",\"single\":false,\"parameters\":{}},
* {\"id\":\"8\",\"queryName\":\"deadPatientsPerDate\",\"single\":false,\"parameters\":{}},
* {\"id\":\"9\",\"queryName\":\"testResultsPerDate\",\"single\":false,\"parameters\":{}},
* {\"id\":\"12\",\"queryName\":\"vaccinationsPerAge\",\"single\":false,\"parameters\":{}},
* {\"id\":\"14\",\"queryName\":\"infectionFactor\",\"single\":false,\"parameters\":{}},
* {\"id\":\"16\",\"queryName\":\"testsPerDate\",\"single\":false,\"parameters\":{}},
* {\"id\":\"19\",\"queryName\":\"patientsPerDate\",\"single\":false,\"parameters\":{}},
* {\"id\":\"23\",\"queryName\":\"averageInfectedPerWeek\",\"single\":false,\"parameters\":{}},
* {\"id\":\"24\",\"queryName\":\"researchGraph\",\"single\":false,\"parameters\":{}},
* {\"id\":\"25\",\"queryName\":\"infectedByPeriodAndAgeAndGender\",\"single\":false,\"parameters\":{}},
* {\"id\":\"26\",\"queryName\":\"HospitalBedStatusSegmentation\",\"single\":false,\"parameters\":{}},
* {\"id\":\"27\",\"queryName\":\"isolatedVerifiedDoctorsAndNurses\",\"single\":false,\"parameters\":{}},
* {\"id\":\"28\",\"queryName\":\"hospitalStatus\",\"single\":false,\"parameters\":{}},
* {\"id\":\"30\",\"queryName\":\"spotlightLastupdate\",\"single\":false,\"parameters\":{}},
* {\"id\":\"31\",\"queryName\":\"spotlightAggregatedPublic\",\"single\":true,\"parameters\":{}},
* {\"id\":\"34\",\"queryName\":\"spotlightPublic\",\"single\":false,\"parameters\":{}}]}",
*/
const endpoint = Covid.url;
const options = Covid.requestOptions;

/**
 * get information from the official API.
 * @param {*} days number of days to get, 1-7
 * @returns information about infected people on these days.
 */
const infected = (days = '1') => new Promise((resolve, reject) => {

    console.log(`looking for last ${days} days of Covid data...`);

    if (!isInt(days) || 0 >= days || days > 7)
        days = 1;
    fetchJson(endpoint, options).then(body => {

        let info = body[0].data;
        let activePatients = body[1].data;
        let text = `???? Active Cases: ${activePatients[0].amount + activePatients[1].amount}\n`;
        let finalText = [];
        for (let i = 0; i < days; i++) {
            let day = info.pop();
            text += (`??????? Date: ${day['date'].replace(/\T.*$/g, '')}\n???? Infected: ${day.amount}\n????????????? Recovered: ${day.recovered}\n???? Total Cases: ${day.sum}`);
            if (day.coronaEvents) text += (`\n??? Event: ${day.coronaEvents}`);
            finalText.push(text);
            text = '';
        }
        resolve(finalText.join('\n\n'));
    }).catch(err => {
        console.error(err);
        reject(err);
    });
});

module.exports = {
    infected
}