import {topics,protocols} from "./graph.js";
import { getState } from "./state.js";

export function drawNav (){
    const nav = document.getElementById('nav')
    while (nav.firstChild) {
        nav.removeChild(nav.lastChild)
      }
    
    for (const item in topics){
        const button = document.createElement('div')
        button.classList.add('button', item)
        button.addEventListener('click', topics[item].onClick)
        nav.appendChild(button)
        const ul = document.createElement('ul')
        ul.id = item
        nav.appendChild(ul)
        ul.classList.add('dropdown', 'dropdown-animation')
        for (const protocol of topics[item].protocols){
            const subButton = document.createElement('li')
            subButton.classList.add('dropdown-item', protocol)
            subButton.addEventListener('click',protocols[protocol].onClick)
            ul.appendChild(subButton)
        }
    }
}
/** TODO add forward backwards pause method + css */
export function drawControlPanel(){
    const state = getState()
    const control = document.getElementById('control')
    while (control.firstChild) {
        control.removeChild(control.lastChild)
      }
    for (const method in protocols[state.protocol].functions){
        const button = document.createElement('div')
        button.id = method
        control.appendChild(button)
    }
    
}