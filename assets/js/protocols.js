import { getGraph, getProtocolRandom } from "./graphUpdate.js";
import { counter } from "./lib/counter.js";
import {
  grayOutGraph,
  resetHighlightGraph,
  highlightVertices,
  drawVerticesColor,
  toggleProtocol,
  switchProtocol,
} from "./visuals.js";
import { updateChanges, reloadSeed} from "./dynamicChanges.js";
import { getState } from "./state.js";


export async function changeVertices(time = getState().time) {
  const state = getState();
  grayOutGraph();
  var vertices = protocols[state.protocol].pickVertex()
  highlightVertices(vertices);
  var neighbors = protocols[state.protocol].pickNeighbors(vertices)
  await sleep(time);
  for (const vertex in neighbors) {
    highlightVertices(neighbors[vertex]);
  }
  await sleep(time);
  protocols[state.protocol].changeProtocol(neighbors,vertices)
  if (state.protocol == "rumor"){
    for (const vertex in neighbors){
      drawVerticesColor(neighbors[vertex])
    }
  } else {
    drawVerticesColor(vertices)
  }
  await sleep(time);
  resetHighlightGraph();
}


export async function skipVoterVertex() {
  const state = getState();
  var vertices = protocols[state.protocol].pickVertex()
  var neighbors = protocols[state.protocol].pickNeighbors(vertices)
  protocols[state.protocol].changeOpinion(neighbors,vertices)
  if (state.protocol == "rumor"){
    for (const vertex in neighbors){
      drawVerticesColor(neighbors[vertex])
    }
  } else {
    drawVerticesColor(vertices)
  }
}

export const protocols = {
  voter: {
    pickVertex:pickVertex,
    pickNeighbors: (vertices) => pickNeighbors(vertices,1),
    changeProtocol: (neighbors)=> changeVoterOpinion(neighbors),
    onClick: switchProtocol("voter"),
  },
  majority: {
    pickVertex:pickVertex,
    pickNeighbors: (vertices) => pickNeighbors(vertices,getState().majority),
    changeProtocol: (neighbors)=> changeMajorityOpinion(neighbors),
    onClick: switchProtocol("majority"),
  },
  rumor: {
    pickVertex: pickSpreaders,
    pickNeighbors: (vertices) => pickSpreadersNeighbors(vertices),
    changeProtocol: (neighbors)=> changeRumorOpinion(neighbors),
    onClick: switchProtocol("rumor"),
  },
  SIRmodel: {
    onClick: switchProtocol("voter"),
  },
  glauber: {
    pickVertex: pickVertex,
    pickNeighbors: (vertices) => pickSpreadersNeighbors(vertices),
    changeProtocol: (neighbors, vertices) => glauberChange(neighbors,vertices),
    onClick: switchProtocol("glauber"),
  },
};
export const reloader = {
  graph: {
    onClick: reloadSeed("seed"),
  },
  color: {
    onClick: reloadSeed("colorSeed"),
  },
  algo: {
    onClick: reloadSeed("protocolSeed"),
  }
}
export function pickVertex() {
  const numberOfVertices = getState().numberOfVertices
  const graph = getGraph();
  const random = getProtocolRandom();
  const vertices = [...graph.vertices];
  const shuffled = vertices.sort(() => 0.5 - random());
  return shuffled.slice(0, numberOfVertices);
}
function pickNeighbors(vertices, majority = 1) {
  const random = getProtocolRandom();
  const neighbors = {};
  for (const vertex of vertices) {
    neighbors[vertex.name] = vertex.neighbors
      .sort(() => 0.5 - random())
      .slice(0, majority);
  }
  return neighbors;
}
function pickSpreaders() {
  const graph = getGraph();
  const spreader = [];
  for (const node of graph.vertices) {
    if (node.level === 0) {
      spreader.push(node);
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
function changeVoterOpinion(neighbors) {
  const graph = getGraph();
  const vertices = {};
    for (const vertex in neighbors) {
    if (!graph.vertices[vertex].fix) {
      vertices[vertex] = [
        graph.vertices[vertex].level,
        neighbors[vertex][0].level,
        neighbors[vertex],
      ];
      graph.vertices[vertex].level = neighbors[vertex][0].level;
    }
  }
  updateChanges(vertices);
}
function changeMajorityOpinion(neighborsArray) {
  const random = getProtocolRandom();

  const graph = getGraph();
  const vertices = {}
  /** own vertex opinion matters in h-majority therefore we include it in opinions */
  for (const vertex in neighborsArray) {
    const neighbors = neighborsArray[vertex]
    const opinions = neighbors.concat(graph.vertices[vertex]);
    const test = counter(opinions);
    const maxOpinions = getMaxOpinions(test);
    if (maxOpinions.length === 1) {
      vertices[vertex] = [ graph.vertices[vertex].level, maxOpinions[0], neighbors]
      graph.vertices[vertex].level = maxOpinions[0];
    } else {
      /** if vertex opinion is one of the max opinions, it stays the same, else choose random */
      if (!maxOpinions.includes(vertex.level)) {
        const newOpinion =
          maxOpinions[Math.floor(random() * maxOpinions.length)];
        vertices[vertex] = [graph.vertices[vertex].level, newOpinion, neighbors]
        graph.vertices[vertex].level = newOpinion;
      }
    }
  }
  updateChanges(vertices);
}

function changeRumorOpinion(vertices) {
  const changes = {}
  const graph = getGraph()
  for (const vertex in vertices) {
  const neighbors = vertices[vertex]
  for (const neighbor of neighbors){
    changes[neighbor.name] = [
      neighbor.level,
      0,
      [graph.vertices[vertex]]
    ]
    neighbor.level = 0;
  }
  }
  updateChanges(changes)
}

function glauberChange(neighbors,vertices) {
  const random = getProtocolRandom();
  const state = getState();
  const changes = {};
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
      changeGlauberOpinion(vertex, neighbors,changes);
    } else {
      changes[vertex.name] = [vertex.level, vertex.level, neighbors[vertex.name]]
    }
  }
  updateChanges(changes);

}
function changeGlauberOpinion(vertex, neighbors,changes) {
  changes[vertex.name] = [
    vertex.level,
    (vertex.level + 1) % 2,
    neighbors[vertex.name]
  ]
  vertex.level = (vertex.level + 1) % 2;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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