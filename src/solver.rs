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
    fn _dist(&self, rhs: &P) -> f64 {
        let d = self.dist2(rhs);
        (d as f64).sqrt()
    }
    fn dist2(&self, rhs: &P) -> i64 {
        let y = (self.0 - rhs.0) as i64;
        let x = (self.1 - rhs.1) as i64;
        return y * y + x * x;
    }
    fn distI(&self, rhs: &P) -> i64 {
        (self._dist(rhs) * 1000.0) as i64
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

fn calc_score(path: &Vec<P>) -> i64 {
    let mut tot = 0;
    for i in 0..path.len() {
        tot += path[i].distI(&path[(i + 1) % path.len()])
    }
    tot
}

/* ノードの index からコスト計算 */
fn calc_score2(input: &Input, path_idx: &Vec<usize>) -> i64 {
    let path = path_idx.iter().map(|&i| input.p[i]).collect_vec();
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
    let mut best = (i64::MAX, vec![]);

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
use std::mem::swap;

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
    _nearest_addition_method(&input, 0usize)
}

/* 最近追加法 */
pub fn _nearest_addition_method(input: &Input, st: usize) -> Vec<usize> {
    let N = input.n;
    let pos = input.p.clone();

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
    // println!("{:?}", best.1);
    // path_to_idx(&input, &best.1)
    path
}

// 頂点間の距離リストを作成
// 空間O(N^2)使うので、必要であれば先頭 k 件のみ残すようにする
fn gen_dist_list(input: &Input) -> Vec<Vec<(i64, usize)>> {
    (0..input.n).map(|i| {
        let mut lst = vec![];
        for j in 0..input.n {
            if i == j { continue; }
            lst.push((input.p[i].distI(&input.p[j]), j));
        }
        lst.sort();
        lst
    }).collect::<Vec<_>>()
}


fn yamanobori2opt(input: &Input) -> Vec<usize> {
    let dist_list = gen_dist_list(&input);
    _yamanobori2opt(input, &dist_list)
}

fn _yamanobori2opt(input: &Input, dist_lst: &Vec<Vec<(i64, usize)>>) -> Vec<usize> {
    let mut rng = rand_pcg::Pcg64Mcg::new(48);
    let N = input.n;
    let path = nearest_neighbor_solver(&input);
    // let mut path = _nearest_addition_method(&input, 0usize);
    // pos の index と座標の vectorに
    let mut path = path.iter().map(|&i| (i, input.p[i])).collect::<Vec<_>>();

    let mut iter = 0;
    let mut v1_i = 0usize;
    while Timer::get_time() < 3.0 {
        iter += 1;

        // v1->v2 より小さい v2->v3 とできる辺を探す
        let v1 = path[v1_i];
        let v2 = path[(v1_i + 1) % N];

        // v1->v2 とつなぎ変えできるものを探す
        let f = || -> Option<usize>{
            for i in 0..dist_lst[v2.0].len() {
                if dist_lst[v2.0][i].1 == v1.0 { break; }

                let v3_pi = dist_lst[v2.0][i].1;
                let (v3_i, v3) = path.iter().find_position(|&v| v.0 == v3_pi).unwrap();
                let v4 = path[(v3_i + 1) % N];
                if v4.0 == v1.0 { continue; }

                // d(v1,v2) + d(v3,v4) > d(v1,v3) + d(v2,v4)
                if v1.1.distI(&v2.1) + v3.1.distI(&v4.1) > v1.1.distI(&v3.1) + v2.1.distI(&v4.1) {
                    return Some(v3_i);
                }
            }
            None
        };
        if let Some(v3_i) = f() {

            // v2 から v3 までを反転
            let mut l = (v1_i + 1) % N;
            let mut r = v3_i;

            let v3 = path[r];
            // println!("# v1{:?} v2:{:?}, v3:{:?}",v1, v2, v3);
            loop {
                path.swap(l, r);
                l = (l + 1) % N;
                if l == r { break; }
                r = (r + N - 1) % N;
                if l == r { break; }
            }
            let tmp = path.iter().map(|(i, _)| *i).collect::<Vec<_>>();
            // print_result(&input, &tmp);
        } else {};

        v1_i = (v1_i + 1) % N;

        // if iter > 350 { break; }
        if iter%1000==0{
            path.reverse();
        }
    }
    println!("# iter:{}",iter);

    path.into_iter().map(|(i, _)| i).collect::<Vec<_>>()
}


#[cfg(feature = "exp")]
fn print_result(input: &Input, path: &Vec<usize>) {
    let score = calc_score2(&input, &path);
    println!("{}", score);
}

#[cfg(not(feature = "exp"))]
fn print_result(input: &Input, path: &Vec<usize>) {
    for i in 0..path.len() - 1 { print!("{} ", path[i]); }
    println!("{}", path[path.len() - 1]);
}

pub fn main2() {
    let input = parse_input();
    let st = Timer::get_time();
    // let res = nearest_neighbor_solver(&input);
    // let res = nearest_addition_method(&input);
    let res = yamanobori2opt(&input);
    print_result(&input, &res);
}

