import { state } from "./defaults.js"

/** Highlight nodes, links, and tree on a mouseover event
  * @param {Number} i is the color to be highlighted
  * @param {Number} round is the round that the color i refers to
  */
export function highlightColor (i, round) {
    d3.selectAll('circle.graphNode').attr('class', o => o.crtree[round].rank === i ? 'graphNode highlight' : 'graphNode nonhighlight')
    d3.selectAll('line.graphEdge').attr('class', o => (o.source.crtree[round].rank === i &&
       o.target.crtree[round].rank === i) ? 'graphEdge highlight' : 'graphEdge nonhighlight')
    d3.selectAll('#crtrees svg').classed('nonhighlight', true)
    d3.select('#crtree' + i).classed('nonhighlight', false).classed('highlight', true)
  }

/** Reset all highlights (e.g. when the mouseover event is over) */
export function resetHighlightColor () {
  d3.selectAll('#crtrees svg').classed('highlight', false).classed('nonhighlight', false)
  d3.selectAll('circle.graphNode').classed('highlight', false).classed('nonhighlight', false)
  d3.selectAll('line.graphEdge').classed('highlight', false).classed('nonhighlight', false)
}

/** Pulse all nodes of a given color (e.g., when a tree has been clicked)
  * @param {Number} i is the color that should be pulsed
  * @param {Number} round is the round that the color i refers to
  * @return {Function} is a function that, when called, performs the pulse
  */
export function pulser (i, round) {
    return function () {
      d3.selectAll('circle.graphNode')
        .transition()
        .duration(100)
        .attr('r', v => radius(v) + (v.crtree[round].rank === i ? 8 : 0))
        .transition()
        .duration(200)
        .attr('r', radius)
    }
  }

/** Radial to Cartesian coordinates
  * @param {Number} x
  * @param {Number} y
  * @return {NumberPair} [x', y']
  */
export function radialPoint (x, y) {
    return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)]
  }

  /** Compute radius of a node.
  * @param {Node} v
  * @return {Number} the radius of the node scales with its degree
  */
export function radius (v) {
    return 5 * Math.sqrt(v.neighbors.length) + 4
  }

  /** Given an object and the total number of objects, returns a color
  * @param {Number} obj is the current object (between 0 and numObjects-1)
  * @param {Number} numObjects is the total number of colors needed
  * @param {Number} round is the current round (between 0 and numRounds-1)
  * @param {Number} numRounds is the total number of color refinement rounds
  *
  * @return {String} an RGB string, such as #ef1d99
  */
 export function color (obj, numObjects, round, numRounds) {
    let fraction = 0
    if (obj < 0 || obj > numObjects - 1) return undefined
    if (numObjects > 1) fraction = obj / (numObjects - 1)
  
    /* Alternative color schemes:
    return d3.interpolateSpectral(fraction);
    return d3.interpolateViridis(fraction);
    return d3.interpolateWarm(fraction);
    return d3.interpolateCool(fraction);
    */
  
    fraction = 1.75 * (1 - fraction)
    if (fraction <= 1) return d3.color(d3.interpolateWarm(fraction)).darker(0.2)
    else return d3.color(d3.interpolateCool(2 - fraction)).darker(0.2)
  }


export function getVertexColor(vertex){
  return state.color[vertex.level]
}

export function toggleHighlight (vertex){
  const node = d3.selectAll('circle.graphNode').filter(function(d){return d.name === vertex.name});
  const isHighlighted = node.classed('highlight');
  node.classed('highlight', !isHighlighted);
}
export function highlightVertex (vertex) {
  d3.selectAll('circle.graphNode').filter(function(d){return d.name === vertex.name}).attr('class','graphNode highlight')
}
export function highlightVertices (vertices){
  d3.selectAll('circle.graphNode').filter(function(d){return vertices.includes(d)}).attr('class','graphNode highlight')
}
export function grayOutGraph(){
  d3.selectAll('circle.graphNode').attr('class','graphNode nonhighlight')
}
export function resetHighlightGraph () {
  console.log('test')
  d3.selectAll('circle.graphNode').classed('highlight', false).classed('nonhighlight', false)
}

export function drawVertexColor(vertex){
  d3.selectAll('circle.graphNode').filter(function(d){return d.name === vertex.name}).attr('fill', getVertexColor)
}
export function drawVerticesColor(vertices){
  d3.selectAll('circle.graphNode').filter(function(d){return vertices.includes(d)}).attr('fill', getVertexColor)
}
export function blendoutGraph(){
  d3.selectAll('circle.graphNode').attr('class','graphNode blendout')
  d3.selectAll('line.graphEdge').attr('class','graphEdge blendout')
}
export function resetBlendout(){
  d3.selectAll('circle.graphNode').classed('highlight', false).classed('blendout', false)
  d3.selectAll('line.graphEdge').classed('blendout', false)
}