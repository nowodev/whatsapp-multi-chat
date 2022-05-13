<template>
    <div class="flex items-center min-h-screen">
        <div class="container mx-auto justify-center flex">
            <div class="w-1/3 outline border items-center rounded grid grid-cols-1"
                :class="showBarCode ? 'min-w-fit md:grid-cols-3' : ''">
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
                        <h2 class="my-2 mb-2 ml-2 text-lg text-gray-600">Accounts</h2>
                        <li>
                            <a @click="navigate()"
                                class="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-y border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none">
                                <img class="object-cover w-10 h-10 rounded-full"
                                    src="https://cdn.pixabay.com/photo/2018/09/12/12/14/man-3672010__340.jpg"
                                    alt="username" />
                                <div class="w-full">
                                    <span class="ml-5 font-semibold text-gray-600">Jhon
                                        Don</span>
                                </div>
                            </a>
                            <a
                                class="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none">
                                <img class="object-cover w-10 h-10 rounded-full"
                                    src="https://cdn.pixabay.com/photo/2016/06/15/15/25/loudspeaker-1459128__340.png"
                                    alt="username" />
                                <div class="w-full">
                                    <span class="ml-5 font-semibold text-gray-600">Jhon
                                        Don</span>
                                </div>
                            </a>
                            <a
                                class="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none">
                                <img class="object-cover w-10 h-10 rounded-full"
                                    src="https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg"
                                    alt="username" />
                                <div class="w-full">
                                    <span class="ml-5 font-semibold text-gray-600">Jhon
                                        Don</span>
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="hidden md:col-span-2" :class="showBarCode ? 'md:block' : ''">
                    <div class="w-full">
                        <div
                            class="relative w-full p-6 overflow-y-auto h-[32rem] items-center flex justify-center">
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
            showBarCode: false,
            isLoaderHidden: false,
        };
    },

    methods: {
        navigate: function () {
            this.showBarCode = !this.showBarCode

            // instantiate connection
            const socket = io(this.config.IP + ':' + this.config.PORT);

            socket.emit('init', {
                userId: '05edee08-9164-40b3-a3ce-170333b44dda'
            });

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
            socket.on('ready', (chats) => {
                this.$inertia.get(route('chat'))
            });
        }
    },
}
</script>