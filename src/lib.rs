mod utils;

use std::io::Cursor;
use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;
use image::*;

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

#[wasm_bindgen]
pub fn mask(img: &[u8], mask: &[u8]) -> Option<Box<[u8]>> {
    let mut img = load_from_memory(img).ok()?.to_rgba();
    let mask = load_from_memory(mask).ok()?.to_rgba();

    for (x, y, px) in img.enumerate_pixels_mut() {
        px.channels_mut()[3] = mask.get_pixel(x, y).channels()[3];
    }
    
    let mut out = Cursor::new(vec![]);
    png::PNGEncoder::new(&mut out).encode(&img, img.width(), img.height(), Rgba::<u8>::color_type()).ok()?;

    Some(out.into_inner().into_boxed_slice())
}
