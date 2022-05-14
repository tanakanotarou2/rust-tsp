import React, {useEffect, useState} from 'react';
import './App.css';
import Container from "./Container";

function App() {
    return (
        <div className="App">
            <h1>長方形詰込み問題</h1>
            <div className="App-body">
            <Container/>
            </div>
            <div className="footer">
                <h2>参考</h2>
                <ul>
                    <li>
                        <cite>梅谷俊治, アルゴリズム実装を教える, オペレーションズ・リサーチ, 59 (2014), 615-621. (http://www.orsj.or.jp/archive2/or59-10/or59_10_615.pdf)</cite>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default App;
