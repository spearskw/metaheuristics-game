# Level 11 - CVRPTW with Simulated Annealing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Level 11, a CVRPTW (Capacitated Vehicle Routing Problem with Time Windows) solver using simulated annealing, with a route visualization canvas and a score progress canvas.

**Architecture:** The Solomon C101 benchmark (100 customers, 25 vehicles, capacity 200) is parsed from a text file. Simulated annealing explores the solution space via relocate, swap, 2-opt, and or-opt mutations with undo support. Only feasible solutions (capacity + time windows) are kept. The UI follows level 10's pattern: controls panel, left canvas (route map), right canvas (score plot).

**Tech Stack:** Vanilla JavaScript (ES modules), HTML5 Canvas, Vite dev server, Vitest (unit tests), Playwright (E2E tests)

---

## File Structure

```
src/levels/level_11/
├── index.html        # Page layout: controls + 2 canvases
├── main.js           # Entry point: UI binding, SA loop, rendering
├── styles.css        # Layout styling (mirrors level 10)
├── c101.txt          # Solomon C101 instance data (101 rows)
├── cvrptw.js         # Parse instance, distance matrix, route cost, feasibility
├── mutations.js      # SA mutations with undo: relocate, swap, 2-opt, or-opt

tests/
├── unit/cvrptw.test.js     # Unit tests for parsing, distance, feasibility, cost
├── unit/mutations.test.js  # Unit tests for mutations + undo
├── e2e/level11.spec.js     # Playwright UI + convergence tests
```

Existing file reused (imported, not copied):
- `src/levels/level_10/annealing.js` — cooling schedules + acceptor function

---

### Task 1: Create the Solomon C101 instance data file

**Files:**
- Create: `src/levels/level_11/c101.txt`

- [ ] **Step 1: Create c101.txt with the standard Solomon C101 benchmark data**

```
C101

VEHICLE
NUMBER     CAPACITY
  25         200

CUSTOMER
CUST NO.  XCOORD.   YCOORD.    DEMAND   READY TIME  DUE DATE   SERVICE   TIME

    0      40         50          0          0       1236          0
    1      45         68         10        912        967         90
    2      45         70         30        825        870         90
    3      42         66         10         65        146         90
    4      42         68         10        727        782         90
    5      42         65         10         15         67         90
    6      40         69         20        621        702         90
    7      40         66         20        170        225         90
    8      38         68         20        255        324         90
    9      38         70         10        534        605         90
   10      35         66         10        357        410         90
   11      35         69         10        448        505         90
   12      25         85         20        652        721         90
   13      22         75         30         30         92         90
   14      22         85         10        567        620         90
   15      20         80         40        384        429         90
   16      20         85         40        475        528         90
   17      18         75         20         99        148         90
   18      15         75         20        179        254         90
   19      15         80         10        278        345         90
   20      30         50         10         10         73         90
   21      30         52         20        914        965         90
   22      28         52         20        812        883         90
   23      28         55         10        732        777         90
   24      25         50         10         65        144         90
   25      25         52         40        169        224         90
   26      25         55         10        622        701         90
   27      23         52         10        261        316         90
   28      23         55         20        546        593         90
   29      20         50         10        358        405         90
   30      20         55         10        449        504         90
   31      10         35         20        200        237         90
   32      10         40         30         31        100         90
   33       8         40         40         87        158         90
   34       8         45         20        751        816         90
   35       5         35         10        283        344         90
   36       5         45         10        665        716         90
   37       2         40         20        383        434         90
   38       0         40         30        479        522         90
   39       0         45         20        567        624         90
   40      35         30         10        264        321         90
   41      35         32         10        166        235         90
   42      33         32         20         68        149         90
   43      33         35         10         16         80         90
   44      32         30         10        359        412         90
   45      30         30         10        541        600         90
   46      30         32         30        448        509         90
   47      30         35         10       1054       1127         90
   48      28         30         10        632        693         90
   49      28         35         10       1001       1066         90
   50      26         32         10        815        880         90
   51      25         30         10        725        786         90
   52      25         35         10        912        969         90
   53      44          5         20        286        347         90
   54      42         10         40        186        257         90
   55      42         15         10         95        158         90
   56      40          5         30        385        436         90
   57      40         15         40         35         87         90
   58      38          5         30        471        534         90
   59      38         15         10        651        740         90
   60      35          5         20        562        629         90
   61      50         30         10        531        610         90
   62      50         35         20        262        317         90
   63      50         40         50        171        218         90
   64      48         30         10        632        693         90
   65      48         40         10         76        129         90
   66      47         35         10        826        875         90
   67      47         40         10         12         77         90
   68      45         30         10        734        777         90
   69      45         35         10        916        969         90
   70      95         30         30        387        456         90
   71      95         35         20        293        360         90
   72      53         30         10        450        505         90
   73      92         30         10        478        551         90
   74      53         35         50        353        412         90
   75      45         65         20        997       1068         90
   76      90         35         10        203        260         90
   77      88         30         10        574        643         90
   78      88         35         20        109        170         90
   79      87         30         10        668        731         90
   80      85         25         10        769        820         90
   81      85         35         30         47        124         90
   82      75         55         20        369        420         90
   83      72         55         10        265        338         90
   84      70         58         20        458        523         90
   85      68         60         30        555        612         90
   86      66         55         10        173        238         90
   87      65         55         20         85        144         90
   88      65         60         30        645        708         90
   89      63         58         10        737        802         90
   90      60         55         10         20         84         90
   91      60         60         10        836        889         90
   92      67         85         20        368        441         90
   93      65         85         40        475        518         90
   94      65         82         10        285        336         90
   95      62         80         30        196        239         90
   96      60         80         10         95        156         90
   97      60         85         30        561        622         90
   98      58         75         20         30         84         90
   99      55         80         10        743        820         90
  100      55         85         20        647        726         90
```

- [ ] **Step 2: Commit**

```bash
git add src/levels/level_11/c101.txt
git commit -m "feat(level11): add Solomon C101 benchmark instance data"
```

---

### Task 2: Instance parser, distance matrix, and route evaluation (`cvrptw.js`)

**Files:**
- Create: `src/levels/level_11/cvrptw.js`
- Create: `tests/unit/cvrptw.test.js`

- [ ] **Step 1: Write failing tests for instance parsing**

