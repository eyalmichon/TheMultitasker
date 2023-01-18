const { b, m, i, help, returnType } = require("./helper");
const { errors } = require('./errors');
const { meme, downloader, parser, songs } = require("..");

class Social {
    // Add type, function and help using spread syntax.
    addInfo(cmd) { return { type: 'Social', ...cmd } }

    // Add alias and call addInfo.
    alias(cmd) { return { ...this.addInfo(cmd), alias: true } }

    constructor(commands, defaultTimer) {
        this.defaultTimer = defaultTimer;

        commands.meme = this.addInfo(this.meme)

        commands.reddit = this.addInfo(this.reddit)
        commands.rd = this.alias(this.reddit)

        commands.instagram = this.addInfo(this.instagram)
        commands.insta = this.alias(this.instagram)
        commands.ig = this.alias(this.instagram)

        commands.twitter = this.addInfo(this.twitter)
        commands.tw = this.alias(this.twitter)

        commands.facebook = this.addInfo(this.facebook)
        commands.fb = this.alias(this.facebook)

        commands.tiktok = this.addInfo(this.tiktok)
        commands.tik = this.alias(this.tiktok)
        commands.tk = this.alias(this.tiktok)

        commands.youtube = this.addInfo(this.youtube)
        commands.yt = this.alias(this.youtube)

        commands.video = this.addInfo(this.video)
        commands.v = this.alias(this.video)

        commands.songs = this.addInfo(this.downloadSongs)

    }

    meme = {
        func: async (args) => {

            const memePost = [];

            // find a random meme on a specific sub.
            if (args[0] && args[0].match(/^[0-9a-zA-Z]+$/))
                memePost.push(meme.subRedditImg(args[0]))

            // find a random meme on a random sub.
            else
                memePost.push(meme.randomRedditImg())
            return await Promise.all(memePost)
                .then(promise => {
                    let post = promise[0];
                    return returnType.fileFromURL(post.url, `the_multitasker.${post.url.split('.').pop()}`, post.title)

                })
                .catch(err => {
                    console.error(err);
                    if (err === 'SUB_ERROR') return errors.SUB_ERROR
                    else if (err === 'NO_MEDIA') return errors.NO_MEDIA
                    else if (err === 'PORN_ERROR') return errors.PORN_ERROR
                    else return errors.UNKNOWN()
                })
        },
        help: () => help.Social.meme.replace('SUBS_LIST', meme.subreddits.join(', ')),
        timer: () => this.defaultTimer
    }

    reddit = {
        func: async (args) => {

            const redditPost = [];
            // get a post from a specific subreddit.
            if (args[0] !== undefined && args[0].match(/^[0-9a-zA-Z]+$/))
                redditPost.push(meme.subRedditPost(args[0]))
            // get a post from a random subreddit.
            else
                redditPost.push(meme.randomRedditPost());

            return await Promise.all(redditPost)
                .then(promise => {
                    let post = promise[0];
                    switch (post.type) {
                        case 'video':
                            return returnType.sendFile(post.path, 'the_multitasker.mp4', post.title);
                        case 'image/gif':
                            return returnType.fileFromURL(post.url, `the_multitasker.${post.url.split('.').pop()}`, post.title);
                        case 'youtube':
                            return this.youtube.func([post.url]);
                        default:
                            break;
                    }
                })
                .catch(err => {
                    console.error(err);
                    if (err === 'SUB_ERROR') return errors.SUB_ERROR
                    else if (err === 'NO_MEDIA') return errors.NO_MEDIA
                    else if (err === 'PORN_ERROR') return errors.PORN_ERROR
                    else return errors.UNKNOWN()
                })
        },
        help: () => help.Social.reddit.replace('SUBS_LIST', meme.subreddits.join(', ')),
        timer: () => this.defaultTimer

    }

    instagram = {
        func: (args) => {

            const options = parser.parse(args);
            if (!options.url) return errors.INVALID_LINK
            let link = options.url;

            // Get videos/images from link.
            return downloader.insta(link)
                .then((linkList) => {
                    return returnType.filesFromURL(linkList);
                }
                ).catch((err) => {
                    if (err.message === 'Not Found instagram') return errors.INVALID_LINK
                    else if (err.message === 'Parse Error') return errors.INVALID_INSTA
                    else if (err === 'EMPTY') return errors.UNKNOWN()
                    else return errors.PRIVATE_SOCIAL
                })
        },
        help: () => help.Social.instagram,
        timer: () => this.defaultTimer
    }

