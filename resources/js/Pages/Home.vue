<template>
    <div v-show="!authenticated">
        <ModelsList ref="model" @navigate="navigate" />
    </div>

    <div v-show="authenticated">
        <ChatList ref="chat" :chats="chats" :received-messages="receivedMessages"
            :sent-messages="sentMessages" @send-to-home="receivedFromChatList"
            @selected-chat="selectedChat" />
    </div>
</template>


<script>
import ChatList from '@/components/ChatList.vue';
import ModelsList from '@/components/ModelsList.vue'
import { defineComponent } from '@vue/runtime-core';

// instantiate connection
const socket = io('localhost:3001');

export default defineComponent({
    components: { ModelsList, ChatList },

    data() {
        return {
            authenticated: false,
            userId: '05edee08-9164-40b3-a3ce-170333b44dda',
            chats: [],
            receivedMessages: [],
            sentMessages: [],
        };
    },

    created() {
        // listen to message
        socket.on('message', (message) => {
            console.log('Message Received: ' + message.body);
            this.receivedMessages.push(message);
        });

        // listen to message_ack
        socket.on('message_ack', (message) => {
            console.log('Message Sent: ' + message.body);
            this.sentMessages.push(message);
        });

        // listen to media upload
        socket.on('media_uploaded', (message) => {
            console.log('Media Uploaded: ' + message);
        });

        // listen destory
        socket.on('destroy', (data) => {
            console.log('Destroyed: ' + data);
        });
    },

    methods: {
        navigate: function () {
            // instantiate connection
            // if (this.authenticated === false) {
            socket.emit('init', {
                userId: this.userId
            });

            // listent to qr
            socket.on('qr', (qr) => {
                window.QRCode.toCanvas(this.$refs.model.$refs.qr, qr, function (error) {
                    if (error) {
                        alert("Failed to render QR");
                        return console.error(error);
                    }
                });

                this.$refs.model.$refs.qr.classList.remove('animate-pulse');
                this.$refs.model.$refs.msg.classList.add('hidden');
                this.$refs.model.$refs.cnt.classList.remove('hidden');
            });

            // } else {
            // update dom
            socket.on('ready', (chats) => {
                // console.log(chats);
                this.authenticated = true;
                this.chats = chats;
            });
            // }
        },

        // emitted event from ChatList to get selected chat
        selectedChat: function (id) {
            // get the selected chat id
            console.log('Selected Chat ID: ' + id);

            socket.emit('fetchMessage', { chatId: id })
        },

        // emitted event from ChatList, coming from Messages to send messages to server
        receivedFromChatList: function (id, message) {
            // check if message is a file
            if (message instanceof File) {
                let file = message

                const reader = new FileReader();

                reader.readAsDataURL(message);

                reader.onload = function () {
                    var startIndex = reader.result.indexOf("base64,") + 7;

                    socket.emit('sendMessage', {
                        chatId: id,
                        mimetype: file.type,
                        data: reader.result.substr(startIndex)
                    })
                };

                reader.onerror = function (error) {
                    console.log('Error: ', error);
                };

            } else {
                socket.emit('sendMessage', {
                    chatId: id,
                    data: message
                })
            }
        }
    },

})
</script>