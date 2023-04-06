import { worker } from "./main.js"
var graph = {}

export function getGraph(){
    return graph
}
export function setGraph(newGraph){
    graph = newGraph
    worker.postMessage({newGraph:newGraph})
}

var protocolRandom = function(){}

export function getProtocolRandom(){
    return protocolRandom
}

export function setProtocolRandom(protocolSeed){
    worker.postMessage({seed:protocolSeed})
    }