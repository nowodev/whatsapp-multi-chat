const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: { origin: "*"}
});
const process = require('dotenv').config().parsed;

io.on('connection', (socket) => {
    socket.on('init', async ({userId} = data) => {
        const client = new Client({
            puppeteer: {
                headless: true
            },
            authStrategy: new LocalAuth({
                clientId: userId,
                dataPath: `public/storage/whatsapp/${userId}`
            })
        });

        // on qr
        client.on('qr', (qr) => {
           io.emit('qr', qr);
        });

        // on ready
        client.on('ready', async () => {
            // get chats
            const chats = await client.getChats();

            // send chats
            io.emit('ready', chats);
        });

        // on message
        client.on('message', (message) => {
            io.emit('message', message);
        });

        // on message
        client.on('message_ack', (message) => {
            io.emit('message_ack', message);
        });

        // on media uploaded
        client.on('media_uploaded', (message) => {
            io.emit('media_uploaded', message);
        });

        // on disconnected
        client.on('disconnected', (data) => {
            console.log(data);
            io.emit('destroy', data)
        });

        // init
        client.initialize();

        // sendMessage
        socket.on('sendMessage', (data) => {

            if(data.mimetype) {
                const media = new MessageMedia(data.mimetype, data.data)
                return client.sendMessage(data.chatId, media);
            }

            client.sendMessage(data.chatId, data.data);
        });

        // close
        socket.on('disconnect', async () => {
            // close client
            client.destroy();
        });
    });
});

server.listen(process.SOCKET_IO_PORT, () => {
    console.log('Server is running on port:', process.SOCKET_IO_PORT);
});