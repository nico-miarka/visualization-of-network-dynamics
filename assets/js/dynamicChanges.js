import { getState, updateState } from "./state.js";
import { skipVoterVertex } from "./protocols.js";
import { changeOpinionSum, plots } from "./plot.js";
import { getGraph } from "./graphUpdate.js";
import { drawVertexColor,grayOutGraph,highlightVertices, drawVerticesColor,resetHighlightGraph, highlightVertex,animations } from "./visuals.js";
import {worker} from './main.js'
let running = false;
let intervalId;

export function reloadSeed(seed) {
  return () => {
    const state = getState();
    state[seed] = Math.random().toString(36).substr(2, 5);
    updateState(state);
  };
}
export function forwards() {
  return async () => {
    const state = getState();
    var changes = getChanges();
    if (changes.length == state.step){
    const newStep = state.step+1
    worker.postMessage({state: state,newStep:newStep,changes:changes,currentNetwork:getGraph()})
    worker.onmessage = (event) => {
        updateState(event.data.state)
        const graph = getGraph();
        for (const vertex in graph.vertices){
          graph.vertices[vertex].level = event.data.currentNetwork[vertex].level
        }
        updateChanges(event.data.changes)
        changeOpinionSum(event.data.changes);
        for (let i=1;i<plotBar.children.length;i++){
          const parentElement = document.getElementById('plot' + i)
          const selectElement = parentElement.querySelector("#plotType");
          plots[selectElement.value].update('plot' + i)
        }
    }
    await sleep(100)
    const graph = getGraph()
    const newChanges = getChanges()
    animations[state.animation].animation(graph,graph.vertices.filter(vertex => newChanges[newChanges.length-1].hasOwnProperty(vertex.name)),newChanges[newChanges.length-1])
    } else {
      changesForward();
      updateState({ step: ++state.step });
    }
  }
}
export function backward(){
  return async () => {
  const state = getState();
  if (state.step > 0){
    const currentNetwork = getGraph();
    const changes = getChanges()[state.step-1];
    const graph = getGraph();
    grayOutGraph()
    const vertices = currentNetwork.vertices.filter(vertex => changes.hasOwnProperty(vertex.name));
    highlightVertices(vertices)
    for (const vertex in changes){
      graph.vertices[vertex].level = changes[vertex][0]
    }
    await sleep(state.time)
    drawVerticesColor(vertices)
    await sleep(state.time);
    resetHighlightGraph()
    updateState({step: --state.step})
    for (let i=1;i<plotBar.children.length;i++){
      const parentElement = document.getElementById('plot' + i)
      const selectElement = parentElement.querySelector("#plotType");
      plots[selectElement.value].update('plot' + i)
    }
  }
}
}
function startStop() {
  return async () => {
    const state = getState();
    const forwardFunction = forwards();
    if (running) {
      clearInterval(intervalId);
      running = false;
    } else {
      intervalId = setInterval(forwardFunction, (1050-state.time) * 4);
      running = true;
    }
  };
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
    const neighbor = changes[name][2]
    highlightVertices(graph.vertices.filter(graphNode => neighbor.some(changesNode => changesNode.name === graphNode.name)))
  }
  await sleep(state.time)
  for (const name in changes){
    graph.vertices[name].level = changes[name][1]
    drawVertexColor(graph.vertices[name])
  }
  await sleep(state.time)
  resetHighlightGraph();
  for (let i=1;i<plotBar.children.length;i++){
    const parentElement = document.getElementById('plot' + i)
    const selectElement = parentElement.querySelector("#plotType");
    plots[selectElement.value].update('plot' + i)
  }
}
export function skipToStep(newStep){
  const state = getState();
  if (state.step >= 0){
    const newNetwork = getNetworkArray()[newStep]
    const graph = getGraph();
    for (const vertex in newNetwork){
      graph.vertices[vertex].level = newNetwork[vertex].level
    }
    drawVerticesColor(graph.vertices)
    updateState({ step: newStep });
}
}
export async function skipSteps(newStep) {
  const state = getState();
  const networkArray = getNetworkArray();
  if (state.step < newStep && newStep < networkArray.length){
    skipToStep(newStep)
  }
  else if (state.step < newStep){
  skipToStep(networkArray.length-1)
  while (state.step < newStep) {
      await skipVoterVertex();
      changeOpinionSum();
      for (const plot in plots){
        plots[plot].update()
      }
      updateState({ step: ++state.step });
      const graph = getGraph();
      updateNetworkArray(graph.vertices.map(obj => ({...obj})))
      }
  }
  if (state.step > newStep) {
    skipToStep(newStep);
  }
  const graph = getGraph();
  for (const vertex of graph.vertices) {
    drawVertexColor(vertex);
  }
}

export const protocolFunctions = {
  backwards: backward,
  startStop: startStop,
  forward: forwards,
};
export const icons = {
  forward: "arrow_forward_ios",
  backwards: "arrow_back_ios",
  startStop: "play_arrow",
};

var changes = [];

export function updateChanges(newChanges) {
  var changes = getChanges();
  changes =changes.concat(newChanges)
  setChanges(changes);
}
export function getChanges() {
  return changes;
}
export function setChanges(newChanges) {
  changes = newChanges;
  worker.postMessage({newChanges:newChanges})
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
