/**
 * Mutation operators with undo for CVRPTW solutions.
 */

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Fast feasibility check (same logic as isRouteFeasible in cvrptw.js).
 */
function isRouteFeasibleFast(route, instance, dist) {
  if (route.length === 0) return true;
  const { vehicleCapacity, customers } = instance;

  let totalDemand = 0;
  for (const cid of route) {
    totalDemand += customers[cid].demand;
  }
  if (totalDemand > vehicleCapacity) return false;

  const depot = customers[0];
  let time = 0;
  let prev = 0;
  for (const cid of route) {
    const c = customers[cid];
    time += dist[prev][cid];
    if (time > c.dueDate) return false;
    if (time < c.readyTime) time = c.readyTime;
    time += c.serviceTime;
    prev = cid;
  }
  time += dist[prev][0];
  if (time > depot.dueDate) return false;

  return true;
}

/**
 * Check feasibility of all affected routes.
 */
function allFeasible(routeIndices, routes, instance, dist) {
  for (const ri of routeIndices) {
    if (ri >= 0 && ri < routes.length) {
      if (!isRouteFeasibleFast(routes[ri], instance, dist)) return false;
    }
  }
  return true;
}

/**
 * Apply a random mutation to routes in-place. Returns undo info.
 */
export function mutateSolution(routes, instance, dist) {
  // Pick a random mutation type
  const types = ['relocate', 'swap', '2opt', 'oropt'];
  const type = types[randInt(0, 3)];

  switch (type) {
    case 'relocate': return tryRelocate(routes, instance, dist);
    case 'swap': return trySwap(routes, instance, dist);
    case '2opt': return try2opt(routes, instance, dist);
    case 'oropt': return tryOropt(routes, instance, dist);
  }
}

function tryRelocate(routes, instance, dist) {
  const MAX_ATTEMPTS = 50;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const srcRouteIdx = randInt(0, routes.length - 1);
    const srcRoute = routes[srcRouteIdx];
    if (srcRoute.length === 0) continue;

    const srcPos = randInt(0, srcRoute.length - 1);
    const customer = srcRoute[srcPos];

    // Pick destination route and position
    const dstRouteIdx = randInt(0, routes.length - 1);
    const dstRoute = routes[dstRouteIdx];

    // Compute valid insert positions
    let dstPos;
    if (srcRouteIdx === dstRouteIdx) {
      // Same route: remove first, then insert
      if (dstRoute.length <= 1) continue; // would just put it back
      dstPos = randInt(0, dstRoute.length - 2); // length-1 after removal
      // Avoid putting it back in the same spot
      if (dstPos === srcPos || (dstPos === srcPos - 1 && srcPos > 0)) continue;
    } else {
      dstPos = randInt(0, dstRoute.length);
    }

    // Perform the mutation
    srcRoute.splice(srcPos, 1);

    // Adjust dstPos for same-route case
    let actualDstPos = dstPos;
    if (srcRouteIdx === dstRouteIdx && dstPos >= srcPos) {
      // Already adjusted by the length-2 bound above, positions shifted
    }

    const actualDstRouteIdx = srcRouteIdx === dstRouteIdx ? srcRouteIdx : dstRouteIdx;
    routes[actualDstRouteIdx].splice(actualDstPos, 0, customer);

    // Check feasibility
    const indicesToCheck = srcRouteIdx === dstRouteIdx
      ? [srcRouteIdx]
      : [srcRouteIdx, dstRouteIdx];

    if (allFeasible(indicesToCheck, routes, instance, dist)) {
      // Check if source route is now empty
      let removedRouteIdx = -1;
      let removedRoute = null;
      if (srcRouteIdx !== dstRouteIdx && srcRoute.length === 0) {
        removedRouteIdx = srcRouteIdx;
        removedRoute = routes.splice(srcRouteIdx, 1)[0];
      }

      // Build undo info
      // To undo: remove customer from dst, put back in src
      // But we need to account for route removal shifting indices
      let undoDstRouteIdx = actualDstRouteIdx;
      let undoDstPos = actualDstPos;
      if (removedRouteIdx >= 0 && actualDstRouteIdx > removedRouteIdx) {
        undoDstRouteIdx -= 1;
        // The dstPos stays the same since it's within the route
      }

      return {
        type: 'relocate',
        customer,
        srcRouteIdx,
        srcPos,
        dstRouteIdx: undoDstRouteIdx,
        dstPos: undoDstPos,
        removedRouteIdx,
      };
    }

    // Undo the mutation
    routes[actualDstRouteIdx].splice(actualDstPos, 1);
    srcRoute.splice(srcPos, 0, customer);
  }

  return { type: 'noop' };
}

