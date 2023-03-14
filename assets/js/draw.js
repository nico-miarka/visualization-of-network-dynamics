import {
  topics,
  protocols,
  icons,
  protocolFunctions,
  getChanges,
} from "./dynamicChanges.js";
import { getState, updateState } from "./state.js";
import { plots } from "./plot.js";
import { getSumOfOpinions } from "./plot.js";
import { resetBlendout,blendoutGraph, highlightVertex,resetHighlightGraph} from "./visuals.js";
import { getGraph } from "./graphUpdate.js";
import { contextFunctions } from "./contextFunctions.js";
export function drawNav() {
  const nav = document.getElementById("nav");
  while (nav.firstChild) {
    nav.removeChild(nav.lastChild);
  }

  for (const item in topics) {
    const button = document.createElement("div");
    button.classList.add("button", item);
    button.addEventListener("click", topics[item].onClick);
    button.innerText = item;
    nav.appendChild(button);
    const ul = document.createElement("ul");
    ul.id = item;
    nav.appendChild(ul);
    ul.classList.add("dropdown", "dropdown-animation");
    for (const protocol of topics[item].protocols) {
      const subButton = document.createElement("li");
      subButton.innerText = protocol;
      subButton.classList.add("dropdown-item", protocol);
      subButton.addEventListener("click", protocols[protocol].onClick);
      ul.appendChild(subButton);
    }
  }
  const button = document.createElement("div");
  button.classList.add("button", "sync");
  button.addEventListener("click", () => {
    return;
  });
  button.innerText = "sync";
  nav.appendChild(button);
}


