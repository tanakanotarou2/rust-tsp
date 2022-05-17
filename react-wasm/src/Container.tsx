import {useContext, useEffect, useRef, useState} from "react";
import './Container.css';

import {useMountEffect} from "./utils";

import init, {NN_solver, NA_solver, two_opt_solver} from "rust-tsp";

import {Network} from "vis-network";

/* グラフ設定 */
const options = {
    nodes: {
        size: 2,
        shape: 'dot',
        fixed: true,
    },
    edges: {
        smooth: false,
        color: 'red'
    },
    // node が fixed の場合は false で良い
    physics: false
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
                path: line.split(" ").map(v => parseInt(v.trim())).filter(v => 0 <= v && v <= 10000000),
                comments: [],
            })
        }
    })
    return steps;
}

const generateRandomDataset = (num: number) => {
    let positions = [];
    for (let i = 0; i < num; i++) {
        positions.push([
            Math.floor(Math.random() * 400),
            Math.floor(Math.random() * 400),
        ])
    }
    return {
        n: num,
        positions,
    }
}

const calcDist = (nodes, path) => {
    let dist = 0.0;
    for (let i = 0; i < path.length - 1; i++) {
        let u = nodes[path[i]];
        let v = nodes[path[i + 1]];
        dist += Math.sqrt((u.x - v.x) * (u.x - v.x) + (u.y - v.y) * (u.y - v.y));
    }
    return Math.floor(dist * 100) / 100;
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
    const [inputValue, setInputValue] = useState<string>("")
    const [outputValue, setOutputValue] = useState<string>("")
    const [network, setNetwork] = useState<any>(null)
    const [nodes, setNodes] = useState<any>(null)
    const [steps, setSteps] = useState<any>([])
    const [playFlg, setPlayFlg] = useState<boolean>(false)
    const [stepNo, setStepNo] = useState<number>(0)
    const [loopGraph, setLoopGraph] = useState<boolean>(true)
    const [graphState, setGraphState] = useState<any>({path: [], comments: [], dist: -1})
    const [selAlgo, setSelAlgo] = useState<string>("NN");
    const visJsRef = useRef(null);


    const renderPath = (path, loop = loopGraph) => {
        if (!network) return;
        let edges = []
        const lim = path.length - (loop ? 0 : 1);
        for (let i = 0; i < lim; i++) {
            let u = i;
            let v = (i + 1) % path.length;
            if (path[u] >= 0 && path[u] < nodes.length && path[v] >= 0 && path[v] < nodes.length) {
                edges.push({
                    from: path[u],
                    to: path[v]
                })
            } else {
                return;
            }
        }

        network.setData({edges, nodes})
        network.fit({maxZoomLevel: 2})
    }
    const initNetwork = (nodePositions: Array<any>) => {
        try {
            const nodes = nodePositions.map((v, id) => {
                return {id, label: id.toString(), x: v[0], y: v[1]}
            })
            const network =
                visJsRef.current &&
                new Network(visJsRef.current, {nodes, edges: []}, options);
            network.fit({maxZoomLevel: 2})

            setNetwork(network)
            setNodes(nodes)
        } catch (e) {
            console.log(e)
        }
    }

    const runSolver = () => {
        setPlayFlg(false)

        const inp = parseInputText(inputValue);
        const algo = selAlgo;
        const algoFnc = {
            NN: NN_solver,
            NA: NA_solver,
            '2opt': two_opt_solver,
        }
        init().then(() => {
            const res = algoFnc[algo](inp);
            const txt = res.path.join(" ")
            changeOutput(txt);
            setOutputValue(txt)
        }).catch((e) => {
            console.log(e)
        })
    }

    const _calcDist = (path, loop) => {
        try {
            if (loop) {
                path = path.slice()
                path.push(path[0])
            }
            return calcDist(nodes, path)
        } catch (e) {
            console.log(e)
            return -1
        }
    }

    const changeStep = (steps, step) => {
        if (steps.length <= step) return
        setStepNo(step)
        renderPath(steps[step].path)
        let state = Object.assign({}, steps[step])
        state.comments = steps[step].comments.join("\n");
        state.dist = _calcDist(steps[step].path, loopGraph)
        setGraphState(state)
    }

    const changeRandomDataset = () => {
        const dataset = generateRandomDataset(100)
        let txt = `${dataset.n}\n`
        const positions = dataset.positions.map(v => `${v[0]} ${v[1]}`).join("\n")
        txt += positions + "\n"
        setInputValue(txt)
        initNetwork(dataset.positions)
    }

    // useEffect(() => {
    //     const network =
    //         visJsRef.current &&
    //         new Network(visJsRef.current, {nodes, edges}, options);
    //     setNetwork(network)
    // }, [visJsRef])

    useEffect(() => {
        const interval = setInterval(() => {
            if (playFlg) {
                if (stepNo + 1 < steps.length) {
                    renderPath(steps[stepNo + 1].path)
                    setStepNo((no) => {
                        return no + 1
                    })
                } else {
                    setPlayFlg(() => false)
                }
            }
        }, 50)
        return () => clearInterval(interval)
    })


    const handleChangeInput = (event) => {
        setInputValue(event.target.value)
        let data = parseInputText(event.target.value)
        initNetwork(data.positions)

        setPlayFlg(false)
    }

    const changeOutput = (txt: string) => {
        let steps = parseOutputText(txt)
        setSteps(steps)
        if (steps.length > stepNo) {
            changeStep(steps, stepNo)
        } else {
            changeStep(steps, 0)
            setStepNo(0)
        }
    }
    const handleChangeOutput = (event) => {
        setOutputValue(event.target.value)
        setPlayFlg(false)

        changeOutput(event.target.value)
    }

    const handleChangeStep = (event) => {
        changeStep(steps, Number(event.target.value) || 0)

        setPlayFlg(false)
    }
    const handleClickPlay = () => {
        setPlayFlg(true)
    };

    /* render values */
    const input_placeholder = "N \nx1 y1\nx2 y2"
    const output_placeholder = "x1 y1\nx2 y2"

    let handleChangeGraphLoop = (e) => {
        const checked = e.target.checked;
        let state = Object.assign({}, graphState);
        state['dist'] = _calcDist(state.path, checked);
        setGraphState(state);
        setLoopGraph(checked);
        renderPath(state.path, checked)
    };

    return (
        <>
            <div className={"container"}>
                <div>
                    <div className="input">
                        <div>
                            <div>
                                <label htmlFor="inp">入力データ</label>
                                (<a
                                href={"https://github.com/tanakanotarou2/rust-tsp/blob/main/docs/mondai.md#%E5%85%A5%E5%87%BA%E5%8A%9B"}>入出力説明</a>)
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
                <div className="solver">
                    <h3>ソルバー</h3>
                    <label>
                        <input
                            name="algo"
                            type="radio"
                            onChange={() => setSelAlgo("NN")}
                            value="NN"
                            checked={selAlgo === "NN"}
                        />
                        Nearest Neighbor 法
                    </label>
                    <label>
                        <input
                            name="algo"
                            type="radio"
                            value="NA"
                            checked={selAlgo === "NA"}
                            onChange={() => setSelAlgo("NA")}
                        />
                        最近追加法
                    </label>
                    <label>
                        <input
                            name="algo"
                            type="radio"
                            value="2opt"
                            checked={selAlgo === "2opt"}
                            onChange={() => setSelAlgo("2opt")
                            }
                        />
                        2-opt法
                    </label>
                    <button onClick={runSolver}>ソルバー実行</button>
                </div>
            </div>
            {/* end left panel */}
            <div>
                <div className={"canvas-header"}>
                    <div>
                        <input type="checkbox" id={'chk_loop'}
                               onChange={handleChangeGraphLoop}
                               checked={loopGraph}
                        />
                        <label htmlFor={'chk_loop'}
                               style={{paddingRight: '15px'}}
                        >始点と終点に辺をはる</label>
                    </div>
                    <div className={"step-container"}>
                        <div>
                            <label htmlFor={'step'}>step</label>
                            <input name={'step'} type={'range'} value={stepNo} min={0}
                                   max={steps.length - 1}
                                   style={{width: '150px'}}
                                   onChange={handleChangeStep}
                            />
                            <input type="number" placeholder="0" min={0}
                                   value={stepNo}
                                   style={{marginRight: '5px'}}
                                   onChange={handleChangeStep}
                            />
                            <button onClick={handleClickPlay}>Play</button>
                        </div>
                        <div>
                            <div>
                                <div className={'label'}>dist: {graphState.dist}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={"canvas-body"}>
                    <div ref={visJsRef} style={{height: '500px', width: '500px', minWidth: '500px'}}/>
                </div>
                <div className={"canvas-comment"}>
                    <textarea style={{height: '50px', width: '500px'}}
                              placeholder={"comments"}
                              readOnly={true} value={graphState.comments}></textarea>
                </div>
            </div>
        </>
    )
}
export default Container
