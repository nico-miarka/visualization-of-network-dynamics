import { topics} from "./graph.js";

export function drawNav (state){
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
        for (const protocols of topics[item].protocols){
            const subButton = document.createElement('li')
            subButton.classList.add('dropdown-item', protocols)
            ul.appendChild(subButton)
        }
    }
}