use std::fs;
use std::env::args;

fn main() {
    let img_buf = fs::read(args().nth(1).unwrap()).unwrap();
    let mask_buf = fs::read(args().nth(2).unwrap()).unwrap();
    let masked = postcard::mask(&img_buf, &mask_buf).unwrap();
    fs::write(args().nth(3).unwrap(), masked).unwrap();
}
