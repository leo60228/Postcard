import '../pkg/postcard.js';

let oldFetch = window.fetch.bind(window);
window.fetch = (url, opts = {}) => {
    Object.assign(opts, {credentials: 'include'});
    console.log(url);
    return oldFetch(url, opts);
};

let imgSelector = document.getElementById('img-selector');
let checkpoint = document.getElementById('checkpoint');

let initialized = false;

document.getElementById('form').addEventListener('submit', async e => {
    e.preventDefault();

    if (!initialized) await wasm_bindgen('../pkg/postcard_bg.wasm');

    let maskBuf = await (await fetch('../mask.png')).arrayBuffer();
    let mask = new Uint8Array(maskBuf);
    let imgBuf = await new Response(imgSelector.files[0]).arrayBuffer();
    let img = new Uint8Array(imgBuf);
    let masked = wasm_bindgen.mask(img, mask);
    let blob = new Blob([masked], {type: 'image/png'});
    let url = URL.createObjectURL(blob);
    checkpoint.src = url;
    document.body.className += 'done';
});
