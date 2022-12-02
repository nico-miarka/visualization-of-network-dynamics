import {counter} from './lib/counter.js'

/**TODO Generalize for h-neighbors (h-Majority) */
import {highlightVertex, highlightVertices, grayOutGraph,drawVertexColor, resetHighlightGraph} from './visuals.js'
function pickVertex(graph,random){
    return graph.vertices[Math.floor(random() * graph.vertices.length)]
}

function pickNeighbor(vertex,random,majority){
    const shuffled = vertex.neighbors.sort(() => 0.5 - random());
    return shuffled.slice(0,majority)
}

function changeOpinion (vertex, neighbors){
    /** TODO add select max opinion from neighbors (what if multiply opinions with same amount? random?) */
    
}

export async function changeVertex (graph,seed,h){
    const random = Math.seedrandom ? new Math.seedrandom(seed) : Math.random; // eslint-disable-line
    const vertex = pickVertex(graph, random)
    await sleep(500)
    grayOutGraph()
    highlightVertex(vertex)
    const neighbors = pickNeighbor(vertex, random,1)
    await sleep(500)
    highlightVertices(neighbors)
    await sleep(500)
    changeOpinion(vertex,neighbors)
    drawVertexColor(vertex)
    await sleep(3000)
    resetHighlightGraph()
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