```js
// tests/unit/cvrptw.test.js
import { describe, it, expect } from 'vitest';
import { parseInstance, computeDistanceMatrix, routeDistance, isRouteFeasible, totalDistance, buildGreedySolution } from '../../src/levels/level_11/cvrptw.js';

const INSTANCE_TEXT = `C101

VEHICLE
NUMBER     CAPACITY
  25         200

CUSTOMER
CUST NO.  XCOORD.   YCOORD.    DEMAND   READY TIME  DUE DATE   SERVICE   TIME

    0      40         50          0          0       1236          0
    1      45         68         10        912        967         90
    2      45         70         30        825        870         90
    3      42         66         10         65        146         90
    4      42         68         10        727        782         90
    5      42         65         10         15         67         90
    6      40         69         20        621        702         90
    7      40         66         20        170        225         90
    8      38         68         20        255        324         90
    9      38         70         10        534        605         90
   10      35         66         10        357        410         90
   11      35         69         10        448        505         90
   12      25         85         20        652        721         90
   13      22         75         30         30         92         90
   14      22         85         10        567        620         90
   15      20         80         40        384        429         90
   16      20         85         40        475        528         90
   17      18         75         20         99        148         90
   18      15         75         20        179        254         90
   19      15         80         10        278        345         90
   20      30         50         10         10         73         90
   21      30         52         20        914        965         90
   22      28         52         20        812        883         90
   23      28         55         10        732        777         90
   24      25         50         10         65        144         90
   25      25         52         40        169        224         90
   26      25         55         10        622        701         90
   27      23         52         10        261        316         90
   28      23         55         20        546        593         90
   29      20         50         10        358        405         90
   30      20         55         10        449        504         90
   31      10         35         20        200        237         90
   32      10         40         30         31        100         90
   33       8         40         40         87        158         90
   34       8         45         20        751        816         90
   35       5         35         10        283        344         90
   36       5         45         10        665        716         90
   37       2         40         20        383        434         90
   38       0         40         30        479        522         90
   39       0         45         20        567        624         90
   40      35         30         10        264        321         90
   41      35         32         10        166        235         90
   42      33         32         20         68        149         90
   43      33         35         10         16         80         90
   44      32         30         10        359        412         90
   45      30         30         10        541        600         90
   46      30         32         30        448        509         90
   47      30         35         10       1054       1127         90
   48      28         30         10        632        693         90
   49      28         35         10       1001       1066         90
   50      26         32         10        815        880         90
   51      25         30         10        725        786         90
   52      25         35         10        912        969         90
   53      44          5         20        286        347         90
   54      42         10         40        186        257         90
   55      42         15         10         95        158         90
   56      40          5         30        385        436         90
   57      40         15         40         35         87         90
   58      38          5         30        471        534         90
   59      38         15         10        651        740         90
   60      35          5         20        562        629         90
   61      50         30         10        531        610         90
   62      50         35         20        262        317         90
   63      50         40         50        171        218         90
   64      48         30         10        632        693         90
   65      48         40         10         76        129         90
   66      47         35         10        826        875         90
   67      47         40         10         12         77         90
   68      45         30         10        734        777         90
   69      45         35         10        916        969         90
   70      95         30         30        387        456         90
   71      95         35         20        293        360         90
   72      53         30         10        450        505         90
   73      92         30         10        478        551         90
   74      53         35         50        353        412         90
   75      45         65         20        997       1068         90
   76      90         35         10        203        260         90
   77      88         30         10        574        643         90
   78      88         35         20        109        170         90
   79      87         30         10        668        731         90
   80      85         25         10        769        820         90
   81      85         35         30         47        124         90
   82      75         55         20        369        420         90
   83      72         55         10        265        338         90
   84      70         58         20        458        523         90
   85      68         60         30        555        612         90
   86      66         55         10        173        238         90
   87      65         55         20         85        144         90
   88      65         60         30        645        708         90
   89      63         58         10        737        802         90
   90      60         55         10         20         84         90
   91      60         60         10        836        889         90
   92      67         85         20        368        441         90
   93      65         85         40        475        518         90
   94      65         82         10        285        336         90
   95      62         80         30        196        239         90
   96      60         80         10         95        156         90
   97      60         85         30        561        622         90
   98      58         75         20         30         84         90
   99      55         80         10        743        820         90
  100      55         85         20        647        726         90`;

describe('parseInstance', () => {
  it('parses vehicle capacity', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    expect(instance.vehicleCapacity).toBe(200);
    expect(instance.numVehicles).toBe(25);
  });

  it('parses depot (customer 0)', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    expect(instance.customers[0]).toEqual({
      id: 0, x: 40, y: 50, demand: 0, readyTime: 0, dueDate: 1236, serviceTime: 0,
    });
  });

  it('parses all 101 customers (depot + 100)', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    expect(instance.customers).toHaveLength(101);
  });

  it('parses customer 1 correctly', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    expect(instance.customers[1]).toEqual({
      id: 1, x: 45, y: 68, demand: 10, readyTime: 912, dueDate: 967, serviceTime: 90,
    });
  });

  it('parses customer 100 correctly', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    expect(instance.customers[100]).toEqual({
      id: 100, x: 55, y: 85, demand: 20, readyTime: 647, dueDate: 726, serviceTime: 90,
    });
  });
});

describe('computeDistanceMatrix', () => {
  it('distance from node to itself is 0', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    expect(dist[0][0]).toBe(0);
    expect(dist[50][50]).toBe(0);
  });

  it('distance is symmetric', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    expect(dist[0][1]).toBe(dist[1][0]);
    expect(dist[10][50]).toBe(dist[50][10]);
  });

  it('computes correct Euclidean distance for depot to customer 1', () => {
    // depot (40,50) to customer 1 (45,68): sqrt(25+324) = sqrt(349) ≈ 18.68
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    expect(dist[0][1]).toBeCloseTo(Math.sqrt(349), 5);
  });
});

describe('routeDistance', () => {
  it('computes distance for a single-customer route', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    // Route [20]: depot->20->depot. Customer 20 is at (30,50), depot at (40,50)
    // dist = 10 + 10 = 20
    expect(routeDistance([20], dist)).toBeCloseTo(20, 5);
  });

  it('computes distance for a multi-customer route', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    // Route [1, 2]: depot(40,50)->1(45,68)->2(45,70)->depot(40,50)
    // d(0,1) = sqrt(349), d(1,2) = 2, d(2,0) = sqrt(25+400) = sqrt(425)
    const expected = Math.sqrt(349) + 2 + Math.sqrt(425);
    expect(routeDistance([1, 2], dist)).toBeCloseTo(expected, 5);
  });
});

describe('isRouteFeasible', () => {
  it('empty route is feasible', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    expect(isRouteFeasible([], instance, dist)).toBe(true);
  });

  it('single customer within time window is feasible', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    // Customer 20: at (30,50), readyTime=10, dueDate=73
    // Travel time from depot: 10. Arrive at 10, within [10,73]. Feasible.
    expect(isRouteFeasible([20], instance, dist)).toBe(true);
  });

  it('rejects route exceeding capacity', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    // Create a route with demand > 200
    // Customers with demand 40: 15,16,25,33,57,93 => 6*40 = 240 > 200
    expect(isRouteFeasible([15, 16, 25, 33, 57, 93], instance, dist)).toBe(false);
  });

  it('rejects route violating time windows', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    // Customer 67 has readyTime=12, dueDate=77. Customer 21 has readyTime=914.
    // Visiting 21 first: depot(40,50)->21(30,52) = sqrt(104) ≈ 10.2, arrive ~10, wait to 914,
    // depart 1004. Then 21(30,52)->67(47,40) = sqrt(433) ≈ 20.8, arrive ~1025 > dueDate 77.
    expect(isRouteFeasible([21, 67], instance, dist)).toBe(false);
  });

  it('accepts the known optimal route 5 (customers 13,17,18,19,15,16,14,12)', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    expect(isRouteFeasible([13, 17, 18, 19, 15, 16, 14, 12], instance, dist)).toBe(true);
  });
});

describe('totalDistance', () => {
  it('sums distances of all routes', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    const routes = [[20], [1]];
    const expected = routeDistance([20], dist) + routeDistance([1], dist);
    expect(totalDistance(routes, dist)).toBeCloseTo(expected, 5);
  });

  it('known optimal solution has distance ~828.94', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    const optimalRoutes = [
      [81, 78, 76, 71, 70, 73, 77, 79, 80],
      [57, 55, 54, 53, 56, 58, 60, 59],
      [98, 96, 95, 94, 92, 93, 97, 100, 99],
      [32, 33, 31, 35, 37, 38, 39, 36, 34],
      [13, 17, 18, 19, 15, 16, 14, 12],
      [90, 87, 86, 83, 82, 84, 85, 88, 89, 91],
      [43, 42, 41, 40, 44, 46, 45, 48, 51, 50, 52, 49, 47],
      [67, 65, 63, 62, 74, 72, 61, 64, 68, 66, 69],
      [5, 3, 7, 8, 10, 11, 9, 6, 4, 2, 1, 75],
      [20, 24, 25, 27, 29, 30, 28, 26, 23, 22, 21],
    ];
    const d = totalDistance(optimalRoutes, dist);
    expect(d).toBeGreaterThan(820);
    expect(d).toBeLessThan(840);
  });
});

describe('buildGreedySolution', () => {
  it('assigns all 100 customers', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    const routes = buildGreedySolution(instance, dist);
    const assigned = routes.flat();
    expect(assigned).toHaveLength(100);
    expect(new Set(assigned).size).toBe(100);
  });

  it('all routes are feasible', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    const routes = buildGreedySolution(instance, dist);
    for (const route of routes) {
      expect(isRouteFeasible(route, instance, dist)).toBe(true);
    }
  });

  it('uses no more than 25 vehicles', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    const routes = buildGreedySolution(instance, dist);
    expect(routes.length).toBeLessThanOrEqual(25);
  });

  it('produces a solution with distance under 1200', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    const routes = buildGreedySolution(instance, dist);
    const d = totalDistance(routes, dist);
    expect(d).toBeLessThan(1200);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/cvrptw.test.js`
