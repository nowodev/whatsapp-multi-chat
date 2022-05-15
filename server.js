const WhatsAppClient = require('./whatsapp_client');
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
        const client = new WhatsAppClient(userId, io);
        // create api
        const api = await client.setUpApi();

        // on qr
        api.client.on('qr', api.onQr);
        // on ready
        api.client.on('ready', api.onReady);
        // on message
        api.client.on('message', api.onMessage);
        // on message
        api.client.on('message_ack', api.onMessageAck);
        // on media uploaded
        api.client.on('media_uploaded', api.onMediaUploaded);
        // authenticated
        api.client.on('authenticated', api.onAuthenticated);
        // init
        api.client.initialize();

        // sendMessage
        socket.on('sendMessage', api.sendMessage);
        // fetch Messages
        socket.on('fetchMessage', api.fetchMessage);
        // close
        socket.on('disconnect', api.onDestroy);
    });
});

server.listen(process.SOCKETIO_PORT, () => {
    console.log('Server is running on port:', process.SOCKETIO_PORT);
});