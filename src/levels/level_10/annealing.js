export function geometricCooling(initialTemp, iteration, beta) {
  return initialTemp * Math.pow(beta, iteration);
}

export function annealingAcceptor(currentMSE, candidateMSE, temperature) {
  const delta = candidateMSE - currentMSE;
  if (delta <= 0) return true;
  return Math.random() < Math.exp(-delta / temperature);
}