Expected: FAIL — module `cvrptw.js` does not exist yet

- [ ] **Step 3: Implement cvrptw.js**

```js
// src/levels/level_11/cvrptw.js

export function parseInstance(text) {
  const lines = text.split('\n');
  let vehicleCapacity = 0;
  let numVehicles = 0;
  const customers = [];

  let section = '';
  let headerSkipped = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('C101')) continue;

    if (trimmed === 'VEHICLE') { section = 'vehicle'; headerSkipped = false; continue; }
    if (trimmed === 'CUSTOMER') { section = 'customer'; headerSkipped = false; continue; }

    if (section === 'vehicle') {
      if (!headerSkipped) { headerSkipped = true; continue; } // skip "NUMBER CAPACITY" header
      const parts = trimmed.split(/\s+/).map(Number);
      if (parts.length >= 2 && !isNaN(parts[0])) {
        numVehicles = parts[0];
        vehicleCapacity = parts[1];
      }
      continue;
    }

    if (section === 'customer') {
      if (!headerSkipped) { headerSkipped = true; continue; } // skip column header
      const parts = trimmed.split(/\s+/).map(Number);
      if (parts.length >= 7 && !isNaN(parts[0])) {
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
    }
  }

  return { numVehicles, vehicleCapacity, customers };
}

export function computeDistanceMatrix(customers) {
  const n = customers.length;
  const dist = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = customers[i].x - customers[j].x;
      const dy = customers[i].y - customers[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      dist[i][j] = d;
      dist[j][i] = d;
    }
  }
  return dist;
}

export function routeDistance(route, dist) {
  if (route.length === 0) return 0;
  let d = dist[0][route[0]]; // depot to first
  for (let i = 0; i < route.length - 1; i++) {
    d += dist[route[i]][route[i + 1]];
  }
  d += dist[route[route.length - 1]][0]; // last to depot
  return d;
}

export function totalDistance(routes, dist) {
  let total = 0;
  for (const route of routes) {
    total += routeDistance(route, dist);
  }
  return total;
}

export function isRouteFeasible(route, instance, dist) {
  if (route.length === 0) return true;

  // Check capacity
  let load = 0;
  for (const custId of route) {
    load += instance.customers[custId].demand;
  }
  if (load > instance.vehicleCapacity) return false;

  // Check time windows
  let time = 0; // start at depot at time 0
  let prev = 0; // depot
  for (const custId of route) {
    const cust = instance.customers[custId];
    time += dist[prev][custId]; // travel
    if (time > cust.dueDate) return false; // arrived too late
    time = Math.max(time, cust.readyTime); // wait if early
    time += cust.serviceTime; // service
    prev = custId;
  }
  // Check return to depot
  time += dist[prev][0];
  if (time > instance.customers[0].dueDate) return false;

  return true;
}

export function buildGreedySolution(instance, dist) {
  const n = instance.customers.length - 1; // exclude depot
  const assigned = new Set();
  const routes = [];

  // Sort customers by ready time for better initial assignment
  const sortedCustomers = [];
  for (let i = 1; i <= n; i++) {
    sortedCustomers.push(i);
  }
  sortedCustomers.sort((a, b) => instance.customers[a].readyTime - instance.customers[b].readyTime);

  for (const custId of sortedCustomers) {
    if (assigned.has(custId)) continue;

    // Try to insert into existing route at the best position
    let bestCost = Infinity;
    let bestRoute = -1;
    let bestPos = -1;

    for (let r = 0; r < routes.length; r++) {
      for (let pos = 0; pos <= routes[r].length; pos++) {
        const newRoute = [...routes[r]];
        newRoute.splice(pos, 0, custId);
        if (!isRouteFeasible(newRoute, instance, dist)) continue;
        const cost = routeDistance(newRoute, dist) - routeDistance(routes[r], dist);
        if (cost < bestCost) {
          bestCost = cost;
          bestRoute = r;
          bestPos = pos;
        }
      }
    }

    if (bestRoute >= 0) {
      routes[bestRoute].splice(bestPos, 0, custId);
    } else {
      // Start a new route
      routes.push([custId]);
    }
    assigned.add(custId);
  }

  return routes;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/cvrptw.test.js`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/levels/level_11/cvrptw.js tests/unit/cvrptw.test.js
