// All cooling schedules share the signature:
//   (initialTemp, iteration, numIterations) => temperature
//
// Key insight from the paper: performance correlates with average temperature.
// Lower average = better convergence. Each schedule is tuned so that it reaches
// near-zero by numIterations and spends most of its time at low temperatures.

// Geometric: T_0 * beta^i, with beta computed so T decays to ~0.01.
// Exponential decay means temperature drops fast and stays low.
export function geometricCooling(initialTemp, iteration, numIterations) {
  const beta = Math.pow(0.01 / initialTemp, 1 / numIterations);
  return initialTemp * Math.pow(beta, iteration);
}

// Linear: T_0 * (1 - i/N)^6.
// The power of 6 makes it spend most time at low temperature (like geometric),
// while keeping the linear "shape" (smooth, monotonic, no reheating).
export function linearCooling(initialTemp, iteration, numIterations) {
  const progress = iteration / numIterations;
  return initialTemp * Math.pow(Math.max(0, 1 - progress), 6);
}

// Linear Reheat: decay in epochs, reheating to 1/3 of the prior peak.
// 8 epochs with cubic per-epoch decay. Early epochs explore; later epochs
// have very low peaks, acting as pure hill-climbing refinement.
export function linearReheatCooling(initialTemp, iteration, numIterations) {
  const numEpochs = 8;
  const epochLen = numIterations / numEpochs;
  const epochIndex = Math.min(Math.floor(iteration / epochLen), numEpochs - 1);
  const withinEpoch = (iteration - epochIndex * epochLen) / epochLen;
  const epochPeak = initialTemp / Math.pow(3, epochIndex);
  return epochPeak * Math.pow(Math.max(0, 1 - withinEpoch), 3);
}

// Cosine: standard cosine annealing (smooth decay from T_0 to 0).
// Raised to power 4 for fast initial decay, matching geometric's average temperature.
export function cosineCooling(initialTemp, iteration, numIterations) {
  const progress = iteration / numIterations;
  const cosValue = (1 + Math.cos(Math.PI * progress)) / 2;
  return initialTemp * Math.pow(cosValue, 4);
}

export const coolingSchedules = {
  geometric: geometricCooling,
  linear: linearCooling,
  linearReheat: linearReheatCooling,
  cosine: cosineCooling,
};

export function annealingAcceptor(currentMSE, candidateMSE, temperature) {
  const delta = candidateMSE - currentMSE;
  if (delta <= 0) return true;
  if (temperature <= 0) return false;
  return Math.random() < Math.exp(-delta / temperature);
}
