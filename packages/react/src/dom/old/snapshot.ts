import type { FiberRoot } from "./types";
import { masterState } from "./masterState";
import { routes } from "./route";
import { createTree } from "./createTree";

// -------------------------UPDATE & SEND TREE SNAP SHOT------------------------
/**
 * This function creates a new `snapShot` fiber tree with the provided `fiberRoot`, then send the updated snapshot to front end.
 * This runs after every Fiber commit if mode is not jumping.
 * This
 * @param snapshot The current snapshot of the fiber tree
 * @param fiberRoot The `fiberRootNode`, which is the root node of the fiber tree is stored in the current property of the fiber root object which we can use to traverse the tree
 */
// updating tree depending on current mode on the panel (pause, etc)
export function updateAndSendSnapShotTree(fiberRoot: FiberRoot): void {
  // This is the currently active root fiber(the mutable root of the tree)
  const { current } = fiberRoot;
  // Clear all of the legacy actions from old fiber tree because we are about to create a new one
  masterState.clear();
  // Calls the createTree function which creates the new snapshot tree and store new state update method to compoenActionsRecord
  /** The snapshot of the current ReactFiber tree */
  const payload = createTree(current);
  // Save the current window url to route
  payload.route = routes.addRoute(window.location.href);
  // method safely enables cross-origin communication between Window objects;
  // e.g., between a page and a pop-up that it spawned, or between a page
  // and an iframe embedded within it.
  // this postMessage will be sending the most up-to-date snapshot of the current React Fiber Tree
  // the postMessage action will be received on the content script to later update the tabsObj
  // this will fire off everytime there is a change in test application
  // convert the payload from a fiber tree to an object to avoid a data clone error when postMessage processes the argument
  console.log(payload);
}