git commit -m "feat(level11): add CVRPTW instance parser, distance matrix, route evaluation, and greedy solver"
```

---

### Task 3: Mutation operators with undo (`mutations.js`)

**Files:**
- Create: `src/levels/level_11/mutations.js`
- Create: `tests/unit/mutations.test.js`

- [ ] **Step 1: Write failing tests for mutations**

```js
// tests/unit/mutations.test.js
import { describe, it, expect } from 'vitest';
import { parseInstance, computeDistanceMatrix, isRouteFeasible, totalDistance, buildGreedySolution } from '../../src/levels/level_11/cvrptw.js';
import { mutateSolution, undoMutation } from '../../src/levels/level_11/mutations.js';

// Use the same INSTANCE_TEXT as in cvrptw.test.js (copy the full string)
// For brevity in the plan, reference it — the actual test file must include the full string.
// Import a shared helper instead:

import { INSTANCE_TEXT } from './cvrptw.test.js';

function makeTestInstance() {
  const instance = parseInstance(INSTANCE_TEXT);
  const dist = computeDistanceMatrix(instance.customers);
  const routes = buildGreedySolution(instance, dist);
  return { instance, dist, routes };
}

describe('mutateSolution', () => {
  it('returns undo info with a recognized type', () => {
    const { instance, dist, routes } = makeTestInstance();
    const undo = mutateSolution(routes, instance, dist);
    expect(['relocate', 'swap', '2opt', 'oropt', 'noop']).toContain(undo.type);
  });

  it('preserves total customer count after mutation', () => {
    const { instance, dist, routes } = makeTestInstance();
    mutateSolution(routes, instance, dist);
    const allCustomers = routes.flat();
    expect(allCustomers).toHaveLength(100);
    expect(new Set(allCustomers).size).toBe(100);
  });

  it('all routes remain feasible after mutation', () => {
    const { instance, dist, routes } = makeTestInstance();
    for (let i = 0; i < 100; i++) {
      mutateSolution(routes, instance, dist);
      for (const route of routes) {
        expect(isRouteFeasible(route, instance, dist)).toBe(true);
      }
    }
  });

  it('can be undone to restore original state', () => {
    const { instance, dist, routes } = makeTestInstance();
    for (let trial = 0; trial < 50; trial++) {
      const snapshot = JSON.stringify(routes);
      const undo = mutateSolution(routes, instance, dist);
      undoMutation(routes, undo);
      expect(JSON.stringify(routes)).toBe(snapshot);
    }
  });

  it('does not create empty routes (removes them)', () => {
    const { instance, dist, routes } = makeTestInstance();
    for (let i = 0; i < 100; i++) {
      mutateSolution(routes, instance, dist);
      for (const route of routes) {
        expect(route.length).toBeGreaterThan(0);
      }
    }
  });
});
```

Note: The `INSTANCE_TEXT` must be exported from `cvrptw.test.js`. Update that file to add `export` in front of the `const INSTANCE_TEXT` declaration.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/mutations.test.js`
Expected: FAIL — module `mutations.js` does not exist yet

- [ ] **Step 3: Implement mutations.js**

