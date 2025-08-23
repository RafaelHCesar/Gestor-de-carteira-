import local from "./local.js";

// Driver único em uso: localStorage
const driver = local;

export const saveState = (state) => driver.saveState(state);
export const loadState = () => driver.loadState();
export const clearState = () => driver.clearState();

export default { saveState, loadState, clearState };
