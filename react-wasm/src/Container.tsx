import {useContext, useEffect, useRef, useState} from "react";
import './Container.css';

import {useMountEffect} from "./utils";

import {Network} from "vis-network";

type ProblemResult = {
    squares: Array<Array<number>> | null
    width: number
    height: number
}

const nodes = [
    {id: 1, label:'1',  x:0, y:0},
    {id: 2, label:'2', fixed:true, x:100, y:500},
    {id: 3, title:'test'},
    {id: 4},
    {id: 5},
];

const edges = [
    {from: 1, to: 3},
    {from: 1, to: 2},
    {from: 2, to: 4},
    {from: 2, to: 5},
    {from: 3, to: 3},
];
const options = {
    nodes:{
        size:12,
        shape:'dot',
        fixed:true,
    },
    edges:{
    arrows:'to'
    , smooth:false
    }
};

/**
 * 全体的な管理を行う
 *
 * このコンポーネントで扱う情報
 * - 現在の表示する盤面の状態
 * - 使用するテストデータなど
 * などなど
 */
const Container = () => {
    // const [problemResult, setProblemResult] = useState<ProblemResult>({squares: null, width: 0, height: 0})
    const [inputValue, setInputValue] = useState<string>("")
    const [outputValue, setOutputValue] = useState<string>("")

    // const [selAlgo, setSelAlgo] = useState<string>("NF");
    // const [scale, setScale] = useState<number>(1.0);
    const visJsRef = useRef(null);

    const runSolver = () => {
    }


    let changeRandomDataset = () => {
        // setInputValue(txt)
    }

    useEffect(() => {
        const network =
            visJsRef.current &&
            new Network(visJsRef.current, {nodes, edges}, options);
    }, [visJsRef])

    const handleChangeInput = (event) => {
    }
    const handleChangeOutput = (event) => {
    }

    const input_placeholder = "N \nx1 y1\nx2 y2"
    const output_placeholder = "x1 y1\nx2 y2"

    return (
        <>
            <div className={"container"}>
                <div>
                    <div className="input">
                        <div>
                            <div>
                                <label htmlFor="inp">入力データ</label>
                                {/*(<a*/}
                                {/*href={"https://github.com/tanakanotarou2/rust-rectangle-tsumekomi/blob/main/docs/mondai.md#%E5%85%A5%E5%87%BA%E5%8A%9B"}>入出力説明</a>)*/}
                            </div>
                            <textarea id="inp"
                                      name="inp"
                                      placeholder={input_placeholder}
                                      value={inputValue}
                                      onChange={handleChangeInput}
                            ></textarea>
                        </div>
                        <button onClick={changeRandomDataset}>ランダム入力データ作成</button>
                    </div>
                    <div className="output">
                        <label htmlFor="output">出力</label>
                        <textarea id="output" name="output"
                                  placeholder={output_placeholder}
                                  value={outputValue}
                                  onChange={handleChangeOutput}
                        ></textarea>
                    </div>
                </div>
                {/*<div className="solver">*/}
                {/*    <h3>ソルバー</h3>*/}
                {/*    <label>*/}
                {/*        <input*/}
                {/*            name="algo"*/}
                {/*            type="radio"*/}
                {/*            onChange={() => changeAlgo("NF")}*/}
                {/*            value="NF"*/}
                {/*            checked={selAlgo === "NF"}*/}
                {/*        />*/}
                {/*        NF法*/}
                {/*    </label>*/}
                {/*    <label>*/}
                {/*        <input*/}
                {/*            name="algo"*/}
                {/*            type="radio"*/}
                {/*            value="NFDH"*/}
                {/*            checked={selAlgo === "NFDH"}*/}
                {/*            onChange={() => changeAlgo("NFDH")}*/}
                {/*        />*/}
                {/*        NFDH法*/}
                {/*    </label>*/}
                {/*    <label>*/}
                {/*        <input*/}
                {/*            name="algo"*/}
                {/*            type="radio"*/}
                {/*            value="BLF"*/}
                {/*            checked={selAlgo === "BLF"}*/}
                {/*            onChange={() => changeAlgo("BLF")*/}
                {/*            }*/}
                {/*        />*/}
                {/*        BLF法*/}
                {/*    </label>*/}
                {/*    <button onClick={runSolver}>ソルバー実行</button>*/}
                {/*</div>*/}
            </div>
            {/* end left panel */}
            <div>
                <div className={"canvas-header"}>
                </div>
                <div className={"canvas-body"}>
                    <div ref={visJsRef} style={{height: '500px', width: '800px'}}/>
                </div>
            </div>
        </>
    )
}
export default Container
