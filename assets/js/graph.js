import { getState, updateState } from "./state.js";

/** return default graph with n vertices
 * @param {Number} n vertices
 * @return {Graph}
 */
function create_graph(n,random) {
  const graph = { vertices: [], edges: [] };
  const state = getState()
  var numberOfColors = 2
  if (state.graph === 'majority' || state.graph == "rumor" ){
    numberOfColors = state.numberOfColors
  }
  for (let i = 0; i < n; i++) {
    graph.vertices[i] = { name: i, neighbors: [], level: Math.floor(random() *(numberOfColors-1)  + 0.5)};
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

function addRandomEdges(graph,m,random,maxNumEdges){
  while (graph.edges.length < m && graph.edges.length !== maxNumEdges){
    var edge = makeRandomEdge(graph,random);
    addEdge(graph,edge);
  }
}

function randomWalk(n,m,random,maxNumEdges){
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
  addRandomEdges(graph,m,random,maxNumEdges)
  return graph
  
}
/** Sample a random graph G(n,m)
 * @param {Number} n vertices
 * @param {Number} m edges
 * @return {Graph}
 */
export function randomGraph(n, m, seed) {
  const maxNumEdges = n * (n - 1) / 2
  const random = Math.seedrandom ? new Math.seedrandom(seed) : Math.random; // eslint-disable-line
  const graph = randomWalk(n,m,random,maxNumEdges)
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
/** TODO implement state toggle for topics
*/ 

function toggleProtocol(key){
  return () => {
  document.getElementById(key).classList.toggle('show')
}
}
const toggleOpinion = toggleProtocol('opinion')
const toggleGlauber = toggleProtocol('glauber')
const toggleRumor = toggleProtocol('rumor')

/** TODO add switchProtocol function to onclick switch protocol + draw new graph */
function switchProtocol(key){
  return ()=> {updateState({graph: key})
  console.log(getState().graph)
}
}

const switchToRumor = switchProtocol('rumor')
const switchToVoter = switchProtocol('voter')
const switchToMajority = switchProtocol('majority') 

export const topics = {
  opinion:{
      protocols:{
        voter:{
          icon:'voter icon',
          tooltip: 'voter tooltip',
          functions:{
            forward: 'voter forward',
            backwards: 'voter backwards',
            startStop : 'voter Startstop'
          },
          onClick: switchToVoter
          
        },
        majority:{
          icon: 'majority icon',
          tooltip: 'majority tooltip',
          functions:{
      
          },
          onClick: switchToMajority
        }
      },
      name:'example',
      onClick: toggleOpinion,
  },
  glauber:{
    protocols:{
      glauber:{
        icon: 'glauber icon',
        tooltip: 'glauber tooltip',
        functions:{
    
        },
        onClick: switchToVoter
      },
      filler:{
        icon: 'filler icon',
        tooltip: 'filler tooltip',
        functions:{
    
        },
        onClick: switchToVoter
      }
    },
    name:'example2',
    onClick: toggleGlauber,
  },
  rumor:{
    protocols:{
      regular:{
        icon: 'regular icon',
        tooltip: 'regular tooltip',
        functions:{
    
        },
        onClick:switchToRumor
      },
      SIRmodel:{
        icon: 'SIRmodel icon',
        tooltip: 'SIRmodel tooltip',
        functions:{
    
        },
        onClick: switchToVoter
      },
      more:{
        icon: 'more icon',
        tooltip: 'more tooltip',
        functions:{
    
        },
        onClick: switchToMajority
      }
    },
    name:'example3',
    onClick: toggleRumor,
  }
}
