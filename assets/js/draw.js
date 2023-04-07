import {
  icons,
  protocolFunctions,
  getChanges,
  skipSteps,
  updateChanges,
} from "./dynamicChanges.js";
import { getState, updateState } from "./state.js";
import { getSumOfOpinions, plots,changeOpinionSum, sumOpinions,plotData } from "./plot.js";
import { drawVerticesColor, toggleProtocol, getColors, setColors,getVertexColor,animations} from "./visuals.js";
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
  drawAnimationSelector(nav)
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('buttonContainer')
  const button = document.createElement("div");
  button.classList.add("button", "sync");
  button.addEventListener("click", () => {
    const state = getState()
    updateState({sync:!state.sync})
    if (button.innerText == "sync"){
      button.innerText = "async"
    } else {
      button.innerText = "sync"
    }
  });
  button.innerText = "sync";
  buttonContainer.appendChild(button)
  const selectorContainer = document.createElement('div')
  selectorContainer.classList.add('buttonContainer')
  const selectorbar = document.createElement("ul");
  selectorbar.id = "selectorbar";
  drawSelectors(selectorbar)
  const selectorButton = document.createElement('div');
  selectorButton.classList.add('button')
  selectorButton.addEventListener('click',() =>{
    selectorContainer.classList.toggle('show')
  })
  selectorContainer.appendChild(selectorButton)
  selectorContainer.appendChild(selectorbar)
  selectorButton.innerText = 'selectors'
  nav.appendChild(buttonContainer);
  nav.appendChild(selectorContainer)
  const colorContainer = document.createElement('div')
  colorContainer.classList.add('buttonContainer')
  const colorButton = document.createElement('div')
  colorButton.classList.add('button')
  colorButton.innerText = 'colors'
  colorButton.addEventListener('click', () =>{
    colorContainer.classList.toggle('show')
  })
  const ul = document.createElement('ul')
  ul.id = "colorPickerList"
  drawColorPicker(ul)
  colorContainer.appendChild(colorButton)
  colorContainer.appendChild(ul)
  nav.appendChild(colorContainer)
  drawReloader(nav)
  highlightNavBarElements();
}
function drawReloader(parent){
  const reloaderDiv = document.createElement('div')
  reloaderDiv.classList.add('buttonContainer')
  const button = document.createElement('div')
  button.classList.add('button','reloader')
  reloaderDiv.id = 'reloader';
  button.innerText = "reloader";
  button.addEventListener('click',toggleProtocol('reloader'))
  reloaderDiv.appendChild(button)
  for (const seed in reloader){
      const subButton = document.createElement("div");
      subButton.innerText = seed;
      subButton.classList.add("dropdown-item", seed);
      subButton.addEventListener("click", reloader[seed].onClick);
      reloaderDiv.appendChild(subButton);
  }
  parent.appendChild(reloaderDiv)

}
export function highlightNavBarElements(){
  const state = getState();
  document.getElementById(state.protocol).classList.add('active')
  document.getElementById(state.animation).classList.add('active')
  document.getElementById(state.pickedVertices).classList.add('active')
  
}
function drawAnimationSelector(parent){
  const list = document.createElement('ul')
  list.classList.add('dropdown-item')
  const selector = document.createElement("input")
  selector.type = "range"
  selector.id = "speed";
  selector.name = "speed";
  selector.value = getState().time;
  selector.setAttribute('min', 1)
  selector.setAttribute('max',1000)
  selector.addEventListener("change", function(){
      updateState({time:selector.value});
      
  })
  const label = document.createElement("label")
  label.innerText = "speed"
  list.appendChild(label)
  list.appendChild(selector)
  const animationDiv = document.createElement('div');
  animationDiv.classList.add('buttonContainer')
  animationDiv.id = "animation"
  const button = document.createElement('div')
  button.classList.add('button')
  button.innerText = "animation"
  button.addEventListener('click', toggleProtocol('animation'))
  animationDiv.appendChild(button)
  for (const animation in animations){
    const subButton = document.createElement('div');
    subButton.innerText = animation;
    subButton.id = animation
    subButton.classList.add('dropdown-item');
    subButton.addEventListener('click', function(){
      updateState({animation:animation})
      for (const child of animationDiv.children){
        if (child.classList.contains('active')){
          child.classList.toggle('active')
        }
      }
      subButton.classList.add('active')
    })
    animationDiv.appendChild(subButton)
  }
  const verticesDiv = document.createElement('div')
  verticesDiv.classList.add('buttonContainer')
  verticesDiv.id = 'vertices'
  const verticesButton = document.createElement('div');
  verticesButton.classList.add('button')
  verticesButton.innerText = 'vertices'
  verticesButton.addEventListener('click', toggleProtocol('vertices'))
  verticesDiv.appendChild(verticesButton)
  for (const pickedOption of verticesOptions){
    const subButton = document.createElement('div')
    subButton.innerText = pickedOption
    subButton.id = pickedOption
    subButton.classList.add('dropdown-item')
    subButton.addEventListener('click', function(){
      updateState({pickedVertices:pickedOption})
      for (const child of verticesDiv.children){
        if (child.classList.contains('active')){
          child.classList.toggle('active')
        }
      }
      subButton.classList.add('active')
    })
    
    verticesDiv.appendChild(subButton)
  }
  animationDiv.appendChild(list)
  parent.appendChild(animationDiv)
  parent.appendChild(verticesDiv)
}
const verticesOptions = ['all','one','changed']
function drawProtocolSelector(parent){
  const protocolDiv = document.createElement("div");
  protocolDiv.classList.add("buttonContainer");
  const button = document.createElement('div')
  button.classList.add('button')
  button.innerText = 'protocols'
  protocolDiv.id = 'protocol';
  button.addEventListener('click',toggleProtocol('protocol'))
  protocolDiv.appendChild(button)
  for (const protocol in protocols){
    const subButton = document.createElement('div');
    subButton.innerText = protocol
    subButton.classList.add('dropdown-item')
    subButton.id = protocol
    subButton.addEventListener('click', function(){
      updateState({protocol:protocol})
      for (const child of protocolDiv.children){
        if (child.classList.contains('active')){
          child.classList.toggle('active')
        }
      }
      subButton.classList.add('active')
    })
    protocolDiv.appendChild(subButton)
    
  }
  parent.appendChild(protocolDiv)
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
    if (element === "majority" && getState().protocol != "majority"){
      continue;
    }
    if ((element === "beta" || element === "gamma") && getState().protocol != "SIRmodel" ){
      continue;
    }
    if (element === "nodeSelector" && (getState().protocol !== "voter" && getState().protocol !== "majority"&& getState().protocol !== "glauber") ){
      continue;
    }
    if (element === "temperature" && getState().protocol != "glauber"){
      continue;
    }
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
    selector.value = selectors[element].getValue(state);
    selector.setAttribute('min', selectors[element].min)
    selector.setAttribute('max', selectors[element].max)
    selector.setAttribute('step', selectors[element].step)
    selector.addEventListener("change", function(){
        selectors[element].update(selector.value);
    })
    forward.addEventListener('click', ()=>{
      selector.value = (Math.min(parseFloat(selector.value) + selectors[element].step, selectors[element].max)).toFixed(2)
      selector.dispatchEvent(new Event('change'))})
    backwards.addEventListener('click', ()=>{
      selector.value = (Math.max(parseFloat(selector.value) - selectors[element].step, selectors[element].min)).toFixed(2)
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
  const state = getState()
  const colors = getColors()
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
  selector.type = "number"
  selector.id = "color";
  selector.name = "color";
  selector.value = getState().numberOfColors;
  selector.setAttribute('min', 1)
  selector.addEventListener("change", function(){
      updateState({numberOfColors:selector.value});
  })
  forward.addEventListener('click', ()=>{
    selector.value = parseInt(selector.value) + 1
    selector.dispatchEvent(new Event('change'))})
  backwards.addEventListener('click', ()=>{
    selector.value = Math.max(parseInt(selector.value) - 1, 1)
    selector.dispatchEvent(new Event('change'))})
  const label = document.createElement("label")
  label.innerText = "#colors"
  listitem.appendChild(label)
  list.appendChild(backwards)
  list.appendChild(selector)
  list.appendChild(forward)
  listitem.appendChild(list)
  parent.appendChild(listitem)
  for (let i=0;i<state.numberOfColors;i++){
    const colorSelection = document.createElement('li');
    const colorPicker = document.createElement("input")
    colorPicker.type = "color"
    colorPicker.value = colors[i];
    colorPicker.addEventListener("input", function() {
      setColors(colorPicker.value,i)
      d3.selectAll("rect.graphNode").attr("fill", (vertex) => {
        return getVertexColor(vertex);
      });
      d3.selectAll('#chartLine' + i).attr('stroke',getColors()[i])
      d3.selectAll('#chartArea' + i).attr('fill',getColors()[i])
    });
    colorSelection.appendChild(colorPicker)
    parent.appendChild(colorSelection)
  }
}

const selectors = {
  nSelector:{
    type: "number",
    id: "nSelector",
    step:5,
    max:5000,
    min:1,
    getValue: (state) => state.n,
    update: (key) => updateState({n: key}),
    labelText: "n: ",
  },
  mSelector:{
    type: "number",
    id: "mSelector",
    step:5,
    max:20000,
    min:1,
    getValue: (state) => state.m,
    update: (key) => updateState({m: key}),
    labelText: "m: ",
  },
  nodeSelector:{
    type: "number",
    id: "nodeSelector",
    min:1,
    step:5,
    max:5000,
    getValue: (state) => state.numberOfVertices,
    update: (key) => updateState({numberOfVertices: key}),
    labelText: "nodes: ",
  },
  stepSelector:{
    type: "number",
    id: "stepSelector",
    min:0,
    step:5,
    max:1000000,
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
    for (let i=1;i<plotBar.children.length;i++){
      const parentElement = document.getElementById('plot' + i)
      const selectElement = parentElement.querySelector("#plotType");
      plots[selectElement.value].update('plot' + i)
    }
    }
  },
    labelText: "step: ",
  },
  majority:{
    type: "number",
    id: "majority",
    min:1,
    max:100,
    step:1,
    getValue: (state) => state.majority,
    update: (key) => updateState({majority: key}),
    labelText: "majority: ",
  },
  beta:{
    type: "number",
    id: "beta",
    min:0.01,
    max:1,
    step:0.01,
    getValue: (state) => state.beta,
    update: (key) => updateState({beta: key}),
    labelText: "beta: ",
  },
  gamma:{
    type: "number",
    id: "gamma",
    min:0.01,
    max:1,
    step:0.01,
    getValue: (state) => state.gamma,
    update: (key) => updateState({gamma: key}),
    labelText: "gamma: ",
  },
  temperature:{
    type: "number",
    id: "temperature",
    min:-10,
    max:10,
    step:0.5,
    getValue: (state) => state.gamma,
    update: (key) => updateState({temperature: key}),
    labelText: "heat: ",
  }
  
}
export function drawPlotBar() {
  const div = document.getElementById("plotBar");
  while (div.firstChild) {
    div.removeChild(div.lastChild);
  }
  const createPlotButton = document.createElement('button')
  createPlotButton.innerHTML = "NEW PLOT"
  createPlotButton.classList.add('plotButton')
  createPlotButton.addEventListener('click',function(){
  const plotButton = document.createElement("button");
  plotButton.classList.add('plotButton')
  const selectDataType = document.createElement('select');
  selectDataType.id = 'dataType'
  for (const dataType in plotData){
    const dataOption = document.createElement('option');
    dataOption.value = dataType
    dataOption.innerText = plotData[dataType].text
    selectDataType.appendChild(dataOption)
  }
  selectDataType.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  selectDataType.addEventListener('change', () => {
    const id = selectPlotType.parentElement.parentElement.id;
    d3.select('.' + id).remove()
    plots[selectPlotType.value].update(id)
  })
  plotButton.appendChild(selectDataType)
  const selectPlotType = document.createElement('select')
  selectPlotType.id = 'plotType'
  for (const plotType in plots){
    const plotOption = document.createElement('option')
    plotOption.innerText = plots[plotType].type
    plotOption.value = plotType
    selectPlotType.appendChild(plotOption)
  }
  selectPlotType.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  selectPlotType.addEventListener('change', () => {
    const id = selectPlotType.parentElement.parentElement.id;
    d3.select('.' + id).remove()
    plots[selectPlotType.value].update(id)
  })
  plotButton.appendChild(selectPlotType)
  const closeButton = document.createElement('button');
  closeButton.classList.add('closeButton');
  closeButton.addEventListener('click', (event)=>{
    event.stopPropagation();
    const id = selectPlotType.parentElement.parentElement.id;
    const plot = document.getElementById(id)
    plot.remove()
    for (let i=0;i<div.children.length-1;i++){
      const divChildren = div.querySelectorAll('div')
      const plotNumber = i+1
      divChildren[i].id = 'plot' + plotNumber

    }

  })
  plotButton.appendChild(closeButton)
  const plotContainer = document.createElement("div");
  plotContainer.classList.add('plotContainer')
  plotContainer.id = 'plot' + div.children.length
  const d3plotContainer = d3.select('#' + plotContainer.id)
  plotButton.addEventListener('click', function(){
    plotContainer.classList.toggle('showPlot')
  })
  plotContainer.appendChild(plotButton)
  div.appendChild(plotContainer)
  updateStateDistribution(plotContainer.id)
  })
  div.appendChild(createPlotButton)
  
}
export function drawStateDistribution(id){
  const state = getState();
  const graph = getGraph();
  const changes = getChanges();
  const color = getColors()
  const parent = document.getElementById(id)
  const plotType = parent.querySelector("#plotType").value;
  const dataType = parent.querySelector('#dataType').value;
  const data = plotData[dataType].data
  const width = 400
  const height = 275
  const margin = ({ top: (1/15)*height, right: (1/20)*width, bottom: (1/5)*height, left: (1/10)*width });
  const svg = d3.select(parent)
    .append('svg')
    .classed(id,true)
    .attr('width', width)
    .attr('height',height)
  if (dataType === "sumOfOpinions"){
    var x = d3.scaleLinear()
    .domain([0, Math.max(30,changes.length)])         
    .range([0.1*width, 0.93*width]); 
  var y = d3.scaleLinear()
    .domain([0, graph.vertices.length])
    .range([0.8*height,(1/30)*height])
  var xAxis = svg.append('g')
    .call(d3.axisBottom(x))
    .attr('transform', `translate(0,${height - margin.bottom})`)
  var yAxis = svg.append('g')
    .call(d3.axisLeft(y))
    .attr('transform', `translate(${margin.left},0)`)
  } else if (dataType === "splitChanges") {
    var x = d3.scaleLinear()
    .domain([0, Math.max(30,changes.length)])         
    .range([0.1*width, 0.93*width]); 
  var y = d3.scaleLinear()
    .domain([-state.n/10, state.n/10])
    .range([0.8*height,(1/30)*height])
  var xAxis = svg.append('g')
    .call(d3.axisBottom(x))
    .attr('transform', `translate(0,${115})`)
  var yAxis = svg.append('g')
    .call(d3.axisLeft(y))
    .attr('transform', `translate(${margin.left},0)`)
  } else {
    var x = d3.scaleLinear()
    .domain([0, Math.max(30,changes.length)])         
    .range([0.1*width, 0.93*width]); 
  var y = d3.scaleLinear()
    .domain([0,state.n/10])
    .range([0.8*height,(1/30)*height])
  var xAxis = svg.append('g')
    .call(d3.axisBottom(x))
    .attr('transform', `translate(0,${115})`)
  var yAxis = svg.append('g')
    .call(d3.axisLeft(y))
    .attr('transform', `translate(${margin.left},0)`)
  }
  

if (plotType === 'histogram' || plotType === "line" || plotType === "area"){
  const verticalLine = svg.append("line")
  .attr("class", "vertical-line")
  .attr("x1", x(state.step))
  .attr("y1", margin.top)
  .attr("x2", x(state.step))
  .attr("y2", height - margin.bottom)
  .style("stroke-width", 2)
  .style("stroke", "gray")
  .style("fill", "none");
  var zoomed = d3.zoom()
    .scaleExtent([1, 20]) 
    .extent([[0, 0], [width-margin.left-margin.right, height]])
    .translateExtent([[0, 0], [width-margin.left-margin.right, height]])
    .on("zoom", (event) => updateChart(event));
  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .call(zoomed);
  svg.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top-20)
    .attr("width", width - margin.left - margin.right)
    .attr("height", height);
  function updateChart(event) {
      var newX = event.transform.rescaleX(x)
      xAxis.call(d3.axisBottom(newX))
      for (let i=0; i<state.numberOfColors; i++){
        svg.selectAll('.chartLine').remove();
        svg.selectAll('.layer').remove()
      }
    
      verticalLine.attr('x1', newX(state.step))
      .attr('x2', newX(state.step))
      plots[plotType].drawData(svg,newX,y,data)
  }
  plots[plotType].drawData(svg,x,y,data)
  const click = function (event) {
    const state = getState();
    var changes = getChanges();
      const xPos = d3.pointer(event)[0];
      const xValue = Math.round(x.invert(xPos));
      verticalLine.attr("x1", x(xValue)).attr("x2", x(xValue));
      for (let i=0; i<state.numberOfColors; i++){
        const line = d3.line()
          .x((d,j) => x(j))
          .y(d => y(d[i]))
          .curve(d3.curveCardinal)
        svg.select('#chartLine' + i)
          .attr("d", line);
      }
      worker.postMessage({state: state,newStep:xValue,changes:changes,currentNetwork:getGraph()})
      worker.onmessage = (event) => {
        updateState(event.data.state)
        const graph = getGraph();
        for (const vertex in graph.vertices){
          graph.vertices[vertex].level = event.data.currentNetwork[vertex].level
        }
        updateChanges(event.data.changes);
        changeOpinionSum(event.data.changes);
        drawVerticesColor(graph.vertices);
        for (let i=1;i<plotBar.children.length;i++){
          const parentElement = document.getElementById('plot' + i)
          const selectElement = parentElement.querySelector("#plotType");
          plots[selectElement.value].update('plot' + i)
        }
        
      }
      verticalLine.attr("x1", x(xValue)).attr("x2", x(xValue));
    }
  svg.on('click', click);
  }

}

