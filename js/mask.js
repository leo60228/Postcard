import '../pkg/postcard.js';

let oldFetch = window.fetch.bind(window);
window.fetch = (url, opts = {}) => {
    Object.assign(opts, {credentials: 'include'});
    console.log(url);
    return oldFetch(url, opts);
};

let imgSelector = document.getElementById('img-selector');
let checkpoint = document.getElementById('checkpoint');

let initialization = wasm_bindgen('../pkg/postcard_bg.wasm');
let maskDl = fetch('../mask.bin').then(e => e.arrayBuffer()).then(e => new Uint8Array(e));

document.getElementById('form').addEventListener('submit', async e => {
    e.preventDefault();

    await initialization;

    let mask = await maskDl;
    let imgBuf = await new Response(imgSelector.files[0]).arrayBuffer();
    let img = new Uint8Array(imgBuf);
    //console.profile();
    let masked = wasm_bindgen.mask(img, mask);
    //console.profileEnd();
    let blob = new Blob([masked], {type: 'image/png'});
    let url = URL.createObjectURL(blob);
    checkpoint.src = url;
    document.body.className += 'done';
});
