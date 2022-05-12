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

        <div class="bg-gray-400 w-64 h-64" id="qr"></div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    Echo.channel('barcode')
        .listen('GenerateBarcode', (e) => {
            console.log('This works!')
            document.getElementById('qr').innerHTML = `<img src="https://qrcode.tec-it.com/API/QRCode?data=QR+Code+Generator+by+TEC-IT" />`;                

    });
</script>
@endsection