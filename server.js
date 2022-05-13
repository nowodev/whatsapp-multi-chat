const { Client } = require('whatsapp-web.js');

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: { origin: "*"}
});
const client = new Client({
    puppeteer: {
        headless: false,
    }
});

io.on('connection', (socket) => {
    // init client
    client.initialize();

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        socket.broadcast.emit('qr', qr);
    });

    client.on('ready', async () => {
        socket.broadcast.emit('ready');
    });

    socket.on('disconnect', (socket) => {
        // destroy client
        client.destroy();
    });
});


server.listen(3009, () => {
    console.log('Server is running');
});