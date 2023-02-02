/* cr.js | MIT License | https://github.com/holgerdell/color-refinement */
import { getState, updateState, getStateChanges } from "./state.js";
import { setGraph, setProtocolRandom} from "./graphUpdate.js";
import { randomGraph} from "./randomGraph.js";
import { getVertexColor } from "./visuals.js";
import { drawNav, drawControlPanel, drawPlotBar,drawStateDistribution} from "./draw.js";
import { setChanges } from "./dynamicChanges.js";
import { sumOpinions, setSumOfOpinions} from "./plot.js";
let simulation;
let draggingNode;
let hoveringNode;

/** Recenter the simulation (e.g. after window resize event) */
function recenter() {
  const w = document.getElementById("main").offsetWidth;
  const h = document.getElementById("main").offsetHeight;
  simulation
    .force("center", d3.forceCenter(w / 2, h / 2))
    .force("xAxis", d3.forceX(w / 2).strength(0.1))
    .force("yAxis", d3.forceY(h / 2).strength(0.1))
    .alpha(1)
    .restart();
}
function drawGraph(state, graph) {
  const svg = d3.select("main > svg");
  const w = document.getElementById("main").offsetWidth;
  const h = document.getElementById("main").offsetHeight;
  svg.selectAll("*").remove();
  d3.select("main").classed("loading", true);
  simulation
    .nodes(graph.vertices)
    .force("charge", d3.forceManyBody().strength(state.charge))
    .force("link", d3.forceLink(graph.edges).distance(50).strength(0.9));

  svg
    .selectAll("line.graphEdge")
    .data(graph.edges)
    .enter()
    .append("line")
    .attr("class", "graphEdge");

  svg
    .selectAll("circle.graphNode")
    .data(graph.vertices)
    .enter()
    .append("circle")
    .attr("class", "graphNode")
    .attr("r", 10)
    .attr("cx", w / 2)
    .attr("cy", h / 2)
    .call(
      d3
        .drag()
        .on("start", (event, v) => {
          draggingNode = v;
          if (!event.active) simulation.alphaTarget(0.3).restart();
          [v.fx, v.fy] = [v.x, v.y];
        })
        .on("drag", (event, v) => {
          [v.fx, v.fy] = [event.x, event.y];
        })
        .on("end", (event, v) => {
          draggingNode = undefined;
          if (!event.active) simulation.alphaTarget(0);
          [v.fx, v.fy] = [null, null];
        })
    );
  recenter();

  d3.select("main").classed("loading", false);
  updateState(state);
  /**color */
  d3.selectAll("circle.graphNode").attr("fill", (vertex) => {
    return getVertexColor(vertex);
  });
}

/** Sample and draw new graph
 */
async function reload(forceResample = false) {
  const state = getState();
  const changedFields = getStateChanges(state);
  if (Math.seedrandom && state.seed === "") {
    state.seed = Math.random().toString(36).substr(2, 5);
    state.protocolSeed = Math.random().toString(36).substr(2, 5);
    setProtocolRandom(state.protocolSeed)
    state.colorSeed = Math.random().toString(36).substr(2, 5);
  }
  if (changedFields.has("protocol")) {
    const graph = randomGraph(state.n, state.m, state.seed);
    drawControlPanel();
    setChanges([]);
    state.time = 0;
    setGraph(graph)
    drawGraph(state, graph);
    drawPlotBar();
    drawStateDistribution();
    
  }
  if (changedFields.has("protocolSeed")){
    setProtocolRandom(state.protocolSeed)
  }
  if (
    forceResample ||
    changedFields === undefined ||
    changedFields.has("n") ||
    changedFields.has("m") ||
    changedFields.has("seed") ||
    changedFields.has("colorSeed") ||
    changedFields.has("protocolSeed")
  ) {

    const graph = randomGraph(state.n, state.m, state.seed);
    setSumOfOpinions([sumOpinions()]);
    setChanges([]);
    state.time = 0;
    setGraph(graph);
    drawGraph(state, graph);
    drawPlotBar();
    drawStateDistribution();

    /** TODO add button to do one iteration */
  } else {
    if (changedFields.has("charge")) {
      simulation
        .force("charge", d3.forceManyBody().strength(state.charge))
        .alpha(0.5)
        .restart();
    }
  }
  /**if (changedFields !== undefined && changedFields.size !== 0) {
    drawNavElements(state)
  } */
}

function addto(field, stepsize, min, max) {
  const state = getState();
  const newval = state[field] + stepsize;
  if (min !== undefined && newval < min) state[field] = min;
  else if (max !== undefined && newval > max) state[field] = max;
  else state[field] = newval;
  updateState(state);
}

const STEPSIZE = {
  n: 5,
  m: 5,
  charge: -50,
};

const getMin = (field) => (field === "charge" ? -Infinity : 0);
const getMax = (field) => (field === "charge" ? 0 : Infinity);
/** TODO add maxnumedges as ceiling for m */
/** TODO add 2 as floor for n */
const increase = (field) =>
  addto(field, STEPSIZE[field], getMin(field), getMax(field));
const decrease = (field) =>
  addto(field, -STEPSIZE[field], getMin(field), getMax(field));

function shortcuts(event) {
  if (!event.ctrlKey && !event.altKey) {
    if (["r"].includes(event.key)) reload(true);
    else if (["ArrowUp", "k"].includes(event.key)) increase("charge");
    else if (["ArrowDown", "j"].includes(event.key)) decrease("charge");
    else if (["+", "M"].includes(event.key)) increase("m");
    else if (["-", "m"].includes(event.key)) decrease("m");
    else if (["N"].includes(event.key)) increase("n");
    else if (["n"].includes(event.key)) decrease("n");
  }
}
/** The main function is called when the page has loaded */
function main() {
  simulation = d3.forceSimulation().on("tick", () => {
    d3.selectAll("line.graphEdge")
      .attr("x1", (e) => e.source.x)
      .attr("y1", (e) => e.source.y)
      .attr("x2", (e) => e.target.x)
      .attr("y2", (e) => e.target.y);
    d3.selectAll("circle.graphNode")
      .attr("cx", (v) => v.x)
      .attr("cy", (v) => v.y);
  });

  document
    .getElementById("up")
    .addEventListener("click", () => increase("charge"));
  document
    .getElementById("down")
    .addEventListener("click", () => decrease("charge"));
  document
    .getElementById("reload")
    .addEventListener("click", () => reload(true));
  document
    .getElementById("main")
    .addEventListener("wheel", (event) =>
      event.deltaY < 0 ? increase("charge") : decrease("charge")
    );
  document.addEventListener("keydown", shortcuts);
  window.addEventListener("hashchange", () => reload());
  window.onresize = recenter;
  drawNav();
  reload();
}

window.onload = main;
