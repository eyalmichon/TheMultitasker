/**
 * Removes a given item from the array.
 * 
 * @param {Array} array the array from which you want to remove the element from.
 * @param {*} element the element to remove.
 * @returns array without the element.
 */
const removeFromArray = (array, element) => {
    return array.filter(item => item !== element);
}

/**
 * This method works by splitting the string into an array using the spread operator, 
 * and then uses the every() method to test whether all elements (characters) in the 
 * array are included in the string of digits '0123456789'.
 * @param {String} string the string to check if is integer.
 * @returns true if the string is an integer.
 */
const isInt = string => !!parseInt(string) && [...string].every(c => '0123456789'.includes(c));

module.exports = {
    removeFromArray,
    isInt
}