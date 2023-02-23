import {
  topics,
  protocols,
  icons,
  protocolFunctions,
} from "./dynamicChanges.js";
import { getState } from "./state.js";
import { plots } from "./plot.js";
import { getSumOfOpinions } from "./plot.js";
import { resetBlendout,blendoutGraph, highlightVertex} from "./visuals.js";
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
  const controlbar = document.createElement("ul");
  controlbar.id = "controlbar";
  while (control.firstChild) {
    control.removeChild(control.lastChild);
  }
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
  control.appendChild(controlbar);
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
    div.appendChild(plotButton)
  }
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
//TODO when protocol changes, reset the graph
export function drawStateDistribution(){
  const state = getState();
  const color = ['red','blue','green','yellow']
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
    .domain([0, 30])         
    .range([40, 380]); 
  var y = d3.scaleLinear()
    .domain([0,50])
    .range([240,10])
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
  const color = ['red','blue','green','yellow']
  const state = getState();
  const parent = d3.select("#stateDistribution")
  const width = parent.node().offsetWidth;
  const height = parent.node().offsetHeight;
  const margin = ({ top: (1/15)*height, right: (1/20)*width, bottom: (1/5)*height, left: (1/10)*width });
  console.log(height, width)
  const svg = d3.select("#stateDistribution")
  .append('svg')
  .classed('stateDistribution',true)
  .attr('width', width)
  .attr('height',height)
  const sumOfOpinions = getSumOfOpinions();
  var x = d3.scaleLinear()
    .domain([0, 30])         
    .range([0.1*width, 0.95*width]); 
  var y = d3.scaleLinear()
    .domain([0,50])
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
        svg
          .append('path')
          .datum(sumOfOpinions)
          .attr('fill','none')
          .attr('stroke',color[i])
          .attr('stroke-width',1.5)
          .attr("d",line)
      }
}