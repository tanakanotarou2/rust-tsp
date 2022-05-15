use std::borrow::Borrow;
use std::collections::hash_map::Entry;
use std::ops::{Index, IndexMut};
use itertools::{concat, Itertools};
// use rand_pcg::Mcg128Xsl64;
use std::collections::{BTreeSet, HashMap};
use rand_pcg::Mcg128Xsl64;
use rand::prelude::{IteratorRandom, SliceRandom};
use proconio::{*};
use rand::Rng;
use crate::mat;
use crate::procon_utils::SetMinMax;
use crate::procon_utils::Timer;


/// 座標を表す構造体
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[derive_readable] // proconio で input
pub struct P(pub i32, pub i32);

impl P {
    fn dist(&self, rhs: P) -> f64 {
        let d = self.dist2(rhs);
        (d as f64).sqrt()
    }
    fn dist2(&self, rhs: P) -> i64 {
        let y = (self.0 - rhs.0) as i64;
        let x = (self.1 - rhs.1) as i64;
        return y * y + x * x;
    }
}

#[derive(Clone, Debug)]
pub struct Input {
    pub n: usize,
    pub p: Vec<P>,
}

fn parse_input() -> Input {
    input! {
        n: usize,
		p: [P; n]
	}
    Input { n, p }
}

fn calc_score(path: &Vec<P>) -> f64 {
    let mut tot = 0.0;
    for i in 1..path.len() {
        tot += path[i - 1].dist(path[i])
    }
    tot + path[0].dist(path[path.len() - 1])
}

/**
 * Nearest Neighbor法
 * 最初に任意の出発点を適当に選び、現在いる都市から最も近い都市を選んで移動する
 */
pub fn nearest_neighbor_solver(input: &Input) -> Vec<P> {
    let mut rng = rand_pcg::Pcg64Mcg::new(48);
    let N = input.n;
    let pos = input.p.clone();
    let mut best = (1e10, vec![]);

    while Timer::get_time() < 0.5
    {
        let mut arr = vec![false; N];

        // 始点を選択
        let st = (0..N).choose(&mut rng).unwrap();
        let mut pre_idx = st;
        arr[pre_idx] = true;

        let mut path = vec![pos[pre_idx]];

        for _ in 0..N - 1 {
            let u = pos[pre_idx];
            // 最も近い点
            let (v, ni) = (0..N).filter(|&i| !arr[i]).map(|i| (pos[i].dist2(u), i)).min().unwrap();
            path.push(pos[ni]);
            pre_idx = ni;
            arr[ni] = true;
        }
        let score = calc_score(&path);
        if best.0 > score {
            best = (score, path);
            eprintln!("best score:{}",score);
        }
    }
    best.1
}

pub fn main2() {
    let st = Timer::get_time();
    // let input = parse_input();
    // println!("{:?}", input);
    let mut rng = rand_pcg::Pcg64Mcg::new(48);
    let mut pos = vec![];
    for _ in 0..10 {
        let x = rng.gen_range(0, 100);
        let y = rng.gen_range(0, 100);
        pos.push(P(x, y));
    }
    let input = Input { n: pos.len(), p: pos };
    let res = nearest_neighbor_solver(&input);
    for p in res {
        println!("{} {}", p.0, p.1);
    }
}

