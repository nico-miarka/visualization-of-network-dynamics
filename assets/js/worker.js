var protocolRandom = function(){}

function getProtocolRandom(){
    return protocolRandom
}

let vertices;
function getVertices(){
  return vertices
}
function setVertices(newVertices){
  vertices = newVertices;
}
var changes = []
function getChanges(){
  return changes
}
function setChanges(newChanges){
  changes = newChanges
}
function updateChanges(newChanges) {
  var changes = getChanges();
  changes =changes.concat(newChanges)
  setChanges(changes);
}
importScripts('https://cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js');

self.addEventListener("message", function(event) {
  if (event.data.seed){
    console.log(event.data.seed)
      protocolRandom =  Math.seedrandom
          ? new Math.seedrandom(event.data.seed)
          : Math.random

    }
  if (event.data.newGraph){
    vertices = event.data.newGraph.vertices
  } 
  if (event.data.state) {
  skipSteps(event.data.state,event.data.newStep,event.data.changesLength,event.data.currentNetwork)

    }
}, false);
async function skipSteps(state,newStep,changesLength,currentNetwork) {
  if (state.step < newStep && newStep < changesLength+1){
  skipForward(state,newStep)
  state.step = newStep
  }
  var newChanges = []
  var counter = 0;
  let newChangesStep;
  while (state.step < newStep) {
    newChangesStep = await skipVoterVertex(state,currentNetwork);
    newChanges[counter] = newChangesStep
    ++state.step;
    ++counter;
      }
      updateChanges(newChanges)
      self.postMessage({state:state,currentNetwork:getVertices(),changes:newChanges})
  if (state.step > newStep) {

    skipBackwards(state,newStep)
    const changes = getChanges()
    state.step = newStep;
    self.postMessage({state:state,currentNetwork:getVertices(),changes:[]})
  }
}
function skipBackwards(state,newStep){
  const changes = getChanges();
  const vertices = getVertices()
  while (state.step > newStep){
    for (const vertex in changes[state.step-1]){
      vertices[vertex].level = changes[state.step-1][vertex][0]
    }
    state.step--;
  }
  setVertices(vertices)
}
function skipForward(state,newStep){
  const changes = getChanges();
  const vertices = getVertices()
  console.log(changes[state.step])
  while (state.step < newStep){
  for (const vertex in changes[state.step]){
    vertices[vertex].level = changes[state.step][vertex][1]
    }
  state.step++;
  }
  setVertices(vertices)
}
async function skipVoterVertex(state,currentNetwork) {
  var vertices = protocols[state.protocol].pickVertex(state,currentNetwork)
  var neighbors = protocols[state.protocol].pickNeighbors(state,vertices)
  return protocols[state.protocol].changeProtocol(neighbors, vertices, state)
}
const protocols = {
  rumor: {
    pickVertex: pickSpreaders,
    pickNeighbors: (state,vertices) => pickSpreadersNeighbors(vertices),
    changeProtocol: (neighbors)=> changeRumorOpinion(neighbors),
  },
  glauber: {
    pickVertex:(state,currentNetwork) => pickVertex(state,currentNetwork),
    pickNeighbors: (state,vertices) => pickSpreadersNeighbors(vertices),
    changeProtocol: (neighbors,vertices,state ) => glauberChange(neighbors,vertices,state),
  },
  voter: {
    pickVertex:(state,currentNetwork) => pickVertex(state,currentNetwork),
    pickNeighbors: (state,vertices) => pickNeighbors(vertices,1),
    changeProtocol: (neighbors)=> changeVoterOpinion(neighbors),
  },
  majority: {
    pickVertex:(state,currentNetwork) => pickVertex(state,currentNetwork),
    pickNeighbors: (state,vertices) => pickNeighbors(vertices,state.majority),
    changeProtocol: (neighbors)=> changeMajorityOpinion(neighbors),
  },
};

