import {EffectCallback, useEffect} from "react";

/**
 * 初回のレンダリングでのみ処理する hook
 * https://dev.to/nibble/what-is-useeffect-hook-and-how-do-you-use-it-1p9c#:~:text=Second%20argument%20to%20useEffect,-The%20second%20argument&text=React%20compares%20the%20current%20value,be%20executed%20after%20every%20render.
 */
export const useMountEffect = (func: EffectCallback) => useEffect(func, [])