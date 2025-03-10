// src/index.ts
function findReactFiberObjectsWithContext(
  obj: any,
  found = new Set<any>()
): any {
  if (!obj || typeof obj !== "object" || found.has(obj)) {
    return [];
  }
  found.add(obj);
  const results = [];
  const keys = [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
  for (const key of keys) {
    try {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const value = obj[key];
      if (!value || typeof value !== "object") continue;
      if (key.toString().includes("__reactFiber")) {
        if (value._context) {
          results.push({
            fiber: value,
            context: value._context,
          });
        }
        if (value.type && value.type._context) {
          results.push({
            fiber: value,
            context: value.type._context,
          });
        }
        const stateNode = value.stateNode;
        if (stateNode?.constructor?.contextType) {
          results.push({
            fiber: value,
            context: stateNode.constructor.contextType,
          });
        }
      }
      results.push(...findReactFiberObjectsWithContext(value, found));
    } catch (e) {
      continue;
    }
  }
  return results;
}

function getAllDOMElements(root = document.documentElement) {
  const elements = [root];
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    elements.push(node);
  }
  return elements;
}

var fiberObjectsWithContext = [
  ...findReactFiberObjectsWithContext(window),
  ...getAllDOMElements().flatMap((el) => findReactFiberObjectsWithContext(el)),
];
console.log(fiberObjectsWithContext);
