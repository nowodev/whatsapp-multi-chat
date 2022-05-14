const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const chromeLauncher = require('chrome-launcher');
const util = require('util');
const path = require('path');
const fs = require('fs');
const request = require('request');
const { disconnect } = require('process');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: { origin: "*" }
});
const process = require('dotenv').config().parsed;

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
        const sendMessage = (data) => {
            console.log('send messages');

            if (data.filePath) {
                const media = MessageMedia.fromUrl(data.filePath);
                return client.sendMessage(data.chatId, media);
            }

            client.sendMessage(data.chatId, data.data);
        };
        const qr = (qr) => {
            console.log('qr');

            io.emit('qr', qr);
        };
        const ready = async () => {
            console.log('ready');

            // get chats
            const chats = await client.getChats();

            for (let chat of chats) {
                let contact = await chat.getContact();
                profilePic = await contact.getProfilePicUrl();
                chat.profilePic = profilePic ? profilePic : 'img/avatar.png'
            }

            // send chats
            io.emit('ready', chats);
        };
        const message = async (message) => {
            message.chat = await message.getChat();
            io.emit('message', message);
        };
        const message_ack = async (message) => {
            message.chat = await message.getChat();
            io.emit('message_ack', message);
        };
        const media_uploaded = (message) => {
            io.emit('media_uploaded', message);
        };
        const destroy = async () => {
            await chromeLauncher.killAll();
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

        // sendMessage
        socket.on('sendMessage', sendMessage);
        // fetch Messages
        socket.on('fetchMessage', fetchMessage);
        // close
        socket.on('disconnect', destroy);
    });
});

server.listen(process.SOCKETIO_PORT, () => {
    console.log('Server is running on port:', process.SOCKETIO_PORT);
});