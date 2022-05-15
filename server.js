const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const chromeLauncher = require('chrome-launcher');
const util = require('util');
const path = require('path');
const fs = require('fs');
const request = require('request');
const app = require('express')();
const express = require('express');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: { origin: "*" }
});
const process = require('dotenv').config().parsed;
const mime = require('mime-types');
const axios = require('axios');
const fileUpload = require('express-fileupload');


app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(fileUpload({
    debug: true
}));

io.on('connection', (socket) => {
    socket.on('init', async ({ userId } = data) => {
        let config = {};
        const dataPath = `public/storage/whatsapp/${userId}`;
        const dirPath = path.resolve(`${dataPath}/session-${userId}`);


        if (fs.existsSync(dirPath)) {
            config = {
                userDataDir: dirPath,
            };
        }

        await chromeLauncher.killAll();
        const chrome = await chromeLauncher.launch({
            ...config,
            chromeFlags: [
                // "--headless",
                "--disabled-setupid-sandbox"]
        });
        const resp = await util.promisify(request)(`http://localhost:${chrome.port}/json/version`);
        const { webSocketDebuggerUrl } = JSON.parse(resp.body);
        const client = new Client({
            puppeteer: {
                headless: false,
                browserWSEndpoint: webSocketDebuggerUrl
            },
            authStrategy: new LocalAuth({
                clientId: userId,
                dataPath
            })
        });
        const fetchMessage = async (data) => {
            const chat = await client.getChatById(data.chatId);

            const messages = await chat.fetchMessages({
                limit: 50
            });

            io.emit('listMessages', messages);
        };
        const sendMessage = async (data) => {
            console.log(data); // getting buffer. phew

            if (data.filePath) {
                // const media = MessageMedia.fromUrl(data.filePath);
                const fileUrl = data.data;

                let mimetype;
                const attachment = await axios.get(fileUrl, {
                    responseType: 'arraybuffer'
                }).then(response => {
                    mimetype = response.headers['content-type'];
                    return response.data.toString('base64');
                });

                const media = new MessageMedia(mimetype, attachment, 'Media');

                // this works
                // const media = new MessageMedia(data.mimetype, data.data, data.name);

                return client.sendMessage(data.chatId, media);
            }

            client.sendMessage(data.chatId, data.data);
        };
        const qr = (qr) => {
            console.log('qr');

            io.emit('qr', qr);
        };
        const authenticated = async () => {
            io.emit('authenticated', 'Whatsapp Authenticated!');
        };
        const ready = async () => {
            console.log('ready');

            // get chats
            const chats = await client.getChats();

            for (let chat of chats) {
                let contact = await chat.getContact();
                profilePic = await contact.getProfilePicUrl();
                chat.profilePic = profilePic ? profilePic : './img/avatar.png'
            }

            // send chats
            io.emit('ready', chats);
        };
        const message = async (message) => {
            message.chat = await message.getChat();

            // Downloading media
            if (message.hasMedia) {
                message.downloadMedia().then(media => {
                    // To better understanding
                    // Please look at the console what data we get
                    console.log(media);

                    if (media) {
                        // The folder to store: change as you want!
                        // Create if not exists
                        const mediaPath = './public/downloaded-media/';

                        if (!fs.existsSync(mediaPath)) {
                            fs.mkdirSync(mediaPath);
                        }

                        // Get the file extension by mime-type
                        const extension = mime.extension(media.mimetype);

                        // Filename: change as you want!
                        // I will use the time for this example
                        // Why not use media.filename? Because the value is not certain exists
                        const filename = new Date().getTime();

                        const fullFilename = mediaPath + filename + '.' + extension;

                        // Save to file
                        try {
                            fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                            console.log('File downloaded successfully!', fullFilename);
                        } catch (err) {
                            console.log('Failed to save the file:', err);
                        }
                    }
                });
            }

            io.emit('message', message);
        };
        const message_ack = async (message) => {
            message.chat = await message.getChat();

            // Downloading media
            if (message.hasMedia) {
                message.downloadMedia().then(media => {
                    // To better understanding
                    // Please look at the console what data we get
                    console.log(media);

                    if (media) {
                        // The folder to store: change as you want!
                        // Create if not exists
                        const mediaPath = './public/downloaded-media/';

                        if (!fs.existsSync(mediaPath)) {
                            fs.mkdirSync(mediaPath);
                        }

                        // Get the file extension by mime-type
                        const extension = mime.extension(media.mimetype);

                        // Filename: change as you want!
                        // I will use the time for this example
                        // Why not use media.filename? Because the value is not certain exists
                        const filename = new Date().getTime();

                        const fullFilename = mediaPath + filename + '.' + extension;

                        // Save to file
                        try {
                            fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                            console.log('File downloaded successfully!', fullFilename);
                        } catch (err) {
                            console.log('Failed to save the file:', err);
                        }
                    }
                });
            }

            io.emit('message_ack', message);
        };
        const media_uploaded = (message) => {
            io.emit('media_uploaded', message);
        };

        // on qr
        client.on('qr', qr);
        // on ready
        client.on('ready', ready);
        // on message
        client.on('message', message);
        // on message
        client.on('message_ack', message_ack);
        // on media uploaded
        client.on('media_uploaded', media_uploaded);
        // init
        client.initialize();
        // authenticated
        client.on('authenticated', authenticated);

        // sendMessage
        socket.on('sendMessage', sendMessage);
        // fetch Messages
        socket.on('fetchMessage', fetchMessage);
    });
});

server.listen(process.SOCKETIO_PORT, () => {
    console.log('Server is running on port:', process.SOCKETIO_PORT);
});