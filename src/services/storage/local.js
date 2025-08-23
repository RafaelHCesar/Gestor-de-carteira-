const STORAGE_KEY = "gdc_app_state_v1";

export const saveState = async (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {
    // ignore
  }
};

export const loadState = async () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
};

export const clearState = async () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {
    // ignore
  }
};

export default { saveState, loadState, clearState };
