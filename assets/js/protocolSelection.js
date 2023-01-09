import { getState, updateState } from "./state.js";
import { protocols } from "./dynamicChanges.js";
import { get } from "./lib/hash";

export function buttonHandler(state, method){
    return protocols[state.protocol].functions[method]
}