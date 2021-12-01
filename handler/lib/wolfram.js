const puppeteer = require('puppeteer');
const { query } = require("mathram");
const fs = require('fs')
const path = require('path');
var wolfHTML = fs.readFileSync(path.join(__dirname, '../util/wolfram/wolf.html'), 'utf8');

/**
 * Get the first answer that shows up in wolfram.
 * @param {*} question 
 * @returns 
 */
const getAnswer = (question) => new Promise((resolve, reject) => {

    console.log(`getting an answer from WolframAlpha to: ${question}`);

    query(question)
        .then(answer => {
            if (!answer.queryresult.success) throw 'NO_RESULT';
            resolve({ text: answer.queryresult.pods[1].subpods[0].plaintext, img: answer.queryresult.pods[1].subpods[0].img.src, })
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
})

/**
 * Create a section for the HTML.
 * @param {*} title 
 * @param {*} img 
 * @returns 
 */
function addSection(title, img) {
    return `<section class="sections">
    <header>
        <h2>${title}</h2>
    </header>
    <div class="dataSection">
        <img
            src="${img}">
    </div>
</section>`
}
function addSectionTitle(title) {
    return `<section class="sections">
    <header>
        <h2>${title}</h2>
    </header>
</section>`
}
/**
 * Create a subsection for the HTML.
 * @param {*} title 
 * @param {*} img 
 * @returns 
 */
function addSubSection(title, img) {
    if (title)
        return `<section class="sections">
    <div class="sections"><span class="subSecWithTitle">
                <h2>${title}</h2>
            </span></div>
    <div class="dataSection">
        <img
            src="${img}">
    </div>
</section>`
    else
        return `<section class="sections">
<div class="dataSection">
    <img
        src="${img}">
</div>
</section>`
}
/**
 * Join the subsections together.
 * @param {*} subSections 
 * @returns 
 */
function joinSubSections(subSections) {
    return subSections.join(`<hr class="horizontalRule">`);
}

/**
 * Used for creating the html page from the given sections info.
 * @param {Array} pods the array of sections.
 * @returns 
 */
function toSections(pods) {
    let final = '';
    let maxWidth = 0;
    pods.forEach(pod => {
        let subpods = pod.subpods;

        let title = pod.title;
        if (pod.subpods.length > 1) {
            let subSections = [];
            let firstSub = subpods.shift();
            subSections.push(addSectionTitle(title) + addSubSection(firstSub.title, firstSub.img.src));
            pod.subpods.forEach(info => {
                // find the max width.
                if (info.img.width > maxWidth) maxWidth = info.img.width;

                subSections.push(addSubSection(info.title, info.img.src))
            })
            final += joinSubSections(subSections);
        }
        else {
            // find the max width.
            if (subpods[0].img.width > maxWidth) maxWidth = subpods[0].img.width;
            final += addSection(title, subpods[0].img.src);
        }
    })
    return { maxWidth: maxWidth, final: final };
}
/**
 * Mimic the HTML on WolframAlpha to get the same result view, to show all of the results together.
 * @param {*} question 
 * @returns base64 of the image.
 */
const getFullAnswer = (question) => new Promise((resolve, reject) => {

    console.log(`getting a full answer from WolframAlpha to: ${question}`);

    query(question)
        .then(answer => {
            if (!answer.queryresult.success) throw 'NO_RESULT';

            let { final, maxWidth } = toSections(answer.queryresult.pods);

            if (maxWidth < 600) maxWidth = 600;

            puppeteer.launch().then(async browser => {
                const page = await browser.newPage();

                page.setViewport({ width: maxWidth + 16, height: 100 });

                let wolfHTMLCpy = wolfHTML.replace('SECTIONS_PLACE', final).replace('MAX_WIDTH', maxWidth.toString());
                // set contents of the page.
                await page.setContent(wolfHTMLCpy);
                // save image in base64.
                let base64 = await page.screenshot({ encoding: "base64", fullPage: true });

                await browser.close();
                resolve(base64);
            });
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
})



module.exports = {
    getAnswer,
    getFullAnswer
}