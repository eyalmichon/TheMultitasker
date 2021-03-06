const { b, m, i, prefix } = require("./helper");

const addType = (error) => {
    return { type: 'reply', info: error };
}

const errors = {
    OWNER: addType(`📛 Error, this command can only be used by the bot master!`),
    ADMIN: addType(`📛 Error, this command can only be used by group admins!`),
    GROUP: addType(`📛 Error, this command can only be used within a group!`),
    WRONG_ID: addType(`📛 Error, ID entered was incorrect!`),
    INVALID_JID: addType(`📛 Error, JID entered was invalid!`),
    SUB_ERROR: addType(`📛 Error, this subreddit doesn't exist.`),
    NO_MEDIA: addType(`📛 Error, this subreddit doesn't contain any media.`),
    PORN_ERROR: addType(`📛 Error, this is a porn subreddit. 🔞`),
    UNKNOWN: addType(`📛 An unknown error has occurred.`),
    NO_LINK: addType(`📛 Error, no link found.`),
    BAD_CMD: addType(`📛 Error, this is not the right way to use this command!\nCheck ${prefix}help command for more details.`),
    WRONG_CMD: addType(`📛 Error, are you making up commands?\nUse ${prefix}help for ${b(`real`)} available commands.`),
    ONLY_TEXT: addType(`📛 Error, only text messages are allowed.`),
    SPAM: addType(`📛 Sorry, I don\'t like spammers!`),
    STICKER_ERR: addType(`📛 There was an error processing your sticker.`),
    STICKER_TOO_LARGE: addType(`📛 Error, the image/video was too large.`),
    STICKER_RETRY: addType(`📛 There was an error processing your sticker.\nMaybe try to edit the ${b('length')} or ${b('resize')} and resend.`),
    STICKER_NOT_GIF: addType(`📛 Error, not an image/gif`),
    TEXT_TOO_LONG: addType(`📛 Error, the text exceeds the limit.`),
    NOT_IMG: addType(`📛 Error, either the message or the quoted message not an image`),
    PRIVATE_SOCIAL: addType(`📛 Error, private user or wrong link`),
    INVALID_LINK: addType(`📛 Error, the link you sent was invalid.`),
    INVALID_INSTA: addType(`📛 Error, this is not a valid Instagram link.`),
    CONTENT_TOO_LARGE: addType(`📛 Error, the file you're trying to get is too large to handle...`),
    TWITTER_API: addType(`📛 Twitter API error, maybe this link is not a valid twitter link.`),
    INVALID_TWITTER: addType(`📛 Error, this is not a not a twitter URL.`),
    PRIVATE_TWITTER: addType(`📛 Error, private user, wrong link or not a video.`),
    ID_YOUTUBE: addType(`📛 Error, video ID does not match expected format.`),
    DOMAIN_YOUTUBE: addType(`📛 Error, this is not a Youtube domain.`),
    PRIVATE_FACE: addType(`📛 Error, couldn't find video download, maybe the video is not public...`),
    UNKNOWN_SOCIAL: addType(`📛 Error, wrong link or not a video.`),
    NOT_SUPPORTED: addType(`📛 Error, site not supported`),
    CANT_ANSWER_WOLF: addType(`📛 Error, can't answer that question.`),
    NON_FOUND_URBAN: addType(`📛 Error, couldn't find any definitions for this term.`),
    WRONG_LANG_CODE: addType(`📛 Error, wrong language code used, please see the help section for this command for all available language codes.`),
    NO_RESULT_RECO: addType(`📛 Error, could'nt find any music matching this song.`),
    WRONG_TYPE_RECO: addType(`📛 Error, only accepting audio messages.`),
    CONV_VIDEO_TOO_LARGE: addType(`📛 Error, the video you're trying to convert is too large...`),
    CONV_NOT_VIDEO: addType(`📛 Error, only videos are allowed.`),
    EMOJI_GEN_ERROR: addType(`📛 Error, wrong number.`),
    EMPTY_TEXT: addType(`📛 Error, no text found.`),
    WRONG_CAR_NUMBER_LENGTH: addType(`📛 Error, car number length entered is invalid.`),
    NOT_FOUND_CAR_NUMBER_INFO: addType(`📛 Error, car number isn't in the database.`),
    NO_SONGS: addType(`📛 Error, no songs given.`),
    TOO_MANY_SONGS: addType(`📛 Error, too many songs given.`),
    NO_SONGS_FOUND: addType(`📛 Error, no songs found.`),
    NO_QUOTED_MESSAGE: addType(`📛 Error, no quoted message found.`),
}

module.exports = { errors }