    twitter = {
        func: (args) => {
            const options = parser.parse(args);
            if (!options.url) return errors.INVALID_LINK
            let link = options.url;

            return downloader.tweet(link)
                .then(async (url) => {
                    if (url === 'CONTENT_TOO_LARGE') return errors.CONTENT_TOO_LARGE
                    return returnType.fileFromURL(url, 'the_multitasker.mp4');
                }).catch((err) => {
                    if (err.message === 'Twitter API error') errors.TWITTER_API
                    else if (err.message === 'Not a twitter URL') errors.INVALID_TWITTER
                    else errors.PRIVATE_TWITTER
                })
        },
        help: () => help.Social.twitter,
        timer: () => this.defaultTimer
    }

    tiktok = {
        func: (args) => {
            const options = parser.parse(args);
            if (!options.url) return errors.INVALID_LINK
            let link = options.url;

            return downloader.tiktok(link)
                .then(async (info) => {
                    return returnType.fileFromURL(post.url, 'the_multitasker.mp4', post.title, { headers: info.options });
                }).catch(() => {
                    return errors.PRIVATE_SOCIAL
                })
        },
        help: () => help.Social.tiktok,
        timer: () => this.defaultTimer
    }

    facebook = {
        func: (args) => {
            const options = parser.parse(args);
            if (!options.url) return errors.INVALID_LINK
            let link = options.url;

            if (link)
                return downloader.facebook(link)
                    .then(info => {
                        return returnType.fileFromURL(info.link, 'the_multitasker.mp4', info.title);
                    })
                    .catch(err => {
                        if (err.name === 'TypeError') return errors.PRIVATE_FACE
                        else return errors.UNKNOWN_SOCIAL
                    })
            else
                return errors.NO_LINK
        },
        help: () => help.Social.facebook,
        timer: () => this.defaultTimer
    }

    youtube = {
        func: (args) => {
            const options = parser.parse(args);
            if (!options.url) return errors.INVALID_LINK
            let link = options.url;
            let audio = !!options.a || !!options.audio;

            if (audio)
                return downloader.youtubeMp3(link)
                    .then(info => {
                        return returnType.sendPtt(info.path);
                    })
                    .catch(err => {
                        if (err.name === 'TypeError') return errors.ID_YOUTUBE
                        else if (err.message === 'Not a YouTube domain') return errors.DOMAIN_YOUTUBE
                        else return errors.UNKNOWN_SOCIAL
                    })
            else
                return downloader.youtube(link)
                    .then(info => {
                        return returnType.fileFromURL(info.link, 'the_multitasker.mp4', info.title);
                    })
                    .catch(err => {
                        if (err.name === 'TypeError') return errors.ID_YOUTUBE
                        else if (err.message === 'Not a YouTube domain') return errors.DOMAIN_YOUTUBE
                        else return errors.UNKNOWN_SOCIAL
                    })
        },
        help: () => help.Social.youtube,
        timer: () => this.defaultTimer
    }


    video = {
        func: (args) => {
            const options = parser.parse(args);
            if (!options.url) return errors.INVALID_LINK

            let link = options.url;
            let audio = !!options.a || !!options.audio;

            return downloader.video(link, audio)
                .then(path => {
                    if (audio)
                        return returnType.sendPtt(path);

                    return returnType.sendFile(path, 'the_multitasker.mp4');
                })
                .catch(err => {
                    if (err === 'CONTENT_TOO_LARGE') return errors.CONTENT_TOO_LARGE
                    else return errors.NOT_SUPPORTED
                })
        },
        help: () => help.Social.video,
        timer: () => this.defaultTimer
    }
    downloadSongs = {
        func: (args) => {
            return errors.UNKNOWN();
            const songNames = parser.parseStrings(args);
            if (!songNames) return errors.NO_SONGS
            if (songNames.length > 20) return errors.TOO_MANY_SONGS
            return songs.downloadSongs(songNames)
                .then(songs => returnType.sendFiles(songs.filePaths, songs.fileNames))
                .catch(err => {
                    console.error(err);
                    if (err === 'NO_SONGS_FOUND') return errors.NO_SONGS_FOUND
                    return errors.UNKNOWN()
                })
        },
        help: () => help.Social.downloadSongs,
        timer: () => this.defaultTimer
    }
}

module.exports = { Social }