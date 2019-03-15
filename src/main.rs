use std::fs;
use std::env::args;
use image::*;

fn main() {
    let mask = open(args().nth(1).unwrap()).unwrap().to_rgba().into_vec();
    fs::write(args().nth(2).unwrap(), mask).unwrap();
}
