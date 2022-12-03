/** return default graph with n vertices
 * @param {Number} n vertices
 * @return {Graph}
 */
function create_graph(n,random) {
  const graph = { vertices: [], edges: [] };
  for (let i = 0; i < n; i++) {
    graph.vertices[i] = { name: i, neighbors: [], level: Math.floor(random() *2  + 0.5)};
  }
  return graph;
}
function addEdge(graph,edge){

    graph.edges.push(edge)
    edge.target.neighbors.push(edge.source)
    edge.source.neighbors.push(edge.target)
}
function makeRandomEdge(graph,random){
  var u = graph.vertices[Math.floor(random() * graph.vertices.length)];
  var v = graph.vertices[Math.floor(random() * graph.vertices.length)];
  while (u === v || graph.edges.some(i => ((i.target === v  && i.source === u)|| (i.target === u && i.source === v)))){
    u = graph.vertices[Math.floor(random() * graph.vertices.length)];
    v = graph.vertices[Math.floor(random() * graph.vertices.length)];
  }
  return {source:u, target:v}
}

function addRandomEdges(graph,m,maxNumEdges,random){
  while (graph.edges.length < m && graph.edges.length !== maxNumEdges){
    var edge = makeRandomEdge(graph,random);
    addEdge(graph,edge);
  }
}

function randomWalk(n,m,random){
  const graph = create_graph(n,random)
  const S = new Set(graph.vertices);
  const visited = new Set();
  var currentVertex =
    graph.vertices[Math.floor(random() * graph.vertices.length)];
  S.delete(currentVertex);
  visited.add(currentVertex);
  while (S.size !== 0) {
    var nextVertex =
      graph.vertices[Math.floor(random() * graph.vertices.length)];
    if (!visited.has(nextVertex)) {
      graph.edges.push({ source: currentVertex, target: nextVertex });
      currentVertex.neighbors.push(nextVertex);
      nextVertex.neighbors.push(currentVertex);
      S.delete(nextVertex);
      visited.add(nextVertex);
    }
    currentVertex = nextVertex;
  }
  const maxNumEdges = n * (n - 1) / 2
  addRandomEdges(graph,m,maxNumEdges,random)
  return graph
  
}
/** Sample a random graph G(n,m)
 * @param {Number} n vertices
 * @param {Number} m edges
 * @return {Graph}
 */
export function randomGraph(n, m, seed) {
  const random = Math.seedrandom ? new Math.seedrandom(seed) : Math.random; // eslint-disable-line
  const graph = randomWalk(n, m, random);
  return graph;
}


function crtrees(n,m,random,maxNumEdges){
  if (n < 0 || m < 0 || m > maxNumEdges) return undefined
  const graph = create_graph(n)
  const randomInt = (min, max) => Math.floor(random() * (max - min) + min)
  const state = {}
  for (let i = 0; i < m; i++) {
    const j = randomInt(i, maxNumEdges)
    if (!(i in state)) state[i] = i
    if (!(j in state)) state[j] = j;
    [state[i], state[j]] = [state[j], state[i]]
  }

  /** Cantor's unpairing function
    * @param {Number} k non-negative integer
    * @return {NumberPair} returns the k-th non-negative integer pair (x,y)
    * in the sequence (0,0), (0,1), (1,0), (0,2), (1,1), (2,0), (0,3)...
    */
  function unpair (k) {
    const z = Math.floor((-1 + Math.sqrt(1 + 8 * k)) / 2)
    return [k - z * (1 + z) / 2, z * (3 + z) / 2 - k]
  }

  for (let i = 0; i < m; i++) {
    const [x, y] = unpair(state[i])
    const u = graph.vertices[x]
    const v = graph.vertices[n - 1 - y]
    graph.edges.push({ source: u, target: v })
    u.neighbors.push(v)
    v.neighbors.push(u)
  }
  return graph
}
/** TODO implement real logic : navbar => draw one button for each graphs element | forward start/stop etc handled by function in each element.

const graphs = {
  opinion:{
      functions:[
        toggleasync,
        onestepforward,
        pauseStop,
        etc
      ],
      icon:'example',
      tooltip:'example'
  },
  glauber:{

  },
  rumor:{

  }
  
}*/ 