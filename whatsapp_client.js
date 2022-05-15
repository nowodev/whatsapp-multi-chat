const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const chromeLauncher = require('chrome-launcher');
const util = require('util');
const path = require('path');
const fs = require('fs');
const request = require('request');
const axios = require('axios');
const mime = require('mime-types');

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
    setUpApi = async (tries) => {
        try {
            // kill all processes
            await this.onDestroy();

            if(tries > 10) {
                const dirPath = path.resolve(await this.getDataPath());
                fs.rmSync(dirPath, { recursive: true, force: true });
            }

            const browserWSEndpoint = await this.getBrowserWsEndpoint();
            this.client = new Client({
                authTimeoutMs: 5e4,
                takeoverOnConflict: true,
                puppeteer: {
                    browserWSEndpoint
                },
                authStrategy: new LocalAuth({
                    clientId: this.userId,
                    dataPath: await this.getDataPath()
                })
            });
            return this;
        } catch(e) {
            console.log("Failed to setUp Api:", e.message);
        }
    }
    getBrowserWsEndpoint = async () => {
        try {
            const config = await this.getConfig(this.userId);

            const chrome = await chromeLauncher.launch({
                ...config,
                chromeFlags: [
                    "--headless",
                    "--disabled-setupid-sandbox",
                    "--window-position=910,450",
                    "--window-size=50,50"
                ]
            });
            const resp = await util.promisify(request)(
                `http://localhost:${chrome.port}/json/version`
            );

            return JSON.parse(resp.body).webSocketDebuggerUrl;
        } catch (e) {
            console.log("Failed to launch Chrome process:", e.message);
            return '';
        }
    }
    initialize = async () => {
        try {
            await this.client.initialize();
        } catch(e) {
            console.log("Initialization failed:", e.message);
            this.io.emit('auth_failure', 'Whatsapp Authentication Failed!');
        }
    }
    onQr = async (qr) => {
        console.log('qr');

        this.io.emit('qr', qr);
    }
    onAuthenticated = async () => {
        this.io.emit('authenticated', 'Whatsapp Authenticated!');
    }
    onAuthFailure = async () => {
        this.io.emit('auth_failure', 'Whatsapp Authentication Failed!');
    }
    onReady = async () => {
        console.log('ready');
        try {
            // get chats
            const chats = await this.client.getChats();

            for (let chat of chats) {
                const contact = await chat.getContact();
                const profilePic = await contact.getProfilePicUrl();
                chat.profilePic = profilePic ? profilePic : 'img/avatar.png'
            }

            // send chats
            this.io.emit('ready', chats);
        } catch(e) {
            console.log("Ready failed:", e.message);
        }
    }
    onMessage = async (message) => {
        try {

            message.chat = await message.getChat();

            if (message.hasMedia) {
                message.downloadMedia().then(media => {
                    // To better understanding
                    // Please look at the console what data we get
                    console.log(media);

                    if (media) {
                        // The folder to store: change as you want!
                        // Create if not exists
                        const mediaPath = 'public/storage/downloaded-media/';

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

            this.io.emit('message', message);
        } catch (e) {
            console.log("Failed to handle message received event:", e.message);
        }
    }
    onMessageAck = async (message) => {
        try {
            message.chat = await message.getChat();

            // Downloading media
            if (message.hasMedia) {
                const media = await message.downloadMedia();

                // To better understanding
                // Please look at the console what data we get
                console.log(media);

                if (media) {
                    // The folder to store: change as you want!
                    // Create if not exists
                    const mediaPath = 'public/storage/downloaded-media/';

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
                    fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                    console.log('File downloaded successfully!', fullFilename);

                }
            }

            this.io.emit('message_ack', message);
        } catch (err) {
            console.log('Failed to handle message ack event:', err.message);
        }
    }
    onMediaUploaded = async (message) => {
        this.io.emit('media_uploaded', message);
    }
    onDestroy = async () => {
        await chromeLauncher.killAll();
    }
    fetchMessage = async (data) => {
        try {
            const chat = await this.client.getChatById(data.chatId);

            const messages = await chat.fetchMessages({
                limit: 50
            });

            this.io.emit('listMessages', messages);
        } catch(e) {
            console.log("List Message failed:", e.message);
        }
    }
    sendMessage = async (data) => {

        if (data.filePath) {
            console.log('has media');
            const file = data.data;
            console.log(file);

            fs.createWriteStream('public/storage/downloaded-media/text.mp4').write(Buffer.from(file));

            return
            const media = new MessageMedia(file.mimetype, file.data.toString('base64'), file.name);

            console.log('got media');
            this.client.sendMessage(data.chatId, media);
        }
        // if (data.filePath) {
        //     // const media = MessageMedia.fromUrl(data.filePath);
        //     // return this.client.sendMessage(data.chatId, media);

        //     const fileUrl = data.data;

        //     let mimetype;
        //     const attachment = await axios.get(fileUrl, {
        //         responseType: 'arraybuffer'
        //     }).then(response => {
        //         mimetype = response.headers['content-type'];
        //         return response.data.toString('base64');
        //     });

        //     const media = new MessageMedia(mimetype, attachment, 'Media');
        // }

        this.client.sendMessage(data.chatId, data.data);
    };
    getDataPath = async () => {
        return `public/storage/whatsapp/${this.userId}`;
    }
}

module.exports = WhatsAppClient;