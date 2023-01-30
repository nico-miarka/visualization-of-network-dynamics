import {
  topics,
  protocols,
  icons,
  controlBarButtons,
} from "./dynamicChanges.js";
import { getState } from "./state.js";
import { plots } from "./plot.js";

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
  for (const method in protocols[state.protocol].functions) {
    const button = document.createElement("li");
    button.id = method;
    button.classList.add("controlbutton");
    button.addEventListener("click", controlBarButtons(state, method));
    const icon = document.createElement("i");
    icon.classList.add("material-symbols-outlined");
    icon.innerText = icons[method];
    button.appendChild(icon);
    controlbar.appendChild(button);
  }
  control.appendChild(controlbar);
}

export function drawPlots() {
  const div = document.getElementById("plot-container");
  while (div.firstChild) {
    div.removeChild(div.lastChild);
  }
  for (const plot in plots) {
    const plotButton = document.createElement("div");
    plotButton.classList.add("plotbutton");
    plotButton.addEventListener("click", plots[plot].onClick);
    div.appendChild(plotButton);
  }
}
