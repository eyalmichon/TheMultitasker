<div align="center">

# The Multitasker

##### A WhatsApp bot written in JavaScript and Node.js.

![forthebadge](https://img.shields.io/badge/Made%20with-Node.js-8bbf3d)
![forthebadge](https://img.shields.io/badge/version-1.3.2-blueviolet)


</div>


## Features

- ### Red Alerts 🚀:
  Send Red Alerts as message with (or without) location on GoogleMaps.

- ### Stickers 😀:
  Create stickers from:
  - image 📷
  - video 🎥
  - gif 👾
  - URL 🔗

- ### Downloader ⏬:
  - Download all content from Instagram.
  - Download videos from:
    - Twitter
    - Tiktok
    - Facebook
    - YouTube
  - Download mp3 audio from YouTube.

- ### Extras ⭐:
  - Compile 👨‍💻 and get output from many languages like Python 🐍, C, Java, etc....
  - Get a random 🎲 meme/post from a set of subreddits you choose or a specifc one.
  - Get COVID-19 🦠 updates for Israel.
  - Get answers to questions ❓ from WolframAlpha.

- ### Owner 👑:
  - Add and remove senders from sending groups (senders.json) straight from Whatsapp.
  - Spam-tag someone to get their attention.
  - Get a list of names from a specific group.

- ### Admin 💼:
  - Kick 🦶 a participant or all participants from group.
  - Tag everyone in the group.


## Dependencies
- [node.js](https://nodejs.org/en/download/) v14.16.0
- [npm]() v7.15.1
- [wa-automate](https://github.com/open-wa/wa-automate-nodejs) v4.12.0
- [puppeteer](https://github.com/puppeteer/puppeteer#readme) v10.1.0

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

#### Example senders.json:

The group info needed here is the JID of the group. (which looks like this "\*\*\*\*-\*\*\*\*@g.us")
Same thing for regular users (which is the phone number with @c.us appended)
```json
{
  "Me": "****@c.us",
  "Allowed": [
    "****-****@g.us",
    "****@c.us"
  ],
  "RedAlerts-MessageOnly": [
    ""
  ],
  "RedAlerts": [
    ""
  ],
  ...
}
```

## Running & Usage

```
npm start
```
scan the QR code and wow, you're done!
