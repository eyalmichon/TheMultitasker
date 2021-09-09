const fs = require('fs');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const tmpFolder = path.join(__dirname, '../tmp/');

const getRandomFileName = () => {
    var timestamp = new Date().toISOString().replace(/[-:.Z]/g, "");
    var random = ("" + Math.random()).substring(2, 6);
    var random_number = timestamp + random;
    return random_number;
}

/**
 * Append a string to file name.
 * @param {String} filename the original filename.
 * @param {String} string string to append.
 * @returns filename with added string.
 */
function appendToFilename(filename, string) {
    let dotIndex = filename.lastIndexOf(".");
    if (dotIndex == -1) return filename + string;
    else return filename.substring(0, dotIndex) + string + filename.substring(dotIndex);
}

/**
 * Merge video and audio into a new video file.
 * @param {String} videoPath Path to video file.
 * @param {String} audioPath Path to audio file.
 * @returns {Promise} Promise of output path of the merged video.
 */
const mergeVideoAudio = (videoPath, audioPath) => new Promise((resolve, reject) => {
    const outputPath = appendToFilename(videoPath, '_output');
    ffmpeg(videoPath)
        .addInput(audioPath)
        .addOutput(outputPath)
        .addOption(['-crf 30'])
        .videoCodec('libx264')
        .on('error', (err) => reject(err))
        .on('end', () => {
            fs.unlinkSync(videoPath);
            fs.unlinkSync(audioPath);
            resolve(outputPath)
        })
        .run()
});
/**
 * Shrink video in size.
 * @param {String} videoPath Path to video file.
 * @returns {Promise} Promise of output path of the shrinked video.
 */
const shrinkVideoSize = (videoPath) => new Promise((resolve, reject) => {
    const outputPath = appendToFilename(videoPath, '_output');
    ffmpeg(videoPath)
        .addOutput(outputPath)
        .addOption(['-crf 30'])
        .videoCodec('libx264')
        .on('error', (err) => reject(err))
        .on('end', () => {
            fs.unlinkSync(videoPath);
            resolve(outputPath);
        })
        .run();

});

const toMP3 = (audioPath) => new Promise((resolve, reject) => {
    const outputPath = appendToFilename(audioPath, '_output');
    ffmpeg(audioPath)
        .output(outputPath)
        .audioCodec('libmp3lame')
        .on('error', (err) => reject(err))
        .on('end', () => {
            fs.unlinkSync(audioPath);
            resolve(outputPath);
        })
        .run();
})
/**
 * Deletes a file of a given path.
 * @param {String} path Path of the file you want to delete.
 */
const unlinkOutput = (path) => {
    try {
        fs.unlinkSync(path)
    }
    catch (err) {
        console.error(err);
    }
}
/**
 * Get size in bytes of a file.
 * @param {String} filePath path to the file.
 * @returns the size of the file, false if error.
 */
const getFileSize = (filePath) => {
    try {
        return fs.statSync(filePath).size;
    } catch (err) {
        console.error(err);
        return false;
    }
}
/**
 * Clean tmp folder.
 */
const cleanTmp = () => {
    fs.readdirSync(tmpFolder).forEach(file => {
        if (file !== 'tmp.txt')
            unlinkOutput(tmpFolder + file)
    });
}

/**
 * save binary buffer to a file.
 * @param {*} buffer the binary data.
 * @param {*} ext the extention you want the file to have.
 * @returns path to the file.
 */
const saveBinary = (buffer, ext) => {
    try {
        const path = tmpFolder + getRandomFileName() + '.' + ext;
        fs.writeFileSync(path, buffer)
        return path;
    } catch (err) {
        console.error(err);
        return false;
    }

}
module.exports = {
    mergeVideoAudio,
    shrinkVideoSize,
    getFileSize,
    unlinkOutput,
    cleanTmp,
    toMP3,
    saveBinary,
    ffmpegPath
}