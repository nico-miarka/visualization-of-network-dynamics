/** Compare two trees
  * @param {Tree} T1 is the first tree
  * @param {Tree} T2 is the second tree
  * @return {Number} negative if T1 < T2; positive if T1 > T2; zero if T1 = T2
  *
  * Trees T are objects with at least the following properties:
  * T.children is a (recursively) sorted list of trees
  * T.size is the number of nodes in the tree
  */
export function compareTrees (T1, T2) {
    if (T1 === T2) {
      return 0
    } else if (T1.children.length !== T2.children.length) {
      return T1.children.length - T2.children.length
    } else if (T1.size !== T2.size) {
      return T1.size - T2.size
    } else {
      for (let i = 0; i < T1.children.length; i++) {
        const res = compareTrees(T1.children[i], T2.children[i])
        if (res !== 0) return res
      }
      console.error('several refs to same tree were found, this is not intended.')
    }
}
  
/** Find an isomorphic copy of tree in treelist
    * @param {TreeList} treelist is a list of tree objects
    * @param {TreeList} T represents a tree T as list of children subtrees
    *   and is assumed to be sorted
    * @return {Number} returns i if treelist[i] is the tree T; otherwise -1
    */
export function findTree (treelist, T) {
    for (let i = 0; i < treelist.length; i++) {
      if (treelist[i].children.length === T.length) {
        let couldbe = true
        for (let j = 0; j < T.length; j++) {
          if (treelist[i].children[j] !== T[j]) {
            couldbe = false
            break
          }
        }
        if (couldbe) return i
      }
    }
    return -1
}

/** Draw the CR trees
  * @param {Dictionary} state the current program state
  * @param {TreeList} trees a list of tree objects
  */
 async function drawTrees (state, trees) {
  if (!state.crtrees) return

  const d3treeMaker = d3.tree().size([2 * Math.PI, 30])
    .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)

  const crtrees = d3.select('#crtrees')
  crtrees.selectAll('div').remove()
  crtrees.classed('loading', true)
  for (let i = 0; i < trees.length; i++) {
    const root = d3.hierarchy(trees[i])
    root.sort()
    const d3tree = d3treeMaker(root)

    root.each((v) => {
      [v.x, v.y] = radialPoint(v.x, v.y);
      [v.x, v.y] = [v.x + 46, v.y + 46]
    })

    const div = d3.create('div')
    const svg = div.append('svg').attr('id', 'crtree' + i)
      .style('background-color',
        color(i, trees.length, state.round, treesPerRound.length))

    div.append('div').classed('count', true).text(trees[i].class.length)

    svg.selectAll('line.treeEdge')
      .data(d3tree.links())
      .enter().append('line').classed('treeEdge', true)
      .attr('x1', e => e.source.x)
      .attr('y1', e => e.source.y)
      .attr('x2', e => e.target.x)
      .attr('y2', e => e.target.y)

    svg.selectAll('circle.treeNode')
      .data(root.descendants())
      .enter().append('circle').classed('treeNode', true)
      .classed('rootNode', v => v.parent === null)
      .attr('r', v => v.parent === null ? 5 : 2.5)
      .attr('cx', v => v.x)
      .attr('cy', v => v.y)

    div.on('mouseover', () => { hoveringTreeRound = state.round; highlightColor(i, state.round) })
    div.on('mouseout', () => { hoveringTreeRound = undefined; resetHighlightColor() })
    div.on('click', pulser(i, state.round))
    crtrees.insert(() => div.node(), 'div.loading-animation')
  }
  crtrees.classed('loading', false)
}