import { getGraph } from "./graphUpdate.js"
import { getState, updateState } from "./state.js"
import { getProtocolRandom } from "./graphUpdate.js"

/** Highlight nodes, links, and tree on a mouseover event
  * @param {Number} i is the color to be highlighted
  * @param {Number} round is the round that the color i refers to
  */
export function highlightColor (i, round) {
    d3.selectAll('rect.graphNode').attr('class', o => o.crtree[round].rank === i ? 'graphNode highlight' : 'graphNode nonhighlight')
    d3.selectAll('line.graphEdge').attr('class', o => (o.source.crtree[round].rank === i &&
       o.target.crtree[round].rank === i) ? 'graphEdge highlight' : 'graphEdge nonhighlight')
    d3.selectAll('#crtrees svg').classed('nonhighlight', true)
    d3.select('#crtree' + i).classed('nonhighlight', false).classed('highlight', true)
  }

/** Reset all highlights (e.g. when the mouseover event is over) */
export function resetHighlightColor () {
  d3.selectAll('#crtrees svg').classed('highlight', false).classed('nonhighlight', false)
  d3.selectAll('rect.graphNode').classed('highlight', false).classed('nonhighlight', false)
  d3.selectAll('line.graphEdge').classed('highlight', false).classed('nonhighlight', false)
}

/** Pulse all nodes of a given color (e.g., when a tree has been clicked)
  * @param {Number} i is the color that should be pulsed
  * @param {Number} round is the round that the color i refers to
  * @return {Function} is a function that, when called, performs the pulse
  */
