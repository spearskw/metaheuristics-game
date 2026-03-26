export function geometricCooling(initialTemp, iteration, beta) {
  return initialTemp * Math.pow(beta, iteration);
}

// Compute beta so that temperature decays from initialTemp to ~0.01 over numIterations
export function computeBeta(initialTemp, numIterations) {
  return Math.pow(0.01 / initialTemp, 1 / numIterations);
}

export function annealingAcceptor(currentMSE, candidateMSE, temperature) {
  const delta = candidateMSE - currentMSE;
  if (delta <= 0) return true;
  return Math.random() < Math.exp(-delta / temperature);
}
