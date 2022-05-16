import React, {useEffect, useState} from 'react';
import './App.css';
import Container from "./Container";

function App() {
    return (
        <div className="App">
            <h1>巡回セールスマン問題</h1>
            <div className="App-body">
            <Container/>
            </div>
            <div className="footer">
                <h2>参考</h2>
                <ul>
                    <li>
                        <cite>梅谷俊治, 巡回セールスマン問題に対する近似解法 (https://sites.google.com/site/shunjiumetani/software-jp)</cite>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default App;
