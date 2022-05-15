<template>
    <div class="md:col-span-2 lg:col-span-3 md:block">
        <div class="flex flex-col h-full">
            <div class="flex flex-1 flex-col">
                <div class="relative flex items-center p-3 border-b border-gray-300">
                    <img class="object-cover w-10 h-10 rounded-full"
                        :src="selectedChat?.profilePic"
                        :alt="selectedChat?.name" />
                    <span class="block ml-2 font-bold text-gray-600">{{ selectedChat?.name }}</span>
                    <!-- <span class="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3">
                    </span> -->
                </div>

                <div class="relative h-full w-full p-6">
                    <div class="inset-0 absolute overflow-y-auto flex flex-col-reverse">
                        <ul ref="bottom" class="space-y-2 p-4 w-full">
                            <li v-for="(msg, index) in messages" :key="index" class="flex"
                                :class="{ 'justify-end': msg.fromMe, 'justify-start': !msg.fromMe }">
                                <div class="relative max-w-xl px-4 py-2 rounded shadow"
                                    :class="{ 'text-white bg-cyan-500': msg.fromMe, 'text-gray-700': !msg.fromMe }">
                                    <span class="block">{{ msg.body }}</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div
                class="flex flex-2 items-center justify-between w-full p-3 border-t border-gray-300">
                <div class="relative flex w-10 items-center overflow-hidden">
                    <button class="absolute">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 text-gray-500"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>

                    <input type="file" ref="file" class="cursor-pointer h-full w-full opacity-0"
                        name="">
                </div>

                <input type="text" placeholder="Message"
                    class="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
                    v-model="msgInput" required />
                <button type="submit" @click="send(selectedChat?.id._serialized)">
                    <svg class="w-8 text-gray-500 origin-center transform rotate-90"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Messages',

    props: ['selectedChat', 'messages'],

    data() {
        return {
            msgInput: '',
        }
    },

    methods: {
        send: function (id) {
            const file = this.$refs.file.files[0];

            if (this.msgInput.length > 0 && this.$refs.file.files[0] === undefined) {
                // this.messages.push(this.msgInput)
                this.$emit('sendToChatList', id, this.msgInput)
                this.msgInput = ''
            }

            if (this.$refs.file.files[0] !== undefined) {
                // this.messages.push(this.msgInput)
                this.$emit('sendToChatList', id, file)
            }
        },
    }
}
</script>