import { getGraph } from "./graphUpdate.js";
import { getState, updateState } from "./state.js";
import { getChanges } from "./dynamicChanges.js";
import { highlightVertex,highlightVertices, grayOutGraph, resetHighlightGraph, drawVerticesColor } from "./visuals.js";
export const plots = {
  stateDistribution: {
    onClick: toggleProtocol("stateDistribution"),
  },
  donut: {
    onClick: toggleProtocol("donut"),
  }
  

};
function toggleProtocol(key) {
  return async () => {
    document.getElementById(key).classList.toggle("showPlot");
};
}

export function sumOpinions(){
  const state = getState();
  const opinionSum = {};
  for (let i =0; i<state.numberOfColors;i++){
    opinionSum[i] = 0;
  }
  const graph = getGraph();
  for (const node in graph.vertices){
    opinionSum[graph.vertices[node].level]++;
  }
  return opinionSum
}

export var sumOfOpinions = [];

export function getSumOfOpinions(){
  return sumOfOpinions;
}

export function setSumOfOpinions(newSum){
  sumOfOpinions = newSum;
}
//TODO doesnt work for 3 opinions. even though blue should stay the same it increments.
export function changeOpinionSum(){
  const sumOfOpinions = getSumOfOpinions();
  const state = getState();
  const changes = getChanges();
  sumOfOpinions[state.step] = Object.assign({}, sumOfOpinions[state.step-1])
  for (const node in changes[state.step-1]){
    const vertex = changes[state.step-1][node][0]
    const neighbor = changes[state.step-1][node][1]
    sumOfOpinions[state.step][vertex]--;
    sumOfOpinions[state.step][neighbor]++;
  }
  
}
//TODO maybe add that the vertices get highlighted, even though there is no change in the time stamp
export function backward(){
  return async () => {
  const state = getState();
  console.log(state.step)
  if (state.step > 0){
    const changes = getChanges()[state.step-1];
    const graph = getGraph();
    grayOutGraph()
    const vertices = graph.vertices.filter(vertex=> Object.keys(changes).includes(vertex.name.toString()))
    highlightVertices(vertices)
    await sleep(state.time);
    for (const vertex in changes){
      graph.vertices[vertex].level = changes[vertex][0]
    }
    drawVerticesColor(vertices)
    await sleep(state.time);
    resetHighlightGraph()
    updateState({step: --state.step})
  }
}
}

export async function changesForward(){
    const state = getState();
    const changes = getChanges()[state.step];
    const graph = getGraph();
    grayOutGraph();
    for (const name in changes){
      const vertex = graph.vertices[name]
      highlightVertex(vertex)
    }
    await sleep(state.time)
    for (const name in changes){
      const neighbor = graph.vertices.filter(vertex=> changes[name][2].includes(vertex.name))
      console.log(neighbor)
      highlightVertices(neighbor)
    }
    await sleep(state.time)
    for (const name in changes){
      graph.vertices[name].level = changes[name][1]
    }
    const vertices = graph.vertices.filter(vertex=> Object.keys(changes).includes(vertex.name.toString()))
    drawVerticesColor(vertices)
    await sleep(state.time)
    resetHighlightGraph();
  }
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}