```js
// src/levels/level_11/mutations.js

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tryRelocate(routes, instance, dist) {
  if (routes.length === 0) return null;

  const srcRouteIdx = randInt(0, routes.length - 1);
  const srcRoute = routes[srcRouteIdx];
  if (srcRoute.length === 0) return null;

  const custIdx = randInt(0, srcRoute.length - 1);
  const custId = srcRoute[custIdx];

  // Pick a destination route and position
  const dstRouteIdx = randInt(0, routes.length - 1);
  const dstRoute = routes[dstRouteIdx];
  const dstPos = (srcRouteIdx === dstRouteIdx)
    ? randInt(0, dstRoute.length - 1) // same route: any position except current
    : randInt(0, dstRoute.length);     // different route: any position including end

  if (srcRouteIdx === dstRouteIdx && dstPos === custIdx) return null;

  // Remove from source
  srcRoute.splice(custIdx, 1);

  // Adjust dstPos if same route and position shifted
  let adjustedDstPos = dstPos;
  if (srcRouteIdx === dstRouteIdx && dstPos > custIdx) {
    adjustedDstPos = dstPos; // already shifted by removal
  }

  // Insert at destination
  const targetRoute = routes[dstRouteIdx];
  targetRoute.splice(adjustedDstPos, 0, custId);

  // Check feasibility of affected routes
  const srcFeasible = srcRouteIdx === dstRouteIdx || srcRoute.length === 0 || isRouteFeasibleFast(srcRoute, instance, dist);
  const dstFeasible = isRouteFeasibleFast(targetRoute, instance, dist);

  if (!srcFeasible || !dstFeasible) {
    // Undo
    targetRoute.splice(adjustedDstPos, 1);
    srcRoute.splice(custIdx, 0, custId);
    return null;
  }

  // Remove empty source route
  let removedEmptyRoute = false;
  let removedRouteIdx = -1;
  if (srcRouteIdx !== dstRouteIdx && srcRoute.length === 0) {
    routes.splice(srcRouteIdx, 1);
    removedEmptyRoute = true;
    removedRouteIdx = srcRouteIdx;
  }

  return {
    type: 'relocate',
    custId,
    srcRouteIdx,
    custIdx,
    dstRouteIdx: removedEmptyRoute && dstRouteIdx > srcRouteIdx ? dstRouteIdx - 1 : dstRouteIdx,
    adjustedDstPos,
    removedEmptyRoute,
    removedRouteIdx,
  };
}

function trySwap(routes, instance, dist) {
  if (routes.length === 0) return null;

  const r1 = randInt(0, routes.length - 1);
  const r2 = randInt(0, routes.length - 1);
  if (routes[r1].length === 0 || routes[r2].length === 0) return null;

  const i1 = randInt(0, routes[r1].length - 1);
  const i2 = randInt(0, routes[r2].length - 1);
  if (r1 === r2 && i1 === i2) return null;

  // Swap
  const tmp = routes[r1][i1];
  routes[r1][i1] = routes[r2][i2];
  routes[r2][i2] = tmp;

  // Check feasibility
  const f1 = isRouteFeasibleFast(routes[r1], instance, dist);
  const f2 = (r1 === r2) || isRouteFeasibleFast(routes[r2], instance, dist);

  if (!f1 || !f2) {
    // Undo
    routes[r2][i2] = routes[r1][i1];
    routes[r1][i1] = tmp;
    return null;
  }

  return { type: 'swap', r1, i1, r2, i2 };
}

function try2Opt(routes, instance, dist) {
  if (routes.length === 0) return null;

  const rIdx = randInt(0, routes.length - 1);
  const route = routes[rIdx];
  if (route.length < 3) return null;

  let i = randInt(0, route.length - 2);
  let j = randInt(i + 1, route.length - 1);

  // Reverse segment [i, j]
  reverseSegment(route, i, j);

  if (!isRouteFeasibleFast(route, instance, dist)) {
    reverseSegment(route, i, j); // undo
    return null;
  }

  return { type: '2opt', rIdx, i, j };
}

function tryOrOpt(routes, instance, dist) {
  if (routes.length < 1) return null;

  const srcRouteIdx = randInt(0, routes.length - 1);
  const srcRoute = routes[srcRouteIdx];
  if (srcRoute.length < 2) return null;

  const segLen = randInt(1, Math.min(2, srcRoute.length - 1));
  const segStart = randInt(0, srcRoute.length - segLen);

  // Remove segment
  const segment = srcRoute.splice(segStart, segLen);

  // Pick destination
  const dstRouteIdx = randInt(0, routes.length - 1);
  const dstRoute = routes[dstRouteIdx];
  const dstPos = randInt(0, dstRoute.length);

  // Insert segment
  dstRoute.splice(dstPos, 0, ...segment);

  // Check feasibility
  const srcOk = srcRouteIdx === dstRouteIdx || srcRoute.length === 0 || isRouteFeasibleFast(srcRoute, instance, dist);
  const dstOk = isRouteFeasibleFast(dstRoute, instance, dist);

  if (!srcOk || !dstOk) {
    // Undo: remove from dst, insert back to src
    dstRoute.splice(dstPos, segLen);
    srcRoute.splice(segStart, 0, ...segment);
    return null;
  }

  // Remove empty route
  let removedEmptyRoute = false;
  let removedRouteIdx = -1;
  if (srcRouteIdx !== dstRouteIdx && srcRoute.length === 0) {
    routes.splice(srcRouteIdx, 1);
    removedEmptyRoute = true;
    removedRouteIdx = srcRouteIdx;
  }

  return {
    type: 'oropt',
    segment,
    srcRouteIdx,
    segStart,
    dstRouteIdx: removedEmptyRoute && dstRouteIdx > srcRouteIdx ? dstRouteIdx - 1 : dstRouteIdx,
    dstPos,
    segLen,
    removedEmptyRoute,
    removedRouteIdx,
  };
}

function reverseSegment(arr, i, j) {
  while (i < j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    i++;
    j--;
  }
}

// Fast feasibility check (same logic as cvrptw.isRouteFeasible but inlined to avoid circular imports)
function isRouteFeasibleFast(route, instance, dist) {
  if (route.length === 0) return true;
  let load = 0;
  for (const custId of route) {
    load += instance.customers[custId].demand;
  }
  if (load > instance.vehicleCapacity) return false;

  let time = 0;
  let prev = 0;
  for (const custId of route) {
    const cust = instance.customers[custId];
    time += dist[prev][custId];
    if (time > cust.dueDate) return false;
    time = Math.max(time, cust.readyTime);
    time += cust.serviceTime;
    prev = custId;
  }
  time += dist[prev][0];
  if (time > instance.customers[0].dueDate) return false;
  return true;
}

export function mutateSolution(routes, instance, dist) {
  const mutationType = randInt(0, 3);
  let result = null;

  if (mutationType === 0) {
    result = tryRelocate(routes, instance, dist);
  } else if (mutationType === 1) {
    result = trySwap(routes, instance, dist);
  } else if (mutationType === 2) {
    result = try2Opt(routes, instance, dist);
  } else {
    result = tryOrOpt(routes, instance, dist);
  }

  if (result === null) return { type: 'noop' };
  return result;
}

export function undoMutation(routes, undo) {
  if (undo.type === 'noop') return;

  if (undo.type === 'relocate') {
    // Re-create empty route if it was removed
    if (undo.removedEmptyRoute) {
      routes.splice(undo.removedRouteIdx, 0, []);
    }
    const actualDstIdx = undo.removedEmptyRoute && undo.dstRouteIdx >= undo.removedRouteIdx
      ? undo.dstRouteIdx + 1 : undo.dstRouteIdx;
    const dstRoute = routes[actualDstIdx];
    dstRoute.splice(undo.adjustedDstPos, 1);
    routes[undo.srcRouteIdx].splice(undo.custIdx, 0, undo.custId);
    return;
  }

  if (undo.type === 'swap') {
    const tmp = routes[undo.r1][undo.i1];
    routes[undo.r1][undo.i1] = routes[undo.r2][undo.i2];
    routes[undo.r2][undo.i2] = tmp;
    return;
  }

  if (undo.type === '2opt') {
    reverseSegment(routes[undo.rIdx], undo.i, undo.j);
    return;
  }

  if (undo.type === 'oropt') {
    if (undo.removedEmptyRoute) {
      routes.splice(undo.removedRouteIdx, 0, []);
    }
    const actualDstIdx = undo.removedEmptyRoute && undo.dstRouteIdx >= undo.removedRouteIdx
      ? undo.dstRouteIdx + 1 : undo.dstRouteIdx;
    const dstRoute = routes[actualDstIdx];
    dstRoute.splice(undo.dstPos, undo.segLen);
    routes[undo.srcRouteIdx].splice(undo.segStart, 0, ...undo.segment);
    return;
  }
}
```

