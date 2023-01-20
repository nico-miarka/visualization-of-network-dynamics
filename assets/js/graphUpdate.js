var graph = {}

export function getGraph(){
    return graph
}
export function setGraph(newGraph){
    graph = newGraph
}

var protocolRandom = function(){return 1 }

export function getProtocolRandom(){
    return protocolRandom
}

export function setProtocolRandom(protocolSeed){
    protocolRandom =  Math.seedrandom
        ? new Math.seedrandom(protocolSeed)
        : Math.random

    }