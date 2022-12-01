function pickVertex(graph,random){
    return graph.vertices[Math.floor(random() * graph.vertices.length)]
}

function pickNeighbor(vertex,random){
    return vertex.neighbors[Math.floor(random() * vertex.neighbors.length)]
}

function changeOpinion (vertex, neighbor){
    vertex.level = neighbor.level
}

export function changeVertex (graph,seed){
    const random = Math.seedrandom ? new Math.seedrandom(seed) : Math.random; // eslint-disable-line
    const vertex = pickVertex(graph, random)
    console.log(vertex)
    const neighbor = pickNeighbor(vertex, random)
    changeOpinion(vertex,neighbor)
    console.log(neighbor)
    console.log(vertex)
}

