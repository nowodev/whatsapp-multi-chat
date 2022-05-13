<template>
    <div class="flex items-center min-h-screen">
        <div class="container mx-auto shadow-xl">
            <div class="min-w-full border rounded grid grid-cols-1 md:grid-cols-3">
                <div class="border-r border-gray-300 md:col-span-1">
                    <div class="mx-3 my-3">
                        <div class="relative text-gray-600">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                                <svg fill="none" stroke="currentColor" stroke-linecap="round"
                                    stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"
                                    class="w-6 h-6 text-gray-300">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </span>
                            <input type="search"
                                class="block w-full py-2 pl-10 bg-gray-100 rounded outline-none"
                                name="search" placeholder="Search" required />
                        </div>
                    </div>

                    <ul class="overflow-auto h-[32rem]">
                        <h2 class="my-2 mb-2 ml-2 text-lg text-gray-600">Chats</h2>
                        <li>
                            <a
                                class="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none">
                                <img class="object-cover w-10 h-10 rounded-full"
                                    src="https://cdn.pixabay.com/photo/2018/09/12/12/14/man-3672010__340.jpg"
                                    alt="username" />
                                <div class="w-full pb-2">
                                    <div class="flex justify-between">
                                        <span class="block ml-2 font-semibold text-gray-600">Jhon
                                            Don</span>
                                        <span class="block ml-2 text-sm text-gray-600">25
                                            minutes</span>
                                    </div>
                                    <span class="block ml-2 text-sm text-gray-600">bye</span>
                                </div>
                            </a>
                            <a
                                class="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out bg-gray-100 border-b border-gray-300 cursor-pointer focus:outline-none">
                                <img class="object-cover w-10 h-10 rounded-full"
                                    src="https://cdn.pixabay.com/photo/2016/06/15/15/25/loudspeaker-1459128__340.png"
                                    alt="username" />
                                <div class="w-full pb-2">
                                    <div class="flex justify-between">
                                        <span
                                            class="block ml-2 font-semibold text-gray-600">Same</span>
                                        <span class="block ml-2 text-sm text-gray-600">50
                                            minutes</span>
                                    </div>
                                    <span class="block ml-2 text-sm text-gray-600">Good night</span>
                                </div>
                            </a>
                            <a @click="navigate()"
                                class="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none">
                                <img class="object-cover w-10 h-10 rounded-full"
                                    src="https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg"
                                    alt="username" />
                                <div class="w-full pb-2">
                                    <div class="flex justify-between">
                                        <span
                                            class="block ml-2 font-semibold text-gray-600">Emma</span>
                                        <span class="block ml-2 text-sm text-gray-600">6 hour</span>
                                    </div>
                                    <span class="block ml-2 text-sm text-gray-600">Good
                                        Morning</span>
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="hidden md:col-span-2 md:block">
                    <div class="w-full">
                        <div class="relative flex items-center p-3 border-b border-gray-300">
                            <img class="object-cover w-10 h-10 rounded-full"
                                src="https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg"
                                alt="username" />
                            <span class="block ml-2 font-bold text-gray-600">Emma</span>
                            <span class="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3">
                            </span>
                        </div>
                        <div>
                            <div :class="isChatHidden ? 'hidden' : 'flex'"
                                class="relative w-full p-6 overflow-y-auto h-[40rem]">
                                <ul class="space-y-2">
                                    <li class="flex justify-start">
                                        <div
                                            class="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
                                            <span class="block">Hi</span>
                                        </div>
                                    </li>
                                    <li class="flex justify-end">
                                        <div
                                            class="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                                            <span class="block">Hiiii</span>
                                        </div>
                                    </li>
                                    <li class="flex justify-end">
                                        <div
                                            class="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                                            <span class="block">how are you?</span>
                                        </div>
                                    </li>
                                    <li class="flex justify-start">
                                        <div
                                            class="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
                                            <span class="block">Lorem ipsum dolor sit, amet
                                                consectetur
                                                adipisicing elit.
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                            </div>


                            <div v-show="!isBarCodeHidden"
                                class="relative w-full p-6 overflow-y-auto h-[40rem] items-center flex justify-center">
                                <div class="relative w-64">
                                    <canvas class="bg-gray-400 w-64 h-64 rounded-lg relative"
                                        ref="qr"></canvas>

                                    <div v-show="!isLoaderHidden"
                                        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            class="animate-spin w-8 fill-gray-700"
                                            viewBox="0 0 512 512">
                                            <path
                                                d="M468.9 32.11c13.87 0 27.18 10.77 27.18 27.04v145.9c0 10.59-8.584 19.17-19.17 19.17h-145.7c-16.28 0-27.06-13.32-27.06-27.2c0-6.634 2.461-13.4 7.96-18.9l45.12-45.14c-28.22-23.14-63.85-36.64-101.3-36.64c-88.09 0-159.8 71.69-159.8 159.8S167.8 415.9 255.9 415.9c73.14 0 89.44-38.31 115.1-38.31c18.48 0 31.97 15.04 31.97 31.96c0 35.04-81.59 70.41-147 70.41c-123.4 0-223.9-100.5-223.9-223.9S132.6 32.44 256 32.44c54.6 0 106.2 20.39 146.4 55.26l47.6-47.63C455.5 34.57 462.3 32.11 468.9 32.11z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex items-center justify-between w-full p-3 border-t border-gray-300">
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </button>

                            <input type="text" placeholder="Message"
                                class="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
                                name="message" required />
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </button>
                            <button type="submit">
                                <svg class="w-5 h-5 text-gray-500 origin-center transform rotate-90"
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path
                                        d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    // socket.IO config
    props: ['config'],

    data() {
        return {
            isLoaderHidden: false,
            isBarCodeHidden: false,
            isChatHidden: true,
            classes: null
        };
    },

    mounted() {
        // instantiate connection
        const socket = io(this.config.IP + ':' + this.config.PORT);

        // listent to qr
        socket.on('qr', (qr) => {
            window.QRCode.toCanvas(this.$refs.qr, qr, function (error) {
                if (error) {
                    alert("Failed to render QR");
                    return console.error(error);
                }
            });
            this.isLoaderHidden = true;
        });

        // update dom
        socket.on('ready', () => {
            this.isChatHidden = false;
            this.isBarCodeHidden = true;
        });
    },

    methods: {
        navigate: function () {
            console.log(this.classes);
        }
    }
}
</script>