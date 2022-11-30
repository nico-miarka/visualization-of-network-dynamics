/* cr.js | MIT License | https://github.com/holgerdell/color-refinement */

/* default URL parameters */
export const state = {
  n: 50,
  m: 40,
  charge: () => (document.getElementById('main').offsetWidth < 700) ? -100 : -200,
  navbar: true,
  graph: 'rumor',
  seed: () => (Math.seedrandom) ? '' : undefined,
  count: false,
  charge: -50
}

