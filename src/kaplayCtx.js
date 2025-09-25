import kaplay from "kaplay";

export default function makeKaplayCtx(){
    return kaplay({
        global: false,
        pixelDensity: 2,
        touchToMouse: true,
        debug: true, // todo: set it false production
        debugKey: "f12",
        canvas: document.getElementById("game"),
    });
}