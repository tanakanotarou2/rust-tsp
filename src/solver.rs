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
use crate::procon_utils::{SetMinMax};
use crate::procon_utils::Timer;

/// 座標を表す構造体
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[derive_readable] // proconio で input
pub struct P(pub i32, pub i32);

impl P {
    fn dist(&self, rhs: &P) -> f64 {
        let d = self.dist2(rhs);
        (d as f64).sqrt()
    }
    fn dist2(&self, rhs: &P) -> i64 {
        let y = (self.0 - rhs.0) as i64;
        let x = (self.1 - rhs.1) as i64;
        return y * y + x * x;
    }
    fn distI(&self, rhs: &P) -> i64 {
        (self.dist(rhs) * 1000.0) as i64
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
    for i in 0..path.len() {
        tot += path[i].dist(&path[(i + 1) % path.len()])
    }
    tot
}

fn calc_score2(input:&Input, path_idx: &Vec<usize>) -> f64 {
    let path=path_idx.iter().map(|&i|input.p[i]).collect_vec();
    calc_score(&path)
}

fn path_to_idx(input: &Input, path: &Vec<P>) -> Vec<usize> {
    let mut used = vec![false; input.n];
    let mut res = vec![];
    for (j, v) in path.iter().enumerate() {
        for (i, u) in input.p.iter().enumerate() {
            if used[i] { continue; }
            if *u == *v {
                res.push(i);
                used[i] = true;
                break;
            }
        }
    }
    res
}

/**
 * Nearest Neighbor法
 * 最初に任意の出発点を適当に選び、現在いる都市から最も近い都市を選んで移動する
 */
pub fn nearest_neighbor_solver(input: &Input) -> Vec<usize> {
    let mut rng = rand_pcg::Pcg64Mcg::new(48);
    let N = input.n;
    let pos = input.p.clone();
    let mut best = (1e10, vec![]);

    while Timer::get_time() < 10.0
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
            let (v, ni) = (0..N).filter(|&i| !arr[i]).map(|i| (pos[i].dist2(&u), i)).min().unwrap();
            path.push(pos[ni]);
            pre_idx = ni;
            arr[ni] = true;
        }
        let score = calc_score(&path);
        if best.0 > score {
            best = (score, path);
            eprintln!("best score:{}", score);
        }
    }
    // println!("{:?}", best.1);
    path_to_idx(&input, &best.1)
}

use std::cmp::Ordering;
use std::collections::BinaryHeap;

#[derive(Copy, Clone, Eq, PartialEq)]
struct Edge {
    cost: i64,
    u: usize,
    v: usize,
}

impl Ord for Edge {
    fn cmp(&self, other: &Self) -> Ordering {
        other.cost.cmp(&self.cost)
    }
}

impl PartialOrd for Edge {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}


pub fn nearest_addition_method(input: &Input) -> Vec<usize> {
    let mut rng = rand_pcg::Pcg64Mcg::new(48);

    let N = input.n;
    let pos = input.p.clone();
    let mut best = (1e10, vec![]);


    while Timer::get_time() < 0.5
    {
        // let st = (0..N).choose(&mut rng).unwrap();
        let st = 0;
        let mut path = vec![st];
        let mut arr = vec![false; N];
        let mut heap = BinaryHeap::new();
        arr[st] = true;

        let mut pre_node = st;
        for i in 0..N - 1 {
            for j in 0..N {
                if arr[j] { continue; }
                heap.push(Edge { u: pre_node, v: j, cost: pos[pre_node].distI(&pos[j]) })
            }

            while let Some(Edge { cost, u, v }) = heap.pop() {
                if arr[v] { continue; }
                arr[v] = true;

                // u に v を接続
                let uidx = path.iter().position(|&x| x == u).unwrap();
                // 隣接点
                let left = (uidx + path.len() - 1) % path.len();
                let right = (uidx + 1) % path.len();
                let x = path[left];
                let y = path[right];
                // let xcost = pos[x].distI(&pos[v]) - pos[x].distI(&pos[u]);
                // let ycost = pos[y].distI(&pos[v]) - pos[y].distI(&pos[u]);
                let xcost = pos[x].distI(&pos[v]) - pos[x].distI(&pos[u]);
                let ycost = pos[y].distI(&pos[v]) - pos[y].distI(&pos[u]);
                // x-v-u-y とするか、x-u-v-yとするか？
                if xcost < ycost {
                    // x と v をつなぐ
                    path.insert(uidx, v);
                } else {
                    path.insert(right, v);
                }
                pre_node = v;

                // print_result(&path);
                // eprintln!("# u, v: {} {}", u,v);
                // eprintln!("# x, y: {} {}", x,y);
                // eprintln!("# xcost, ycost: {} {}", xcost,ycost);

                break;
            }
        }

        let _path = path.iter().map(|&i| pos[i]).collect_vec();
        let score = calc_score(&_path);
        if best.0 > score {
            best = (score, path);
            eprintln!("# best score:{}", score);
        }
        break;
    }
    // println!("{:?}", best.1);
    // path_to_idx(&input, &best.1)
    best.1
}

#[cfg(feature = "exp")]
fn print_result(input:&Input,path: &Vec<usize>) {
    let score=calc_score2(&input,&path);
    println!("{}", score);
}

#[cfg(not(feature = "exp"))]
fn print_result(input:&Input,path: &Vec<usize>) {
    for i in 0..path.len() - 1 { print!("{} ", path[i]); }
    println!("{}", path[path.len() - 1]);
}

pub fn main2() {
    let input = parse_input();
    let st = Timer::get_time();
    let res = nearest_neighbor_solver(&input);
    // let res = nearest_addition_method(&input);
    print_result(&input,&res);
}

