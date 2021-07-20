<div align="center">

# The Multitasker

##### A WhatsApp bot written in JavaScript and Node.js.

![forthebadge](https://img.shields.io/badge/Made%20with-Node.js-8bbf3d)
![forthebadge](https://img.shields.io/badge/version-1.3.1-blueviolet)


</div>


## Features

| (⌐■_■)☞|                Feature           |
| :-----------: | :--------------------------------: |
|       ✅       | Send Red Alerts 🚀 as message with (or without) location on GoogleMaps. |
|       ✅       | Owner can add and remove senders from sending groups (senders.json) straight from Whatsapp.     |
|       ✅       |     Create stickers from image 📷, video 🎥, gif 👾 or URL 🔗 just by sending them to the bot.          |
|       ✅       |     Send a random message from a given group to your chat.          |
|       ✅       |     Download content from Instagram straight to the chat.          |
|       ✅       |     Download videos from Twitter/Tiktok/Facebook/YouTube straight to the chat.          |
|       ✅       |     Download YouTube to mp3 straight to the chat.          |
|       ✅      |     Get a random 🎲 meme/post from a set of subreddits you choose or a specifc one.          |
|       ✅       |     Kick 🦶 a participant or all participants from group.          |
|       ✅       |     Tag everyone in the group.          |
|       ✅      |     Get a list of names from a specific group.          |
|       ✅      |     Compile 👨‍💻 and get output from many languages like Python 🐍, C, Java, etc....          |
|       ✅      |     Simple spam ⛔ detector          |
|       ✅      |     Get COVID-19 🦠 updates for Israel straight to the chat.  |
|       ✅      |          Spam-tag someone to get their attention     |
|              |     More to come...?          |
<!-- |              |      | -->
## Dependencies
- [node.js](https://nodejs.org/en/download/) v14.16.0
- [npm]() v7.15.1
- [wa-automate](https://github.com/open-wa/wa-automate-nodejs) v4.11.1
- [puppeteer](https://github.com/puppeteer/puppeteer#readme) v10.1.0
- [video-url-link](https://github.com/catcto/video-url-link#readme) forked version in handler/lib/util
- [AbortController](https://github.com/mysticatea/abort-controller#readme) v3.0.0

## Installation
clone the project:
```
git clone https://github.com/eyalmichon/TheMultitasker.git
```
then inside the project folder use the following command to install required packages:
```
npm install
```
next, you'll need to create a senders file in json format which you can use to save your group/private numbers for different functions safely without being part of the code.

Example senders.json:
```json
{
  "Me": "",
  "Allowed": [
    ""
  ],
  "RedAlerts-MessageOnly": [
    ""
  ],
  "RedAlerts": [
    ""
  ],
}
```

## Running & Usage

```
npm start
```
scan the QR code and wow, you're done!
