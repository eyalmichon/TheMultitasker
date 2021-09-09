<div align="center">

<img src="./images/the_multitasker_logo.png" width="150">

<h1>𝚝𝚑𝚎_𝚖𝚞𝚕𝚝𝚒𝚝𝚊𝚜𝚔𝚎𝚛;</h1>

<h5> A WhatsApp bot written in JavaScript and Node.js.</h5>

![forthebadge](https://img.shields.io/badge/Made%20with-Node.js-8bbf3d)


</div>

## Latest Changes

<div align="center">
   <img src="./release.png"/>
   </div>

## Features

Command pattern used for easy management of adding more commands.
<!--  -->
- ### Owner Commands 👑:
  - Send Red Alerts 🚀 as message with (or without) location on GoogleMaps.
  - Add and remove senders from sending groups (senders.json) straight from Whatsapp.
  - Kick 🦶 all participants from group.
  - Get a list of names from a specific group.
  - Get all group IDs of the groups sent to owner.
  - Spam-tag someone to get their attention.

- ### Admin Commands 💼:
  - Tag everyone in the group.
  - Kick 🦶 a participant from group.
  
- ### Social Commands 🌐:
  - Get a random 🎲 meme/post from a set of subreddits you choose or a specifc one.
  - Download all types of content from Instagram.
  - Download videos from:
    - Twitter
    - Tiktok
    - Facebook
    - YouTube
    - [and more...](http://ytdl-org.github.io/youtube-dl/supportedsites.html)
  - Download audio from YouTube and any site from the list above.

- ### Info Commands ℹ:
  - Compile 👨‍💻 and get output from many languages like Python 🐍, C, Java, etc....
  - Get COVID-19 🦠 updates for Israel.
  - Get answers to questions ❓ from WolframAlpha.
  - Get definition of words / Word of the day / random word from Urban Dictionary.
  - Translate sentences using Google Translate.
  - Recognize music 👂🎶.

- ### Forwarder Commands:
  - Forward messages randomly from a chosen group. (group IDs need to be set manually)

- ### Sticker Commands 😀:
  Create stickers from:
  - image 📷:
    - add stroke.
    - add text.
    - change background.
  - video 🎥
  - gif 👾
  - URL 🔗

- ### Media Commands:
  - Remove background:
    - add stroke.
    - add text.
    - change background.
  - Convert video to voice message.


## Dependencies
- [node.js](https://nodejs.org/en/download/) >= v14.16.0
- [npm]() >= v7.15.1
- [python](https://www.python.org/) >= v2.7
- [wa-automate](https://github.com/open-wa/wa-automate-nodejs) v4.17.1
- [puppeteer](https://github.com/puppeteer/puppeteer#readme) v10.2.0
- on Windows [Microsoft Visual C++ 2010 Service Pack 1 Redistributable Package (x86)](https://download.microsoft.com/download/1/6/5/165255E7-1014-4D0A-B094-B6A430A6BFFC/vcredist_x86.exe)


## Installation

clone the project:
```
git clone https://github.com/eyalmichon/TheMultitasker.git
```
then inside the project folder use the following command to install required packages:
```
npm install
```
next, make sure all of the dependencies are installed.

Now you'll need to create a senders file in json format at `./handler/util` which you can use to save your group/private numbers for different functions safely without being part of the code.

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
Now if you want to use any api that is using image uploading / music recognition / better background removal you'll need to create an account on [imgur](https://imgur.com) and get a client ID and secret and place them in a new secrets.json file located at `./handler/util` folder .

#### Example secrets.json:
```json
{
    "Imgur": {
        "ID": "*********",
        "secret": "***********************************"
    },
    "ACRCloud": [{
            "host": "******",
            "endpoint": "******",
            "signature_version": "******",
            "data_type": "******",
            "secure": "******",
            "access_key": "******",
            "access_secret": "******"
        }],
    "removebg":["******"]
}
```

Now, inside index.js change `executablePath` path in the options to where you've installed chrome OR try the `useChrome` option and it may guess the location corretly.


## Running & Usage

```
npm start
```
scan the QR code and wow, you're done!
