import { getGraph } from "./graphUpdate.js";
import { getState, updateState } from "./state.js";
import { getChanges } from "./dynamicChanges.js";
import { highlightVertex,highlightVertices, grayOutGraph, resetHighlightGraph, drawVertexColor } from "./visuals.js";
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
    console.log(changes)
    const neighbor = changes[state.step-1][node][1]
    console.log(vertex, neighbor)
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
    const changes = getChanges();
    const graph = getGraph();
    grayOutGraph()
    for (const node in changes[state.step-1]){
      const vertex = graph.vertices[node]
      console.log(changes)
      highlightVertex(vertex)
      await sleep(state.time);
      vertex.level = changes[state.step-1][node][0]
      drawVertexColor(vertex)
      await sleep(state.time);

    }
    updateState({ step: --state.step });
    resetHighlightGraph()
  }
}}

export async function changesForward(){
    const state = getState();
    const changes = getChanges();
    console.log(changes)
    const graph = getGraph();
    grayOutGraph();
    for (const node in changes[state.step]){
      const vertex = graph.vertices[node]
      const neighbor = changes[state.step][node][2]
      highlightVertex(vertex)
      await sleep(state.time)
      highlightVertices(neighbor)
      await sleep(state.time)
      vertex.level = changes[state.step][node][1]
      drawVertexColor(vertex)
      await sleep(state.time)

    }
    resetHighlightGraph();
  }
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}