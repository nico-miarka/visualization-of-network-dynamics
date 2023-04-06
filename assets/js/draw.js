import {
  icons,
  protocolFunctions,
  getChanges,
  skipSteps,
  updateChanges,
} from "./dynamicChanges.js";
import { getState, updateState } from "./state.js";
import { getSumOfOpinions, plots,changeOpinionSum } from "./plot.js";
import { resetBlendout,blendoutGraph, highlightVertex, drawVerticesColor, toggleProtocol, getColors} from "./visuals.js";
import { getGraph } from "./graphUpdate.js";
import { contextFunctions } from "./contextFunctions.js";
import {protocols,reloader} from "./protocols.js"
import { worker } from "./main.js";
export function drawNav() {
  const nav = document.getElementById("nav");
  while (nav.firstChild) {
    nav.removeChild(nav.lastChild);
  }
  drawProtocolSelector(nav)
  drawReloader(nav)
  const button = document.createElement("div");
  button.classList.add("button", "sync");
  button.addEventListener("click", () => {
    return;
  });
  button.innerText = "sync";
  const selectorbar = document.createElement("ul");
  selectorbar.id = "selectorbar";
  drawSelectors(selectorbar)
  nav.appendChild(button);
  nav.appendChild(selectorbar)
  const ul = document.createElement('ul')
  ul.id = "colorPickerList"
  drawColorPicker(ul)
  nav.appendChild(ul)
}
function drawReloader(parent){
  const button = document.createElement('div')
  button.classList.add("button", "reloader");
  button.id = "reloader"
  button.innerText = "reloader";
  button.addEventListener('click',toggleProtocol('reloader'))
  parent.appendChild(button)
  const ul = document.createElement("ul");
  ul.id = 'reloader';
  parent.appendChild(ul);
  ul.classList.add("dropdown", "dropdown-animation");
  for (const seed in reloader){
      const subButton = document.createElement("li");
      subButton.innerText = seed;
      subButton.classList.add("dropdown-item", seed);
      subButton.addEventListener("click", reloader[seed].onClick);
      ul.appendChild(subButton);
  }

}

