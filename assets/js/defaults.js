/* cr.js | MIT License | https://github.com/holgerdell/color-refinement */

/* default URL parameters */
export const state = {
  n: 50,
  m: 40,
  charge: () =>
    document.getElementById("main").offsetWidth < 700 ? -100 : -200,
  protocol: "voter",
  graph: {},

  graphRandom: "",
  protocolRandom: "",
  colorRandom: "",
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
  majority: 1,
  numberOfColors: 3,
  sync: "sync",
  t: 0,
};