- [ ] **Step 4: Export INSTANCE_TEXT from cvrptw.test.js**

Change the first line of `tests/unit/cvrptw.test.js`:

```js
// Change: const INSTANCE_TEXT = `C101 ...
// To:
export const INSTANCE_TEXT = `C101 ...
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/unit/mutations.test.js`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/levels/level_11/mutations.js tests/unit/mutations.test.js tests/unit/cvrptw.test.js
git commit -m "feat(level11): add CVRPTW mutation operators (relocate, swap, 2-opt, or-opt) with undo"
```

---

### Task 4: HTML, CSS, and main.js — UI and SA optimization loop

**Files:**
- Create: `src/levels/level_11/index.html`
- Create: `src/levels/level_11/styles.css`
- Create: `src/levels/level_11/main.js`

- [ ] **Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Level 11 - Vehicle Routing</title>
    <script src="main.js" type="module"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
<h1>Vehicle Routing with Time Windows</h1>
<div class="layout">
    <div class="controls">
        <label for="cooling-schedule">Cooling Schedule:</label>
        <select id="cooling-schedule">
            <option value="geometric" selected>Geometric</option>
            <option value="linear">Linear</option>
            <option value="linearReheat">Linear Reheat</option>
            <option value="cosine">Cosine</option>
        </select>

        <label for="iterations">Iterations: <span id="iterations-value">200000</span></label>
        <input type="range" id="iterations" min="10000" max="1000000" value="200000" step="10000">

        <label for="temperature">Initial Temp: <span id="temperature-value">50</span></label>
        <input type="range" id="temperature" min="1" max="500" value="50" step="1">

        <label for="speed">Batch size: <span id="speed-value">500</span></label>
        <input type="range" id="speed" min="10" max="5000" value="500" step="10">

        <button id="start">Start</button>

        <p>Iteration: <span id="iteration-display">-</span></p>
        <p>Best Distance: <span id="distance-display">-</span></p>
        <p>Routes: <span id="routes-display">-</span></p>
        <p>Temperature: <span id="temp-display">-</span></p>
    </div>
    <div class="canvases">
        <div class="canvas-tile">
            <div>Routes</div>
            <canvas id="route-canvas" width="500" height="500"></canvas>
        </div>
        <div class="canvas-tile">
            <div>Score (Total Distance)</div>
            <canvas id="score-canvas" width="480" height="480"></canvas>
        </div>
    </div>
</div>
</body>
</html>
```

- [ ] **Step 2: Create styles.css**

```css
h1 {
    font-family: Calibri, sans-serif;
}

.layout {
    display: flex;
    gap: 2rem;
}

.controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 180px;
    font-family: Calibri, sans-serif;
}

.controls input[type="range"] {
    width: 180px;
}

.controls p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
}

.canvases {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.canvas-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Calibri, sans-serif;
}

#route-canvas {
    border: 2px solid #cbd5e1;
    background-color: #f8fafc;
    border-radius: 0.75rem;
    width: 500px;
    height: 500px;
}

#score-canvas {
    border: 2px solid #cbd5e1;
    background-color: #f8fafc;
    border-radius: 0.75rem;
    width: 480px;
    height: 480px;
}
```

- [ ] **Step 3: Create main.js**

