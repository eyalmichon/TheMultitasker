const { spawn } = require('child_process')
const { join } = require('path')
const filesPath = join(__dirname, 'files')

// function for removing everything after a certain character
function removeAfter(str) {
    [';', '(', ')', '&', '&&', ',', '||'].forEach(char => {
        let index = str.indexOf(char)
        if (index > -1)
            str = str.substring(0, index)
    })
    return str
}

/**
 * Run a python script using a given path and arguments and return the output.
 * @param {String} fileName The name of the python script.
 * @param {Array} args The arguments to pass to the script.
 * @returns {String} The output of the script.
 */
const runPython = (fileName, args) => new Promise((resolve, reject) => {
    // Remove any attempts to execute a malicious command.
    args = args.map(arg => removeAfter(arg))
    const pythonProcess = spawn('python', [join(filesPath, fileName), ...args])
    let output = ''
    pythonProcess.stdout.on('data', (data) => {
        output += data
    })
    pythonProcess.stderr.on('data', (data) => {
        console.error(data.toString())
    })
    pythonProcess.on('close', (code) => {
        if (code === 0) resolve(output.toString())
        else reject(code)
    })
})


module.exports = {
    runPython
}