function drawProtocolSelector(parent){
  const select = document.createElement("select");
  for (const protocol in protocols){
    const option = document.createElement("option");
    option.value = protocol
    option.innerText = protocol
    select.appendChild(option)

  }
  select.id = 'protocolSelector'
  select.addEventListener("change", function() {
    var selectedValue = document.querySelector('select').value;
    updateState({protocol:selectedValue})
  });
  parent.appendChild(select)
}

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
export function drawSelectors(parent){
  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }
  const state = getState();
  for(const element in selectors){
    console.log(selectors[element].id)
    const list = document.createElement('ul')
    list.classList.add('selectorList')
    const backwards = document.createElement("div");
    const icon = document.createElement("i");
    icon.classList.add("material-symbols-outlined");
    icon.innerText = icons['backwards'];
    backwards.appendChild(icon);
    backwards.classList.add('backwards')
    list.appendChild(backwards)
    const forward = document.createElement("div");
    const icon2 = document.createElement("i");
    icon2.classList.add("material-symbols-outlined");
    icon2.innerText = icons['forward'];
    forward.appendChild(icon2);
    forward.classList.add('forward')
    const listitem = document.createElement("li")
    const selector = document.createElement("input")
    selector.type = selectors[element].type
    selector.id = selectors[element].id;
    selector.name = selectors[element].id;
    selector.value = selectors[element].getValue(state) ;
    selector.addEventListener("change", function(){
        selectors[element].update(selector.value);
    })
    forward.addEventListener('click', ()=>{
      if (selectors[element].id === "colorsSelector"){
        selector.value = parseInt(selector.value) + 1
      } else {
        selector.value = parseInt(selector.value) + 5
      }
      selector.dispatchEvent(new Event('change'))})
    backwards.addEventListener('click', ()=>{
      if (selectors[element].id === "colorsSelector"){
        selector.value = parseInt(selector.value) - 1
      } else {
        selector.value = parseInt(selector.value) - 5
      }
      selector.dispatchEvent(new Event('change'))})

    const label = document.createElement("label")
    label.for = selectors[element].id;
    label.innerText = selectors[element].labelText
    listitem.appendChild(label)
    list.appendChild(selector)
    list.appendChild(forward)
    listitem.appendChild(list)
    parent.appendChild(listitem)
  }
}
export function drawColorPicker(parent){
    while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }
  const colorSelection = document.createElement('select');
  const state = getState()
  const colors = getColors()
  for (var i=0;i<state.numberOfColors;i++){
    const colorOption = document.createElement('option')
    colorOption.innerText = colors[i];
    colorOption.style.backgroundColor = colors[i];
    colorSelection.appendChild(colorOption)
    
  }
  parent.appendChild(colorSelection)
  colorSelection.addEventListener("change", function() {
    const selectedOption = this.options[this.selectedIndex];
    const selectedColor = selectedOption.style.backgroundColor;
    selectElement.style.backgroundColor = selectedColor;
  });
  const colorPicker = document.createElement("input")
  colorPicker.type = "color"
  parent.appendChild(colorPicker)
}
const selectors = {
  speedSelector:{
    type: "number",
    id: "speedSelector",
    min:0,
    getValue: (state) => state.time,
    update: (key) => updateState({time: key}),
    labelText: "speed: ",
  },
  nSelector:{
    type: "number",
    id: "nSelector",
    min:1,
    getValue: (state) => state.n,
    update: (key) => updateState({n: key}),
    labelText: "n: ",
  },
  mSelector:{
    type: "number",
    id: "mSelector",
    min:getState().n-1,
    getValue: (state) => state.m,
    update: (key) => updateState({m: key}),
    labelText: "m: ",
  },
  nodeSelector:{
    type: "number",
    id: "nodeSelector",
    min:1,
    getValue: (state) => state.numberOfVertices,
    update: (key) => updateState({numberOfVertices: key}),
    labelText: "nodes: ",
  },
  stepSelector:{
    type: "number",
    id: "stepSelector",
    min:0,
    getValue: (state) => state.step,
    update: (key) => 
      {
      const state = getState();
      const changes = getChanges();
      const currentNetwork = getGraph()
      worker.postMessage({state: state,newStep:key,changesLength:changes.length,currentNetwork:currentNetwork,opinionSum:getSumOfOpinions()})
      worker.onmessage = (event) => {
        updateState(event.data.state)
        const graph = getGraph();
        for (const vertex in graph.vertices){
          graph.vertices[vertex].level = event.data.currentNetwork[vertex].level
        }
    updateChanges(event.data.changes)
    changeOpinionSum(event.data.changes);
    drawVerticesColor(graph.vertices)
    for (const plot in plots){
      plots[plot].update()
    }
    }
  },
    labelText: "step: ",
  },
  colorSelector:{
    type: "number",
    id: "colorsSelector",
    min:1,
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
    plotButton.classList.add('plotButton')
    const plotContainer = document.createElement("div");
    plotContainer.id = plot;
    plotContainer.classList.add('plotContainer')
    new ResizeObserver(() => plots[plot].update()).observe(plotContainer);
    plotButton.addEventListener('click', plots[plot].onClick)
    plotContainer.appendChild(plotButton)
    div.appendChild(plotContainer)
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
export function drawStateDistribution(id,data){
  const state = getState();
  const graph = getGraph();
  const changes = getChanges();
  const color = ['red','blue','green','yellow','purple','orange','gray']
  const parent = d3.select('#' + id)
  const width = parent.node().offsetWidth;
  const height = parent.node().offsetHeight;
  const margin = ({ top: (1/15)*height, right: (1/20)*width, bottom: (1/5)*height, left: (1/10)*width });
  const svg = d3.select('#' + id)
  .append('svg')
  .classed(id,true)
  .attr('width', width)
  .attr('height',height)
  var x = d3.scaleLinear()
    .domain([0, Math.max(30,changes.length)])         
    .range([0.1*width, 0.93*width]); 
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
    .datum(data)
    .attr('fill','none')
    .attr('stroke',color[i])
    .attr('stroke-width',1.5)
    .attr("d",line)
}
// Create vertical line
const verticalLine = svg.append("line")
  .attr("class", "vertical-line")
  .attr("y1", margin.top)
  .attr("y2", height - margin.bottom)
  .style("stroke", "black")
  .style("stroke-width", "1px")
  .style("opacity", 0)
  .style("display", "block");

let requestId;

svg.on("mousemove", function() {
  // Cancel any previous animation frame requests
  cancelAnimationFrame(requestId);

  // Get the mouse position relative to the SVG element
  const [mouseX, mouseY] = d3.pointer(event, this);

  // Check if the mouse position is within the range of the x-axis
  if (mouseX >= x.range()[0] && mouseX <= x.range()[1]) {
    // Update the position of the vertical line
    const xPos = Math.round(x.invert(mouseX));
    verticalLine
      .attr("x1", x(xPos))
      .attr("x2", x(xPos))
      .style("opacity", 1)
      .style("display", "block");
  } else {
    // Hide the vertical line if the mouse is outside the range of the x-axis
    verticalLine.style("display", "none");
  }
  
  
});

// Add a mouseout event listener to the SVG element
svg.on("mouseout", function() {
  // Cancel any previous animation frame requests
  cancelAnimationFrame(requestId);

  // Hide the vertical line
  verticalLine.style('display', 'none');
});
svg.on("click", function(){
  const [mouseX, mouseY] = d3.pointer(event, this);
  const xPos = Math.round(x.invert(mouseX));
  skipSteps(xPos);
})

}

export async function updateStateDistribution(id, data){
  d3.select('.' + id).remove()
  drawStateDistribution(id,data);
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