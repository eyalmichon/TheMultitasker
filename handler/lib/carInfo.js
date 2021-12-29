const { fetchJson } = require("../util/fetcher");

fields = {
    "mispar_rechev": "מספר רכב",
    "tozeret_cd": "קוד תוצר",
    "sug_degem": "סוג דגם",
    "tozeret_nm": "שם תוצר",
    "degem_cd": "קוד דגם",
    "degem_nm": "שם דגם",
    "ramat_gimur": "רמת גימור",
    "ramat_eivzur_betihuty": "רמת אבזור בטיחותי",
    "kvutzat_zihum": "קבוצת זיהום",
    "shnat_yitzur": "שנת יצור",
    "degem_manoa": "דגם מנוע",
    "mivchan_acharon_dt": "תאריך מבחן רכב (טסט)",
    "tokef_dt": "תוקף רישיון רכב",
    "baalut": "סוג בעלות",
    "misgeret": "מספר שילדה",
    "tzeva_cd": "מספר צבע",
    "tzeva_rechev": "צבע רכב",
    "zmig_kidmi": "מידות צמיג קדמי",
    "zmig_ahori": "מידות צמיג אחורי",
    "sug_delek_nm": "סוג דלק",
    "horaat_rishum": "מספר הוראת רישום",
    "moed_aliya_lakvish": "מועד עליה לכביש",
    "kinuy_mishari": "כינוי מסחרי",
    "tozeret_eretz_nm": "ארץ תוצר",
    "sug_delek_cd": "סוג דלק - קוד",
    "mishkal_kolel": "משקל כולל",
    "mida_zmig_kidmi": "מידות צמיג קדמי",
    "mida_zmig_ahori": "מידות צמיג אחורי",
    "kod_omes_zmig_kidmi": "קוד עומס צמיג קדמי",
    "kod_omes_zmig_ahori": "קוד עומס צמיג אחורי",
    "kod_mehirut_zmig_kidmi": "קור מהירות צמיג קדמי",
    "kod_mehirut_zmig_ahori": "קור מהירות צמיג אחורי",
    "nefach_manoa": "נפח מנוע",
    "hespek": "הספק מנוע"
}

const infoByCarNumber = (number) => new Promise(async (resolve, reject) => {
    console.log(`Getting car info for car number: ${number}`)

    const info = []
    // check validity of input.
    if (!parseInt(number) || number.length < 7 || 8 < number.length)
        reject('WRONG_LENGTH')

    // try to get car info.
    let json = await fetchJson(`https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-156f0677aff3&q=${number}`)

    if (json.result.records.length) {
        for (const [key, value] of Object.entries(json.result.records[0])) {
            if (!!fields[key] && !!value) info.push(`*${fields[key]}:* ${value}`)
        }
    }
    else {
        // try to get motorcycle info.
        json = await fetchJson(`https://data.gov.il/api/3/action/datastore_search?resource_id=bf9df4e2-d90d-4c0a-a400-19e15af8e95f&&q=${number}`)
        if (json.result.records.length) {
            for (const [key, value] of Object.entries(json.result.records[0])) {
                if (!!fields[key] && !!value) info.push(`*${fields[key]}:* ${value}`)
            }
        }
    }
    info.length ? resolve(info.join('\n')) : reject('NOT_FOUND')

})

module.exports = {
    infoByCarNumber
}