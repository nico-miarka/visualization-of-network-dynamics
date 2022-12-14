import {counter} from './lib/counter.js'
import { getState } from './state.js'
import { getGraph } from './graphUpdate.js'
import {highlightVertex, highlightVertices, grayOutGraph,drawVertexColor, resetHighlightGraph} from './visuals.js'

/**TODO Generalize for h-neighbors (h-Majority) */
function pickVertex(graph,random){
    return graph.vertices[Math.floor(random() * graph.vertices.length)]
}

function pickNeighbors(graph,vertex,random,majority){
    const neighbors = []
    for (const i of vertex.neighbors){
        neighbors.push(graph.vertices[i])
    }
    const shuffled = neighbors.sort(() => 0.5 - random());
    return shuffled.slice(0,majority)
}

function getMaxOpinions(opinions){
    let max = 0;
    let result = [];

Object.getOwnPropertyNames(opinions).forEach(k => {
  if (opinions[k] > max) {
    result = [parseInt(k)];
    max = opinions[k];
  } else if (opinions[k] === max) {
    result.push(parseInt(k));
  }
});
    return result
}

function changeOpinion (vertex, neighbors,h){
    if (h === 1){
        vertex.level = neighbors[0].level
        return
    }
    /** own vertex opinion matters in h-majority therefore we include it in opinions */
    const opinions = neighbors.concat(vertex)
    const test = counter(opinions)
    const maxOpinions = getMaxOpinions(test)
    /** TODO what if only one neighbor in h-majority? Draw => no change or Voter => change */
    if (maxOpinions.length === 1){
        vertex.level = maxOpinions[0]
    } else {
        /** if vertex opinion is one of the max opinions, it stays the same, else choose random */
        if(!maxOpinions.includes(vertex.level)){
            vertex.level = maxOpinions[Math.floor(random() * maxOpinions.length)]
        }
    }
    
}

export async function changeVertex (){
    const state = getState()
    const graph = getGraph()
    const random = Math.seedrandom
    ? new Math.seedrandom(state.protocolSeed)
    : Math.random;
    const vertex = pickVertex(graph, random)
    await sleep(2000)
    grayOutGraph()
    highlightVertex(vertex)
    const neighbors = pickNeighbors(graph,vertex, random,state.majority)
    await sleep(2000)
    highlightVertices(neighbors)
    await sleep(2000)
    changeOpinion(vertex,neighbors,state.majority)
    drawVertexColor(vertex)
    await sleep(2000)
    resetHighlightGraph()
    await sleep(2000)
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
