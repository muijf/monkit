import type { HookStateItem, Fiber } from "./types";
import { exclude } from "./filterConditions";

type ReactimeData = {
  [key: string]: any;
};
// ------------FILTER DATA FROM REACT DEV TOOL && CONVERT TO STRING-------------
/**
 * This function receives raw Data from REACT DEV TOOL and filter the Data based on the exclude list. The filterd data is then converted to string (if applicable) before being sent to reacTime front end.
 * NOTE: the formating is important since Chrome will only accept JSON.stringfiable object. Circular object & function are not JSON stringifiable.
 *
 * @param reactDevData - The data object obtained from React Devtool. Ex: memoizedProps, memoizedState
 * @param reactimeData - The cached data from the current component. This can be data about states, context and/or props of the component.
 * @returns The update component data object to send to front end of ReactTime
 */
export function filterAndFormatData(
  reactDevData: { [key: string]: any },
  reactimeData: ReactimeData = {}
): ReactimeData {
  for (const key in reactDevData) {
    try {
      // If key is in exclude set or if there is no value at key, skip
      if (exclude.has(key) || reactDevData[key] === undefined) {
        continue;
      }
      // If value at key is a function, assign key with value 'function' to reactimeData object
      else if (typeof reactDevData[key] === "function") {
        reactimeData[key] = "function";
      }
      // If value at key is an object/array and not null => JSON stringify the value
      else if (
        typeof reactDevData[key] === "object" &&
        reactDevData[key] !== null
      ) {
        reactimeData[key] = JSON.stringify(reactDevData[key]);
      }
      // Else assign the primitive value
      else {
        reactimeData[key] = reactDevData[key];
      }
    } catch (err) {
      // COMMENT OUT TO AVOID PRINTTING ON THE CONSOLE OF USER - KEEP IT FOR DEBUGGING PURPOSE
      // console.log({
      //   Message: 'Error in createTree during obtaining props information',
      //   potentialRootCause: 'circular component/failed during JSON stringify',
      //   reactDevData,
      //   key,
      //   err,
      // });
      // we will skip any props that cause an error
      continue;
    }
  }
  return reactimeData;
}

// ----------------------GET HOOK STATE AND DISPATCH METHOD---------------------
/**
 * Helper function to:
 * - traverse through memoizedState
 * - extract the state data & the dispatch method, which is stored in memoizedState.queue.
 *
 * During time jump, dispatch method will be used to re-render historical state.
 * @param memoizedState - The current state of the component associated with the current Fiber node.
 * @return An array of array of HookStateItem objects
 *
 */
export function getHooksStateAndUpdateMethod(
  memoizedState: Fiber["memoizedState"]
): Array<HookStateItem> {
  const hooksStates: Array<HookStateItem> = [];
  while (memoizedState) {
    if (memoizedState.queue) {
      // Check if this is a reducer hook by looking at the lastRenderedReducer
      const isReducer =
        memoizedState.queue.lastRenderedReducer?.name !== "basicStateReducer";

      if (isReducer) {
        // For useReducer hooks, we want to store:
        // 1. The current state
        // 2. The last action that was dispatched (if available)
        // 3. The reducer function itself
        hooksStates.push({
          component: memoizedState.queue,
          state: memoizedState.memoizedState,
          isReducer: true,
          lastAction: memoizedState.queue.lastRenderedAction || null,
          reducer: memoizedState.queue.lastRenderedReducer || null,
        });
      } else {
        // Regular useState hook
        hooksStates.push({
          component: memoizedState.queue,
          state: memoizedState.memoizedState,
          isReducer: false,
        });
      }
    }
    memoizedState = memoizedState.next;
  }
  return hooksStates;
}
