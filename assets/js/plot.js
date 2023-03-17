import { getGraph } from "./graphUpdate.js";
import { getState} from "./state.js";
import { getChanges } from "./dynamicChanges.js";
export const plots = {
  stateDistribution: {
    onClick: togglePlot("stateDistribution"),
  },
  donut: {
    onClick: togglePlot("donut"),
  }
  

};
function togglePlot(key) {
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
  sumOfOpinions[state.step+1] = Object.assign({}, sumOfOpinions[state.step])
  for (const node in changes[state.step]){
    const vertex = changes[state.step][node][0]
    const neighbor = changes[state.step][node][1]
    sumOfOpinions[state.step+1][vertex]--;
    sumOfOpinions[state.step+1][neighbor]++;
  }
  
}