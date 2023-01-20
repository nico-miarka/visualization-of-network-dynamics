import {pickVertex} from './opinion.js'
import { getGraph, getProtocolRandom } from './graphUpdate.js'
import {highlightVertex, highlightVertices, grayOutGraph,drawVertexColor, resetHighlightGraph} from './visuals.js'



function pickNeighbor(graph,vertex,random){
    console.log(vertex.neighbors)
    return graph.vertices[vertex.neighbors[Math.floor(random() * vertex.neighbors.length)]]
    
}

function changeVoterOpinion(vertex,neighbor){
    console.log(neighbor)
    console.log(vertex)
    vertex.level = neighbor.level
    console.log(vertex)
}

export async function changeVoterVertex (){
    const graph = getGraph()
    var random = getProtocolRandom()
    var vertex = pickVertex(graph, random)
    await sleep(1000)
    grayOutGraph()
    highlightVertex(vertex)
    var neighbor = pickNeighbor(graph,vertex, random)
    await sleep(1000)
    highlightVertex(neighbor)
    await sleep(1000)
    changeVoterOpinion(vertex,neighbor)
    drawVertexColor(vertex)
    await sleep (1000)
    resetHighlightGraph()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
