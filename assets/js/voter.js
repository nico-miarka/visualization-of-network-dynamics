import { getGraph, getProtocolRandom } from './graphUpdate.js'
import {counter} from './lib/counter.js'
import {highlightVertex, grayOutGraph,drawVertexColor, resetHighlightGraph, highlightVertices,drawVerticesColor} from './visuals.js'
import { updateChanges } from './dynamicChanges.js'
import { getState } from './state.js'

function changeVoterOpinion(neighbors){
    const graph = getGraph();
    //TODO vertex is a list, to allow multiple vertices and their neighbors to be picked in one round. add logic if wanna implement
    for (const vertex in neighbors){
        graph.vertices[vertex].level = graph.vertices[neighbors[vertex]].level
    }
    //updateChanges(vertex[0].name,vertex[0].level,neighbors[0].level, neighbors)
}

export async function changeVoterVertex (){
    const state = getState()
    const graph = getGraph()
    var random = getProtocolRandom()
    grayOutGraph()
    switch (state.protocol){
        case 'voter':
            var vertices = pickVertex(graph, random,2)
            highlightVertices(vertices)
            var neighbors = pickNeighbors(graph,vertices, random)
            await sleep(state.time)
            for (const vertex in neighbors){
                console.log(neighbors[vertex])
                highlightVertex(graph.vertices[neighbors[vertex]])
            }
            await sleep(state.time)
            for (const node of vertices){
                if (!node.fix){
                    changeVoterOpinion(neighbors)
                } else {
                    //TODO forward function 
                    console.log('poof')
                }
            }
            for (const vertex of vertices){
                console.log(vertex)
                drawVertexColor(vertex)
            }
            break;
        case 'majority':
            var vertices = pickVertex(graph, random,2)
            highlightVertices(vertices)
            var neighbors = pickNeighbors(graph,vertices, random,state.majority)
            await sleep(state.time)
            for (const vertex in neighbors){
                console.log(neighbors[vertex])
                highlightVertices(graph.vertices[neighbors[vertex]])
            }
            await sleep(state.time)
            //TODO vertex is a list, to allow multiple vertices and their neighbors to be picked in one round. add logic if wanna implement
            for (const node of vertices){
                if (!node.fix){
                    console.log(node)
                    changeOpinion(neighbors)
                } else {
                    //TODO forward function 
                    console.log('poof')
                }
            }
            for (const vertex of vertices){
                console.log(vertex)
                drawVertexColor(vertex)
            }
            break;
        case 'rumor':
            var vertex = pickSpreaders(graph)
            highlightVertices(vertex)
            console.log(vertex)
            var neighbors = pickSpreadersNeigbors(graph,vertex)
            await sleep(state.time)
            highlightVertices(neighbors)
            await sleep(state.time)
            changeSpreader(neighbors)
            drawVerticesColor(neighbors)
            break;
        case 'glauber':
            var vertex = pickVertex(graph,random,1)
            highlightVertices(vertex)
            var neighbors = pickSpreadersNeigbors(graph,vertex)
            console.log(neighbors)
            await sleep(state.time)
            highlightVertices(neighbors)
            await sleep(state.time)
            glauberChange(vertex, neighbors, random)
            drawVerticesColor(vertex);
            break;


            
    }
    await sleep(state.time)
    resetHighlightGraph()
}
function glauberChange(vertex, neighbors, random){
    const state = getState();
    const temperature = state.temperature
    let vertexSpin
    if (vertex[0].level == 0){
        vertexSpin = 1
    } else {
        vertexSpin = -1
    }
    var sum = vertexSpin
    for (const node of neighbors){
        console.log(node)
        if (node.level == 0){
            sum+=1
        } else {
            sum -=1
        }
    }
    const changeInEnergy = 2*vertexSpin*sum
    const flipChance = (Math.E**((-changeInEnergy)/temperature))/(1+ Math.E**((-changeInEnergy)/temperature))
    const randomNum = random()
    console.log(flipChance)
    console.log(randomNum)
    if (randomNum <= flipChance){
        console.log('success')
        changeGlauberOpinion(vertex, neighbors);
    } 
}
function changeGlauberOpinion(vertex,neighbors){
    updateChanges(vertex[0].name, vertex[0].level, (vertex[0].level+1)%2, neighbors)
    vertex[0].level = (vertex[0].level+1)%2
}
function pickSpreaders(graph){
    const spreader = [];
    for (const node of graph.vertices){
        if (node.level === 0){
            spreader.push(node)
        }
    }
    return spreader
}
function pickSpreadersNeigbors(graph,vertices){
    const neighbors = [];
    for (const vertex in vertices){
        for (const i of vertices[vertex].neighbors){
            if (!neighbors.includes(graph.vertices[i])){
                neighbors.push(graph.vertices[i])
            }
        }
    }
    return neighbors

}
function changeSpreader(vertices){
    for (const vertex in vertices){
        vertices[vertex].level = 0
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
export function pickVertex(graph,random,numberOfVertices){
    const vertices = [...graph.vertices];
    const shuffled = vertices.sort(() => 0.5 - random())
    return shuffled.slice(0,numberOfVertices)
}

function pickNeighbors(graph,vertices,random,majority=1){
    const neighbors = {}
    //TODO vertex is a list, to allow multiple vertices and their neighbors to be picked in one round. add logic if wanna implement
    for (const vertex of vertices){
        neighbors[vertex.name] = vertex.neighbors.sort(() => 0.5 - random()).slice(0,majority);
    }
    return neighbors
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