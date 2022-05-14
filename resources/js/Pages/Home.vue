<template>
    <div v-show="!authenticated">
        <ModelsList ref="model" @navigate="navigate" />
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
const socket = io('localhost:3001');

export default defineComponent({
    components: { ModelsList, ChatList },

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
            // this.messages.push(message);
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

            this.scrollToTop()
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
            console.log('Authentication: ', user);
            this.user = user;
            this.authenticated = false;
        },

        navigate: function (user) {
            // instantiate connection
            if (this.authenticated === false && this.user.id !== user.id) {
                if (this.user.id) {
                    socket.emit('destroy')
                    console.log('Destroyed');
                }

                socket.emit('init', {
                    userId: user.id
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

                // update dom
                socket.on('ready', (chats) => {
                    console.log(chats);
                    this.authenticated = true;
                    this.user = user;
                    this.chats = chats;
                });
            } else {
                this.authenticated = true;
            }
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