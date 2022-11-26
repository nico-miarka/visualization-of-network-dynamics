/** return default graph with n vertices
 * @param {Number} n vertices
 * @return {Graph}
 */
 function create_graph(n) {
  const graph = { vertices: [], edges: [] }
  for (let i = 0; i < n; i++) {
    graph.vertices[i] = { name: i, neighbors: [], level:0}
  }
  return graph
}

/** Sample a random graph G(n,m)
  * @param {Number} n vertices
  * @param {Number} m edges
  * @return {Graph}
  */
export function randomGraph (n, m, seed, option) {
  const maxNumEdges = n * (n - 1) / 2
  if (n < 0 || m < 0 || m > maxNumEdges) return undefined

  const graph = create_graph(n)

  const random = (Math.seedrandom) ? (new Math.seedrandom(seed)) : Math.random // eslint-disable-line
  const randomInt = (min, max) => Math.floor(random() * (max - min) + min)

  /** Generate a list of random integers using sparse Fisher-Yates shuffling */
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