import {
  type Fiber,
  FunctionComponent,
  ClassComponent,
  IndeterminateComponent,
  ContextProvider,
} from "./types";
import { masterState } from "./masterState";
import { getHooksStateAndUpdateMethod } from "./extractors";
import {
  nextJSDefaultComponent,
  remixDefaultComponents,
  allowedComponentTypes,
} from "./filterConditions";

// ------------------------CREATE COMPONENT ACTIONS RECORD----------------------
/**
 * This is a recursive function that runs after Fiber commit, if user is navigating to a new route during jumping. This function performs the following logic:
 * 1. Traverse from FiberRootNode
 * 2. If the component is stateful, extract its update methods & push to the `componentActionRecord` array
 * @param currentFiberNode A Fiber object
 */
export function createComponentActionsRecord(currentFiberNode: Fiber): void {
  // ------------------OBTAIN DATA FROM THE CURRENT FIBER NODE----------------
  // Destructure the current fiber node
  const {
    sibling,
    stateNode,
    child,
    // with memoizedState we can grab the root type and construct an Abstract Syntax Tree from the hooks structure using Acorn in order to extract the hook getters and match them with their corresponding setters in an object
    memoizedState,
    elementType,
    tag,
  } = currentFiberNode;

  // Obtain component name:
  const componentName =
    elementType?._context?.displayName || //For ContextProvider
    elementType?._result?.name || //For lazy Component
    elementType?.render?.name ||
    elementType?.name ||
    "nameless";

  // --------------------FILTER COMPONENTS/FIBER NODE-------------------------
  /**
   * For the snapshot tree,
   * 1. We are only interested in components that are one of these types: Function Component, Class Component, Indeterminate Component or Context Provider.
   * NOTE: this list of components may change depending on future use
   * 2. If user is using Next JS, filter out default NextJS components
   * 3. If user is using Remix JS, filter out default Remix components
   */

  if (
    !allowedComponentTypes.has(tag) ||
    nextJSDefaultComponent.has(componentName) ||
    remixDefaultComponents.has(componentName)
  ) {
    // -------------------TRAVERSE TO NEXT FIBERNODE------------------------
    // If currentFiberNode has children, recurse on children
    if (child) createComponentActionsRecord(child);

    // If currentFiberNode has siblings, recurse on siblings
    if (sibling) {
      createComponentActionsRecord(sibling);
    }
    // ---------RETURN THE TREE OUTPUT & PASS TO FRONTEND FOR RENDERING-------
    return;
  }

  // ---------OBTAIN STATE & SET STATE METHODS FROM CLASS COMPONENT-----------
  // Check if node is a stateful class component when user use setState.
  // If user use setState to define/manage state, the state object will be stored in stateNode.state => grab the state object stored in the stateNode.state
  if (
    (tag === ClassComponent || tag === IndeterminateComponent) &&
    stateNode?.state
  ) {
    // Save component setState() method to our componentActionsRecord for use during timeJump
    masterState.saveNew(stateNode);
  }
  // --------OBTAIN STATE & DISPATCH METHODS FROM FUNCTIONAL COMPONENT--------
  // Check if node is a stateful class component when user use setState.
  // If user use useState to define/manage state, the state object will be stored in memoizedState.queue => grab the state object stored in the memoizedState.queue
  if (
    (tag === FunctionComponent ||
      tag === IndeterminateComponent ||
      tag === ContextProvider) &&
    memoizedState
  ) {
    if (memoizedState.queue) {
      try {
        // Hooks states are stored as a linked list using memoizedState.next,
        // so we must traverse through the list and get the states.
        // We then store them along with the corresponding memoizedState.queue,
        // which includes the dispatch() function we use to change their state.
        const hooksStates = getHooksStateAndUpdateMethod(memoizedState);
        hooksStates.forEach(({ component }) => {
          // Save component's state and dispatch() function to our record for future time-travel state changing. Add record index to snapshot so we can retrieve later
          masterState.saveNew(component);
        });
      } catch (err) {
        console.log("ERROR: Failed Element during JSX parsing", {
          componentName,
        });
      }
    }
  }
  // ---------------------TRAVERSE TO NEXT FIBERNODE--------------------------
  // If currentFiberNode has children, recurse on children
  if (child) createComponentActionsRecord(child);

  // If currentFiberNode has siblings, recurse on siblings
  if (sibling) createComponentActionsRecord(sibling);
}