function pickVertex(state) {
  var vertices = getVertices()
  const random = getProtocolRandom()
  const numberOfVertices = state.numberOfVertices
  var newVertices = [...vertices]
  const shuffled = newVertices.sort(() => 0.5 - random()).slice(0, numberOfVertices);
  return shuffled
}
//TODO fix fixen und aus dem nichts kommende farben
function pickNeighbors(vertices, majority = 1) {
  const random = getProtocolRandom();
  const neighbors = {};
  for (const vertex of vertices) {
    neighbors[vertex.name] = vertex.neighbors
      .sort(() => 0.5 - random())
      .slice(0, majority);
  }
  return neighbors;s
}
function pickSpreaders() {
  const vertices = getVertices();
  const spreader = [];
  for (const vertex of vertices) {
    if (vertex.level === 0) {
      spreader.push(vertex);
    }
  }
  console.log(vertices)
  return spreader;
}
function pickSpreadersNeighbors(vertices) {
  const neighbors = {};
  for (const vertex of vertices) {
    neighbors[vertex.name] = vertex.neighbors
  }
  return neighbors;
}
function changeVoterOpinion(neighbors) {
  const vertices = getVertices()
  const changesStep = {};
    for (const vertex in neighbors) {
    if (!vertices[vertex].fix) {
      changesStep[vertex] = [
        vertices[vertex].level,
        neighbors[vertex][0].level,
        neighbors[vertex],
      ];
      vertices[vertex].level = neighbors[vertex][0].level;
    }
  }
  setVertices(vertices)
  return changesStep
}
function changeMajorityOpinion(neighborsArray) {
  const random = getProtocolRandom();
  const vertices = getVertices();
  const newChangesStep = {}
  /** own vertex opinion matters in h-majority therefore we include it in opinions */
  for (const vertex in neighborsArray) {
    const neighbors = neighborsArray[vertex]
    const opinions = neighbors.concat(vertices[vertex]);
    const test = counter(opinions);
    const maxOpinions = getMaxOpinions(test);
    /** TODO what if only one neighbor in h-majority? Draw => no change or Voter => change */
    if (maxOpinions.length === 1) {
      newChangesStep[vertex] = [ vertices[vertex].level, maxOpinions[0], neighbors]
      vertices[vertex].level = maxOpinions[0];
    } else {
      /** if vertex opinion is one of the max opinions, it stays the same, else choose random */
      if (!maxOpinions.includes(vertex.level)) {
        const newOpinion =
          maxOpinions[Math.floor(random() * maxOpinions.length)];
        newChangesStep[vertex] = [vertices[vertex].level, newOpinion, neighbors]
        vertices[vertex].level = newOpinion;
      }
    }
  }
  setVertices(vertices)
  return newChangesStep
}

function changeRumorOpinion(vertices) {
  const newChangesStep = {}
  const networkVertices = getVertices()
  for (const vertex in vertices) {
  const neighbors = vertices[vertex]
  for (const neighbor of neighbors){
    newChangesStep[neighbor.name] = [
      neighbor.level,
      0,
      [networkVertices[vertex]]
    ]
    neighbor.level = 0;
  }
  }
  return newChangesStep
}

function glauberChange(neighbors,vertices,state) {
  const random = getProtocolRandom();
  const newChangesStep = {};
  const temperature = state.temperature;
  let vertexSpin;
  for (const vertex of vertices){
    if (vertex.level == 0) {
      vertexSpin = 1;
    } else {
      vertexSpin = -1;
    }
    var sum = vertexSpin;
    for (const node of neighbors[vertex.name]) {
      if (node.level == 0) {
        sum += 1;
      } else {
        sum -= 1;
      }
    }
    const changeInEnergy = 2 * vertexSpin * sum;
    const flipChance =
      Math.E ** (-changeInEnergy / temperature) /
      (1 + Math.E ** (-changeInEnergy / temperature));
    const randomNum = random();
    if (randomNum <= flipChance) {
      newChangesStep[vertex.name] = changeGlauberOpinion(vertex, neighbors,changes);
    } else {
      newChangesStep[vertex.name] = [vertex.level, vertex.level, neighbors[vertex.name]]
    }
  }
  return newChangesStep

}
function changeGlauberOpinion(vertex, neighbors,changes) {
  const newChangesStep = [
    vertex.level,
    (vertex.level + 1) % 2,
    neighbors[vertex.name]
  ]
  vertex.level = (vertex.level + 1) % 2;
  return newChangesStep
}

function getMaxOpinions(opinions) {
  let max = 0;
  let result = [];

  Object.getOwnPropertyNames(opinions).forEach((k) => {
    if (opinions[k] > max) {
      result = [parseInt(k)];
      max = opinions[k];
    } else if (opinions[k] === max) {
      result.push(parseInt(k));
    }
  });
  return result;
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function counter (array){
  var count = {};
  array.forEach(val => count[val.level] = (count[val.level] || 0) + 1);
  return count;
}