/** TODO add forward backwards pause method + css */
export function drawControlPanel() {
  const state = getState();
  const control = document.getElementById("control");
  const selectorbar = document.createElement("ul");
  const controlbar = document.createElement("ul");
  controlbar.id = "controlbar";
  selectorbar.id = "selectorbar";
  while (control.firstChild) {
    control.removeChild(control.lastChild);
  }
  drawSelectors(selectorbar)
  for (const method in protocolFunctions) {
    const button = document.createElement("li");
    button.id = method;
    button.classList.add("controlbutton");
    button.addEventListener("click", protocolFunctions[method]());
    const icon = document.createElement("i");
    icon.classList.add("material-symbols-outlined");
    icon.innerText = icons[method];
    button.appendChild(icon);
    controlbar.appendChild(button);
  }
  control.appendChild(selectorbar);
  control.appendChild(controlbar);
}
function drawSelectors(parent){
  const state = getState();
  for(const element in selectors){
    const listitem = document.createElement("li")
    const selector = document.createElement("input")
    selector.type = selectors[element].type
    selector.id = selectors[element].id;
    selector.name = selectors[element].id;
    selector.value = selectors[element].getValue(state) ;
    selector.addEventListener("change", function(){
        selectors[element].update(selector.value);
    })
    const label = document.createElement("label")
    label.for = selectors[element].id;
    label.innerText = selectors[element].labelText
    listitem.appendChild(label)
    listitem.appendChild(selector)
    parent.appendChild(listitem)
  }
}
const selectors = {
  timeSelector:{
    type: "number",
    id: "timeSelector",
    getValue: (state) => state.time,
    update: (key) => updateState({time: key}),
    labelText: "time: ",
  },
  nSelector:{
    type: "number",
    id: "nSelector",
    getValue: (state) => state.n,
    update: (key) => updateState({n: key}),
    labelText: "n: ",
  },
  mSelector:{
    type: "number",
    id: "mSelector",
    getValue: (state) => state.m,
    update: (key) => updateState({m: key}),
    labelText: "m: ",
  },
  nodeSelector:{
    type: "number",
    id: "nodeSelector",
    getValue: (state) => state.numberOfVertices,
    update: (key) => updateState({numberOfVertices: key}),
    labelText: "nodes: ",
  },
  stepSelector:{
    type: "number",
    id: "stepSelector",
    getValue: (state) => state.step,
    update: (key) => updateState({step: key}),
    labelText: "step: ",
  },
  colorSelector:{
    type: "number",
    id: "colorsSelector",
    getValue: (state) => state.numberOfColors,
    update: (key) => updateState({numberOfColors: key}),
    labelText: "colors: ",
  }
  
}
export function drawPlotBar() {
  const div = document.getElementById("plotBar");
  while (div.firstChild) {
    div.removeChild(div.lastChild);
  }
  for (const plot in plots) {
    const plotButton = document.createElement("button");
    plotButton.id = plot;
    plotButton.classList.add('plotButton', 'plotContainer')
    new ResizeObserver(() => updateStateDistribution()).observe(plotButton);
    plotButton.addEventListener('click', plots[plot].onClick)
    addResizablity(plotButton);
    div.appendChild(plotButton)
  }
}
function addResizablity(div){
  var isResizing = false;

  div.addEventListener("mousemove", function(e) {
    if (e.offsetX < 5) {
      div.style.cursor = "col-resize";
    } else {
      div.style.cursor = "auto";
    }
  });
  
  div.addEventListener("mousedown", function(e) {
    if (e.offsetX < 5) {
      isResizing = true;
      div.style.cursor = "col-resize";
    }
  });
  
  document.addEventListener("mousemove", function(e) {
    if (isResizing) {
      div.style.width = (div.offsetLeft - e.clientX + div.offsetWidth) + "px";
    }
  });
  
  document.addEventListener("mouseup", function(e) {
    isResizing = false;
    div.style.cursor = "auto";
  });
}
export function drawColorSelection(){
  const state = getState();
  const node = d3.selectAll('.graphNode.highlight')
  const parentNode = node.node().parentNode;
  var radius = 50;
  var angleIncrement = Math.PI / (state.numberOfColors - 1);
  console.log(node.attr('cx'))
  var nodex = parseFloat(node.attr("cx"));
  var nodey = parseFloat(node.attr("cy"));
  d3.selectAll('.orbitButton').remove();
  d3.select(parentNode).append("circle")
  .attr("class", "orbitButton highlight")
  .attr("cx", nodex-radius)
  .attr("cy", nodey)
  .attr("r", 10)
  .text('X')
  .style("fill", 'white')
  .on("click", orbitButtonClick)
for (var i = 0; i < state.numberOfColors; i++) {
  //TODO finish the color picker part. maybe change implementation to be able to click multiple nodes to highlight, then rightclick to change color of all highlighted
  //or fixate their opinions or do something else... this is a better approach probably
  var angle = -Math.PI/4 + i * angleIncrement;
  var x = nodex + radius * Math.cos(angle);
  var y = nodey + radius * Math.sin(angle);
  
  d3.select(parentNode).append("circle")
    .attr("class", "orbitButton highlight")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 10)
    .style("fill", state.color[i])
    .on("click", ()=>{console.log('poof')})
}
}
function orbitButtonClick() {
  console.log("Orbit button clicked");
  resetBlendout();
  d3.selectAll('.orbitButton').remove()
  d3.selectAll('.graphNode')
  .on('click', (event, v) => {
    if (onNodeClick) {
      onNodeClick(v);
    }
  });
}
function onNodeClick(node){
  d3.selectAll('.graphNode')
  .on('click', null);
  blendoutGraph();
  highlightVertex(node);
  drawColorSelection();
}
export function drawStateDistribution(){
  const state = getState();
  const graph = getGraph();
  const changes = getChanges();
  const color = ['red','blue','green','yellow','purple','orange','gray']
  const parent = d3.select("#stateDistribution")
  const width = parent.node().offsetWidth;
  const height = parent.node().offsetHeight;
  const margin = ({ top: (1/15)*height, right: (1/20)*width, bottom: (1/5)*height, left: (1/10)*width });
  const svg = d3.select("#stateDistribution")
  .append('svg')
  .classed('stateDistribution',true)
  .attr('width', width)
  .attr('height',height)
  const sumOfOpinions = getSumOfOpinions();
  var x = d3.scaleLinear()
    .domain([0, Math.max(30,changes.length)])         
    .range([0.1*width, 0.95*width]); 
  var y = d3.scaleLinear()
    .domain([0, graph.vertices.length])
    .range([0.8*height,(1/30)*height])
    svg.append('g')
      .call(d3.axisBottom(x))
      .attr('transform', `translate(0,${height - margin.bottom})`)
    svg.append('g')
      .call(d3.axisLeft(y))
      .attr('transform', `translate(${margin.left},0)`)
for (let i=0;i<state.numberOfColors;i++){
  const line = d3.line()
      .x((d,j) => x(j))
      .y(d => y(d[i]))
      .curve(d3.curveCardinal)
  svg
    .append('path')
    .datum(sumOfOpinions)
    .attr('fill','none')
    .attr('stroke',color[i])
    .attr('stroke-width',1.5)
    .attr("d",line)
}
}
export async function updateStateDistribution(){
  d3.select('.stateDistribution').remove()
  drawStateDistribution();
}
export function drawContextMenu(event){
  const x = event.pageX;
  const y = event.pageY;
  const contextMenu = document.createElement("div");
  contextMenu.classList.add("context-menu");
  for (const method in contextFunctions){
    const item = document.createElement("div");
    item.innerText = contextFunctions[method].text;
    item.addEventListener("mousedown", contextFunctions[method].onClick)
    contextMenu.appendChild(item);
  }
  contextMenu.style.position = "absolute";
  contextMenu.style.left = `${x+20}px`;
  contextMenu.style.top = `${y-60}px`;
  document.body.appendChild(contextMenu);
  const closeContextMenu = function(event) {
      contextMenu.remove();
      document.removeEventListener("click", closeContextMenu);
      document.removeEventListener("mousedown", closeContextMenu);
      document.removeEventListener("touchstart", closeContextMenu);
  };

  document.addEventListener("click", closeContextMenu);
  document.addEventListener("mousedown", closeContextMenu);
  document.addEventListener("touchstart", closeContextMenu);
}