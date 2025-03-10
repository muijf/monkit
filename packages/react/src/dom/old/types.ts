import { Tree } from "./tree";

export type WorkTag =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24;

/**
 * Contain snapshot of the current ReactFiber tree
 * @member tree - A snapshot of ReactFiber Tree to send to front end
 */
export interface Snapshot {
  /** A snapshot of ReactFiber Tree to send to front end */
  tree: Tree;
}

/**
 * Indicate if mode is jumping/not jumping or navigating during jumping
 * @member jumping - Describe whether we are jumping
 *
 * When `jumping = true`, no new snapShot will be sent to front end.
 * @member navigating - Cache timeJump function to be invoked after ReactFibe tree update with new states from new route
 * @example if user uses click left/right arrow or play button, front end will post a message `jumpToSnap` and a payload of the cached snapShot tree, we will set `jumping = true`
 * @example if during jumping, we navigate to another route, such as from buttons to tictactoe, backend will set `navigating = cache of timeJump function`
 */
export interface Status {
  /**
   * Describe whether we are jumping
   *
   * When `jumping = true`, no new snapShot will be sent to front end.
   */
  jumping: boolean;
  /** Cache timeJump function to be invoked after ReactFibe tree update with new states from new route*/
  navigating?: Function;
}

/**
 * @type MsgData - obj with data object that will be sent to window?
 * @member data - an object with action & payload properties
 */
export interface MsgData {
  data: {
    action: string;
    payload: any;
  };
}

/**
 * @type ComponentData -
 * @member actualDuration - The time taken to render the current Fiber node and its descendants during the previous render cycle. This value is used to optimize the rendering of components and to provide performance metrics to developers.
 * @member actualStartTime - The time at which the rendering of the current Fiber node started during the previous render cycle.
 * @member key - The key a user assigned to the component or null if they didn't assign one
 * @member context - {in experiment} - An object contains all context information of the current component
 * @member index - {class component only} - The index of the bound setState method stored in `componentActionsRecord`
 * @member hooksState - {functional component only} - An object contains all states of the current functional component
 * @member hooksIndex - {functional component only} - An array of index of the bound dispatch method stored in `componentActionsRecord`
 * @member props - An object contains all props of the current component
 * @member selfBaseDuration - The base duration of the current Fiber node's render phase (excluding the time taken to render its children). This field is only set when the enableProfilerTimer flag is enabled.
 * @member state - {class component only} - An object contains all states of the current class component
 * @member treeBaseDuration - The total base duration of the current Fiber node's subtree. This field is only set when the enableProfilerTimer flag is enabled.
 */
export interface ComponentData {
  /** The time taken to render the current Fiber node and its descendants during the previous render cycle. */
  actualDuration?: number;
  /** The time at which the rendering of the current Fiber node started during the previous render cycle. */
  actualStartTime?: number;
  /**The key a user assigned to the component or null if they didn't assign one */
  key: string | null;
  /** {in experiment} - An object contains all context information of the current component */
  context: {};
  /** {class component only} - The index of the bound setState method stored in `componentActionsRecord`  */
  index: number | null;
  /** {functional component only} - An object contains all states of the current functional component */
  hooksState: {} | null;
  reducerStates?: Array<{
    state: any;
    lastAction: any;
    reducerIndex: number;
    hookName: string;
  }> /** {functional component only} - An array of index of the bound dispatch method stored in `componentActionsRecord` */;
  hooksIndex: number[] | null;
  /** An object contains all props of the current component */
  props: { [key: string]: any };
  /** The base duration of the current Fiber node's render phase (excluding the time taken to render its children). */
  selfBaseDuration?: number;
  /** An object contains all states of the current class component */
  state: { [key: string]: any } | null;
  /** The total base duration of the current Fiber node's subtree. */
  treeBaseDuration?: number;
}

/**
 * @member state - states within the current functional component
 * @member component - contains bound dispatch method to update state of the current functional component
 */
export interface HookStateItem {
  component: any;
  state: any;
  isReducer: boolean;
  lastAction?: any;
  reducer?: Function;
}

export const FunctionComponent = 0;
export const ClassComponent = 1;
/** Before we know whether it is function or class */
export const IndeterminateComponent = 2;
/** Root of a host tree. Could be nested inside another node. */
export const HostRoot = 3;
/** A subtree. Could be an entry point to a different renderer. */
export const HostPortal = 4;
/**
 * Host Component: a type of component that represents a native DOM element in the browser environment, such as div, span, input, h1 etc.
 */
