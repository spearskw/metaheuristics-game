export function adaptiveForager(current, initialStepSize, progress, min = -10, max = 10) {
    const stepSize = initialStepSize * (1 - progress);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const candidate = current + direction * stepSize;
    return Math.max(min, Math.min(max, candidate));
}
