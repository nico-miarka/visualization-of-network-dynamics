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
      protocolRandom =  Math.seedrandom
          ? new Math.seedrandom(event.data.seed)
          : Math.random

    }
  if (event.data.newGraph){
    vertices = event.data.newGraph.vertices
  } 
  if (event.data.newChanges){
    setChanges(event.data.newChanges)
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
  if (state.step < parseInt(newStep) && state.step < changes.length){
    skipForward(state,changes.length)
    state.step = changes.length
  }
  var newChanges = []
  var counter = 0;
  let newChangesStep;
  while (state.step < newStep) {
    newChangesStep = await protocolExecution(state,currentNetwork);
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
  while (state.step < newStep){
  for (const vertex in changes[state.step]){
    vertices[vertex].level = changes[state.step][vertex][1]
    }
  state.step++;
  }
  setVertices(vertices)
}
async function protocolExecution(state,currentNetwork) {
  var vertices = protocols[state.protocol].pickVertex(state,currentNetwork)
  var neighbors = protocols[state.protocol].pickNeighbors(state,vertices)
  return protocols[state.protocol].changeProtocol(neighbors, state,vertices)
}
const protocols = {
  rumor: {
    pickVertex: pickSpreaders,
    pickNeighbors: (state,vertices) => pickSpreadersNeighbors(vertices),
    changeProtocol: (neighbors,state,vertices)=> changeRumorOpinion(neighbors,state),
  },
  glauber: {
    pickVertex:(state,currentNetwork) => pickVertex(state,currentNetwork),
    pickNeighbors: (state,vertices) => pickSpreadersNeighbors(vertices),
    changeProtocol: (neighbors,state,vertices) => glauberChange(neighbors,state),
  },
  voter: {
    pickVertex:(state,currentNetwork) => pickVertex(state,currentNetwork),
    pickNeighbors: (state,vertices) => pickNeighbors(vertices,1),
    changeProtocol: (neighbors,state,vertices)=> changeVoterOpinion(neighbors,state),
  },
  majority: {
    pickVertex:(state,currentNetwork) => pickVertex(state,currentNetwork),
    pickNeighbors: (state,vertices) => pickNeighbors(vertices,state.majority),
    changeProtocol: (neighbors,state,vertices)=> changeMajorityOpinion(neighbors,state),
  },
  SIRmodel: {
    pickVertex: pickSpreaders,
    pickNeighbors: (state,vertices) => pickSpreadersNeighbors(vertices),
    changeProtocol: (neighbors,state,vertices)=> changeSIRvertex(neighbors,state),
  }
};

function pickVertex(state) {
  var vertices = getVertices()
  const random = getProtocolRandom()
  const numberOfVertices = state.numberOfVertices
  var newVertices = [...vertices]
  const shuffled = newVertices.sort(() => 0.5 - random()).slice(0, numberOfVertices);
  return shuffled
}
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
  return spreader;
}
function pickSpreadersNeighbors(vertices) {
  const neighbors = {};
  for (const vertex of vertices) {
    neighbors[vertex.name] = vertex.neighbors
  }
  return neighbors;
}
function changeSIRvertex(neighbors,state){
  const changesStep = {}
  const random = getProtocolRandom()
  const vertices = getVertices()
  const verticesCopy = vertices.map(obj => ({...obj}))
  for (const vertex in neighbors){
    for (const neighbor of neighbors[vertex]){
      if (neighbor.level === 1){
        const infectionChance = random();
        if (infectionChance < state.beta){
          changesStep[neighbor.name] = [
            1,
            0,
            [vertices[vertex]]
          ]
          if (!state.sync){
            neighbor.level = 0
          } else {
            verticesCopy[neighbor.name].level = 0
          }
          
        }
      }
    }
    const recoveryChance = random();
    if (recoveryChance < state.gamma){
      changesStep[vertex] = [
        0,
        2,
        [vertices[vertex]]
      ]
      if (!state.sync){
        vertices[vertex].level = 2
      } else {
        verticesCopy[vertex].level = 2
      }
    }
  }
  if (state.sync){
    for (const vertex in vertices){
      vertices[vertex].level = verticesCopy[vertex].level
    }
  }
  return changesStep
}
function changeVoterOpinion(neighbors,state) {
  const vertices = getVertices()
  const verticesCopy = vertices.map(obj => ({...obj}))
  const changesStep = {};
    for (const vertex in neighbors) {
    if (!vertices[vertex].fix) {
      changesStep[vertex] = [
        vertices[vertex].level,
        neighbors[vertex][0].level,
        neighbors[vertex],
      ];
      if(!state.sync){
      vertices[vertex].level = neighbors[vertex][0].level;
    } else {
      verticesCopy[vertex].level = neighbors[vertex][0].level
    }
  }
}
  if (state.sync) {
    for (const vertex in neighbors){
      if (!vertices[vertex].fix) {
        vertices[vertex].level = verticesCopy[vertex].level
      }
    }
  }
  setVertices(vertices)
  return changesStep
}
function changeMajorityOpinion(neighborsArray,state) {
  const random = getProtocolRandom();
  const vertices = getVertices();
  const verticesCopy = Object.assign({},vertices)
  const newChangesStep = {}
  for (const vertex in neighborsArray) {
    if (!vertices[vertex].fix){
      const neighbors = neighborsArray[vertex]
      const opinions = neighbors.concat(vertices[vertex]);
      const test = counter(opinions);
      const maxOpinions = getMaxOpinions(test);
      if (maxOpinions.length === 1) {
        newChangesStep[vertex] = [ vertices[vertex].level, maxOpinions[0], neighbors]
        vertices[vertex].level = maxOpinions[0];
      } else {
        if (!maxOpinions.includes(vertex.level)) {
          const newOpinion = maxOpinions[Math.floor(random() * maxOpinions.length)];
          newChangesStep[vertex] = [vertices[vertex].level, newOpinion, neighbors]
          vertices[vertex].level = newOpinion;
        }
      }
    }
  }
  setVertices(vertices)
  return newChangesStep
}

