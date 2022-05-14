import {useContext, useEffect, useRef, useState} from "react";

type Props = {
    squares: Array<Array<number>> | null
    width: number
    height: number
    scale:number
}


const Canvas = (props: Props) => {
    const canvasRef = useRef(null);

    const scale=props.scale
    let canvasHeight, canvasWidth;

    const W=props.width*scale;
    const H=props.height*scale;

    let clearCanvas = (context, width, height) => {
        // fill background
        context.beginPath();
        context.fillStyle = 'rgb( 255, 255, 255)';
        context.fillRect(0, 0, width, height);

        context.fillStyle = 'rgb( 50, 50, 50)';
        context.fillRect(W, 0, W, H);
        context.save();
    }

    let drawRect = (ctx, no, attr) => {
        const [x0, y0, width, height] = attr;

        const x=x0*scale;
        const y=y0*scale;
        const w=width*scale;
        const h=height*scale;

        ctx.fillStyle = 'rgb(158,168,216)'
        ctx.fillRect(x, canvasHeight - y - h, w, h)
        ctx.strokeStyle = 'rgb( 0, 0, 0)';
        ctx.strokeRect(x, canvasHeight - y - h, w, h)

        ctx.fillStyle = 'rgb( 255, 0, 0)'
        ctx.fillText(no + "", x, canvasHeight - y - h + 10)
    }
    const drawSquares = () => {
        if (!canvasRef.current) return;
        const canvas: any = canvasRef.current;
        const ctx = canvas.getContext('2d');
        clearCanvas(ctx, canvas.width, canvas.height)
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        if (!!props.squares && props.squares.length > 0) {
            ctx.font = "12px serif";
            props.squares.forEach((v, i) => drawRect(ctx, i, v))
        }
    }
    useEffect(() => {
        // TODO: (確認)キャンバスはロード完了してから描画するもよう。
        drawSquares()
    })
    return (
        <>
            <canvas ref={canvasRef} width={W || 400} height={(H || 400) + 10}></canvas>
        </>
    )
}
export default Canvas
