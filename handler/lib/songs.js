const { getFileSize } = require("../util/converter");
const { MAX_SIZE_ALLOWED } = require("../util/fetcher");
const { runPython } = require("../util/python/runPython");

const downloadSongs = (songs) => new Promise((resolve, reject) => {
    console.log(`Downloading the following songs: ${songs.join(', ')}`)
    return runPython('deemix/downloadSongs.py', songs)
        .then(fileNames => {
            if (fileNames.length === 0)
                return reject("NO_SONGS_FOUND");
            if (fileNames.includes('NO_ARL_FOUND'))
                return reject("NO_ARL_FOUND");
            if (fileNames.includes('GENERATION_ERROR'))
                return reject("GENERATION_ERROR");
            const result = {}
            result.filePaths = fileNames.trim().split(/\r?\n/);
            // check file size for all files
            result.filePaths = result.filePaths.filter(filePath => {
                const fileSize = getFileSize(filePath);
                if (fileSize > MAX_SIZE_ALLOWED) {
                    console.error(`File ${filePath} is too big (${fileSize} bytes).`);
                    return false;
                }
                return true;
            });

            result.fileNames = result.filePaths.map(filePath => filePath.split(/[\\/]/).pop());
            return resolve(result);
        })
        .catch(err => {
            console.error(err)
            reject(err)
        })
})

module.exports = {
    downloadSongs
}