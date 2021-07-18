const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

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
 * @returns true if success, otherwise false.
 */
const unlinkOutput = (path) => {
    try {
        fs.unlinkSync(path)
        return true;
    }
    catch (err) {
        console.error(err);
        return false;
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

module.exports = {
    mergeVideoAudio,
    shrinkVideoSize,
    getFileSize,
    unlinkOutput,
    toMP3
}