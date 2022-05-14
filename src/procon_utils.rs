
/// chmin, chmax 関数
pub trait SetMinMax {
    fn chmin(&mut self, v: Self) -> bool;
    fn chmax(&mut self, v: Self) -> bool;
}

impl<T> SetMinMax for T where T: PartialOrd {
    fn chmin(&mut self, v: T) -> bool {
        *self > v && {
            *self = v;
            true
        }
    }
    fn chmax(&mut self, v: T) -> bool {
        *self < v && {
            *self = v;
            true
        }
    }
}


// wasm で time が使えなかったので
// https://github.com/sebcrozet/instant で代用している
pub struct Timer {
    since: instant::Instant,
    duration: f64,
}

impl Timer {
    pub fn new(duration: f64) -> Timer {
        Timer {
            since: instant::Instant::now(),
            duration,
        }
    }
    pub fn t(&self) -> f64 {
        (instant::Instant::now() - self.since).as_secs_f64() * (1.0 / self.duration)
    }

    /*
     * 経過時間取得(sec)
     * 実行経過時間測定用
     * 実行直後に1度コールする。2回目以降は1度目のコールからの経過時間を返す
     *
     */
    pub fn get_time() -> f64 {
        static mut STIME: f64 = -1.0;
        let t = instant::SystemTime::now().duration_since(instant::SystemTime::UNIX_EPOCH).unwrap();
        let ms = t.as_secs() as f64 + t.subsec_nanos() as f64 * 1e-9;
        unsafe {
            if STIME < 0.0 {
                STIME = ms;
            }
            ms - STIME
        }
    }
}




