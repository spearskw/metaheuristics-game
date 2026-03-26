function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function clonePolygon(poly) {
  return {
    vertices: poly.vertices.map((v) => ({ x: v.x, y: v.y })),
    color: { ...poly.color },
  };
}

export function createRandomPolygon(width, height) {
  return {
    vertices: [
      { x: randFloat(0, width), y: randFloat(0, height) },
      { x: randFloat(0, width), y: randFloat(0, height) },
      { x: randFloat(0, width), y: randFloat(0, height) },
    ],
    color: {
      r: randInt(0, 255),
      g: randInt(0, 255),
      b: randInt(0, 255),
      a: randFloat(0.05, 0.9),
    },
  };
}

export function createRandomSolution(numPolygons, width, height) {
  const solution = [];
  for (let i = 0; i < numPolygons; i++) {
    solution.push(createRandomPolygon(width, height));
  }
  return solution;
}

export function cloneSolution(solution) {
  return solution.map(clonePolygon);
}

// Mutate in-place and return info needed to undo.
// Perturbation-based mutations: small random changes converge faster than full random.
// Three mutation types:
//   1. Change color: perturb one RGBA channel by a small random delta
//   2. Move vertex: perturb one vertex position by a small random offset
//   3. Change drawing index: swap two polygons in the render order
export function mutateSolution(solution, width, height) {
  const mutationType = randInt(0, 2);
  const polyIndex = randInt(0, solution.length - 1);

  if (mutationType === 0) {
    // Perturb color: change one channel by a small delta
    const poly = solution[polyIndex];
    const oldColor = { ...poly.color };
    const channel = randInt(0, 3);
    if (channel < 3) {
      const channels = ['r', 'g', 'b'];
      const delta = Math.round((Math.random() * 2 - 1) * 40);
      poly.color[channels[channel]] = Math.max(0, Math.min(255, poly.color[channels[channel]] + delta));
    } else {
      const delta = (Math.random() * 2 - 1) * 0.2;
      poly.color.a = Math.max(0.01, Math.min(1.0, poly.color.a + delta));
    }
    return { type: 'color', polyIndex, oldColor };
  } else if (mutationType === 1) {
    // Perturb vertex: move by small offset relative to canvas size
    const poly = solution[polyIndex];
    const vertIndex = randInt(0, poly.vertices.length - 1);
    const oldVertex = { ...poly.vertices[vertIndex] };
    const dx = (Math.random() * 2 - 1) * width * 0.2;
    const dy = (Math.random() * 2 - 1) * height * 0.2;
    poly.vertices[vertIndex].x = Math.max(0, Math.min(width, poly.vertices[vertIndex].x + dx));
    poly.vertices[vertIndex].y = Math.max(0, Math.min(height, poly.vertices[vertIndex].y + dy));
    return { type: 'vertex', polyIndex, vertIndex, oldVertex };
  } else {
    // Change drawing index (move polygon to new position in array)
    const newIndex = randInt(0, solution.length - 1);
    if (newIndex === polyIndex) {
      return { type: 'noop' };
    }
    const [poly] = solution.splice(polyIndex, 1);
    solution.splice(newIndex, 0, poly);
    return { type: 'order', fromIndex: polyIndex, toIndex: newIndex };
  }
}

// Undo a mutation in-place
export function undoMutation(solution, undo) {
  if (undo.type === 'color') {
    const poly = solution[undo.polyIndex];
    poly.color.r = undo.oldColor.r;
    poly.color.g = undo.oldColor.g;
    poly.color.b = undo.oldColor.b;
    poly.color.a = undo.oldColor.a;
  } else if (undo.type === 'vertex') {
    const poly = solution[undo.polyIndex];
    poly.vertices[undo.vertIndex].x = undo.oldVertex.x;
    poly.vertices[undo.vertIndex].y = undo.oldVertex.y;
  } else if (undo.type === 'order') {
    const [poly] = solution.splice(undo.toIndex, 1);
    solution.splice(undo.fromIndex, 0, poly);
  }
}