export const HostComponent = 5; // has stateNode of html elements
export const HostText = 6;
export const Fragment = 7;
export const Mode = 8;
export const ContextConsumer = 9;
export const ContextProvider = 10;
export const ForwardRef = 11;
export const Profiler = 12;
export const SuspenseComponent = 13;
export const MemoComponent = 14;
export const SimpleMemoComponent = 15; // A higher order component where if the component renders the same result given the same props, react skips rendering the component and uses last rendered result. Has memoizedProps/memoizedState but no stateNode
export const LazyComponent = 16;
export const IncompleteClassComponent = 17;
export const DehydratedFragment = 18;
export const SuspenseListComponent = 19;
export const FundamentalComponent = 20;
export const ScopeComponent = 21;
export const Block = 22;
export const OffscreenComponent = 23;
export const LegacyHiddenComponent = 24;

export type Fiber = {
  /**
   * Time spent rendering this Fiber and its descendants for the current update.
   *
   * This tells us how well the tree makes use of sCU for memoization. It is reset to 0 each time we render and only updated when we don't bailout.
   *
   * This field is only set when the enableProfilerTimer flag is enabled.
   */
  actualDuration?: number;

  /**
   * If the Fiber is currently active in the "render" phase, this marks the time at which the work began.
   *
   * This field is only set when the enableProfilerTimer flag is enabled.
   */
  actualStartTime?: number;

  // Singly Linked List Tree Structure.
  /** Pointer to the first child. */
  child: Fiber | null;

  /**
   * The type of the current Fiber node's element (e.g. the component function or class, or the DOM element type).
   *
   * For class/functional component, elmementType stores the function definition.
   */
  elementType: any;

  /**
   * Unique key string assigned by the user when making component on null if they didn't assign one
   */
  key: string | null;

  /** The current state for a functional component associated with the current Fiber node. */
  memoizedState: any;

  /** The current props of the component associated with the current Fiber node. */
  memoizedProps: any;

  /**
   * Duration of the most recent render time for this Fiber. This value is not updated when we bailout for memoization purposes.
   *
   * This field is only set when the enableProfilerTimer flag is enabled.
   */
  selfBaseDuration?: number;

  // Singly Linked List Tree Structure.
  /**  Pointer to next sibling */
  sibling: Fiber | null;

  /**
   * The local state associated with this fiber.
   *
   * For classComponent, stateNode contains current state and the bound update methods of the component.
   */
  stateNode: any;

  /** The type of the current Fiber node, such as FunctionComponent, ClassComponent, or HostComponent (for DOM elements). */
  tag: WorkTag;

  /**
   * Sum of base times for all descendants of this Fiber. This value bubbles up during the "complete" phase.
   *
   * This field is only set when the enableProfilerTimer flag is enabled.
   */
  treeBaseDuration?: number;

  /** An array of hooks used for debugging purposes. */
  _debugHookTypes: string[] | null;
};

export type FiberRoot = {
  current: Fiber;
};

/**
 * @interface DevTools - A global object provided by the React Developer Tools extension. It provides a set of methods that allow developers to inspect and manipulate React components in the browser.
 */
export interface DevTools {
  /**
   * @property renderers - an Map object containing information about the React renders that are currently active on the page. The react version being used can be obtained at key = 1.
   */
  renderers: Map<1, undefined | { version: string }>;
  /**
   * @method getFiberRoots - get the Set of fiber roots that are currently mounted for the given rendererID. If not found, initalize a new empty Set at renderID key.
   * @param renderID -  a unique identifier for a specific instance of a React renderer. When a React application is first mounted, it will receive a rendererID. This rendererID will remain the same for the entire lifecycle of the application, even if the state is updated and the components are re-rendered/unmounted/added. However, if the application is unmounted and re-mounted again, it will receive a new rendererID.
   * @return A set of fiberRoot.
   */
  getFiberRoots: (rendererID: number) => Set<FiberRoot>;

  /**
   * @method onCommitFiberRoot - After the state of a component in a React Application is updated, the virtual DOM will be updated. When a render has been commited for a root, onCommitFiberRoot will be invoked to determine if the component is being mounted, updated, or unmounted. After that, this method will send update information to the React DevTools to update its UI to reflect the change.
   * @param rendererID -  a unique identifier for a specific instance of a React renderer
   * @param root - root of the rendered tree (a.k.a the root of the React Application)
   * @param priorityLevel
   * @return void
   */
  onCommitFiberRoot: (
    rendererID: number,
    root: FiberRoot,
    priorityLevel: any
  ) => void;
}