export function pulser (i, round) {
    return function () {
      d3.selectAll('rect.graphNode')
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
  return getColors()[vertex.level]
}
//TODO highlightvertices and vertex reset the fix 
export function toggleHighlight (vertex){
  const node = d3.selectAll('rect.graphNode').filter(function(d){return d.name === vertex.name});
  const isHighlighted = node.classed('highlight');
  node.classed('highlight', !isHighlighted);
}
export function highlightVertex (vertex) {
  
  d3.selectAll('rect.graphNode').filter(function(d){return d.name === vertex.name}).classed('highlight', true).classed('nonhighlight', false);
}
export async function highlightVertices (vertices){
  d3.selectAll('rect.graphNode').filter(function(d){return vertices.includes(d)}).classed('highlight', true).classed('nonhighlight', false);
}
export async function grayOutVertex(vertex){
  d3.selectAll('rect.graphNode').filter(function(d){return d.name === vertex.name}).classed('highlight', false).classed('nonhighlight', true);
}
export async function grayOutVertices (vertices){
  d3.selectAll('rect.graphNode').filter(function(d){return vertices.includes(d)}).classed('highlight', false).classed('nonhighlight', true);
}
export async function highlightEdges(source, target,color1='gray',color2='black') {
  const sourceX = source.x;
  const sourceY = source.y;
  const targetX = target.x;
  const targetY = target.y;
  d3.selectAll('line.graphEdge')
    .filter(function(d) {
      return (
        (d.source === source && d.target === target) || 
        (d.source === target && d.target === source) 
      );
    })
    .classed('nonhighlight', false)
    .style('stroke', color1) 
    .style('stroke-width', '2px') 
    .attr('x1', sourceX)
    .attr('y1', sourceY)
    .attr('x2', sourceX)
    .attr('y2', sourceY)
    .transition()
    .duration(getState().time)
    .style('stroke', color2) 
    .style('stroke-width', '2px') 
    .attr('x2', targetX)
    .attr('y2', targetY);
}
export function grayOutGraph(){
  d3.selectAll('rect.graphNode').classed('nonhighlight', true);
  d3.selectAll('line.graphEdge').attr('class','graphEdge nonhighlight')
}
export function resetHighlightGraph () {
  d3.selectAll('rect.graphNode').classed('highlight', false).classed('nonhighlight', false)
  d3.selectAll('line.graphEdge').attr('class','graphEdge')
}

export function drawVertexColor(vertex){
  d3.selectAll('rect.graphNode').filter(function(d){return d.name === vertex.name}).attr('fill', getVertexColor)
}
export function drawVerticesColor(vertices){
  d3.selectAll('rect.graphNode').filter(function(d){return vertices.includes(d)}).attr('fill', getVertexColor)
}
export function blendoutGraph(){
  d3.selectAll('rect.graphNode').attr('class','graphNode blendout')
  d3.selectAll('line.graphEdge').attr('class','graphEdge blendout')
}
export function resetBlendout(){
  d3.selectAll('rect.graphNode').classed('highlight', false).classed('blendout', false)
  d3.selectAll('line.graphEdge').classed('blendout', false)
}

export function toggleProtocol(key) {
  return () => {
    document.getElementById(key).classList.toggle("show");
  };
}
export function switchProtocol(key) {
  return () => {
    updateState({ protocol: key });
  };
}
export var colors = [
  "#ff0000",
  "#add8e6",
  "#90ee90",
  "#cfd84f",
  "#e75adc",
  "#FF7B00",
  "gray",
]
export function getColors(){
  return colors
}
export function setColors(newColor,i){
  colors[i]=newColor
}

export const animations= {
  no:{
    time: 0,
    animation: (graph) => {
      drawVerticesColor(graph.vertices)
    },
  },
  simple:{
    time: getState().time,
    animation: async function(graph,vertices,changes){
    const pickedVertices = getState().pickedVertices
    grayOutGraph()
    if (pickedVertices === "changed"){
      vertices = vertices.filter(vertex=> changes[vertex.name][0] != changes[vertex.name][1])
    } else if (pickedVertices === "one") {
      vertices = [vertices[Math.floor(Math.random()*vertices.length)]]
    }
    highlightVertices(vertices)
    await sleep((1051-getState().time)/1.5)
    for (const vertex in changes){
      if (pickedVertices === "changed"){
        const neighbors = graph.vertices.filter(graphNode => changes[vertex][2].some(changesNode => changesNode.name === graphNode.name) && changes[vertex][0] != changes[vertex][1])
        highlightVertices(neighbors)
        if (!getState().sync){
          for (const element in neighbors){
            await sleep((1051-getState().time)/1.5)
            drawVertexColor(graph.vertices[vertex])
            await sleep((1051-getState().time)/1.5)
            grayOutVertex(graph.vertices[vertex])
            grayOutVertices(neighbors)
          }
        }
      } else if (pickedVertices === "all"){
        const neighbors = graph.vertices.filter(graphNode => changes[vertex][2].some(changesNode => changesNode.name === graphNode.name))
        highlightVertices(neighbors)
        if (!getState().sync){
          for (const element in neighbors){
            await sleep((1051-getState().time)/1.5)
            drawVertexColor(graph.vertices[vertex])
            await sleep((1051-getState().time)/1.5)
            grayOutVertex(graph.vertices[vertex])
            grayOutVertices(neighbors)
          }
        }
      } else {
        const neighbors = graph.vertices.filter(graphNode => changes[vertices[0].name][2].some(changesNode => changesNode.name === graphNode.name))
        highlightVertices(neighbors)
        if (!getState().sync){
          await sleep((1051-getState().time)/1.5)
          drawVerticesColor(graph.vertices)
        }
      }

    }
    if(getState().sync){
      await sleep((1051-getState().time)/1.5)
      drawVerticesColor(graph.vertices)
      await sleep((1051-getState().time)/1.5)
    }
    resetHighlightGraph()
    }
  },
  advanced:{
    time: getState().time,
    animation: async function(graph,vertices,changes){
    grayOutGraph()
    const pickedVertices = getState().pickedVertices
    if (pickedVertices === "changed"){
      vertices = vertices.filter(vertex=> changes[vertex.name][0] != changes[vertex.name][1])
    } else if (pickedVertices === "one") {
      vertices = [vertices[Math.floor(Math.random()*vertices.length)]]
    }
    highlightVertices(vertices)
    await sleep((1051-getState().time)/1.5)
      if (pickedVertices === "all"){
        for(const vertex in changes){
          const changesNodes = changes[vertex][2];
          const targets = graph.vertices.filter(graphNode => changesNodes.some(changesNode => changesNode.name === graphNode.name))
        for (const target of targets){
          highlightEdges(graph.vertices[vertex],target);     
        }
        if(!getState().sync){
          await sleep((1051-getState().time)/1.5)
          grayOutVertex(graph.vertices[vertex])
          const neighbors = graph.vertices.filter(graphNode => changesNodes.some(changesNode => changesNode.name === graphNode.name))
          highlightVertices(neighbors)
          await sleep((1051-getState().time)/1.5)
          const targets = graph.vertices.filter(graphNode => changesNodes.some(changesNode => changesNode.name === graphNode.name))
          for (const target of targets){
          highlightEdges(target,graph.vertices[vertex],"black", getColors()[changes[vertex][1]]);}
          highlightVertex(graph.vertices[vertex])
          await sleep((1051-getState().time)/1.5)
          drawVertexColor(graph.vertices[vertex])
          highlightVertex(graph.vertices[vertex])
          await sleep((1051-getState().time)/1.5)
          grayOutVertex(graph.vertices[vertex])
          grayOutVertices(neighbors)
        }
      }
      if (getState().sync){
        await sleep((1051-getState().time)/1.5)
      grayOutVertices(vertices)
      for (const vertex in changes){
        const changesNodes = changes[vertex][2];
        const neighbors = graph.vertices.filter(graphNode => changesNodes.some(changesNode => changesNode.name === graphNode.name))
        highlightVertices(neighbors)
      }
      await sleep((1051-getState().time)/1.5)
      for(const vertex in changes){
        const changesNodes = changes[vertex][2];
        const targets = graph.vertices.filter(graphNode => changesNodes.some(changesNode => changesNode.name === graphNode.name))
      for (const target of targets){
        highlightEdges(target,graph.vertices[vertex],"black", getColors()[changes[vertex][1]]);     
      }
    }
      }
      
      } else if (pickedVertices === "changed"){
        for(const vertex in changes){
          const targets = graph.vertices.filter(graphNode => changes[vertex][2].some(changesNode => changesNode.name === graphNode.name) && changes[vertex][0] != changes[vertex][1])
          for (const target of targets){
            highlightVertex(graph.vertices[vertex])
            highlightEdges(graph.vertices[vertex],target);
            if(!getState().sync){
              await sleep((1051-getState().time)/1.5)
              grayOutVertex(graph.vertices[vertex])
              const neighbors = graph.vertices.filter(graphNode => changes[vertex][2].some(changesNode => changesNode.name === graphNode.name) && changes[vertex][0] != changes[vertex][1])
              highlightVertices(neighbors)
              await sleep((1051-getState().time)/1.5)
              const targets = graph.vertices.filter(graphNode => changes[vertex][2].some(changesNode => changesNode.name === graphNode.name) && changes[vertex][0] != changes[vertex][1])
              for (const target of targets){
              highlightEdges(target,graph.vertices[vertex],"black", getColors()[changes[vertex][1]]);     
              highlightVertex(graph.vertices[vertex])
              await sleep((1051-getState().time)/1.5)
              drawVertexColor(graph.vertices[vertex])
              highlightVertex(graph.vertices[vertex])
              await sleep((1051-getState().time)/1.5)
              grayOutVertex(graph.vertices[vertex])
              grayOutVertices(neighbors)
            } 
          }
      }
      if (getState().sync){
        await sleep((1051-getState().time)/1.5)
      grayOutVertices(vertices)
      for (const vertex in changes){
        const changesNodes = changes[vertex][2];
        const neighbors = graph.vertices.filter(graphNode => changes[vertex][2].some(changesNode => changesNode.name === graphNode.name) && changes[vertex][0] != changes[vertex][1])
        highlightVertices(neighbors)
      }
      await sleep((1051-getState().time)/1.5)
      for(const vertex in changes){
        const changesNodes = changes[vertex][2];
        const targets = graph.vertices.filter(graphNode => changes[vertex][2].some(changesNode => changesNode.name === graphNode.name) && changes[vertex][0] != changes[vertex][1])
      for (const target of targets){
        highlightEdges(target,graph.vertices[vertex],"black", getColors()[changes[vertex][1]]);     
      }

      }
      }
      
    }} else {
      const targets = graph.vertices.filter(graphNode => changes[vertices[0].name][2].some(changesNode => changesNode.name === graphNode.name))
      for (const target of targets){
        highlightEdges(graph.vertices[vertices[0].name],target)
        if(!getState().sync){
          await sleep((1051-getState().time)/1.5)
          grayOutVertex(vertices[0])
          const neighbors = graph.vertices.filter(graphNode => changes[vertices[0].name][2].some(changesNode => changesNode.name === graphNode.name))
          highlightVertices(neighbors)
          await sleep((1051-getState().time)/1.5)
          for (const target of targets){
          highlightEdges(target,graph.vertices[vertices[0].name],"black", getColors()[changes[vertices[0].name][1]]);     
          highlightVertex(vertices[0])
          await sleep((1051-getState().time)/1.5)
          drawVertexColor(vertices[0])
          highlightVertex(vertices[0])
          await sleep((1051-getState().time)/1.5)
          grayOutVertex(vertices[0])
          grayOutVertices(neighbors)
        } 
      }
      }
      if (getState().sync){
        await sleep((1051-getState().time)/1.5)
        highlightVertices(graph.vertices.filter(graphNode => changes[vertices[0].name][2].some(changesNode => changesNode.name === graphNode.name)))
        await sleep((1051-getState().time)/1.5)
        for (const target of targets){
          highlightEdges(target,graph.vertices[vertices[0].name],"black", getColors()[changes[vertices[0].name][1]]);
        }
      }
    }
    if (getState().sync){
      highlightVertices(vertices)
      await sleep((1051-getState().time)/1.5)
      drawVerticesColor(graph.vertices)
      highlightVertices(vertices)
      await sleep((1051-getState().time)/1.5)
    }
    resetHighlightGraph()
    },
  },
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}