function trySwap(routes, instance, dist) {
  const MAX_ATTEMPTS = 50;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const r1 = randInt(0, routes.length - 1);
    if (routes[r1].length === 0) continue;
    const p1 = randInt(0, routes[r1].length - 1);

    const r2 = randInt(0, routes.length - 1);
    if (routes[r2].length === 0) continue;
    const p2 = randInt(0, routes[r2].length - 1);

    // Don't swap same element
    if (r1 === r2 && p1 === p2) continue;

    const c1 = routes[r1][p1];
    const c2 = routes[r2][p2];

    // Apply swap
    routes[r1][p1] = c2;
    routes[r2][p2] = c1;

    const indicesToCheck = r1 === r2 ? [r1] : [r1, r2];
    if (allFeasible(indicesToCheck, routes, instance, dist)) {
      return { type: 'swap', r1, p1, r2, p2 };
    }

    // Undo
    routes[r1][p1] = c1;
    routes[r2][p2] = c2;
  }

  return { type: 'noop' };
}

function try2opt(routes, instance, dist) {
  const MAX_ATTEMPTS = 50;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const ri = randInt(0, routes.length - 1);
    const route = routes[ri];
    if (route.length < 3) continue;

    let i = randInt(0, route.length - 2);
    let j = randInt(i + 1, route.length - 1);
    if (i === j) continue;

    // Reverse segment [i, j]
    reverse(route, i, j);

    if (isRouteFeasibleFast(route, instance, dist)) {
      return { type: '2opt', ri, i, j };
    }

    // Undo
    reverse(route, i, j);
  }

  return { type: 'noop' };
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

function tryOropt(routes, instance, dist) {
  const MAX_ATTEMPTS = 50;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const srcRouteIdx = randInt(0, routes.length - 1);
    const srcRoute = routes[srcRouteIdx];
    if (srcRoute.length === 0) continue;

    const segLen = randInt(1, Math.min(2, srcRoute.length));
    const srcPos = randInt(0, srcRoute.length - segLen);
    const segment = srcRoute.slice(srcPos, srcPos + segLen);

    // Pick destination
    const dstRouteIdx = randInt(0, routes.length - 1);
    const dstRoute = routes[dstRouteIdx];

    let dstPos;
    if (srcRouteIdx === dstRouteIdx) {
      const remainLen = srcRoute.length - segLen;
      if (remainLen === 0) continue;
      dstPos = randInt(0, remainLen);
      // Avoid reinserting at same position
      if (dstPos === srcPos) continue;
    } else {
      dstPos = randInt(0, dstRoute.length);
    }

    // Remove segment from source
    srcRoute.splice(srcPos, segLen);

    // Adjust dstPos for same-route case
    let actualDstPos = dstPos;
    if (srcRouteIdx === dstRouteIdx && dstPos > srcPos) {
      // positions already shifted by removal; dstPos was computed on the post-removal length
      // so it's already correct
    }

    const targetRoute = srcRouteIdx === dstRouteIdx ? srcRoute : dstRoute;
    targetRoute.splice(actualDstPos, 0, ...segment);

    const indicesToCheck = srcRouteIdx === dstRouteIdx
      ? [srcRouteIdx]
      : [srcRouteIdx, dstRouteIdx];

    if (allFeasible(indicesToCheck, routes, instance, dist)) {
      let removedRouteIdx = -1;
      if (srcRouteIdx !== dstRouteIdx && srcRoute.length === 0) {
        removedRouteIdx = srcRouteIdx;
        routes.splice(srcRouteIdx, 1);
      }

      let undoDstRouteIdx = dstRouteIdx;
      let undoDstPos = actualDstPos;
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
        dstPos: undoDstPos,
        removedRouteIdx,
      };
    }

    // Undo
    targetRoute.splice(actualDstPos, segLen);
    srcRoute.splice(srcPos, 0, ...segment);
  }

  return { type: 'noop' };
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

      // If a route was removed, re-insert it first
      if (removedRouteIdx >= 0) {
        routes.splice(removedRouteIdx, 0, []);
        // Adjust dstRouteIdx if needed
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
