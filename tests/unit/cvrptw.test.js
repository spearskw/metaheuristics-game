import { describe, it, expect } from 'vitest';
import {
  parseInstance,
  computeDistanceMatrix,
  routeDistance,
  totalDistance,
  isRouteFeasible,
  buildGreedySolution,
} from '../../src/levels/level_11/cvrptw.js';

export const INSTANCE_TEXT = `C101

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
`;

describe('parseInstance', () => {
  const instance = parseInstance(INSTANCE_TEXT);

  it('parses vehicle capacity as 200', () => {
    expect(instance.vehicleCapacity).toBe(200);
  });

  it('parses numVehicles as 25', () => {
    expect(instance.numVehicles).toBe(25);
  });

  it('parses 101 customers (including depot)', () => {
    expect(instance.customers).toHaveLength(101);
  });

  it('parses depot at (40, 50)', () => {
    const depot = instance.customers[0];
    expect(depot.id).toBe(0);
    expect(depot.x).toBe(40);
    expect(depot.y).toBe(50);
  });

  it('parses customer 1 correctly', () => {
    const c1 = instance.customers[1];
    expect(c1.id).toBe(1);
    expect(c1.x).toBe(45);
    expect(c1.y).toBe(68);
    expect(c1.demand).toBe(10);
    expect(c1.readyTime).toBe(912);
    expect(c1.dueDate).toBe(967);
    expect(c1.serviceTime).toBe(90);
  });

  it('parses customer 100 correctly', () => {
    const c100 = instance.customers[100];
    expect(c100.id).toBe(100);
    expect(c100.x).toBe(55);
    expect(c100.y).toBe(85);
    expect(c100.demand).toBe(20);
    expect(c100.readyTime).toBe(647);
    expect(c100.dueDate).toBe(726);
    expect(c100.serviceTime).toBe(90);
  });
});

describe('computeDistanceMatrix', () => {
  const instance = parseInstance(INSTANCE_TEXT);
  const dist = computeDistanceMatrix(instance.customers);

  it('self-distance is 0', () => {
    expect(dist[0][0]).toBe(0);
    expect(dist[1][1]).toBe(0);
    expect(dist[50][50]).toBe(0);
  });

  it('is symmetric', () => {
    expect(dist[0][1]).toBe(dist[1][0]);
    expect(dist[5][10]).toBe(dist[10][5]);
    expect(dist[42][73]).toBe(dist[73][42]);
  });

  it('computes correct Euclidean for depot to customer 1', () => {
    // depot (40,50) -> customer 1 (45,68): sqrt((45-40)^2 + (68-50)^2) = sqrt(25+324) = sqrt(349)
    expect(dist[0][1]).toBeCloseTo(Math.sqrt(349), 10);
  });
});

describe('routeDistance', () => {
  const instance = parseInstance(INSTANCE_TEXT);
  const dist = computeDistanceMatrix(instance.customers);

  it('single-customer route [20] has distance 20.0', () => {
    // customer 20 at (30,50), depot at (40,50)
    // depot->20 = 10, 20->depot = 10, total = 20
    expect(routeDistance([20], dist)).toBeCloseTo(20.0, 5);
  });

  it('multi-customer route [1, 2]', () => {
    // depot(40,50)->1(45,68)->2(45,70)->depot(40,50)
    const d01 = Math.sqrt(25 + 324); // sqrt(349)
    const d12 = Math.sqrt(0 + 4);    // 2
    const d20 = Math.sqrt(25 + 400); // sqrt(425)
    const expected = d01 + d12 + d20;
    expect(routeDistance([1, 2], dist)).toBeCloseTo(expected, 5);
  });
});

describe('isRouteFeasible', () => {
  const instance = parseInstance(INSTANCE_TEXT);
  const dist = computeDistanceMatrix(instance.customers);

  it('empty route is feasible', () => {
    expect(isRouteFeasible([], instance, dist)).toBe(true);
  });

  it('single customer [20] is feasible', () => {
    expect(isRouteFeasible([20], instance, dist)).toBe(true);
  });

  it('capacity violation [15,16,25,33,57,93] is infeasible', () => {
    // demands: 40+40+40+40+40+40 = 240 > 200
    expect(isRouteFeasible([15, 16, 25, 33, 57, 93], instance, dist)).toBe(false);
  });

  it('time window violation [21, 67] is infeasible', () => {
    // customer 21: readyTime 914, customer 67: readyTime 12, dueDate 77
    // After visiting 21 (arrives ~914, service until 1004+), can't reach 67 before dueDate 77
    // Actually: depot->21 arrives ~10.2, waits until 914, service until 1004,
    // then 21->67: dist ~21.5, arrives ~1025.5, way past 67's dueDate of 77
    expect(isRouteFeasible([21, 67], instance, dist)).toBe(false);
  });

  it('known optimal route 5 [13,17,18,19,15,16,14,12] is feasible', () => {
    expect(isRouteFeasible([13, 17, 18, 19, 15, 16, 14, 12], instance, dist)).toBe(true);
  });
});

describe('totalDistance', () => {
  const instance = parseInstance(INSTANCE_TEXT);
  const dist = computeDistanceMatrix(instance.customers);

  it('sums distances of two routes', () => {
    const routes = [[20], [1, 2]];
    const expected = routeDistance([20], dist) + routeDistance([1, 2], dist);
    expect(totalDistance(routes, dist)).toBeCloseTo(expected, 5);
  });

  it('known optimal solution has distance between 820 and 840', () => {
    // C101 optimal routes (from literature, ~828.94)
    const optimalRoutes = [
      [5, 3, 7, 8, 10, 11, 9, 6, 4, 2, 1, 75],
      [13, 17, 18, 19, 15, 16, 14, 12],
      [20, 24, 25, 27, 29, 30, 28, 26, 23, 22, 21],
      [32, 33, 31, 35, 37, 38, 39, 36, 34],
      [43, 42, 41, 40, 44, 46, 45, 48, 51, 50, 52, 49, 47],
      [57, 55, 54, 53, 56, 58, 60, 59],
      [67, 65, 63, 62, 74, 72, 61, 64, 68, 66, 69],
      [81, 78, 76, 71, 70, 73, 77, 79, 80],
      [90, 87, 86, 83, 82, 84, 85, 88, 89, 91],
      [98, 96, 95, 94, 92, 93, 97, 100, 99],
    ];
    const d = totalDistance(optimalRoutes, dist);
    expect(d).toBeGreaterThan(820);
    expect(d).toBeLessThan(840);
  });
});

describe('buildGreedySolution', () => {
  const instance = parseInstance(INSTANCE_TEXT);
  const dist = computeDistanceMatrix(instance.customers);
  const routes = buildGreedySolution(instance, dist);

  it('assigns all 100 customers', () => {
    const allCustomers = new Set();
    for (const route of routes) {
      for (const cid of route) {
        allCustomers.add(cid);
      }
    }
    expect(allCustomers.size).toBe(100);
    // Ensure all customers 1-100 are present
    for (let i = 1; i <= 100; i++) {
      expect(allCustomers.has(i)).toBe(true);
    }
  });

  it('all routes are feasible', () => {
    for (const route of routes) {
      expect(isRouteFeasible(route, instance, dist)).toBe(true);
    }
  });

  it('uses at most 25 vehicles', () => {
    expect(routes.length).toBeLessThanOrEqual(25);
  });

  it('total distance is less than 1200', () => {
    const d = totalDistance(routes, dist);
    expect(d).toBeLessThan(1200);
  });
});
