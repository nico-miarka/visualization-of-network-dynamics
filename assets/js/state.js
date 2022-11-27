/* cr.js | MIT License | https://github.com/holgerdell/color-refinement */

import * as defaults from './defaults.js'
import * as hash from './lib/hash.js'

export const getState = () => {
  const state = hash.get(defaults.state)
  console.debug(state)
  return state
}

/* This keeps track of the fields that were changed since the last time getStateChanges() was called */
const oldState = {}
export const getStateChanges = (state = getState()) => {
  const fs = new Set()
  for (const k of Object.keys(state)) {
    if (oldState[k] === undefined || oldState[k] !== state[k]) {
      fs.add(k)
    }
    oldState[k] = state[k]
  }
  return fs
}
export const updateState = (update) => hash.update(update)