
import { getGraph } from "./graphUpdate.js";
import { resetHighlightGraph } from "./visuals.js"
import {worker} from './main.js'
export const contextFunctions = {
    resetAllHighlights:{
        onClick:  resetHighlightGraph,
        text: "reset highlights"
    },
    resetAllFixedNodes:{
        onClick: resetAllFixedNodes,
        text: "reset fixed nodes"
    },
    toggleFix:{
        onClick: toggleFix,
        text: "fix/unfix highlighted nodes"
    },    
}

function toggleFix(){
    const highlightedNodes = d3.selectAll('rect.graphNode.highlight');
    const highlightedNames = highlightedNodes.data().map(d => d.name);
    const graph = getGraph();
    for (const name of highlightedNames){
        graph.vertices[name].fix = !graph.vertices[name].fix
    }
    worker.postMessage({newGraph:graph})
    highlightedNodes.classed('highlight', function(d) {
        // use the current state of the "nonhighlight" class to toggle it
        return !d3.select(this).classed('highlight');
      });
    highlightedNodes.classed('fixed', function(d) {
        // use the current state of the "nonhighlight" class to toggle it
        return !d3.select(this).classed('fixed');
      })
      .dispatch('classChange');
      

}
function resetAllFixedNodes(){
    const fixedNames = d3.selectAll('rect.graphNode.fixed').data().map(d => d.name);
    const graph = getGraph();
    for (const name of fixedNames){
        graph.vertices[name].fix = !graph.vertices[name].fix
    }
    d3.selectAll('rect.graphNode').classed('highlight', false).classed('fixed', false)
}