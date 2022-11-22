import {radialPoint, highlightColor, resetHighlightColor, pulser, color} from './visuals.js'
let treesPerRound
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