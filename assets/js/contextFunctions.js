
import { resetHighlightGraph } from "./visuals.js"

export const contextFunctions = {
    resetAllHighlights:{
        onClick: resetHighlightGraph,
        text: "reset every highlight"
    },
    resetAllFixedNodes:{
        onClick: ()=>{},
        text: "rest every fixed node"
    },
    toggleFix:{
        onClick: ()=>{},
        text: "fix/unfix every highlighted node"
    },
    changeColor:{
        onClick: ()=>{},
        text: "change color of highlighted nodes"
    },

    
}

