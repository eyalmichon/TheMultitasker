/**
* Make text bold.
* @param {String} string 
* @returns 
*/
const b = (string) => { return `*${string}*` }

/**
 * Make text monospace.
 * @param {String} string 
 * @returns 
 */
const m = (string) => { return `\`\`\`${string}\`\`\`` }

/**
 * Make text italic.
 * @param {String} string 
 * @returns 
 */
const i = (string) => { return `_${string}_` }

module.exports = {
    b, m, i
}