const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const chromeLauncher = require('chrome-launcher');
const util = require('util');
const path = require('path');
const fs = require('fs');
const request = require('request');

class WhatsAppClient {
    constructor(userId, io) {
        // set user
        this.userId = userId;
        // set io
        this.io = io;
    }
    getConfig = async (userId) => {
        let config = {};
        let dataPath = await this.getDataPath();
        let dirPath = path.resolve(`${dataPath}/session-${userId}`);

        if (fs.existsSync(dirPath)) {
            config = {
                userDataDir: dirPath,
            };
        }

        return config;
    }
    setUpApi = async () => {
        // kill all processes
        await this.onDestroy();

        const browserWSEndpoint = await this.getBrowserWsEndpoint();
        this.client = new Client({
            puppeteer: {
                browserWSEndpoint
            },
            authStrategy: new LocalAuth({
                clientId: this.userId,
                dataPath: await this.getDataPath()
            })
        });

        return this;
    }
    getBrowserWsEndpoint = async () => {
        const config = this.getConfig(this.userId);
        const chrome = await chromeLauncher.launch({
            ...config,
            chromeFlags: [
                "--headless",
                "--disabled-setupid-sandbox"
            ]
        });
        const resp = await util.promisify(request)(
            `http://localhost:${chrome.port}/json/version`
        );

        return JSON.parse(resp.body).webSocketDebuggerUrl;
    }
    onQr = async (qr) => {
        console.log('qr');

        this.io.emit('qr', qr);
    }
    onAuthenticated = async () => {
        this.io.emit('authenticated', 'Whatsapp Authenticated!');
    }
    onReady = async () => {
        console.log('ready');

        // get chats
        const chats = await this.client.getChats();

        for (let chat of chats) {
            const contact = await chat.getContact();
            const profilePic = await contact.getProfilePicUrl();
            chat.profilePic = profilePic ? profilePic : 'img/avatar.png'
        }

        // send chats
        this.io.emit('ready', chats);
    }
    onMessage = async (message) => {
        message.chat = await message.getChat();
        this.io.emit('message', message);
    }
    onMessageAck = async (message) => {
        message.chat = await message.getChat();
        this.io.emit('message_ack', message);
    }
    onMediaUploaded = async (message) => {
        this.io.emit('media_uploaded', message);
    }
    onDestroy = async () => {
        await chromeLauncher.killAll();
    }
    fetchMessage = async (data) => {
        const chat = await this.client.getChatById(data.chatId);

        const messages = await chat.fetchMessages({
            limit: 50
        });

        this.io.emit('listMessages', messages);
    }
    sendMessage = async (data) => {

        if (data.filePath) {
            const media = MessageMedia.fromUrl(data.filePath);
            return this.client.sendMessage(data.chatId, media);
        }

        this.client.sendMessage(data.chatId, data.data);
    };
    getDataPath = async () => {
        return `public/storage/whatsapp/${this.userId}`;
    }
}

module.exports = WhatsAppClient;