function changeRumorOpinion(vertices,state) {
  const newChangesStep = {}
  const networkVertices = getVertices()
  const networkCopy = networkVertices.map(obj => ({...obj}))
  for (const vertex in vertices) {
  const neighbors = vertices[vertex]
  for (const neighbor of neighbors){
    if (neighbor.level != 0){
      newChangesStep[neighbor.name] = [
        neighbor.level,
        0,
        [networkVertices[vertex]]
      ]
      if(!state.sync){
        neighbor.level = 0;
      } else {
        networkCopy[neighbor.name].level = 0
      }
    }
  }
  }
  if (state.sync) {
    for (const vertex in networkVertices){
        networkVertices[vertex].level = networkCopy[vertex].level
    }
  }
  return newChangesStep
}

function glauberChange(neighbors,state) {
  const random = getProtocolRandom();
  const networkVertices = getVertices()
  const networkCopy = networkVertices.map(obj => ({...obj}))
  const newChangesStep = {};
  const temperature = state.temperature;
  let vertexSpin;
  if (!state.sync){
    for (const vertex in neighbors){
      if (networkVertices[vertex].level == 0) {
        vertexSpin = 1;
      } else {
        vertexSpin = -1;
      }
      var sum = vertexSpin;
      for (const node of neighbors[networkVertices[vertex].name]) {
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
        newChangesStep[networkVertices[vertex].name] = changeGlauberOpinion(networkVertices[vertex], neighbors,changes);
      } else {
        newChangesStep[networkVertices[vertex].name] = [networkVertices[vertex].level , networkVertices[vertex].level , neighbors[networkVertices[vertex].name]]
      }
    }
  } else {
    for (const vertex in neighbors){
      if (networkCopy[vertex].level == 0) {
        vertexSpin = 1;
      } else {
        vertexSpin = -1;
      }
      var sum = vertexSpin;
      for (const node of neighbors[networkCopy[vertex].name]) {
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
        newChangesStep[networkCopy[vertex].name] = changeGlauberOpinion(networkCopy[vertex], neighbors,changes);
      } else {
        newChangesStep[networkCopy[vertex].name] = [networkCopy[vertex].level, networkCopy[vertex].level, neighbors[networkCopy[vertex].name]]
      }
    }
    for (const vertex in networkVertices){
      networkVertices[vertex].level = networkCopy[vertex].level
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
function counter (array){
  var count = {};
  array.forEach(val => count[val.level] = (count[val.level] || 0) + 1);
  return count;
}