export function drawPieChart(id){
  const state = getState()
  const parent = document.getElementById(id)
  const colors = getColors()
  const dataType = parent.querySelector('#dataType').value;
  const data = plotData[dataType].data[state.step]
  const width = 400
  const height = 275
  const viewBox = `0 0 ${width} ${height}`;
  const margin = ({ top: (1/15)*height, right: (1/20)*width, bottom: (1/5)*height, left: (1/10)*width });
  const keys = Object.keys(data);
  const pie = d3.pie()
  .value(function(d) {return Math.abs(d[1])})
    const data_ready = pie(Object.entries(data))
    const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(100);
  
  const svg = d3.select(parent)
    .append("svg")
    .attr("viewBox", viewBox)
    .classed(id,true)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);
  
  const slices = svg.selectAll("path")
    .data(data_ready)
    .enter()
    .append("path")
    .attr('id',function(d, i) { return 'chartArea' + i})
    .attr("d", arc)
    .attr("fill", (d, i) => colors[i]);
}
export function drawAreaChart(id){
  const state = getState();
  const graph = getGraph();
  const changes = getChanges();
  const parent = document.getElementById(id)
  const colors = getColors()
  const data = getSumOfOpinions()
  const width = 400
  const height = 275
  const margin = ({ top: (1/15)*height, right: (1/20)*width, bottom: (1/5)*height, left: (1/10)*width });
const svg = d3.select(parent)
.append("svg")
  .classed(id,true)
  .attr("width", width)
  .attr("height", height)

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
  
}
export function drawBarChart(id){
    const state = getState();
    const graph = getGraph();
    const parent = document.getElementById(id)
    const colors = getColors()
    const dataType = parent.querySelector('#dataType').value;
    const data = plotData[dataType].data[state.step]
    const width = 400
    const height = 275
    const margin = ({ top: (1/15)*height, right: (1/20)*width, bottom: (1/5)*height, left: (1/10)*width });
  const svg = d3.select(parent)
  .append("svg")
    .classed(id,true)
    .attr("width", width)
    .attr("height", height)
    const colorScale = d3.scaleOrdinal()
    .range(colors);
  if (dataType === "sumOfOpinions"){
    var x = d3.scaleBand()
  .domain(Object.keys(data))      
  .range([0.1*width, 0.93*width])
  .padding(0.2);
  var y = d3.scaleLinear()
  .domain([0, graph.vertices.length])
  .range([0.8*height,(1/30)*height])
  svg.append('g')
    .call(d3.axisBottom(x))
    .attr('transform', `translate(0,${height - margin.bottom})`)
  svg.append('g')
    .call(d3.axisLeft(y))
    .attr('transform', `translate(${margin.left},0)`)
  svg.selectAll(".bar")
    .data(Object.entries(data))
    .enter().append("rect")
    .attr("class", "bar")
    .attr("fill", function(d, i) { return colorScale(i);})
    .attr('id',function(d, i) { return 'chartArea' + i})
    .attr("x", d => x(d[0]))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d[1]))
    .attr("height", d => {return height- margin.bottom-y(d[1])});
  } else {
    var x = d3.scaleBand()
  .domain(Object.keys(data))      
  .range([0.1*width, 0.93*width])
  .padding(0.2);
  var y = d3.scaleLinear()
    .domain([-state.n/10, state.n/10])
    .range([0.8*height,(1/30)*height])
  svg.append('g')
    .call(d3.axisBottom(x))
    .attr('transform', `translate(0,${115})`)
  svg.append('g')
    .call(d3.axisLeft(y))
    .attr('transform', `translate(${margin.left},0)`)
  svg.selectAll(".bar")
    .data(Object.entries(data))
    .enter().append("rect")
    .attr("class", "bar")
    .attr("fill", function(d, i) { return colorScale(i);})
    .attr('id',function(d, i) { return 'chartArea' + i})
    .attr("x", d => x(d[0]))
    .attr("width", x.bandwidth())
    .attr("y", d => y(Math.max(0, d[1])))
    .attr("height", d => {return Math.abs(y(d[1])- y(0) )});
  }
  
  }
export function updateBarChart(id){
  d3.select('#' + id).select('svg').remove()
  drawBarChart(id)
}
export function updateAreaChart(id){
  d3.select('#' + id).select('svg').remove()
  drawAreaChart(id)
}
export function updatePieChart(id){
  d3.select('#' + id).select('svg').remove()
  drawPieChart(id);
}
export async function updateStateDistribution(id){
  d3.select('#' + id).select('svg').remove()
  drawStateDistribution(id);
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