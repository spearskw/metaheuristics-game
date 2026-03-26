export function hillClimb(curr, stepSize) {
    const shouldGoRight = Math.random() > 0.5;
    if (shouldGoRight) {
        return curr + stepSize;
    } else {
        return curr - stepSize;
    }
}