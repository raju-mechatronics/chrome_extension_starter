console.log(chrome.runtime.id, "hello");

function createState<T>(initial: T) {
  let state = initial;
  const listeners: ((state: T) => void)[] = [];
  const getValue = () => state;
  const removeListeners = (listener: (state: T) => void) => {
    const index = listeners.indexOf(listener);
    listeners.splice(index, 1);
  };
  const addListners = (listener: (state: T) => void) => {
    listeners.push(listener);
    return () => removeListeners(listener);
  };

  // if state is an object and not array I want to update it with partial

  const setValue = (
    newState: T extends object ? (T extends any[] ? T : Partial<T>) : T
  ) => {
    if (typeof newState === "object" && !Array.isArray(newState)) {
      state = {
        ...state,
        ...newState,
      };
    } else {
      state = newState as T;
    }
  };

  return {
    value: getValue,
    setValue,
    addListners,
    removeListeners,
  };
}
