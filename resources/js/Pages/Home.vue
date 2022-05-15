<template>
    <div v-show="!authenticated">
        <ModelsList ref="model" :users="users" @navigate="navigate" />
    </div>

    <div v-show="authenticated">
        <ChatList ref="chat" :chats="chats" :user="user" :messages="messages"
            @send-to-home="receivedFromChatList" @selected-chat="selectedChat"
            @auth="setAuthentication" />
    </div>
</template>


<script>
import ChatList from '@/components/ChatList.vue';
import ModelsList from '@/components/ModelsList.vue'
import { defineComponent } from '@vue/runtime-core';

// instantiate connection
const socket = window.SocketIO;

export default defineComponent({
    components: { ModelsList, ChatList },

    props: ['users'],

    data() {
        return {
            authenticated: false,
            chats: [],
            user: {},
            messages: [],
        };
    },

    created() {
        // populate messages
        socket.on('listMessages', (messages) => {
            this.messages = messages;
        });

        // listen to message
        socket.on('message', (message) => {
            this.messages.push(message);
            this.updateChat(message);
        });

        // listen to message_ack
        socket.on('message_ack', (message) => {
            console.log('Message Sent: ', message);
            if (message.ack === 1) this.messages.push(message);

            let index = this.messages.findIndex(x => x.id === message.id);

            this.messages[index] = message;

            this.updateChat(message);
        });

        // listen to media upload
        socket.on('media_uploaded', (message) => {
            console.log('Media Uploaded: ' + message);
        });

        // listen destory
        socket.on('destroy', (data) => {
            console.log('Destroyed: ', data);
        });
    },

    methods: {
        updateChat(message) {

            let index = this.chats.findIndex(x => x.id === message.chat.id);

            this.chats[index] = message.chat;
        },

        setAuthentication: function (user) {
            this.user = user;
            this.authenticated = false;

            // show message on home page
            this.$refs.model.$refs.msg.classList.remove('hidden');
            this.$refs.model.$refs.qr.classList.add('hidden');
            this.$refs.model.$refs.waitMsg.classList.add('hidden');
            this.$refs.model.$refs.success.classList.add('hidden');
        },

        navigate: function (user) {
            // remove message on home page and show barcode
            this.$refs.model.$refs.msg.classList.add('hidden');
            this.$refs.model.$refs.waitMsg.classList.remove('hidden');

            // instantiate connection
            if (this.authenticated === false && this.user.uuid !== user.uuid) {
                this.user = user;

                if (this.user.uuid) {
                    socket.emit('destroy')
                }

                socket.emit('init', {
                    userId: user.uuid
                });

                // listent to qr
                socket.on('qr', (qr) => {
                    window.QRCode.toCanvas(this.$refs.model.$refs.qr, qr, function (error) {
                        if (error) {
                            alert("Failed to render QR");
                            return console.error(error);
                        }
                    });

                    this.$refs.model.$refs.waitMsg.classList.add('hidden');
                    this.$refs.model.$refs.qr.classList.remove('hidden');
                });

                socket.on('authenticated', () => {
                    this.$refs.model.$refs.success.classList.remove('hidden');
                    this.$refs.model.$refs.qr.classList.add('hidden');
                    this.$refs.model.$refs.waitMsg.classList.add('hidden');
                });

                // update dom
                socket.on('ready', (chats) => {
                    this.authenticated = true;
                    this.chats = chats;
                });
            } else {
                this.authenticated = true;
            }
        },

        // emitted event from ChatList to get selected chat
        selectedChat: function (id) {
            // get the selected chat id
            socket.emit('fetchMessage', { chatId: id })
        },

        // emitted event from ChatList, coming from Messages to send messages to server
        receivedFromChatList: function (id, message) {
            // check if message is a file
            if (message instanceof File) {
                let file = message

                socket.emit('sendMessage', {
                    chatId: id,
                    filePath: URL.createObjectURL(file),
                    data: file
                });

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