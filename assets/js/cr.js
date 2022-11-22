/* cr.js | MIT License | https://github.com/holgerdell/color-refinement */

import { compareTrees, findTree } from "./trees.js"

/** Compute a color refinement round at a node
  *
  * @param {Node} v is a node
  * @param {Number} depth is the new depth; assumes that depth-1 trees have been
  *   computed for all neighbors of v
  * @param {TreeList} treelist is a list of all trees that have already been
  *   observed in this round
  */
function refineAtNode (v, depth, treelist) {
  const neighbors = []
  if (depth > 0) {
    for (let i = 0; i < v.neighbors.length; i++) {
      neighbors.push(v.neighbors[i].crtree[depth - 1])
    }
    neighbors.sort(compareTrees)
  }

  let T
  const index = findTree(treelist, neighbors)
  if (index >= 0) T = treelist[index]
  else {
    T = {
      rank: undefined,
      size: 1,
      children: neighbors,
      class: [] // list of vertices with this color
    }
    for (let i = 0; i < neighbors.length; i++) T.size += neighbors[i].size
    treelist.push(T)
  }
  T.class.push(v)
  v.crtree.push(T)
}

/** Run the color refinement algorithm on a graph
  * @param {Graph} graph
  * @return {TreeList} a list trees, such that trees[i]
  * is a sorted list of all cr-trees that occur in round i; each tree T has a
  * property T.rank representing its order in round i.
  */
export function colorRefinement (graph) {
  const trees = []
  let prevNumColors = 0
  for (let round = 0; true; round++) {
    trees[round] = []
    for (let i = 0; i < graph.vertices.length; i++) {
      refineAtNode(graph.vertices[i], round, trees[round])
    }

    trees[round].sort(compareTrees)
    for (let i = 0; i < trees[round].length; i++) {
      trees[round][i].rank = i
    }

    const numColors = trees[round].length
    if (prevNumColors === numColors) {
      trees.pop() // remove last round (since no further refinement occurred)
      return trees
    } else { prevNumColors = numColors }
  }
}
