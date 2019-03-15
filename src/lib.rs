mod utils;

use std::io::Cursor;
use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;
use image::{load_from_memory, ImageBuffer, FilterType, GenericImageView, Rgba, Pixel};
use png::*;

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
    let mask = ImageBuffer::<Rgba<u8>, &[u8]>::from_raw(720, 480, mask)?;
    let img = load_from_memory(img).ok()?;

    let mut img = if img.width() != mask.width() || img.height() != mask.height() {
        img.resize(mask.width(), mask.height(), FilterType::Triangle).to_rgba()
    } else {
        img.to_rgba()
    };

    for (px1, px2) in img.pixels_mut().zip(mask.pixels()) {
        px1.channels_mut()[3] = px2.channels()[3];
    }
    
    let mut out = Cursor::new(vec![]);
    let mut enc = png::Encoder::new(&mut out, mask.width(), mask.height());
    enc.set(Compression::Fast);
    enc.set(ColorType::RGBA);
    enc.set(BitDepth::Eight);
    enc.write_header().ok()?.write_image_data(&img.into_raw()).ok()?;

    Some(out.into_inner().into_boxed_slice())
}
