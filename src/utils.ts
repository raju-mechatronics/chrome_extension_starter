export function createState<T>(initial: T) {
  let state = initial;
  const listeners: ((state: T) => void)[] = [];
  const getValue = () => state;
  const removeListeners = (listener: (state: T) => void) => {
    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
  };
  const addListeners = (listener: (state: T) => void) => {
    listeners.push(listener);
    return () => removeListeners(listener);
  };

  const setValue = (
    newState: T extends object ? (T extends any[] ? T : Partial<T>) : T,
  ) => {
    if (typeof newState === "object" && !Array.isArray(newState)) {
      state = {
        ...state,
        ...newState,
      };
    } else {
      state = newState as T;
    }
    listeners.forEach((listener) => listener(state));
  };

  return {
    value: getValue,
    setValue,
    addListeners,
    removeListeners,
  };
}

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const waitUntil = async (condition: () => boolean, interval = 100) => {
  while (!condition()) {
    await wait(interval);
  }
};

export function hide(el: Element) {
  el.setAttribute("hidden", "true");
}

export function show(el: Element) {
  el.removeAttribute("hidden");
}

export function fillInputField(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
