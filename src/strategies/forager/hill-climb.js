export function hillClimb(curr, stepSize, min = -10, max = 10) {
    const shouldGoRight = Math.random() > 0.5;
    const candidate = shouldGoRight ? curr + stepSize : curr - stepSize;
    return Math.max(min, Math.min(max, candidate));
}