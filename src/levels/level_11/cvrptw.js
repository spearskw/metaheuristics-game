/**
 * CVRPTW (Capacitated Vehicle Routing Problem with Time Windows)
 * Instance parser, distance matrix, and route evaluation.
 */

/**
 * Parse Solomon VRPTW instance text format.
 * @param {string} text - Raw text of a Solomon instance file
 * @returns {{ numVehicles: number, vehicleCapacity: number, customers: Array<{id:number,x:number,y:number,demand:number,readyTime:number,dueDate:number,serviceTime:number}> }}
 */
export function parseInstance(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Line index 0: instance name
  // Line index 1: "VEHICLE"
  // Line index 2: "NUMBER     CAPACITY"
  // Line index 3: "25         200"
  // Line index 4: "CUSTOMER"
  // Line index 5: header row
  // Line index 6+: customer data (depot is customer 0)

  // Find vehicle info line (the line after "NUMBER     CAPACITY")
  let vehicleLine = -1;
  let customerStartLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('NUMBER') || lines[i].includes('CAPACITY')) {
      vehicleLine = i + 1;
    }
    if (lines[i].startsWith('CUST') || lines[i].includes('XCOORD')) {
      customerStartLine = i + 1;
    }
  }

  const vehicleParts = lines[vehicleLine].trim().split(/\s+/).map(Number);
  const numVehicles = vehicleParts[0];
  const vehicleCapacity = vehicleParts[1];

  const customers = [];
  for (let i = customerStartLine; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/).map(Number);
    if (parts.length < 7) continue;
    customers.push({
      id: parts[0],
      x: parts[1],
      y: parts[2],
      demand: parts[3],
      readyTime: parts[4],
      dueDate: parts[5],
      serviceTime: parts[6],
    });
  }

  return { numVehicles, vehicleCapacity, customers };
}

/**
 * Compute Euclidean distance matrix between all customers.
 * @param {Array<{x:number,y:number}>} customers
 * @returns {Float64Array[]} 2D array of distances
 */
export function computeDistanceMatrix(customers) {
  const n = customers.length;
  const dist = new Array(n);
  for (let i = 0; i < n; i++) {
    dist[i] = new Float64Array(n);
    for (let j = 0; j < n; j++) {
      if (i === j) {
        dist[i][j] = 0;
      } else {
        const dx = customers[i].x - customers[j].x;
        const dy = customers[i].y - customers[j].y;
        dist[i][j] = Math.sqrt(dx * dx + dy * dy);
      }
    }
  }
  return dist;
}

/**
 * Compute total distance for a single route. Depot (customer 0) is implicit at start/end.
 * @param {number[]} route - Array of customer IDs
 * @param {Float64Array[]} dist - Distance matrix
 * @returns {number}
 */
export function routeDistance(route, dist) {
  if (route.length === 0) return 0;
  let d = dist[0][route[0]]; // depot to first
  for (let i = 0; i < route.length - 1; i++) {
    d += dist[route[i]][route[i + 1]];
  }
  d += dist[route[route.length - 1]][0]; // last to depot
  return d;
}

/**
 * Sum of routeDistance for all routes.
 * @param {number[][]} routes
 * @param {Float64Array[]} dist
 * @returns {number}
 */
export function totalDistance(routes, dist) {
  let total = 0;
  for (const route of routes) {
    total += routeDistance(route, dist);
  }
  return total;
}

/**
 * Check if a route is feasible (capacity + time windows).
 * @param {number[]} route
 * @param {{ vehicleCapacity: number, customers: Array }} instance
 * @param {Float64Array[]} dist
 * @returns {boolean}
 */
export function isRouteFeasible(route, instance, dist) {
  if (route.length === 0) return true;

  const { vehicleCapacity, customers } = instance;

  // Check capacity
  let totalDemand = 0;
  for (const cid of route) {
    totalDemand += customers[cid].demand;
  }
  if (totalDemand > vehicleCapacity) return false;

  // Check time windows
  const depot = customers[0];
  let time = 0; // start at depot at time 0
  let prev = 0;

  for (const cid of route) {
    const c = customers[cid];
    const travelTime = dist[prev][cid];
    time += travelTime;

    // Arrive before due date?
    if (time > c.dueDate) return false;

    // Wait if early
    if (time < c.readyTime) {
      time = c.readyTime;
    }

    // Service
    time += c.serviceTime;
    prev = cid;
  }

  // Return to depot
  time += dist[prev][0];
  if (time > depot.dueDate) return false;

  return true;
}

/**
 * Build a greedy solution using cheapest feasible insertion.
 * @param {{ numVehicles: number, vehicleCapacity: number, customers: Array }} instance
 * @param {Float64Array[]} dist
 * @returns {number[][]} Array of routes
 */
export function buildGreedySolution(instance, dist) {
  const { customers } = instance;

  // Sort customers (excluding depot) by readyTime
  const unassigned = customers
    .slice(1)
    .map(c => c.id)
    .sort((a, b) => customers[a].readyTime - customers[b].readyTime);

  const routes = [];
  const assigned = new Set();

  for (const custId of unassigned) {
    if (assigned.has(custId)) continue;

    let bestCost = Infinity;
    let bestRouteIdx = -1;
    let bestPos = -1;

    // Try to insert into existing routes
    for (let r = 0; r < routes.length; r++) {
      const route = routes[r];
      for (let pos = 0; pos <= route.length; pos++) {
        const newRoute = [...route.slice(0, pos), custId, ...route.slice(pos)];
        if (!isRouteFeasible(newRoute, instance, dist)) continue;

        // Compute insertion cost
        const oldDist = routeDistance(route, dist);
        const newDist = routeDistance(newRoute, dist);
        const cost = newDist - oldDist;

        if (cost < bestCost) {
          bestCost = cost;
          bestRouteIdx = r;
          bestPos = pos;
        }
      }
    }

    if (bestRouteIdx >= 0) {
      routes[bestRouteIdx].splice(bestPos, 0, custId);
    } else {
      // Create new route
      routes.push([custId]);
    }
    assigned.add(custId);
  }

  return routes;
}
