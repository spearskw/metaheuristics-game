function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
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
  return solution.map((poly) => ({
    vertices: poly.vertices.map((v) => ({ x: v.x, y: v.y })),
    color: { ...poly.color },
  }));
}

export function mutateSolution(solution, temperature, width, height) {
  const clone = cloneSolution(solution);
  const polyIndex = randInt(0, clone.length - 1);
  const poly = clone[polyIndex];

  if (Math.random() < 0.5) {
    const channel = randInt(0, 3);
    if (channel < 3) {
      const channels = ['r', 'g', 'b'];
      const delta = Math.round((Math.random() * 2 - 1) * Math.min(temperature, 255));
      poly.color[channels[channel]] = Math.max(0, Math.min(255, poly.color[channels[channel]] + delta));
    } else {
      const delta = (Math.random() * 2 - 1) * Math.min(temperature / 255, 0.5);
      poly.color.a = Math.max(0.05, Math.min(0.9, poly.color.a + delta));
    }
  } else {
    const vertIndex = randInt(0, poly.vertices.length - 1);
    const scale = Math.min(temperature / 10, Math.max(width, height));
    poly.vertices[vertIndex].x = Math.max(0, Math.min(width, poly.vertices[vertIndex].x + (Math.random() * 2 - 1) * scale));
    poly.vertices[vertIndex].y = Math.max(0, Math.min(height, poly.vertices[vertIndex].y + (Math.random() * 2 - 1) * scale));
  }

  return clone;
}
