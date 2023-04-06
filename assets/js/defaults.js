/* cr.js | MIT License | https://github.com/holgerdell/color-refinement */

/* default URL parameters */
export const state = {
  n: 50,
  m: 40,
  charge: () =>
    document.getElementById("main").offsetWidth < 700 ? -100 : -200,
  protocol: "voter",
  seed: "",
  protocolSeed: "",
  colorSeed: "",
  animation: "no",
  pickedVertices: "all",
  charge: -50,
  majority: 2,
  numberOfColors: 3,
  numberOfVertices: 4,
  sync: true,
  step: 0,
  time:500,
  temperature:5,
  beta: 0.4,
  gamma:0.04,

};