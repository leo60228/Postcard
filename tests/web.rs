//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

use wasm_bindgen_test::*;

#[wasm_bindgen_test]
fn mask() {
    let img_buf = include_bytes!("./img.png");
    let mask_buf = include_bytes!("./mask.png");
    let verify_buf = include_bytes!("./out.png");
    let masked = postcard::mask(img_buf, mask_buf).unwrap();
    assert_eq!(masked.as_ref(), &verify_buf[..]);
}
