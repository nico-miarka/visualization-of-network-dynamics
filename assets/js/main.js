/* cr.js | MIT License | https://github.com/holgerdell/color-refinement */
import { getState, updateState, getStateChanges } from './state.js'
import { randomGraph} from './graph.js'
let simulation
let treesPerRound
let hoveringNode
let draggingNode


/** Recenter the simulation (e.g. after window resize event) */
function recenter () {
  const w = document.getElementById('main').offsetWidth
  const h = document.getElementById('main').offsetHeight
  simulation
    .force('center', d3.forceCenter(w / 2, h / 2))
    .force('xAxis', d3.forceX(w / 2).strength(0.1))
    .force('yAxis', d3.forceY(h / 2).strength(0.1))
    .alpha(1).restart()
}

/** Sample and draw new graph
  */
async function reload (forceResample = false) {
  const svg = d3.select('main > svg')
  const state = getState()
  const changedFields = getStateChanges(state)
  if (forceResample || changedFields === undefined || changedFields.has('n') || changedFields.has('m') || changedFields.has('seed')) {
    hoveringNode = undefined
    draggingNode = undefined
    svg.selectAll('*').remove()
    d3.select('main').classed('loading', true)
    const w = document.getElementById('main').offsetWidth
    const h = document.getElementById('main').offsetHeight

    if (Math.seedrandom && (state.seed === '' || forceResample)) {
      state.seed = Math.random().toString(36).substr(2, 5)
    }
    const graph = randomGraph(state.n, state.m, state.seed, state.option)

    simulation
      .nodes(graph.vertices)
      .force('charge', d3.forceManyBody().strength(state.charge))
      .force('link', d3.forceLink(graph.edges).distance(50).strength(0.9))

    svg.selectAll('line.graphEdge')
      .data(graph.edges).enter().append('line')
      .attr('class', 'graphEdge')

    svg.selectAll('circle.graphNode')
      .data(graph.vertices).enter().append('circle')
      .attr('class', 'graphNode')
      .attr('r', 10).attr('cx', w / 2).attr('cy', h / 2)
      .call(d3.drag()
        .on('start', (event, v) => {
          draggingNode = v
          if (!event.active) simulation.alphaTarget(0.3).restart();
          [v.fx, v.fy] = [v.x, v.y]
        })
        .on('drag', (event, v) => {
          [v.fx, v.fy] = [event.x, event.y]
        })
        .on('end', (event, v) => {
          draggingNode = undefined
          if (!event.active) simulation.alphaTarget(0);
          [v.fx, v.fy] = [null, null]
        }))
    recenter()
    d3.select('main').classed('loading', false)
    updateState(state, true)
  } else {
    if (changedFields.has('charge')) {
      simulation.force('charge', d3.forceManyBody().strength(state.charge))
        .alpha(0.5).restart()
    }
  }
  if (changedFields !== undefined && changedFields.size !== 0) {
    drawNavElements(state)
  }
  /**color */
  d3.selectAll('circle.graphNode').attr('fill', 'gray')
}

function addto (field, stepsize, min, max) {
  const state = getState()
  const newval = state[field] + stepsize
  if (min !== undefined && newval < min) state[field] = min
  else if (max !== undefined && newval > max) state[field] = max
  else state[field] = newval
  updateState(state)
}

const STEPSIZE = {
  n: 5,
  m: 5,
  charge: -50
}

const getMin = field => (field === 'charge') ? -Infinity : 0
const getMax = field => (field === 'round') ? treesPerRound.length - 1
  : (field === 'charge') ? 0 : Infinity
const increase = field => addto(field, STEPSIZE[field], getMin(field), getMax(field))
const decrease = field => addto(field, -STEPSIZE[field], getMin(field), getMax(field))
const toggle = field => { const state = getState(); state[field] = !state[field]; updateState(state) }

function shortcuts (event) {
  if (!event.ctrlKey && !event.altKey) {
    if (['r'].includes(event.key)) reload(true)
    else if (['ArrowUp', 'k'].includes(event.key)) increase('charge')
    else if (['ArrowDown', 'j'].includes(event.key)) decrease('charge')
    else if (['+', 'M'].includes(event.key)) increase('m')
    else if (['-', 'm'].includes(event.key)) decrease('m')
    else if (['N'].includes(event.key)) increase('n')
    else if (['n'].includes(event.key)) decrease('n')
  }
}

function drawNavElements (state) {
  document.getElementById('nav').style.display = (state.navbar) ? 'flex' : 'none'

  document.getElementById('n').innerText = state.n
  document.getElementById('m').innerText = state.m
  document.getElementById('charge').innerText = state.charge
}

/** The main function is called when the page has loaded */
function main () {
  simulation = d3.forceSimulation().on('tick', () => {
    d3.selectAll('line.graphEdge')
      .attr('x1', e => e.source.x)
      .attr('y1', e => e.source.y)
      .attr('x2', e => e.target.x)
      .attr('y2', e => e.target.y)
    d3.selectAll('circle.graphNode')
      .attr('cx', v => v.x)
      .attr('cy', v => v.y)
  })

  document.getElementById('up').addEventListener('click', () => increase('charge'))
  document.getElementById('down').addEventListener('click', () => decrease('charge'))
  document.getElementById('reload').addEventListener('click', () => reload(true))
  document.addEventListener('keydown', shortcuts)
  document.getElementById('main').addEventListener('wheel', event => (event.deltaY < 0) ? increase('charge') : decrease('charge'))
  window.addEventListener('hashchange', () => reload())
  window.onresize = recenter
  reload()
}

window.onload = main
