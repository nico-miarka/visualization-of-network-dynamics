import { getGraph } from "./graphUpdate.js";
import { getState} from "./state.js";
import { drawStateDistribution,updateStateDistribution } from "./draw.js";
export const plots = {
  stateDistribution: {
    onClick: togglePlot("stateDistribution"),
    draw: () => drawStateDistribution('stateDistribution', getSumOfOpinions()),
    update: () => updateStateDistribution('stateDistribution', getSumOfOpinions()),
    reset: () => setSumOfOpinions([sumOpinions()])
  },
  donut: {
    onClick: togglePlot("donut"),
    draw: () => drawStateDistribution('donut', getSumOfOpinions()),
    update: () => updateStateDistribution('donut', getSumOfOpinions()),
    reset: () => setSumOfOpinions([sumOpinions()])
  },
  changeOnTime:{
    onClick: togglePlot("changeOnTime"),
    draw: () => drawStateDistribution('changeOnTime', getSumOfOpinions()),
    update: () => updateStateDistribution('changeOnTime', getSumOfOpinions()),
    reset: () => setSumOfOpinions([sumOpinions()]),
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

export function changeOpinionSum(newChanges){
  console.log(newChanges)
  const sumOfOpinions = getSumOfOpinions();
  console.log(sumOfOpinions)
  const state = getState();
  const lastElement = sumOfOpinions[sumOfOpinions.length-1]
  var sumOfOpinionsCopy = Object.assign({},lastElement)
  for (const changes of newChanges){
    for (const vertex in changes){
      sumOfOpinionsCopy[changes[vertex][0]]--;
      sumOfOpinionsCopy[changes[vertex][1]]++;

    }
    sumOfOpinions[[sumOfOpinions.length]] = sumOfOpinionsCopy
    var sumOfOpinionsCopy = Object.assign({},sumOfOpinionsCopy)
  }

}