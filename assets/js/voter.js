import { getGraph, getProtocolRandom } from './graphUpdate.js'
import {counter} from './lib/counter.js'
import {highlightVertex, grayOutGraph,drawVertexColor, resetHighlightGraph, highlightVertices} from './visuals.js'
import { updateChanges } from './dynamicChanges.js'
import { getState } from './state.js'

function changeVoterOpinion(vertex,neighbors){
    updateChanges(vertex.name,vertex.level,neighbors[0].level, neighbors)
    vertex.level = neighbors[0].level

}

export async function changeVoterVertex (){
    const state = getState()
    const graph = getGraph()
    var random = getProtocolRandom()
    var vertex = pickVertex(graph, random)
    await sleep(state.time)
    grayOutGraph()
    highlightVertex(vertex)
    switch (state.protocol){
        case 'voter':
            var neighbors = pickNeighbors(graph,vertex, random,1)
            await sleep(state.time)
            highlightVertices(neighbors)
            await sleep(state.time)
            changeVoterOpinion(vertex,neighbors)
            break;
        case 'majority':
            var neighbors = pickNeighbors(graph,vertex, random,state.majority)
            await sleep(state.time)
            highlightVertices(neighbors)
            await sleep(state.time)
            changeOpinion(vertex,neighbors)
            break;
    }
    drawVertexColor(vertex)
    await sleep(state.time)
    resetHighlightGraph()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
export function pickVertex(graph,random){
    return graph.vertices[Math.floor(random() * graph.vertices.length)]
}

function pickNeighbors(graph,vertex,random,majority=1){
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

function changeOpinion (vertex, neighbors){

    /** own vertex opinion matters in h-majority therefore we include it in opinions */
    const opinions = neighbors.concat(vertex)
    const test = counter(opinions)
    const maxOpinions = getMaxOpinions(test)
    /** TODO what if only one neighbor in h-majority? Draw => no change or Voter => change */
    if (maxOpinions.length === 1){
        updateChanges(vertex.name,vertex.level,maxOpinions, neighbors)
        vertex.level = maxOpinions[0]
    } else {
        /** if vertex opinion is one of the max opinions, it stays the same, else choose random */
        if(!maxOpinions.includes(vertex.level)){
            const newOpinion = maxOpinions[Math.floor(random() * maxOpinions.length)]
            updateChanges(vertex.name,vertex.level,newOpinion, neighbors)
            vertex.level = newOpinion
        }
    }
    
}