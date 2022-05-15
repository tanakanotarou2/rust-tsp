import {useContext, useEffect, useRef, useState} from "react";
import './Container.css';

import {useMountEffect} from "./utils";

import {Network} from "vis-network";

const options = {
    nodes: {
        size: 3,
        shape: 'dot',
        fixed: true,
    },
    edges: {
        smooth: false,
        color:'red'
    }
};

const parseInputText = (txt: string) => {
    const lines = txt.trim().split("\n")
    const n = parseInt(lines[0].trim())
    let positions = lines.slice(1).map(v => v.split(" ").map(v => parseInt(v)))
    return {
        n,
        positions
    }
}


const parseOutputText = (txt: string) => {
    const lines = txt.trim().split("\n")

    let i = 0;
    let steps = [];
    lines.forEach(v => {
        let line = v.trim();
        if (line.length == 0) {
            return
        }
        if (line.startsWith('#')) {
            if (steps.length > 0) {
                steps[steps.length - 1].comments.push(line)
            }
        } else {
            steps.push({
                step: steps.length,
                path: line.split(" ").map(v => parseInt(v)),
                comments: [],
            })
        }
    })
    return steps;
}

const generateRandomDataset = (num: number) => {
    let positions=[];
    for (let i = 0; i < num; i++) {
        positions.push([
            Math.floor(Math.random() * 1000),
            Math.floor(Math.random() * 1000),
        ])
    }
    return {
        n: num,
        positions,
    }
}


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
    const [network, setNetwork] = useState<any>(null)
    const [nodes, setNodes] = useState<any>(null)
    const [step,setStep] = useState<any>(null)
    const [stateList,setStateList]= useState<any>(null)

    // const [selAlgo, setSelAlgo] = useState<string>("NF");
    // const [scale, setScale] = useState<number>(1.0);
    const visJsRef = useRef(null);

    const renderPath = (path) => {
        if (!network) return;
        let edges = []
        for (let i = 1; i < path.length; i++) {
            edges.push({from: path[i - 1], to: path[i]})
        }
        network.setData({edges, nodes})
    }
    const initNetwork = (nodePositions: Array<any>) => {
        try {
            const nodes = nodePositions.map((v, id) => {
                return {id, label: id.toString(), x: v[0], y: v[1]}
            })
            const network =
                visJsRef.current &&
                new Network(visJsRef.current, {nodes, edges: []}, options);
            setNetwork(network)
            setNodes(nodes)
        } catch (e) {
            console.log(e)
        }
    }

    const runSolver = () => {
    }


    let changeRandomDataset = () => {
        const dataset=generateRandomDataset(100)
        let txt=`${dataset.n}\n`
        const positions=dataset.positions.map(v=>`${v[0]} ${v[1]}`).join("\n")
        txt += positions + "\n"
        setInputValue(txt)
        initNetwork(dataset.positions)
    }

    // useEffect(() => {
    //     // const network =
    //     //     visJsRef.current &&
    //     //     new Network(visJsRef.current, {nodes, edges}, options);
    //     // setNetwork(network)
    // }, [visJsRef])


    const handleChangeInput = (event) => {
        setInputValue(event.target.value)
        let data = parseInputText(event.target.value)
        initNetwork(data.positions)
    }
    const handleChangeOutput = (event) => {
        setOutputValue(event.target.value)
        let steps = parseOutputText(event.target.value)
        renderPath(steps[0].path)
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
