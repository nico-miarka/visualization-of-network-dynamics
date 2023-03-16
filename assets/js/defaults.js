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
  charge: -50,
  color: [
    "tomato",
    "lightblue",
    "lightgreen",
    "yellow",
    "purple",
    "orange",
    "gray",
  ],
  majority: 2,
  numberOfColors: 3,
  numberOfVertices: 4,
  sync: "sync",
  step: 0,
  time:500,
  temperature:5,

};