```js
// src/levels/level_11/main.js
import { parseInstance, computeDistanceMatrix, totalDistance, buildGreedySolution } from './cvrptw.js';
import { mutateSolution, undoMutation } from './mutations.js';
import { coolingSchedules, annealingAcceptor } from '../level_10/annealing.js';

const ROUTE_COLORS = [
  '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
  '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990',
  '#dcbeff', '#9A6324', '#800000', '#aaffc3', '#808000',
  '#000075', '#a9a9a9', '#e6beff', '#ffe119', '#ffd8b1',
  '#000000', '#fffac8', '#7cb9e8', '#c19a6b', '#b284be',
];

let running = false;

window.onload = main;

function main() {
  bindSliders();
  document.getElementById('start').addEventListener('click', toggleRun);
}

function bindSliders() {
  const sliders = ['iterations', 'temperature', 'speed'];
  for (const id of sliders) {
    const slider = document.getElementById(id);
    const display = document.getElementById(id + '-value');
    slider.addEventListener('input', () => {
      display.textContent = slider.value;
    });
  }
}

async function toggleRun() {
  if (running) {
    running = false;
    document.getElementById('start').textContent = 'Start';
    return;
  }

  running = true;
  document.getElementById('start').textContent = 'Stop';

  const numIterations = parseInt(document.getElementById('iterations').value);
  const initialTemp = parseInt(document.getElementById('temperature').value);
  const batchSize = parseInt(document.getElementById('speed').value);
  const scheduleName = document.getElementById('cooling-schedule').value;
  const coolingFn = coolingSchedules[scheduleName];

  const response = await fetch('c101.txt');
  const text = await response.text();
  const instance = parseInstance(text);
  const dist = computeDistanceMatrix(instance.customers);
  const routes = buildGreedySolution(instance, dist);
  const currentDistance = totalDistance(routes, dist);

  const state = {
    routes,
    instance,
    dist,
    currentDistance,
    bestDistance: currentDistance,
    bestRoutes: JSON.parse(JSON.stringify(routes)),
    iteration: 0,
    numIterations,
    initialTemp,
    coolingFn,
    batchSize,
    scores: [currentDistance],
    plotInterval: Math.max(1, Math.floor(numIterations / 1000)),
  };

  renderRoutes(document.getElementById('route-canvas'), state.bestRoutes, state.instance);
  updateStats(state);
  requestAnimationFrame(() => runBatch(state));
}

function runBatch(state) {
  if (!running) return;

  const { batchSize, initialTemp, numIterations, instance, dist, coolingFn, plotInterval } = state;

  for (let b = 0; b < batchSize; b++) {
    if (state.iteration >= numIterations) break;

    const temperature = coolingFn(initialTemp, state.iteration, numIterations);

    const undo = mutateSolution(state.routes, instance, dist);
    if (undo.type === 'noop') {
      state.iteration++;
      if (state.iteration % plotInterval === 0) {
        state.scores.push(state.bestDistance);
      }
      continue;
    }

    const candidateDistance = totalDistance(state.routes, dist);
    const delta = candidateDistance - state.currentDistance;

    if (annealingAcceptor(state.currentDistance, candidateDistance, temperature)) {
      state.currentDistance = candidateDistance;
      if (candidateDistance < state.bestDistance) {
        state.bestDistance = candidateDistance;
        state.bestRoutes = JSON.parse(JSON.stringify(state.routes));
      }
    } else {
      undoMutation(state.routes, undo);
    }

    state.iteration++;

    if (state.iteration % plotInterval === 0) {
      state.scores.push(state.bestDistance);
    }
  }

  renderRoutes(document.getElementById('route-canvas'), state.bestRoutes, state.instance);
  renderScorePlot(document.getElementById('score-canvas'), state.scores);
  updateStats(state);

  if (state.iteration < numIterations) {
    requestAnimationFrame(() => runBatch(state));
  } else {
    running = false;
    document.getElementById('start').textContent = 'Start';
  }
}

function renderRoutes(canvas, routes, instance) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Compute coordinate bounds with padding
  const customers = instance.customers;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const c of customers) {
    if (c.x < minX) minX = c.x;
    if (c.x > maxX) maxX = c.x;
    if (c.y < minY) minY = c.y;
    if (c.y > maxY) maxY = c.y;
  }
  const pad = 20;
  const scaleX = (W - 2 * pad) / (maxX - minX || 1);
  const scaleY = (H - 2 * pad) / (maxY - minY || 1);
  const scale = Math.min(scaleX, scaleY);
  const offsetX = pad + ((W - 2 * pad) - (maxX - minX) * scale) / 2;
  const offsetY = pad + ((H - 2 * pad) - (maxY - minY) * scale) / 2;

  function tx(x) { return offsetX + (x - minX) * scale; }
  function ty(y) { return H - (offsetY + (y - minY) * scale); } // flip Y so up is up

  // Draw routes as colored lines
  for (let r = 0; r < routes.length; r++) {
    const route = routes[r];
    if (route.length === 0) continue;
    const color = ROUTE_COLORS[r % ROUTE_COLORS.length];

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Depot to first customer
    ctx.moveTo(tx(customers[0].x), ty(customers[0].y));
    for (const custId of route) {
      ctx.lineTo(tx(customers[custId].x), ty(customers[custId].y));
    }
    // Last customer back to depot
    ctx.lineTo(tx(customers[0].x), ty(customers[0].y));
    ctx.stroke();

    // Draw customer dots
    ctx.fillStyle = color;
    for (const custId of route) {
      ctx.beginPath();
      ctx.arc(tx(customers[custId].x), ty(customers[custId].y), 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw depot as a larger black square
  ctx.fillStyle = '#000';
  const depotX = tx(customers[0].x);
  const depotY = ty(customers[0].y);
  ctx.fillRect(depotX - 6, depotY - 6, 12, 12);
}

function renderScorePlot(canvas, scores) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (scores.length < 2) return;

  const maxScore = scores[0];
  let minScore = maxScore;
  for (let i = 1; i < scores.length; i++) {
    if (scores[i] < minScore) minScore = scores[i];
  }
  const yRange = maxScore - minScore || 1;

  ctx.beginPath();
  ctx.strokeStyle = '#e31f1f';
  ctx.lineWidth = 2;

  for (let i = 0; i < scores.length; i++) {
    const x = (i / (scores.length - 1)) * canvas.width;
    const y = canvas.height - ((scores[i] - minScore) / yRange) * (canvas.height * 0.9) - canvas.height * 0.05;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#333';
  ctx.font = '12px Calibri, sans-serif';
  ctx.fillText(`Best: ${minScore.toFixed(1)}`, 5, 15);
  ctx.fillText(`Initial: ${maxScore.toFixed(1)}`, 5, 30);
}

function updateStats(state) {
  const temperature = state.coolingFn(state.initialTemp, state.iteration, state.numIterations);
  document.getElementById('iteration-display').textContent = `${state.iteration} / ${state.numIterations}`;
  document.getElementById('distance-display').textContent = state.bestDistance.toFixed(2);
  document.getElementById('routes-display').textContent = state.bestRoutes.length;
  document.getElementById('temp-display').textContent = temperature.toFixed(2);
}
```

- [ ] **Step 4: Verify the page loads manually**

Run: `npx vite src --port 5174`
Open: `http://localhost:5174/levels/level_11/index.html`
Expected: Page loads with controls and two canvases. Click Start — routes appear on left canvas, score plot on right canvas. Distance decreases over time.

- [ ] **Step 5: Commit**

```bash
git add src/levels/level_11/index.html src/levels/level_11/styles.css src/levels/level_11/main.js
git commit -m "feat(level11): add CVRPTW level with SA optimization, route map, and score plot"
```

---

### Task 5: Playwright E2E tests

**Files:**
- Create: `tests/e2e/level11.spec.js`

- [ ] **Step 1: Write E2E tests**

