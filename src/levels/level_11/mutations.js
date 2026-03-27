/**
 * Mutation operators with undo for CVRPTW solutions.
 * Mutations apply freely without feasibility checks — the SA acceptance
 * criterion (using penalty-based cost) handles solution quality.
 */

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Apply a random mutation to routes in-place. Returns undo info.
 */
export function mutateSolution(routes) {
  const types = ['relocate', 'swap', '2opt', 'oropt'];
  const type = types[randInt(0, 3)];

  switch (type) {
    case 'relocate': return tryRelocate(routes);
    case 'swap': return trySwap(routes);
    case '2opt': return try2opt(routes);
    case 'oropt': return tryOropt(routes);
  }
}

function tryRelocate(routes) {
  if (routes.length === 0) return { type: 'noop' };

  const srcRouteIdx = randInt(0, routes.length - 1);
  const srcRoute = routes[srcRouteIdx];
  if (srcRoute.length === 0) return { type: 'noop' };

  const srcPos = randInt(0, srcRoute.length - 1);
  const customer = srcRoute[srcPos];

  const dstRouteIdx = randInt(0, routes.length - 1);
  const dstRoute = routes[dstRouteIdx];

  let dstPos;
  if (srcRouteIdx === dstRouteIdx) {
    if (dstRoute.length <= 1) return { type: 'noop' };
    dstPos = randInt(0, dstRoute.length - 2);
    if (dstPos === srcPos || (dstPos === srcPos - 1 && srcPos > 0)) return { type: 'noop' };
  } else {
    dstPos = randInt(0, dstRoute.length);
  }

  // Perform the mutation
  srcRoute.splice(srcPos, 1);

  const actualDstRouteIdx = srcRouteIdx === dstRouteIdx ? srcRouteIdx : dstRouteIdx;
  routes[actualDstRouteIdx].splice(dstPos, 0, customer);

  // Remove empty source route
  let removedRouteIdx = -1;
  if (srcRouteIdx !== dstRouteIdx && srcRoute.length === 0) {
    removedRouteIdx = srcRouteIdx;
    routes.splice(srcRouteIdx, 1);
  }

  let undoDstRouteIdx = actualDstRouteIdx;
  if (removedRouteIdx >= 0 && actualDstRouteIdx > removedRouteIdx) {
    undoDstRouteIdx -= 1;
  }

  return {
    type: 'relocate',
    customer,
    srcRouteIdx,
    srcPos,
    dstRouteIdx: undoDstRouteIdx,
    dstPos,
    removedRouteIdx,
  };
}

function trySwap(routes) {
  if (routes.length === 0) return { type: 'noop' };

  const r1 = randInt(0, routes.length - 1);
  if (routes[r1].length === 0) return { type: 'noop' };
  const p1 = randInt(0, routes[r1].length - 1);

  const r2 = randInt(0, routes.length - 1);
  if (routes[r2].length === 0) return { type: 'noop' };
  const p2 = randInt(0, routes[r2].length - 1);

  if (r1 === r2 && p1 === p2) return { type: 'noop' };

  const c1 = routes[r1][p1];
  const c2 = routes[r2][p2];
  routes[r1][p1] = c2;
  routes[r2][p2] = c1;

  return { type: 'swap', r1, p1, r2, p2 };
}

function try2opt(routes) {
  if (routes.length === 0) return { type: 'noop' };

  const ri = randInt(0, routes.length - 1);
  const route = routes[ri];
  if (route.length < 3) return { type: 'noop' };

  const i = randInt(0, route.length - 2);
  const j = randInt(i + 1, route.length - 1);

  reverse(route, i, j);

  return { type: '2opt', ri, i, j };
}

function reverse(arr, i, j) {
  while (i < j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    i++;
    j--;
  }
}

function tryOropt(routes) {
  if (routes.length === 0) return { type: 'noop' };

  const srcRouteIdx = randInt(0, routes.length - 1);
  const srcRoute = routes[srcRouteIdx];
  if (srcRoute.length === 0) return { type: 'noop' };

  const segLen = randInt(1, Math.min(2, srcRoute.length));
  const srcPos = randInt(0, srcRoute.length - segLen);
  const segment = srcRoute.slice(srcPos, srcPos + segLen);

  const dstRouteIdx = randInt(0, routes.length - 1);
  const dstRoute = routes[dstRouteIdx];

  let dstPos;
  if (srcRouteIdx === dstRouteIdx) {
    const remainLen = srcRoute.length - segLen;
    if (remainLen === 0) return { type: 'noop' };
    dstPos = randInt(0, remainLen);
    if (dstPos === srcPos) return { type: 'noop' };
  } else {
    dstPos = randInt(0, dstRoute.length);
  }

  // Remove segment from source
  srcRoute.splice(srcPos, segLen);

  // Insert at destination
  const targetRoute = srcRouteIdx === dstRouteIdx ? srcRoute : dstRoute;
  targetRoute.splice(dstPos, 0, ...segment);

  // Remove empty route
  let removedRouteIdx = -1;
  if (srcRouteIdx !== dstRouteIdx && srcRoute.length === 0) {
    removedRouteIdx = srcRouteIdx;
    routes.splice(srcRouteIdx, 1);
  }

  let undoDstRouteIdx = dstRouteIdx;
  if (removedRouteIdx >= 0 && dstRouteIdx > removedRouteIdx) {
    undoDstRouteIdx -= 1;
  }

  return {
    type: 'oropt',
    segment,
    segLen,
    srcRouteIdx,
    srcPos,
    dstRouteIdx: undoDstRouteIdx,
    dstPos,
    removedRouteIdx,
  };
}

/**
 * Undo a mutation in-place.
 */
export function undoMutation(routes, undo) {
  switch (undo.type) {
    case 'noop':
      return;

    case 'relocate': {
      const { customer, srcRouteIdx, srcPos, dstRouteIdx, dstPos, removedRouteIdx } = undo;
      if (removedRouteIdx >= 0) {
        routes.splice(removedRouteIdx, 0, []);
        const adjustedDst = dstRouteIdx >= removedRouteIdx ? dstRouteIdx + 1 : dstRouteIdx;
        routes[adjustedDst].splice(dstPos, 1);
        routes[srcRouteIdx].splice(srcPos, 0, customer);
      } else {
        routes[dstRouteIdx].splice(dstPos, 1);
        routes[srcRouteIdx].splice(srcPos, 0, customer);
      }
      return;
    }

    case 'swap': {
      const { r1, p1, r2, p2 } = undo;
      const tmp = routes[r1][p1];
      routes[r1][p1] = routes[r2][p2];
      routes[r2][p2] = tmp;
      return;
    }

    case '2opt': {
      const { ri, i, j } = undo;
      reverse(routes[ri], i, j);
      return;
    }

    case 'oropt': {
      const { segment, segLen, srcRouteIdx, srcPos, dstRouteIdx, dstPos, removedRouteIdx } = undo;
      if (removedRouteIdx >= 0) {
        routes.splice(removedRouteIdx, 0, []);
        const adjustedDst = dstRouteIdx >= removedRouteIdx ? dstRouteIdx + 1 : dstRouteIdx;
        routes[adjustedDst].splice(dstPos, segLen);
        routes[srcRouteIdx].splice(srcPos, 0, ...segment);
      } else {
        routes[dstRouteIdx].splice(dstPos, segLen);
        routes[srcRouteIdx].splice(srcPos, 0, ...segment);
      }
      return;
    }
  }
}
