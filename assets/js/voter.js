import { getGraph, getProtocolRandom } from "./graphUpdate.js";
import { counter } from "./lib/counter.js";
import {
  highlightVertex,
  grayOutGraph,
  drawVertexColor,
  resetHighlightGraph,
  highlightVertices,
  drawVerticesColor,
} from "./visuals.js";
import { updateChanges } from "./dynamicChanges.js";
import { getState } from "./state.js";
export function pickVertex(numberOfVertices) {
  const graph = getGraph();
  const random = getProtocolRandom();
  const vertices = [...graph.vertices];
  const shuffled = vertices.sort(() => 0.5 - random());
  return shuffled.slice(0, numberOfVertices);
}
function changeVoterOpinion(neighbors) {
  const graph = getGraph();
  const vertices = {};
  //TODO vertex is a list, to allow multiple vertices and their neighbors to be picked in one round. add logic if wanna implement
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

export async function changeVoterVertex(time = getState().time) {
  const state = getState();
  const graph = getGraph();
  var random = getProtocolRandom();
  grayOutGraph();
  switch (state.protocol) {
    case "voter":
      var vertices = pickVertex(state.numberOfVertices);
      highlightVertices(vertices);
      var neighbors = pickNeighbors(graph, vertices, random);
      await sleep(time);
      for (const vertex in neighbors) {
        highlightVertices(neighbors[vertex]);
      }
      await sleep(time);
      changeVoterOpinion(neighbors);
      drawVerticesColor(vertices)
      break;
    case "majority":
      var vertices = pickVertex( state.numberOfVertices);
      highlightVertices(vertices);
      var neighbors = pickNeighbors(graph, vertices, random, state.majority);
      await sleep(time);
      for (const vertex in neighbors) {
        highlightVertices(neighbors[vertex]);
      }
      await sleep(time);
      for (const node of vertices) {
        if (!node.fix) {
          changeOpinion(neighbors, random);
        } else {
          //TODO forward function
          console.log("poof");
        }
      }
      for (const vertex of vertices) {
        drawVertexColor(vertex);
      }
      break;
    case "rumor":
      var vertices = pickSpreaders(graph);
      highlightVertices(vertices);
      var neighbors = pickSpreadersNeighbors(vertices);
      await sleep(time);
      for (const vertex in neighbors) {
        highlightVertices(neighbors[vertex]);
      }
      await sleep(time);
      changeSpreader(neighbors);
      for (const vertex in neighbors){
        drawVerticesColor(neighbors[vertex])
      }
      break;
    case "glauber":
      var vertices = pickVertex(state.numberOfVertices);
      highlightVertices(vertices);
      var neighbors = pickSpreadersNeighbors(vertices);
      await sleep(time);
      for (const vertex in neighbors) {
        highlightVertices(neighbors[vertex])
      }
      await sleep(time);
      glauberChange(vertices, neighbors, random);
      drawVerticesColor(vertices);
      break;
  }
  await sleep(time);
  resetHighlightGraph();
}
export async function skipVoterVertex() {
  const state = getState();
  const graph = getGraph();
  var random = getProtocolRandom();
  switch (state.protocol) {
    case "voter":
      var vertices = pickVertex(state.numberOfVertices);
      var neighbors = pickNeighbors(graph, vertices, random);
      changeVoterOpinion(neighbors);
      break;
    case "majority":
      var vertices = pickVertexstate(state.numberOfVertices);
      var neighbors = pickNeighbors(graph, vertices, random, state.majority);
      for (const node of vertices) {
        if (!node.fix) {
          console.log(node);
          changeOpinion(neighbors, random);
        } else {
          //TODO forward function
          console.log("poof");
        }
      }
      break;
    case "rumor":
      var vertex = pickSpreaders(graph);
      var neighbors = pickSpreadersNeighbors(vertex);
      changeSpreader(neighbors);
      break;
    case "glauber":
      var vertex = pickVertex(state.numberOfVertices);
      var neighbors = pickSpreadersNeighbors(vertex);
      glauberChange(vertex, neighbors, random);
      break;
  }
}
function glauberChange(vertices, neighbors, random) {
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
    console.log(flipChance);
    console.log(randomNum);
    if (randomNum <= flipChance) {
      console.log("success");
      changeGlauberOpinion(vertex, neighbors,changes);
    } else {
      changes[vertex.name] = [vertex.level, vertex.level, neighbors[vertex.name]]
    }
  }
  updateChanges(changes);

}
function changeGlauberOpinion(vertex, neighbors,changes) {
  console.log(vertex)
  changes[vertex.name] = [
    vertex.level,
    (vertex.level + 1) % 2,
    neighbors[vertex.name]
  ]
  vertex.level = (vertex.level + 1) % 2;
}
function pickSpreaders(graph) {
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
    console.log(vertex)
    neighbors[vertex.name] = vertex.neighbors
  }
  return neighbors;
}
function changeSpreader(vertices) {
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
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickNeighbors(graph, vertices, random, majority = 1) {
  const neighbors = {};
  //TODO vertex is a list, to allow multiple vertices and their neighbors to be picked in one round. add logic if wanna implement
  for (const vertex of vertices) {
    neighbors[vertex.name] = vertex.neighbors
      .sort(() => 0.5 - random())
      .slice(0, majority);
  }
  return neighbors;
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

function changeOpinion(neighborsArray, random) {
  const graph = getGraph();
  const vertices = {}
  /** own vertex opinion matters in h-majority therefore we include it in opinions */
  for (const vertex in neighborsArray) {
    const neighbors = neighborsArray[vertex]
    const opinions = neighbors.concat(graph.vertices[vertex]);
    const test = counter(opinions);
    const maxOpinions = getMaxOpinions(test);
    /** TODO what if only one neighbor in h-majority? Draw => no change or Voter => change */
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
