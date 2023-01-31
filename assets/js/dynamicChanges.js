import { getState, updateState } from "./state.js";
import { changeVertex } from "./opinion.js";
import { changeVoterVertex } from "./voter.js";
import { update } from "./lib/hash.js";
let running = false;
let intervalId;

function toggleProtocol(key) {
  return () => {
    document.getElementById(key).classList.toggle("show");
  };
}
const toggleOpinion = toggleProtocol("opinion");
const toggleGlauber = toggleProtocol("glauber");
const toggleRumor = toggleProtocol("rumor");
const toggleReload = toggleProtocol("reload");

/** TODO add switchProtocol function to onclick switch protocol + draw new graph */
function switchProtocol(key) {
  return () => {
    updateState({ protocol: key });
  };
}

const switchToRumor = switchProtocol("rumor");
const switchToVoter = switchProtocol("voter");
const switchToMajority = switchProtocol("majority");

export function reloadSeed(seed) {
  return () => {
    const state = getState();
    console.log(state[seed]);
    state[seed] = Math.random().toString(36).substr(2, 5);
    console.log(state[seed]);
    updateState(state);
  };
}
const reloadGraphSeed = reloadSeed("seed");
const reloadColorSeed = reloadSeed("colorSeed");
const reloadProtocolSeed = reloadSeed("protocolSeed");

export const topics = {
  opinion: {
    protocols: ["voter", "majority"],
    onClick: toggleOpinion,
  },
  glauber: {
    protocols: ["glauber", "filler"],
    onClick: toggleGlauber,
  },
  rumor: {
    protocols: ["more", "SIRmodel", "regular"],
    onClick: toggleRumor,
  },
  reload: {
    protocols: ["graph", "color", "algo"],
    onClick: toggleReload,
  },
};
const filler = () => {
  console.log("poof");
}
/** TODO change logic to have one forward backwards pause functoin for every protocol and handle differences outside of functions. */

function startStop (forwardFunction){
  return () =>{
  if(running){
    clearInterval(intervalId);
    running = false;
  } else {
    intervalId = setInterval(forwardFunction, 4000)
    running = true;
  }
}
}
function startStops (){
  return () =>{
  const state = getState()
  const forwardFunction = forwards(state.protocol)
  if(running){
    clearInterval(intervalId);
    running = false;
  } else {
    intervalId = setInterval(forwardFunction, 4000)
    running = true;
  }
}
}
export function forwards(protocol){
  const state = getState()
  updateState({time:state.time+1})
  switch(protocol){
    case "voter":
      return changeVoterVertex
    case "majority":
      return changeVertex
    case "more":
      return filler
    case "SIRmodel":
      return filler
    case "regular":
      return filler
    case "glauber":
      return filler
  }
}
const voterStartStop = startStop(changeVoterVertex)
export const protocols = {
  more: {
    functions: {
      backwards: filler,
      startStop: filler,
      forward: filler,
    },
    onClick: switchToMajority,
  },
  SIRmodel: {
    functions: {
      backwards: filler,
      startStop: filler,
      forward: filler,
    },
    onClick: switchToVoter,
  },
  regular: {
    functions: {
      backwards: filler,
      startStop: filler,
      forward: filler,
    },
    onClick: switchToRumor,
  },
  glauber: {
    functions: {
      backwards: filler,
      startStop: filler,
      forward: filler,
    },
    onClick: switchToVoter,
  },
  filler: {
    functions: {
      backwards: filler,
      startStop: filler,
      forward: filler,
    },
    onClick: switchToVoter,
  },
  voter: {
    functions: {
      backwards: filler,
      startStop: voterStartStop,
      forward: changeVoterVertex,
    },
    onClick: switchToVoter,
  },
  majority: {
    functions: {
      backwards: filler,
      startStop: filler,
      forward: changeVertex,
    },
    onClick: switchToMajority,
  },
  graph: {
    onClick: reloadGraphSeed,
  },
  color: {
    onClick: reloadColorSeed,
  },
  algo: {
    onClick: reloadProtocolSeed,
  },
};
export const icons = {
  forward: "arrow_forward_ios",
  backwards: "arrow_back_ios",
  startStop: "play_arrow",
};

export function controlBarButtons(state, method){
  return protocols[state.protocol].functions[method]
}