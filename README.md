<div align="center">

# WhatsappBot

![forthebadge](https://img.shields.io/badge/Made%20with-Node.js-yellow)


</div>

#### a simple whatsapp bot written in JavaScript and using [wa-automate](https://github.com/open-wa/wa-automate-nodejs) for Node.js.

## Features

| (⌐■_■)☞|                Feature           |
| :-----------: | :--------------------------------: |
|       ✅       | Send Red Alerts 🚀 as message with (or without) location on GoogleMaps |
|       ✅       | Owner can add and remove senders from sending groups (senders.json) straight from Whatsapp     |
|              |     more to come...?          |
<!-- |              |      | -->

## Installation
clone the project:
```
git clone https://github.com/eyalmichon/WhatsappBot.git
```
then inside the project folder use the following command to install required packages:
```
npm install
```
next, you'll need to create a sender file in json format and a config file in [.hjson](https://hjson.github.io/) format (exactly the same as JSON but lets you add comments) which you can use to save your group/private numbers and the URLs/Data for different functions safely without being part of the code.

## Running & Usage

```
npm start
```
scan the QR code and wow, you're done!
