import { getState, updateState } from "./state.js";
import { changeVoterVertex, skipVoterVertex } from "./voter.js";
import { changeOpinionSum, getSumOfOpinions } from "./plot.js";
import { updateStateDistribution } from "./draw.js";
import { backward, changesForward, skipBackward } from "./plot.js";
import { getGraph } from "./graphUpdate.js";
import { drawVertexColor } from "./visuals.js";
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
const switchToGlauber = switchProtocol("glauber");

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
function startStop() {
  return async () => {
    const state = getState();
    const forwardFunction = forwards();
    if (running) {
      clearInterval(intervalId);
      running = false;
    } else {
      intervalId = setInterval(forwardFunction, state.time * 4);
      running = true;
    }
  };
}
export function forwards() {
  return async () => {
    const state = getState();
    changes = getChanges();
    if (changes.length == state.step){
    await changeVoterVertex();
    changeOpinionSum();
    updateStateDistribution();
    updateState({ step: ++state.step });
    } else {
      changesForward();
      updateState({ step: ++state.step });
    }
  };
}
export async function skipSteps(newStep) {
  const state = getState();
  console.log(state.step, newStep);
  while (state.step < newStep) {
    if (changes.length == state.step){
      await skipVoterVertex();
      changeOpinionSum();
      updateStateDistribution();
      updateState({ step: ++state.step });
      } else {
        //TODO fix skipforward bug
        changesForward();
        updateState({ step: ++state.step });
      }
  }
  while (state.step > newStep) {
    skipBackward();
    updateState({ step: --state.step });
  }
  const graph = getGraph();
  for (const vertex of graph.vertices) {
    drawVertexColor(vertex);
  }
}
export const protocolFunctions = {
  backwards: backward,
  startStop: startStop,
  forward: forwards,
};
export const protocols = {
  more: {
    onClick: switchToMajority,
  },
  SIRmodel: {
    onClick: switchToVoter,
  },
  regular: {
    onClick: switchToRumor,
  },
  glauber: {
    onClick: switchToGlauber,
  },
  filler: {
    onClick: switchToVoter,
  },
  voter: {
    onClick: switchToVoter,
  },
  majority: {
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

var changes = [];

export function updateChanges(values) {
  const state = getState();
  const changes = getChanges();
  changes[state.step] = values;
  setChanges(changes);
}
export function getChanges() {
  return changes;
}
export function setChanges(newChanges) {
  changes = newChanges;
}
