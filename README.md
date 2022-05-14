## これはなに
Rust、 React の練習アプリケーション。

巡回セールマン問題を Rust で解き React で描画する。

https://tanakanotarou2.github.io/rust-tsp/

## 開発メモ

### 環境構築

基本的には以下に従い、開発環境を作成する。

https://tkat0.github.io/posts/how-to-create-a-react-app-with-rust-and-wasm

#### wasm build

```
wasm-pack build --target web
```

`target` オプションは `web` を指定する。  
オプションなしでは `bundler` となるが、これは webpack の設定を行える場合に使用する。
しかし、このアプリでは React のアプリケーションを `create-react-app` で作成し、webpack の設定を手動で行わないため、target を web とする。

https://rustwasm.github.io/docs/wasm-bindgen/reference/deployment.html#deploying-rust-and-webassembly

wasm-pack でのビルドは `react-wasm/` で `npm run build:wasm` でもできるようにしている。

### React から wasm function の呼び出し

```js
import init, {greet} from "rust-tsumekomi";

// init が完了後に 目当ての関数をコールする
init().then(()=>{
    greet();
})
```

## デプロイ

`gh-pages` を使ってデプロイします。

前もって、`npm run build:wasm`, `npm run build` を行います。  
ビルドされたモジュールを `npm run deploy` を実行し、github へアップロードします。
しばらくするとデプロイされてページが更新されます。
