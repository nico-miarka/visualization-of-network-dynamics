import {pickVertex} from './opinion.js'
import { getGraph, getProtocolRandom } from './graphUpdate.js'
import {highlightVertex, grayOutGraph,drawVertexColor, resetHighlightGraph} from './visuals.js'
import { updateChanges,getChanges } from './dynamicChanges.js'
import { getState } from './state.js'

function pickNeighbor(graph,vertex,random){
    return graph.vertices[vertex.neighbors[Math.floor(random() * vertex.neighbors.length)]]
    
}

function changeVoterOpinion(vertex,neighbor){
    updateChanges(vertex.name,vertex.level,neighbor.level, neighbor.name)
    vertex.level = neighbor.level

}

export async function changeVoterVertex (){
    const state = getState()
    const graph = getGraph()
    var random = getProtocolRandom()
    var vertex = pickVertex(graph, random)
    await sleep(state.time)
    grayOutGraph()
    highlightVertex(vertex)
    var neighbor = pickNeighbor(graph,vertex, random)
    await sleep(state.time)
    highlightVertex(neighbor)
    await sleep(state.time)
    changeVoterOpinion(vertex,neighbor)
    drawVertexColor(vertex)
    await sleep(state.time)
    resetHighlightGraph()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
