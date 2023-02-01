import { getGraph } from "./graphUpdate.js";
import { getState } from "./state.js";
import { getChanges } from "./dynamicChanges.js";
export const plots = {
  stateDistribution: {
    onClick: toggleProtocol("stateDistribution"),
  }
};
function toggleProtocol(key) {
  return () => {
    document.getElementById(key).classList.toggle("show");
    console.log('poof')
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

export function changeOpinionSum(){
  const sumOfOpinions = getSumOfOpinions();
  const state = getState();
  const changes = getChanges();
  sumOfOpinions[state.time] = Object.assign({}, sumOfOpinions[state.time-1])
  for (const node in changes[state.time-1]){
    const vertex = changes[state.time-1][node][0]
    const neighbor = changes[state.time-1][node][1]
    sumOfOpinions[state.time][vertex]--;
    sumOfOpinions[state.time][neighbor]++;
  }
  
}

