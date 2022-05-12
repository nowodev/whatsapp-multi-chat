@extends('layout.app')

@section('content')
<div class="flex min-h-full my-32 container mx-auto max-w-4xl rounded-lg bg-white">
    <div class="flex p-10 justify-between w-full">
        <div class="container px-5 py-24 mx-auto flex">
            <div id="chatbox"
                class="hidden bg-white rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0 relative z-10 shadow-md">
                <h2 class="text-gray-900 text-lg mb-1 font-medium">Message</h2>
                <div class="relative mb-4">
                    <label for="name" class="leading-7 text-sm text-gray-600">Name</label>
                    <input type="name" id="name" name="name"
                        class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
                </div>
                <div class="relative mb-4">
                    <textarea id="message" name="message"
                        class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
                </div>
                <button
                    class="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Send</button>
            </div>
        </div>

        <canvas class="bg-gray-400 w-64 h-64 animate-pulse rounded-lg" id="qr"></canvas>
    </div>

</div>
@endsection

@section('scripts')
<script src="{{ asset('/js/bundle.js') }}"></script>
<script src="https://cdn.socket.io/4.0.1/socket.io.min.js" integrity="sha384-LzhRnpGmQP+lOvWruF/lgkcqD+WDVt9fU3H4BWmwP5u5LTmkUGafMcpZKNObVMLU" crossorigin="anonymous"></script>
<script>
// socket.IO config
const config = {!! json_encode(config('socketio')) !!}
// instantiate connection
const socket = io(config.IP + ':' + config.PORT);

// listent to qr
socket.on('qr', (qr) => {
    window.QRCode.toCanvas(document.getElementById("qr"), qr, function (error) {
        if (error) {
            alert("Failed to render QR");
            return console.error(error);
        }
    });
});

// update dom
socket.on('ready', () => {
    // alert("Logged In successful!!!");
    document.getElementById('chatbox').classList.remove('hidden')
    document.getElementById('qr').classList.add('hidden')
    // remove the barcode and display
});
</script>
@endsection