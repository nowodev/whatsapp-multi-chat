@extends('layout.app')

@section('content')
<div class="flex min-h-full my-32 container mx-auto rounded-lg bg-white">
    <div class="flex p-10 justify-between w-full">
        <div>
            <button
                class="bg-green-500 py-3 px-6 text-white rounded-md font-bold transition ease-in-out delay-150 hover:scale-110 hover:-translate-y-1">
                Generate QR
            </button>
        </div>

        <div class="bg-gray-400 w-64 h-64" id="qr"></div>
    </div>
</div>
@endsection