```js
// tests/e2e/level11.spec.js
import { test, expect } from '@playwright/test';

test.describe('Level 11 - Vehicle Routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/levels/level_11/index.html');
  });

  test('page loads with all controls', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Vehicle Routing with Time Windows');
    await expect(page.locator('#iterations')).toBeVisible();
    await expect(page.locator('#temperature')).toBeVisible();
    await expect(page.locator('#speed')).toBeVisible();
    await expect(page.locator('#cooling-schedule')).toBeVisible();
    await expect(page.locator('#start')).toBeVisible();
    await expect(page.locator('#route-canvas')).toBeVisible();
    await expect(page.locator('#score-canvas')).toBeVisible();
  });

  test('sliders update their display values', async ({ page }) => {
    const slider = page.locator('#iterations');
    await slider.fill('50000');
    await expect(page.locator('#iterations-value')).toHaveText('50000');
  });

  test('start button toggles to stop', async ({ page }) => {
    await expect(page.locator('#start')).toHaveText('Start');
    await page.locator('#start').click();
    await expect(page.locator('#start')).toHaveText('Stop');
  });

  test('optimization runs and distance decreases', async ({ page }) => {
    await page.locator('#iterations').fill('50000');
    await page.locator('#speed').fill('2000');

    await page.locator('#start').click();

    // Wait for iterations to start
    await expect(page.locator('#iteration-display')).not.toHaveText('-', { timeout: 10000 });

    // Wait for completion
    await expect(page.locator('#start')).toHaveText('Start', { timeout: 60000 });

    // Distance should be a numeric value
    const distText = await page.locator('#distance-display').textContent();
    const dist = parseFloat(distText);
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(2000); // should be well under 2000
  });

  test('stop button halts optimization', async ({ page }) => {
    await page.locator('#iterations').fill('500000');
    await page.locator('#speed').fill('100');

    await page.locator('#start').click();
    await expect(page.locator('#start')).toHaveText('Stop');

    await page.waitForTimeout(500);

    await page.locator('#start').click();
    await expect(page.locator('#start')).toHaveText('Start');

    const iterText1 = await page.locator('#iteration-display').textContent();
    await page.waitForTimeout(500);
    const iterText2 = await page.locator('#iteration-display').textContent();
    expect(iterText1).toBe(iterText2);
  });

  test('route canvas changes after optimization starts', async ({ page }) => {
    await page.locator('#iterations').fill('50000');
    await page.locator('#speed').fill('2000');

    const canvasBefore = await page.locator('#route-canvas').screenshot();

    await page.locator('#start').click();
    await page.waitForTimeout(2000);

    const canvasAfter = await page.locator('#route-canvas').screenshot();
    expect(canvasBefore.equals(canvasAfter)).toBe(false);
  });

  test('shows correct number of routes', async ({ page }) => {
    await page.locator('#iterations').fill('10000');
    await page.locator('#speed').fill('5000');

    await page.locator('#start').click();
    await expect(page.locator('#start')).toHaveText('Start', { timeout: 30000 });

    const routesText = await page.locator('#routes-display').textContent();
    const numRoutes = parseInt(routesText);
    expect(numRoutes).toBeGreaterThanOrEqual(5);
    expect(numRoutes).toBeLessThanOrEqual(25);
  });
});
```

- [ ] **Step 2: Run E2E tests**

Run: `npx playwright test tests/e2e/level11.spec.js`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/level11.spec.js
git commit -m "test(level11): add Playwright E2E tests for CVRPTW level"
```

---

### Task 6: Performance test — verify SA achieves < 1000 distance

**Files:**
- Modify: `tests/unit/cvrptw.test.js`

- [ ] **Step 1: Add SA convergence test**

Add the following to the end of `tests/unit/cvrptw.test.js`:

```js
import { mutateSolution, undoMutation } from '../../src/levels/level_11/mutations.js';
import { geometricCooling, annealingAcceptor } from '../../src/levels/level_10/annealing.js';

describe('simulated annealing convergence', () => {
  it('reaches distance < 1000 within 500000 iterations', () => {
    const instance = parseInstance(INSTANCE_TEXT);
    const dist = computeDistanceMatrix(instance.customers);
    const routes = buildGreedySolution(instance, dist);

    let currentDistance = totalDistance(routes, dist);
    let bestDistance = currentDistance;

    const numIterations = 500000;
    const initialTemp = 50;

    for (let i = 0; i < numIterations; i++) {
      const temperature = geometricCooling(initialTemp, i, numIterations);
      const undo = mutateSolution(routes, instance, dist);

      if (undo.type === 'noop') continue;

      const candidateDistance = totalDistance(routes, dist);

      if (annealingAcceptor(currentDistance, candidateDistance, temperature)) {
        currentDistance = candidateDistance;
        if (candidateDistance < bestDistance) {
          bestDistance = candidateDistance;
        }
      } else {
        undoMutation(routes, undo);
      }
    }

    expect(bestDistance).toBeLessThan(1000);
  }, 120000); // 2 minute timeout
});
```

- [ ] **Step 2: Run the convergence test**

Run: `npx vitest run tests/unit/cvrptw.test.js`
Expected: All tests PASS, including the new convergence test completing under 2 minutes with distance < 1000

- [ ] **Step 3: Commit**

```bash
git add tests/unit/cvrptw.test.js
git commit -m "test(level11): add SA convergence test — verify distance < 1000 within 500k iterations"
```

---

### Task 7: Tune and verify — ensure quality and performance

This task is about running everything end-to-end, checking visual output, and tuning parameters if needed.

- [ ] **Step 1: Run all unit tests**

Run: `npx vitest run`
Expected: All unit tests PASS

- [ ] **Step 2: Run all E2E tests**

Run: `npx playwright test`
Expected: All E2E tests PASS

- [ ] **Step 3: Visual verification**

Run: `npx vite src --port 5174`
Open: `http://localhost:5174/levels/level_11/index.html`
Verify:
- Left canvas shows routes in different colors with dots for customers and a black square for depot
- Right canvas shows score decreasing over time
- Stats update in real-time
- Start/Stop works correctly

- [ ] **Step 4: Performance tuning (if needed)**

If the convergence test fails or the distance doesn't reach < 1000:
- Increase iteration count (try 1M)
- Adjust initial temperature (try range 20-100)
- Check that mutation operators are producing useful neighbors
- Verify the greedy initial solution isn't too far from optimal (should be < 1200)

If the test takes too long (> 2 min):
- Reduce `totalDistance` calls by computing incremental cost changes
- Batch mutations more efficiently

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(level11): complete CVRPTW level with SA, visualization, and tests"
```
