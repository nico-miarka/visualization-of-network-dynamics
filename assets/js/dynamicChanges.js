import { getState, updateState } from "./state.js";
import { changeVertex, skipVoterVertex } from "./voter.js";
import { changeOpinionSum } from "./plot.js";
import { updateStateDistribution } from "./draw.js";
import { getGraph } from "./graphUpdate.js";
import { drawVertexColor,grayOutGraph,highlightVertices, drawVerticesColor,resetHighlightGraph, highlightVertex } from "./visuals.js";
let running = false;
let intervalId;

export function reloadSeed(seed) {
  return () => {
    const state = getState();
    state[seed] = Math.random().toString(36).substr(2, 5);
    updateState(state);
  };
}

function startStop() {
  return async () => {
    const state = getState();
    const forwardFunction = forwards();
    if (running) {
      clearInterval(intervalId);
      running = false;
    } else {
      intervalId = setInterval(forwardFunction, state.time * 4);
      running = true;
    }
  };
}
export function forwards() {
  return async () => {
    const state = getState();
    changes = getChanges();
    if (changes.length == state.step){
    await changeVertex();
    changeOpinionSum();
    updateStateDistribution();
    updateState({ step: ++state.step });
    } else {
      changesForward();
      updateState({ step: ++state.step });
    }
  };
}
export function backward(){
  return async () => {
  const state = getState();
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
    const neighbor = changes[name][2]
    highlightVertices(neighbor)
  }
  await sleep(state.time)
  for (const name in changes){
    graph.vertices[name].level = changes[name][1]
    drawVertexColor(graph.vertices[name])
  }
  await sleep(state.time)
  resetHighlightGraph();
}
export function skipBackward(){
  const state = getState();
  if (state.step > 0){
    const changes = getChanges()[state.step-1];
    const graph = getGraph();
    console.log(graph)
    grayOutGraph()
    const vertices = graph.vertices.filter(vertex=> Object.keys(changes).includes(vertex.name.toString()))
    highlightVertices(vertices)
    for (const vertex in changes){
      graph.vertices[vertex].level = changes[vertex][0]
    }
    drawVerticesColor(vertices)
    resetHighlightGraph()
    updateState({ step: --state.step });
}
}


export async function skipSteps(newStep) {
  const state = getState();
  console.log(state.step, newStep);
  while (state.step < newStep) {
    if (changes.length == state.step){
      await skipVoterVertex();
      changeOpinionSum();
      updateStateDistribution();
      updateState({ step: ++state.step });
      } else {
        //TODO fix skipforward bug
        changesForward();
        updateState({ step: ++state.step });
      }
  }
  while (state.step > newStep) {
    skipBackward();
    updateState({ step: --state.step });
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

export function updateChanges(values) {
  const state = getState();
  const changes = getChanges();
  changes[state.step] = values;
  setChanges(changes);
}
export function getChanges() {
  return changes;
}
export function setChanges(newChanges) {
  changes = newChanges;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}