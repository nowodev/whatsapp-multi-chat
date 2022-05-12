@extends('layout.app')

@section('content')
<div class="flex min-h-full my-32 container mx-auto max-w-4xl rounded-lg bg-white">
    <div class="flex p-10 justify-between w-full">
        <div>
            <button id="generate" onclick="axios.post('generate')"
                class="bg-green-500 py-3 px-6 text-white rounded-md font-bold transition ease-in-out delay-150 hover:scale-110 hover:-translate-y-1">
                Generate QR
            </button>
        </div>

        <canvas class="bg-gray-400 w-64 h-64" id="qr"></canvas>
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
    alert("Logged In successful!!!");
    // remove the barcode and display 
});
</script>
@endsection