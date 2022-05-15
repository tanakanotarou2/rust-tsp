extern crate console_error_panic_hook;

mod utils;
mod procon_utils;
pub mod solver;

use itertools::Itertools;
use wasm_bindgen::prelude::*;

/**
 * vector 初期化
 * e.g.)
 *  mat![1,2,3]; // [1, 2, 3]
 *  mat![false; N; M]; // false で初期化された N * M の vector
 */
#[macro_export] // declared in the crate root scope
macro_rules! mat {
	($($e:expr),*) => { Vec::from(vec![$($e),*]) };
	($($e:expr,)*) => { Vec::from(vec![$($e),*]) };
	($e:expr; $d:expr) => { Vec::from(vec![$e; $d]) };
	($e:expr; $d:expr $(; $ds:expr)+) => { Vec::from(vec![mat![$e $(; $ds)*]; $d]) };
}


// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


use serde::{Serialize, Deserialize};
use crate::solver::{Input, P};

#[derive(Serialize, Deserialize)]
pub struct SolverRes {
    pub path: Vec<usize>,
}

#[derive(Serialize, Deserialize)]
pub struct SolverInput {
    pub n: usize,
    pub positions: Vec<(i32, i32)>, // x,y
}

pub fn solve<F: Fn(&Input) -> Vec<(usize)>>(jsVal: &JsValue, solver: F) -> JsValue {
    console_error_panic_hook::set_once(); // エラーがあった場合にログ出力
    let inp: SolverInput = jsVal.into_serde().unwrap();
    let mut input = Input {
        n: inp.n,
        p: inp.positions.iter().map(|&v| P(v.0, v.1)).collect_vec(),
    };

    let pos = solver(&input);

    let mut res = SolverRes {
        path: pos.clone()
    };

    JsValue::from_serde(&res).unwrap()
}

#[wasm_bindgen]
pub fn NN_solver(jsVal: &JsValue) -> JsValue {
    console_error_panic_hook::set_once(); // エラーがあった場合にログ出力
    return solve(jsVal, solver::nearest_neighbor_solver);
}
