import { getState, updateState } from "./state.js";
import { changeVertex } from "./opinion.js";
import { changeVoterVertex } from "./voter.js";
import { changeOpinionSum, getSumOfOpinions } from "./plot.js";
import { updateStateDistribution } from "./draw.js";
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
    state[seed] = Math.random().toString(36).substr(2, 5);
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
};

function startStop() {
  return async () => {
    const state = getState();
    const forwardFunction = forwards();
    if (running) {
      clearInterval(intervalId);
      running = false;
    } else {
      intervalId = setInterval(forwardFunction, 4500);
      running = true;
    }
  };
}
export function forwards() {
  return async() => {
    const state = getState();
    changes = getChanges()
    changes[state.time] = {}
    updateState({ time: ++state.time });
    switch (state.protocol) {
      case "voter":
        await changeVoterVertex();
        break;
      case "majority":
        await changeVertex();
        break;
      case "more":
        filler();
        break;
      case "SIRmodel":
        filler();
        break;
      case "regular":
        filler();
        break;
      case "glauber":
        filler();
        break;
    }
    changeOpinionSum();
    console.log(getSumOfOpinions());
    updateStateDistribution();
  };
}
export const protocolFunctions = {
  backwards: filler,
  startStop: startStop,
  forward: forwards,
};
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
    },
    onClick: switchToVoter,
  },
  majority: {
    functions: {
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

var changes = []

export function updateChanges(key,oldValue,newValue){
  const state = getState()
  const changes = getChanges()
  changes[state.time-1][key] = [oldValue,newValue]
  setChanges(changes)
}
export function getChanges(){
  return changes
}
export function setChanges(newChanges){
  changes = newChanges
}